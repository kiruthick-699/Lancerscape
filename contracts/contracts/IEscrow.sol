// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IEscrow
/// @notice Interface for Escrow-like contracts used by LancerScape (signatures only)
/// @dev Declares the minimal escrow interactions used by `Project`/factory logic.
interface IEscrow {
    /// @notice Deposit funds for a milestone
    /// @dev `payable` signature included; implementation should accept and record funds
    /// @param milestoneId Identifier of the milestone
    function depositFunds(uint256 milestoneId) external payable;

    /// @notice Release funds for a milestone to the beneficiary
    /// @param milestoneId Identifier of the milestone
    function releaseFunds(uint256 milestoneId) external;

    /// @notice Refund funds for a milestone back to payer
    /// @param milestoneId Identifier of the milestone
    function refundFunds(uint256 milestoneId) external;
}
