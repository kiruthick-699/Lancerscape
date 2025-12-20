// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./IEscrow.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Project
/// @notice Production-ready contract for a single freelance project with milestone-based escrow
/// @dev Implements full milestone lifecycle with dispute resolution and reentrancy protection
contract Project is ReentrancyGuard {
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
    address public admin;
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

    /// @dev Emitted when the admin is changed
    /// @param oldAdmin Previous admin address
    /// @param newAdmin New admin address
    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);

    /* Modifiers */
    /// @dev Restrict access to the client
    modifier onlyClient() {
        require(msg.sender == client, "Project: caller is not the client");
        _;
    }

    /// @dev Restrict access to the freelancer
    modifier onlyFreelancer() {
        require(msg.sender == freelancer, "Project: caller is not the freelancer");
        _;
    }

    /// @dev Restrict access to the admin
    modifier onlyAdmin() {
        require(msg.sender == admin, "Project: caller is not the admin");
        _;
    }

    /// @dev Ensure the given milestone is not currently in dispute
    /// @param milestoneId Milestone index to validate
    modifier onlyNotInDispute(uint256 milestoneId) {
        require(milestones[milestoneId].status != MilestoneStatus.Disputed, "Project: milestone is in dispute");
        _;
    }

    /// @dev Ensure the given milestone index references an existing milestone
    /// @param milestoneId Milestone index to validate
    modifier onlyValidMilestone(uint256 milestoneId) {
        require(milestoneId < milestones.length, "Project: invalid milestone id");
        _;
    }

    /// @notice Assign a freelancer to the project
    /// @dev Can only be called once by the `client`. Emits `FreelancerAssigned`.
    /// @param freelancer_ Address of the freelancer
    function addFreelancer(address freelancer_) external onlyClient {
        require(freelancer_ != address(0), "Project: freelancer is zero address");
        require(freelancer == address(0), "Project: freelancer already assigned");
        freelancer = freelancer_;
        emit FreelancerAssigned(freelancer_);
    }

    /// @notice Create a milestone
    /// @dev Appends milestone to storage with Pending status. Only client can create milestones.
    /// @param title_ Milestone title
    /// @param amount_ Milestone amount in wei
    /// @return milestoneId Index of the created milestone
    function createMilestone(string calldata title_, uint256 amount_) external onlyClient returns (uint256 milestoneId) {
        require(bytes(title_).length > 0, "Project: title is empty");
        require(amount_ > 0, "Project: amount must be greater than zero");

        milestoneId = milestones.length;
        milestones.push(Milestone({
            id: milestoneId,
            title: title_,
            amount: amount_,
            status: MilestoneStatus.Pending,
            evidenceHash: ""
        }));

        emit MilestoneCreated(milestoneId, title_, amount_);
    }

    /// @notice Fund a milestone with ETH
    /// @dev Client deposits funds into escrow. Transitions Pending → Funded. Protected against reentrancy.
    /// @param milestoneId Milestone index
    function fundMilestone(uint256 milestoneId) external payable onlyClient onlyValidMilestone(milestoneId) nonReentrant {
        Milestone storage m = milestones[milestoneId];
        require(m.status == MilestoneStatus.Pending, "Project: milestone not pending");
        require(msg.value == m.amount, "Project: incorrect funding amount");
        require(address(escrow) != address(0), "Project: escrow not set");

        // Effects
        m.status = MilestoneStatus.Funded;

        // Interactions - deposit funds into escrow
        escrow.depositFunds{value: msg.value}(milestoneId);

        emit MilestoneFunded(milestoneId, msg.sender, m.amount);
    }

    /// @notice Submit work for a milestone
    /// @dev Freelancer provides evidence hash. Transitions Funded → Submitted.
    /// @param milestoneId Milestone index
    /// @param evidenceHash_ IPFS hash or reference to submitted work
    function submitWork(uint256 milestoneId, string calldata evidenceHash_)
        external
        onlyFreelancer
        onlyValidMilestone(milestoneId)
        nonReentrant
    {
        require(bytes(evidenceHash_).length > 0, "Project: evidence hash is empty");

        Milestone storage m = milestones[milestoneId];
        require(m.status == MilestoneStatus.Funded, "Project: milestone not funded");

        // Effects
        m.evidenceHash = evidenceHash_;
        m.status = MilestoneStatus.Submitted;

        emit WorkSubmitted(milestoneId, msg.sender, evidenceHash_);
    }

    /// @notice Approve a milestone
    /// @dev Client approves work. Transitions Submitted → Approved. Releases funds to freelancer. Protected against reentrancy.
    /// @param milestoneId Milestone index
    function approveMilestone(uint256 milestoneId)
        external
        onlyClient
        onlyValidMilestone(milestoneId)
        nonReentrant
    {
        Milestone storage m = milestones[milestoneId];
        require(m.status == MilestoneStatus.Submitted, "Project: milestone not submitted");
        require(address(escrow) != address(0), "Project: escrow not set");

        // Effects
        m.status = MilestoneStatus.Approved;

        // Interactions - release funds from escrow to freelancer
        escrow.releaseFunds(milestoneId);

        emit MilestoneApproved(milestoneId, msg.sender);
    }

    /// @notice Open a dispute for a milestone
    /// @dev Either client or freelancer can dispute. Transitions Funded/Submitted → Disputed.
    /// @param milestoneId Milestone index
    /// @param reason_ Reason for opening the dispute
    function openDispute(uint256 milestoneId, string calldata reason_)
        external
        onlyValidMilestone(milestoneId)
        onlyNotInDispute(milestoneId)
        nonReentrant
    {
        require(msg.sender == client || msg.sender == freelancer, "Project: only client or freelancer can dispute");
        require(bytes(reason_).length > 0, "Project: reason is empty");

        Milestone storage m = milestones[milestoneId];
        require(
            m.status == MilestoneStatus.Submitted || m.status == MilestoneStatus.Funded,
            "Project: can only dispute funded or submitted milestones"
        );

        // Effects
        m.status = MilestoneStatus.Disputed;

        emit DisputeOpened(milestoneId, msg.sender, reason_);
    }

    /// @notice Resolve a dispute for a milestone
    /// @dev Admin decides outcome. Transitions Disputed → Resolved. Executes escrow action based on decision. Protected against reentrancy.
    /// @param milestoneId Milestone index
    /// @param clientWins True to refund client, false to release to freelancer
    function resolveDispute(uint256 milestoneId, bool clientWins)
        external
        onlyAdmin
        onlyValidMilestone(milestoneId)
        nonReentrant
    {
        Milestone storage m = milestones[milestoneId];
        require(m.status == MilestoneStatus.Disputed, "Project: milestone not in dispute");
        require(address(escrow) != address(0), "Project: escrow not set");

        // Effects
        m.status = MilestoneStatus.Resolved;

        // Interactions - execute escrow decision
        if (clientWins) {
            escrow.refundFunds(milestoneId);
        } else {
            escrow.releaseFunds(milestoneId);
        }

        emit DisputeResolved(milestoneId, msg.sender, MilestoneStatus.Resolved);
    }

    /// @notice Constructor
    /// @dev Initialize project with client, admin, and metadata
    /// @param client_ Client address
    /// @param admin_ Admin address for dispute resolution
    /// @param title_ Project title
    /// @param description_ Project description
    /// @param escrow_ Address of the escrow contract
    constructor(
        address client_,
        address admin_,
        string memory title_,
        string memory description_,
        address escrow_
    ) {
        require(client_ != address(0), "Project: client is zero address");
        require(admin_ != address(0), "Project: admin is zero address");
        require(escrow_ != address(0), "Project: escrow is zero address");
        require(bytes(title_).length > 0, "Project: title is empty");

        client = client_;
        admin = admin_;
        projectTitle = title_;
        projectDescription = description_;
        escrow = IEscrow(escrow_);
    }

    /// @notice Get total number of milestones
    /// @return Total milestone count
    function getMilestoneCount() external view returns (uint256) {
        return milestones.length;
    }

    /// @notice Get milestone details
    /// @param milestoneId Milestone index
    /// @return Milestone struct data
    function getMilestone(uint256 milestoneId) external view onlyValidMilestone(milestoneId) returns (Milestone memory) {
        return milestones[milestoneId];
    }
}
