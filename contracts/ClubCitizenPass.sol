// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/// @notice Paid Citizen membership (ERC-721). Public `mintCitizen` sends fixed ETH; admin `withdraw` forwards to treasury.
/// @dev `MINTER_ROLE` can call `mintTo` for future free / airdrop mints (same supply cap as public mints).
contract ClubCitizenPass is ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    error WrongPayment();
    error SoldOut();
    error ZeroAddress();
    error InvalidMaxSupply();

    address public immutable treasury;
    uint256 public immutable citizenPriceWei;
    uint256 public immutable maxCitizenSupply;

    string private _citizenTokenUri;

    uint256 private _nextTokenId;
    uint256 public citizensMinted;

    constructor(
        address admin,
        address treasury_,
        string memory name_,
        string memory symbol_,
        string memory citizenTokenUri_,
        uint256 citizenPriceWei_,
        uint256 maxCitizenSupply_
    ) ERC721(name_, symbol_) {
        if (admin == address(0) || treasury_ == address(0)) revert ZeroAddress();
        if (maxCitizenSupply_ == 0) revert InvalidMaxSupply();
        treasury = treasury_;
        citizenPriceWei = citizenPriceWei_;
        maxCitizenSupply = maxCitizenSupply_;
        _citizenTokenUri = citizenTokenUri_;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    /// @notice Paid mint to `msg.sender`. Requires exact `citizenPriceWei` (can be zero on testnets).
    function mintCitizen() external payable {
        if (msg.value != citizenPriceWei) revert WrongPayment();
        _mintOne(msg.sender);
    }

    /// @notice Promotional / airdrop mint; counts toward `maxCitizenSupply`.
    function mintTo(address to) external onlyRole(MINTER_ROLE) {
        if (to == address(0)) revert ZeroAddress();
        _mintOne(to);
    }

    function _mintOne(address to) internal {
        if (citizensMinted >= maxCitizenSupply) revert SoldOut();
        unchecked {
            citizensMinted++;
        }
        uint256 tokenId = ++_nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _citizenTokenUri);
    }

    /// @notice Send contract ETH balance to immutable `treasury`.
    function withdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 bal = address(this).balance;
        if (bal == 0) return;
        (bool ok, ) = payable(treasury).call{value: bal}("");
        require(ok, "withdraw failed");
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    receive() external payable {}
}
