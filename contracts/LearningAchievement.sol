// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/// @notice Single collection of soulbound learning / activity credentials. Only `MINTER_ROLE` can mint.
/// Achievement types 1–3: learning routes; 4: vault activity (e.g. patron).
contract LearningAchievement is ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    error InvalidAchievementType();
    error AlreadyClaimed();
    error Soulbound();

    uint256 private _nextTokenId;
    /// @notice achievement type (1–4) per minted token
    mapping(uint256 tokenId => uint8) public achievementOf;
    /// @notice one credential per wallet per achievement type
    mapping(address holder => mapping(uint8 achievementType => bool)) public hasAchievement;

    string[4] private _typeUris;

    constructor(
        address admin,
        string memory name_,
        string memory symbol_,
        string memory uriType1,
        string memory uriType2,
        string memory uriType3,
        string memory uriType4
    ) ERC721(name_, symbol_) {
        _typeUris[0] = uriType1;
        _typeUris[1] = uriType2;
        _typeUris[2] = uriType3;
        _typeUris[3] = uriType4;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    /// @notice Mint a soulbound credential. `achievementType` is 1–4 (see deployment metadata).
    function mint(address to, uint8 achievementType) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        if (achievementType < 1 || achievementType > 4) revert InvalidAchievementType();
        if (hasAchievement[to][achievementType]) revert AlreadyClaimed();

        hasAchievement[to][achievementType] = true;
        tokenId = ++_nextTokenId;
        achievementOf[tokenId] = achievementType;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _typeUris[achievementType - 1]);
    }

    /// @inheritdoc ERC721
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) revert Soulbound();
        return super._update(to, tokenId, auth);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
