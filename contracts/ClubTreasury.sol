// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice Holds underlying assets; `totalAssets` matches the app’s treasury read.
contract ClubTreasury {
    IERC20 public immutable asset;

    constructor(IERC20 asset_) {
        asset = asset_;
    }

    function totalAssets() external view returns (uint256) {
        return asset.balanceOf(address(this));
    }
}
