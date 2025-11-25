// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./IEscrow.sol";

/// @title Project (skeleton)
/// @notice Minimal skeleton for a single freelance project contract
/// @dev This abstract contract declares the data model, events and signatures for a
///      single freelance project. Implementations should provide concrete logic.
abstract contract Project {
    /// @dev Milestone status enumeration
    /// @notice Tracks the lifecycle state of a milestone
    enum MilestoneStatus {
        Pending,
        Funded,
        Submitted,
        Approved,
        Disputed,
        Resolved
    }

    /// @dev Milestone data
    /// @dev Fields:
    ///  - id: numeric index of the milestone
    ///  - title: short milestone title
    ///  - amount: amount associated with milestone (unit-agnostic)
    ///  - status: current lifecycle status from `MilestoneStatus`
    ///  - evidenceHash: optional reference/hash to submitted evidence
    struct Milestone {
        uint256 id;
        string title;
        uint256 amount;
        MilestoneStatus status;
        string evidenceHash;
    }

    /* State variables */
    address public client;
    address public freelancer;
    string public projectTitle;
    string public projectDescription;

    Milestone[] public milestones;
    /// @dev Escrow contract responsible for holding milestone funds (set in derived contract)
    IEscrow public escrow;

    /* Events */
    /// @dev Emitted when a milestone is created
    /// @param id Milestone id
    /// @param title Milestone title
    /// @param amount Milestone amount
    event MilestoneCreated(uint256 indexed id, string title, uint256 amount);

    /// @dev Emitted when funds are recorded as funded for a milestone
    /// @param id Milestone id
    /// @param payer Address that funded the milestone
    /// @param amount Amount funded
    event MilestoneFunded(uint256 indexed id, address indexed payer, uint256 amount);

    /// @dev Emitted when work is submitted for a milestone
    /// @param id Milestone id
    /// @param submitter Address submitting the work
    /// @param evidenceHash Reference/hash for evidence
    event WorkSubmitted(uint256 indexed id, address indexed submitter, string evidenceHash);

    /// @dev Emitted when a milestone is approved
    /// @param id Milestone id
    /// @param approver Address that approved the milestone
    event MilestoneApproved(uint256 indexed id, address indexed approver);

    /// @dev Emitted when a dispute is opened for a milestone
    /// @param id Milestone id
    /// @param opener Address that opened the dispute
    /// @param reason Text reason for the dispute
    event DisputeOpened(uint256 indexed id, address indexed opener, string reason);

    /// @dev Emitted when a dispute is resolved
    /// @param id Milestone id
    /// @param resolver Address resolving the dispute
    /// @param resolution Final status applied to the milestone
    event DisputeResolved(uint256 indexed id, address indexed resolver, MilestoneStatus resolution);
    /// @dev Emitted when a freelancer is assigned to the project
    /// @param freelancer Address of the freelancer assigned
    event FreelancerAssigned(address indexed freelancer);

    /* Modifiers (placeholders) */
    /// @dev Restrict access to the client. `require` checks will be added later.
    modifier onlyClient() virtual {
        // access check to ensure caller is `client` will be added here
        require(msg.sender == client, "Project: caller is not the client");
        _;
    }

    /// @dev Restrict access to the freelancer. `require` checks will be added later.
    modifier onlyFreelancer() virtual {
        // access check to ensure caller is `freelancer` will be added here
        require(msg.sender == freelancer, "Project: caller is not the freelancer");
        _;
    }

    /// @dev Ensure the given milestone is not currently in dispute. Validation to be added later.
    /// @param milestoneId Milestone index to validate
    modifier onlyNotInDispute(uint256 milestoneId) virtual {
        // check to ensure the milestone is not in dispute will be added here
        require(milestones[milestoneId].status != MilestoneStatus.Disputed, "Project: milestone is in dispute");
        _;
    }

    /// @dev Ensure the given milestone index references an existing milestone. Validation to be added later.
    /// @param milestoneId Milestone index to validate
    modifier onlyValidMilestone(uint256 milestoneId) virtual {
        // validation to ensure milestoneId references an existing milestone will be added here
        require(milestoneId < milestones.length, "Project: invalid milestone id");
        _;
    }

    /* Function signatures (no implementations) */

    /// @notice Assign a freelancer to the project
    /// @dev Signature-only; implementation should set `freelancer`.
    /// @param freelancer_ Address of the freelancer
    /// @notice Assign a freelancer to the project
    /// @dev Can only be called once by the `client`. Emits `FreelancerAssigned`.
    /// @param freelancer_ Address of the freelancer
    function addFreelancer(address freelancer_) external virtual onlyClient {
        require(freelancer_ != address(0), "Project: freelancer is zero address");
        require(freelancer == address(0), "Project: freelancer already assigned");
        freelancer = freelancer_;
        emit FreelancerAssigned(freelancer_);
    }

    /// @notice Create a milestone placeholder
    /// @dev Signature-only; implementation should append to `milestones` and emit `MilestoneCreated`.
    /// @param title_ Milestone title
    /// @param amount_ Milestone amount (unit-agnostic)
    /// @return milestoneId Index of the created milestone
    function createMilestone(string calldata title_, uint256 amount_) external virtual onlyClient returns (uint256 milestoneId) {
        // create a new milestone and initialize status to Pending
        milestoneId = milestones.length;
        // copy calldata string into memory for the struct
        string memory titleCopy = title_;
        Milestone memory m = Milestone({
            id: milestoneId,
            title: titleCopy,
            amount: amount_,
            status: MilestoneStatus.Pending,
            evidenceHash: ""
        });
        milestones.push(m);
        emit MilestoneCreated(milestoneId, titleCopy, amount_);
        return milestoneId;
    }

    /// @notice Fund a milestone (signature only)
    /// @dev Signature-only; implementations may interact with an escrow contract.
    /// @param milestoneId Milestone index
    function fundMilestone(uint256 milestoneId) external virtual onlyClient {
        // Checks
        require(milestoneId < milestones.length, "Project: invalid milestone id");
        Milestone storage m = milestones[milestoneId];
        require(m.status == MilestoneStatus.Pending, "Project: milestone not pending");
        require(m.amount > 0, "Project: milestone amount is zero");
        require(address(escrow) != address(0), "Project: escrow not set");

        // Interactions (no ETH forwarded here)
        escrow.depositFunds(milestoneId); // external call; client funds Escrow separately in later phase

        // Effects (update state after successful external interaction)
        m.status = MilestoneStatus.Funded;

        // Emit event reflecting funding
        emit MilestoneFunded(milestoneId, msg.sender, m.amount);
    }

    /// @notice Submit work for a milestone
    /// @dev Signature-only; implementation should record evidence and emit `WorkSubmitted`.
    /// @param milestoneId Milestone index
    /// @param evidenceHash_ Hash or reference to evidence
    function submitWork(uint256 milestoneId, string calldata evidenceHash_)
        external
        virtual
        onlyFreelancer
        onlyValidMilestone(milestoneId)
    {
        // Checks
        Milestone storage m = milestones[milestoneId];
        require(m.status == MilestoneStatus.Funded, "Project: milestone not funded");

        // Effects
        m.evidenceHash = evidenceHash_;
        m.status = MilestoneStatus.Submitted;

        // Interactions: none
        emit WorkSubmitted(milestoneId, msg.sender, evidenceHash_);
    }

    /// @notice Approve a milestone
    /// @dev Signature-only; implementation should update status and emit `MilestoneApproved`.
    /// @param milestoneId Milestone index
    function approveMilestone(uint256 milestoneId)
        external
        virtual
        onlyClient
        onlyValidMilestone(milestoneId)
    {
        // Checks
        Milestone storage m = milestones[milestoneId];
        require(m.status == MilestoneStatus.Submitted, "Project: milestone not submitted");
        require(address(escrow) != address(0), "Project: escrow not set");

        // Effects
        m.status = MilestoneStatus.Approved;

        // Interactions
        escrow.releaseFunds(milestoneId);

        // Event
        emit MilestoneApproved(milestoneId, msg.sender);
    }

    /// @notice Open a dispute against a milestone
    /// @dev Signature-only; implementation should set status to `Disputed` and emit `DisputeOpened`.
    /// @param milestoneId Milestone index
    /// @param reason_ Reason for dispute
    function openDispute(uint256 milestoneId, string calldata reason_) external virtual;

    /// @notice Resolve a dispute for a milestone
    /// @dev Signature-only; implementation should set final status and emit `DisputeResolved`.
    /// @param milestoneId Milestone index
    /// @param resolution New status to set (e.g., Resolved)
    function resolveDispute(uint256 milestoneId, MilestoneStatus resolution) external virtual;
}
