// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IStrategyAdapter} from "../interfaces/IStrategyAdapter.sol";

/// @notice Test double: fixed totalAssets for demos until real adapters are wired.
contract MockStrategyAdapter is IStrategyAdapter {
    uint256 public override totalAssets;

    constructor(uint256 initialTvl_) {
        totalAssets = initialTvl_;
    }

    function setTotalAssets(uint256 v) external {
        totalAssets = v;
    }
}
