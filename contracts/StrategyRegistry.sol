// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IStrategyAdapter} from "./interfaces/IStrategyAdapter.sol";

/// @notice Strategy weights and TVL for UI / DAO flows. TVL can be manual (owner) or read from an adapter.
contract StrategyRegistry is Ownable {
    uint256 public strategyCount;

    mapping(uint256 => uint256) public allocationBps;
    mapping(uint256 => uint256) public strategyTvl;
    mapping(uint256 => address) public strategyAdapter;

    event Allocated(uint256 indexed strategyId, uint256 bps);
    event TvlUpdated(uint256 indexed strategyId, uint256 tvl);
    event StrategyAdapterSet(uint256 indexed strategyId, address adapter);

    constructor(uint256 strategyCount_, address initialOwner) Ownable(initialOwner) {
        strategyCount = strategyCount_;
    }

    function allocate(uint256 strategyId, uint256 bps) external onlyOwner {
        require(bps <= 10_000, "StrategyRegistry: bps");
        allocationBps[strategyId] = bps;
        emit Allocated(strategyId, bps);
    }

    function setStrategyTvl(uint256 strategyId, uint256 tvlWei) external onlyOwner {
        strategyTvl[strategyId] = tvlWei;
        emit TvlUpdated(strategyId, tvlWei);
    }

    function setStrategyAdapter(uint256 strategyId, address adapter) external onlyOwner {
        strategyAdapter[strategyId] = adapter;
        emit StrategyAdapterSet(strategyId, adapter);
    }

    /// @notice When an adapter is set, TVL comes from `totalAssets()`; otherwise from manual `strategyTvl`.
    function effectiveStrategyTvl(uint256 strategyId) external view returns (uint256) {
        address a = strategyAdapter[strategyId];
        if (a != address(0)) {
            return IStrategyAdapter(a).totalAssets();
        }
        return strategyTvl[strategyId];
    }
}
