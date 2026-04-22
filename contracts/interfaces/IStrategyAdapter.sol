// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Minimal surface for reading strategy TVL on-chain (e.g. ERC-4626 vault or RWA wrapper).
interface IStrategyAdapter {
    function totalAssets() external view returns (uint256);
}
