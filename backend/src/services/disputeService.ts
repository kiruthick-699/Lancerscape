/**
 * backend/src/services/disputeService.ts
 * 
 * Business logic layer for dispute management
 * Phase 7: Implement database operations and external service integrations
 */

/**
 * Temporary in-memory storage for disputes
 * TODO: Phase 7 - Replace with real database (MongoDB, PostgreSQL, etc.)
 */
const disputesDB = new Map<string, any>();

/**
 * createDisputeEntry
 * 
 * Purpose: Create a new dispute record in the database
 * 
 * @param projectId - Project contract address or ID
 * @param milestoneId - Milestone identifier within the project
 * @param openedBy - Wallet address of the user opening the dispute
 * @param reason - Text description of the dispute reason
 * @returns Dispute ID or object
 */
export const createDisputeEntry = async (
  projectId: string,
  milestoneId: number,
  openedBy: string,
  reason: string
): Promise<any> => {
  // Validate input parameters
  if (!projectId || typeof projectId !== 'string') {
    throw new Error('Invalid projectId');
  }
  if (typeof milestoneId !== 'number' || milestoneId < 0) {
    throw new Error('Invalid milestoneId');
  }
  if (!openedBy || typeof openedBy !== 'string' || !openedBy.startsWith('0x')) {
    throw new Error('Invalid openedBy address');
  }
  if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
    throw new Error('Invalid reason');
  }

  // Generate unique dispute ID
  const disputeId = `dispute_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  // Create dispute record
  const dispute = {
    id: disputeId,
    projectId,
    milestoneId,
    openedBy,
    reason: reason.trim(),
    status: 'open',
    evidenceHashes: [],
    aiSummary: null,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  };

  // Store in temporary in-memory database
  disputesDB.set(disputeId, dispute);

  return dispute;
};

/**
 * saveEvidence
 * 
 * Purpose: Associate uploaded evidence files with a dispute
 * 
 * @param disputeId - Dispute identifier
 * @param filePaths - Array of IPFS CIDs or file paths
 * @returns Updated dispute object
 */
export const saveEvidence = async (
  disputeId: string,
  filePaths: string[]
): Promise<any> => {
  // Validate disputeId
  if (!disputeId || typeof disputeId !== 'string') {
    throw new Error('Invalid disputeId');
  }

  // Validate filePaths
  if (!Array.isArray(filePaths) || filePaths.length === 0) {
    throw new Error('filePaths must be a non-empty array');
  }

  // Check if dispute exists
  const dispute = disputesDB.get(disputeId);
  if (!dispute) {
    throw new Error('Dispute not found');
  }

  // Check if dispute is already resolved
  if (dispute.status === 'resolved' || dispute.status === 'closed') {
    throw new Error('Cannot add evidence to a resolved dispute');
  }

  // Append file paths to evidence array (only store references, not binary data)
  dispute.evidenceHashes = [...dispute.evidenceHashes, ...filePaths];
  dispute.lastModified = new Date().toISOString();

  // Update in storage
  disputesDB.set(disputeId, dispute);

  return dispute;
};

/**
 * fetchDispute
 * 
 * Purpose: Retrieve dispute details from database
 * 
 * @param disputeId - Dispute identifier
 * @returns Dispute object with all details
 */
export const fetchDispute = async (disputeId: string): Promise<any> => {
  // Validate disputeId format
  if (!disputeId || typeof disputeId !== 'string') {
    throw new Error('Invalid disputeId');
  }

  // Query in-memory database
  const dispute = disputesDB.get(disputeId);

  // Return null if not found (or throw error based on preference)
  if (!dispute) {
    return null;
  }

  // Return dispute object
  return dispute;
};

/**
 * attachAISummary
 * 
 * Purpose: Save AI-generated summary and recommendation to a dispute
 * 
 * @param disputeId - Dispute identifier
 * @param summaryData - AI analysis result object
 * @returns Updated dispute object
 */
export const attachAISummary = async (
  disputeId: string,
  summaryData: {
    summary: string;
    recommendation: 'approve' | 'reject' | 'partial';
    confidence: number;
    reasoning: string;
  }
): Promise<any> => {
  // Validate disputeId
  if (!disputeId || typeof disputeId !== 'string') {
    throw new Error('Invalid disputeId');
  }

  // Validate summaryData structure
  if (!summaryData || typeof summaryData !== 'object') {
    throw new Error('Invalid summaryData');
  }
  if (!summaryData.summary || typeof summaryData.summary !== 'string') {
    throw new Error('Invalid summary field');
  }
  if (!['approve', 'reject', 'partial'].includes(summaryData.recommendation)) {
    throw new Error('Invalid recommendation field');
  }
  if (typeof summaryData.confidence !== 'number' || summaryData.confidence < 0 || summaryData.confidence > 1) {
    throw new Error('Invalid confidence field (must be between 0 and 1)');
  }
  if (!summaryData.reasoning || typeof summaryData.reasoning !== 'string') {
    throw new Error('Invalid reasoning field');
  }

  // Check if dispute exists
  const dispute = disputesDB.get(disputeId);
  if (!dispute) {
    throw new Error('Dispute not found');
  }

  // Attach AI summary
  dispute.aiSummary = {
    ...summaryData,
    generatedAt: new Date().toISOString(),
  };
  dispute.lastModified = new Date().toISOString();

  // Update in storage
  disputesDB.set(disputeId, dispute);

  return dispute;
};
