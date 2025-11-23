// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ProjectFactory (skeleton)
/// @notice Minimal, intentionally logic-free skeleton for project deployment tracking
/// @dev This abstract contract declares storage and signatures for a factory that would
///      create and register per-project contracts. Implementations should provide the logic.
abstract contract ProjectFactory {
    /// @dev Basic metadata for a project
    /// @dev Fields:
    ///  - title: short project title
    ///  - description: longer project description
    ///  - client: address of the project owner/client
    ///  - projectContract: deployed project contract address (if any)
    struct ProjectMetadata {
        string title;
        string description;
        address client;
        address projectContract;
    }

    /// @dev Stored list of projects
    ProjectMetadata[] public projects;

    /// @dev Convenience array of deployed project contract addresses
    address[] public projectContracts;

    /// @dev Mapping from client address to list of project ids
    mapping(address => uint256[]) public projectsByClient;

    /// @dev Emitted when a new project is created (skeleton event)
    /// @param projectId Index of the project in `projects` array
    /// @param projectContract Address of the deployed project contract instance
    /// @param client Address of the client who owns the project
    event ProjectCreated(uint256 indexed projectId, address indexed projectContract, address indexed client);

    /// @notice Create a new project entry and (optionally) deploy a Project contract
    /// @dev Signature-only; implementation omitted. Implementations should push to `projects` and
    ///      emit `ProjectCreated` when appropriate.
    /// @param title Short title for the project
    /// @param description Longer description
    /// @param client Address of the client / project owner
    /// @return projectContract Address of the deployed project contract (if any)
    function createProject(
        string calldata title,
        string calldata description,
        address client
    ) external virtual returns (address projectContract);

    /// @notice Read project metadata by id
    /// @dev Signature-only; implementation omitted. Should return the `ProjectMetadata` stored at `projectId`.
    /// @param projectId Index of the project in storage
    function getProject(uint256 projectId) external view virtual returns (ProjectMetadata memory);

    /// @notice Returns total number of projects tracked
    /// @dev Signature-only; implementation omitted. Should return `projects.length`.
    function totalProjects() external view virtual returns (uint256);
}
