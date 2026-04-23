// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Lightweight governor-style voting for testnet (not full OpenZeppelin Governor).
contract GovernanceDAO is Ownable {
    struct Tally {
        uint256 againstVotes;
        uint256 forVotes;
        uint256 abstainVotes;
    }

    mapping(uint256 => Tally) public proposalVotes;
    mapping(address => uint256) public votingPower;
    /// @notice Each voter may cast at most one vote per proposal (prevents weight replay).
    mapping(uint256 proposalId => mapping(address voter => bool)) public hasVoted;

    event VoteCast(address indexed voter, uint256 indexed proposalId, uint8 support, uint256 weight);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setVotingPower(address account, uint256 weight) external onlyOwner {
        votingPower[account] = weight;
    }

    function vote(uint256 proposalId, uint8 support) external {
        _castVote(msg.sender, proposalId, support);
    }

    function castVote(uint256 proposalId, uint8 support) external returns (uint256) {
        _castVote(msg.sender, proposalId, support);
        return proposalId;
    }

    function _castVote(address voter, uint256 proposalId, uint8 support) internal {
        require(!hasVoted[proposalId][voter], "GovernanceDAO: already voted");
        uint256 w = votingPower[voter];
        require(w > 0, "GovernanceDAO: no voting power");

        hasVoted[proposalId][voter] = true;

        Tally storage t = proposalVotes[proposalId];
        if (support == 1) {
            t.forVotes += w;
        } else if (support == 0) {
            t.againstVotes += w;
        } else if (support == 2) {
            t.abstainVotes += w;
        } else {
            revert("GovernanceDAO: bad support");
        }

        emit VoteCast(voter, proposalId, support, w);
    }

    /// @dev Matches Governor `getVotes(account, blockNumber)` signature; block ignored for demo.
    function getVotes(address account, uint256) external view returns (uint256) {
        return votingPower[account];
    }
}
