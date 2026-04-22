// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @notice Custodial-style vault: tracks user principal, pending yield, pulls/pushes ERC20.
contract SavingsVault {
    using SafeERC20 for IERC20;

    IERC20 public immutable asset;

    mapping(address => uint256) public balanceOf;
    mapping(address => uint256) public yieldPending;

    uint256 public totalPrincipal;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event YieldAccrued(address indexed user, uint256 amount);
    event YieldClaimed(address indexed user, uint256 amount);

    constructor(IERC20 asset_) {
        asset = asset_;
    }

    function totalAssets() external view returns (uint256) {
        return asset.balanceOf(address(this));
    }

    function yieldEarned(address account) external view returns (uint256) {
        return yieldPending[account];
    }

    function deposit(uint256 amount) external {
        asset.safeTransferFrom(msg.sender, address(this), amount);
        balanceOf[msg.sender] += amount;
        totalPrincipal += amount;
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "SavingsVault: insufficient balance");
        balanceOf[msg.sender] -= amount;
        totalPrincipal -= amount;
        asset.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    /// @dev Demo: treasury or keeper funds yield into the vault, credited to a user.
    function accrueYield(address user, uint256 amount) external {
        asset.safeTransferFrom(msg.sender, address(this), amount);
        yieldPending[user] += amount;
        emit YieldAccrued(user, amount);
    }

    function claimYield() external {
        uint256 y = yieldPending[msg.sender];
        require(y > 0, "SavingsVault: no yield");
        yieldPending[msg.sender] = 0;
        asset.safeTransfer(msg.sender, y);
        emit YieldClaimed(msg.sender, y);
    }
}
