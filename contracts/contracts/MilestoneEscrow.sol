// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IProjectMinimal {
    function client() external view returns (address);
    function freelancer() external view returns (address);
}

/// @title MilestoneEscrow (skeleton)
/// @notice Minimal skeleton for an escrow that would hold milestone funds
/// @dev Abstract escrow declaration; concrete implementations should manage balances and transfers.
contract MilestoneEscrow is ReentrancyGuard {
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
    modifier onlyProject() {
        require(msg.sender == projectContract, "Escrow: caller is not project");
        _;
    }

    /* Function signatures (no implementations) */

    /// @notice Deposit funds for a specific milestone
    /// @dev Increases the balance using msg.value and emits `FundsDeposited`.
    /// @param milestoneId Identifier of the milestone
    function depositFunds(uint256 milestoneId) external payable onlyProject nonReentrant {
        require(msg.value > 0, "Escrow: no value sent");
        // Effects
        milestoneBalances[milestoneId] += msg.value;
        // Interactions: none
        emit FundsDeposited(milestoneId, msg.sender, msg.value);
    }

    /// @notice Release funds to the beneficiary for a milestone
    /// @dev Sends full balance to project.freelancer using .call, then zeroes balance.
    /// @param milestoneId Identifier of the milestone
    function releaseFunds(uint256 milestoneId) external onlyProject nonReentrant {
        uint256 amount = milestoneBalances[milestoneId];
        require(amount > 0, "Escrow: zero balance");

        // Effects
        milestoneBalances[milestoneId] = 0;

        // Interactions
        address to = IProjectMinimal(projectContract).freelancer();
        (bool ok, ) = payable(to).call{value: amount}("");
        require(ok, "Escrow: release transfer failed");

        emit FundsReleased(milestoneId, to, amount);
    }

    /// @notice Refund funds for a milestone back to the client
    /// @dev Sends full balance to project.client using .call, then zeroes balance.
    /// @param milestoneId Identifier of the milestone
    function refundFunds(uint256 milestoneId) external onlyProject nonReentrant {
        uint256 amount = milestoneBalances[milestoneId];
        require(amount > 0, "Escrow: zero balance");

        // Effects
        milestoneBalances[milestoneId] = 0;

        // Interactions
        address to = IProjectMinimal(projectContract).client();
        (bool ok, ) = payable(to).call{value: amount}("");
        require(ok, "Escrow: refund transfer failed");

        emit FundsRefunded(milestoneId, to, amount);
    }

    constructor(address project_) {
        require(project_ != address(0), "Escrow: project is zero address");
        projectContract = project_;
    }
}
