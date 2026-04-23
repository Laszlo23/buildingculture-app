// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

/// @title VillaPocBondingCurve
/// @notice ERC-20 receipt token minted against USDC using a linear marginal price curve.
/// @dev Marginal price in micro-USDC per full token (1e18 wei): P(S) = p0Micro + alphaMicro * S / 1e18.
///      Total micro-USDC to mint dS wei starting from supply S:
///      cost = p0Micro * dS / 1e18 + alphaMicro * (S*dS + dS*dS/2) / 1e36.
///      USDC has 6 decimals; this contract expects `usdc` to report 6 decimals.
///      Not audited. POC only.
contract VillaPocBondingCurve is ERC20, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    address public beneficiary;

    /// @notice Micro-USDC (1e6 = 1 USDC) per 1e18 tokens at S = 0 (marginal at zero supply).
    uint256 public p0Micro;
    /// @notice Micro-USDC per 1e18 tokens added to marginal price per 1e18 tokens of existing supply.
    uint256 public alphaMicro;
    /// @notice Maximum total token supply (wei, 18 decimals).
    uint256 public maxSupplyTokens;

    bool public paused;

    event Bought(address indexed buyer, uint256 usdcPaid, uint256 tokensOut, uint256 newTotalSupply);
    event CurveParamsUpdated(uint256 p0Micro, uint256 alphaMicro);
    event BeneficiaryUpdated(address indexed beneficiary);

    error BondingCurvePaused();
    error ZeroAmount();
    error MaxSupplyExceeded();
    error InvalidCurve();
    error ZeroAddress();

    constructor(
        IERC20 usdc_,
        address beneficiary_,
        address initialOwner,
        string memory name_,
        string memory symbol_,
        uint256 p0Micro_,
        uint256 alphaMicro_,
        uint256 maxSupplyTokens_
    ) ERC20(name_, symbol_) Ownable(initialOwner) {
        if (address(usdc_) == address(0) || beneficiary_ == address(0)) revert ZeroAddress();
        if (p0Micro_ == 0 && alphaMicro_ == 0) revert InvalidCurve();
        usdc = usdc_;
        beneficiary = beneficiary_;
        p0Micro = p0Micro_;
        alphaMicro = alphaMicro_;
        maxSupplyTokens = maxSupplyTokens_;
    }

    function setPaused(bool p) external onlyOwner {
        paused = p;
    }

    function setBeneficiary(address b) external onlyOwner {
        if (b == address(0)) revert ZeroAddress();
        beneficiary = b;
        emit BeneficiaryUpdated(b);
    }

    function setCurveParams(uint256 p0Micro_, uint256 alphaMicro_) external onlyOwner {
        if (p0Micro_ == 0 && alphaMicro_ == 0) revert InvalidCurve();
        p0Micro = p0Micro_;
        alphaMicro = alphaMicro_;
        emit CurveParamsUpdated(p0Micro_, alphaMicro_);
    }

    function setMaxSupplyTokens(uint256 max_) external onlyOwner {
        maxSupplyTokens = max_;
    }

    /// @notice Micro-USDC marginal price at current total supply `S` (18-dec token wei).
    function marginalPriceMicro(uint256 S) public view returns (uint256) {
        return p0Micro + Math.mulDiv(alphaMicro, S, 1e18);
    }

    /// @notice Exact micro-USDC cost to mint `dS` wei when supply is `S`.
    function costMicro(uint256 S, uint256 dS) public view returns (uint256) {
        if (dS == 0) return 0;
        uint256 term1 = Math.mulDiv(p0Micro, dS, 1e18);
        uint256 inner = Math.mulDiv(S, dS, 1) + Math.mulDiv(dS, dS, 2);
        uint256 term2 = Math.mulDiv(alphaMicro, inner, 1e36);
        return term1 + term2;
    }

    /// @notice Max token wei mintable for a USDC budget (micro units), capped by remaining supply.
    function previewBuy(uint256 usdcBudgetMicro) external view returns (uint256 tokensOut, uint256 usdcNeededMicro) {
        uint256 S = totalSupply();
        if (S >= maxSupplyTokens) return (0, 0);
        uint256 dS = _tokensForBudget(S, usdcBudgetMicro);
        uint256 cap = maxSupplyTokens - S;
        if (dS > cap) dS = cap;
        uint256 c = costMicro(S, dS);
        while (c > usdcBudgetMicro && dS > 0) {
            unchecked {
                dS -= 1;
            }
            c = costMicro(S, dS);
        }
        return (dS, c);
    }

    /// @param usdcBudgetMicro Maximum micro-USDC the user allows to spend; actual charge may be lower.
    function buy(uint256 usdcBudgetMicro) external nonReentrant returns (uint256 tokensOut) {
        if (paused) revert BondingCurvePaused();
        if (usdcBudgetMicro == 0) revert ZeroAmount();
        uint256 S = totalSupply();
        if (S >= maxSupplyTokens) revert MaxSupplyExceeded();

        uint256 dS = _tokensForBudget(S, usdcBudgetMicro);
        uint256 cap = maxSupplyTokens - S;
        if (dS > cap) dS = cap;
        if (dS == 0) revert ZeroAmount();

        uint256 c = costMicro(S, dS);
        while (c > usdcBudgetMicro && dS > 0) {
            unchecked {
                dS -= 1;
            }
            c = costMicro(S, dS);
        }
        if (c == 0 || c > usdcBudgetMicro) revert ZeroAmount();

        usdc.safeTransferFrom(msg.sender, beneficiary, c);
        _mint(msg.sender, dS);
        emit Bought(msg.sender, c, dS, totalSupply());
        return dS;
    }

    function _tokensForBudget(uint256 S, uint256 C) internal view returns (uint256) {
        if (C == 0) return 0;
        if (alphaMicro == 0) {
            return Math.mulDiv(C, 1e18, p0Micro);
        }
        uint256 R = 2 * C * 1e36;
        uint256 B = 2 * p0Micro * 1e18 + 2 * alphaMicro * S;
        uint256 disc = B * B + 4 * alphaMicro * R;
        uint256 root = Math.sqrt(disc);
        if (root <= B) return 0;
        return (root - B) / (2 * alphaMicro);
    }
}
