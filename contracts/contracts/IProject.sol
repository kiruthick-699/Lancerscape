// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IProject
/// @notice Interface for Project contract used by LancerScape (signatures only)
/// @dev Interface declares public function signatures that a concrete `Project` should implement.
interface IProject {
    /// @notice Create a milestone placeholder
    /// @dev Implementation should append a milestone record and emit relevant event.
    /// @param title Milestone title
    /// @param amount Amount for the milestone
    function createMilestone(string calldata title, uint256 amount) external;

    /// @notice Fund a milestone
    /// @dev Implementation may forward funds to an escrow contract.
    /// @param milestoneId Index of the milestone
    function fundMilestone(uint256 milestoneId) external;

    /// @notice Submit work for a milestone
    /// @param milestoneId Index of the milestone
    /// @param evidenceHash Reference or hash of the submitted evidence
    function submitWork(uint256 milestoneId, string calldata evidenceHash) external;

    /// @notice Approve a milestone
    /// @param milestoneId Index of the milestone
    function approveMilestone(uint256 milestoneId) external;

    /// @notice Open a dispute for a milestone
    /// @param milestoneId Index of the milestone
    function openDispute(uint256 milestoneId) external;

    /// @notice Resolve a dispute
    /// @param milestoneId Index of the milestone
    /// @param clientWins True if resolution favors client, false otherwise
    function resolveDispute(uint256 milestoneId, bool clientWins) external;
}
