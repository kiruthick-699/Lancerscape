// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MilestoneEscrow (skeleton)
/// @notice Minimal skeleton for an escrow that would hold milestone funds
/// @dev Abstract escrow declaration; concrete implementations should manage balances and transfers.
abstract contract MilestoneEscrow {
    /// @dev Balance held per milestone id
    /// @notice Tracks how much wei (or smallest unit) has been deposited for each milestone
    mapping(uint256 => uint256) public milestoneBalances;

    /// @dev Associated project contract allowed to interact (placeholder)
    /// @notice Address of the `Project` contract that may be authorized to release/refund
    address public projectContract;

    /* Events */
    /// @dev Emitted when funds are deposited for a milestone
    /// @param milestoneId Milestone identifier
    /// @param payer Address depositing funds
    /// @param amount Amount deposited
    event FundsDeposited(uint256 indexed milestoneId, address indexed payer, uint256 amount);

    /// @dev Emitted when funds are released from escrow
    /// @param milestoneId Milestone identifier
    /// @param to Beneficiary address receiving funds
    /// @param amount Amount released
    event FundsReleased(uint256 indexed milestoneId, address indexed to, uint256 amount);

    /// @dev Emitted when funds are refunded from escrow
    /// @param milestoneId Milestone identifier
    /// @param to Recipient address receiving refund
    /// @param amount Amount refunded
    event FundsRefunded(uint256 indexed milestoneId, address indexed to, uint256 amount);

    /* Modifiers */
    /// @dev Intended to restrict calls to the `projectContract`. Checks will be added later.
    modifier onlyProject() virtual {
        _;
    }

    /* Function signatures (no implementations) */

    /// @notice Deposit funds for a specific milestone (signature only)
    /// @dev `payable` signature included; implementation should update `milestoneBalances`.
    /// @param milestoneId Identifier of the milestone
    function depositFunds(uint256 milestoneId) external payable virtual;

    /// @notice Release funds to the beneficiary for a milestone (signature only)
    /// @dev Implementation should transfer funds and emit `FundsReleased`.
    /// @param milestoneId Identifier of the milestone
    function releaseFunds(uint256 milestoneId) external virtual;

    /// @notice Refund funds for a milestone back to payer (signature only)
    /// @dev Implementation should transfer funds back to payer and emit `FundsRefunded`.
    /// @param milestoneId Identifier of the milestone
    function refundFunds(uint256 milestoneId) external virtual;
}
