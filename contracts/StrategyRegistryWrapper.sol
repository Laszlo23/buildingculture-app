// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title StrategyRegistryWrapper
/// @notice A thin wrapper that lets the contract owner register a new strategy in a single call.
///         It calls allocate(uint256 strategyId, uint256 bps) and setStrategyAdapter(uint256 strategyId, address adapter)
///         on the existing StrategyRegistry contract.
contract StrategyRegistryWrapper {
    address public immutable registry;
    address public owner;

    event StrategyRegistered(uint256 indexed strategyId, uint256 bps, address adapter);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _registry) {
        registry = _registry;
        owner = msg.sender;
    }

    /// @dev Register a new strategy with allocation bps and adapter address.
    /// @param strategyId The ID to assign to the new strategy.
    /// @param bps Allocation basis points (e.g., 500 for 5%).
    /// @param adapter The address of the strategy adapter (e.g., SavingsVault).
    function registerStrategy(uint256 strategyId, uint256 bps, address adapter) external onlyOwner {
        // allocate
        (bool successAlloc, ) = registry.call(abi.encodeWithSignature("allocate(uint256,uint256)", strategyId, bps));
        require(successAlloc, "allocate failed");
        // set adapter
        (bool successAdapter, ) = registry.call(abi.encodeWithSignature("setStrategyAdapter(uint256,address)", strategyId, adapter));
        require(successAdapter, "setStrategyAdapter failed");
        emit StrategyRegistered(strategyId, bps, adapter);
    }

    /// @dev Transfer ownership to a new address.
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        owner = newOwner;
    }
}
