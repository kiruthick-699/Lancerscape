/**
 * backend/src/services/disputeService.ts
 * 
 * Business logic layer for dispute management
 * Implements full dispute lifecycle with status transitions
 */

/**
 * Dispute status type
 */
export type DisputeStatus = 
  | 'Pending' 
  | 'EvidenceSubmitted' 
  | 'AI_SummaryGenerated' 
  | 'AdminReview' 
  | 'Resolved';

/**
 * Temporary in-memory storage for disputes
 * TODO: Replace with real database (MongoDB, PostgreSQL, etc.)
 */
const disputesDB = new Map<string, any>();

/**
 * createDisputeEntry
 * 
 * Purpose: Create a new dispute record in the database
 * Initial status: Pending
 * 
 * @param projectId - Project contract address or ID
 * @param milestoneId - Milestone identifier within the project
 * @param openedBy - Wallet address of the user opening the dispute
 * @param reason - Text description of the dispute reason
 * @param projectDescription - Optional project description
 * @param milestoneDescription - Optional milestone description
 * @returns Dispute object
 */
export const createDisputeEntry = async (
  projectId: string,
  milestoneId: number,
  openedBy: string,
  reason: string,
  projectDescription?: string,
  milestoneDescription?: string
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
  if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
    throw new Error('Reason must be at least 10 characters');
  }

  // Generate unique dispute ID
  const disputeId = `dispute_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  // Create dispute record with Pending status
  const dispute = {
    id: disputeId,
    projectId,
    milestoneId,
    openedBy,
    reason: reason.trim(),
    status: 'Pending' as DisputeStatus,
    evidenceHashes: [],
    aiSummary: null,
    freelancerResponse: null,
    projectDescription: projectDescription || '',
    milestoneDescription: milestoneDescription || '',
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    resolvedAt: null,
    resolution: null,
  };

  // Store in temporary in-memory database
  disputesDB.set(disputeId, dispute);

  return dispute;
};

/**
 * saveEvidence
 * 
 * Purpose: Associate uploaded evidence files with a dispute
 * Status transition: Pending → EvidenceSubmitted
 * 
 * @param disputeId - Dispute identifier
 * @param evidenceMetadata - Array of evidence file metadata objects
 * @param uploadedBy - Wallet address of uploader
 * @returns Updated dispute object
 */
export const saveEvidence = async (
  disputeId: string,
  evidenceMetadata: any[],
  uploadedBy: string
): Promise<any> => {
  // Validate disputeId
  if (!disputeId || typeof disputeId !== 'string') {
    throw new Error('Invalid disputeId');
  }

  // Validate evidenceMetadata
  if (!Array.isArray(evidenceMetadata) || evidenceMetadata.length === 0) {
    throw new Error('evidenceMetadata must be a non-empty array');
  }

  // Check if dispute exists
  const dispute = disputesDB.get(disputeId);
  if (!dispute) {
    throw new Error('Dispute not found');
  }

  // Check if dispute is already resolved
  if (dispute.status === 'Resolved') {
    throw new Error('Cannot add evidence to a resolved dispute');
  }

  // Append evidence metadata (store metadata only, not binary data)
  dispute.evidenceHashes = [...dispute.evidenceHashes, ...evidenceMetadata];
  
  // Update status to EvidenceSubmitted
  dispute.status = 'EvidenceSubmitted' as DisputeStatus;
  dispute.lastModified = new Date().toISOString();

  // If uploaded by freelancer, store their response
  if (uploadedBy !== dispute.openedBy) {
    dispute.freelancerResponse = `Evidence submitted by ${uploadedBy}`;
  }

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
 * Status transition: EvidenceSubmitted → AI_SummaryGenerated
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
  
  // Update status to AI_SummaryGenerated
  dispute.status = 'AI_SummaryGenerated' as DisputeStatus;
  dispute.lastModified = new Date().toISOString();

  // Update in storage
  disputesDB.set(disputeId, dispute);

  return dispute;
};

/**
 * getAllDisputes
 * 
 * Purpose: Retrieve all disputes with optional filtering and pagination
 * 
 * @param filters - Optional filters (status, projectId, limit, offset)
 * @returns Object with disputes array and total count
 */
export const getAllDisputes = async (filters: {
  status?: DisputeStatus;
  projectId?: string;
  limit?: number;
  offset?: number;
}): Promise<{ disputes: any[]; total: number }> => {
  let allDisputes = Array.from(disputesDB.values());

  // Apply status filter
  if (filters.status) {
    allDisputes = allDisputes.filter(d => d.status === filters.status);
  }

  // Apply projectId filter
  if (filters.projectId) {
    allDisputes = allDisputes.filter(d => d.projectId === filters.projectId);
  }

  const total = allDisputes.length;

  // Apply pagination
  const offset = filters.offset || 0;
  const limit = filters.limit || 20;
  const paginatedDisputes = allDisputes.slice(offset, offset + limit);

  return {
    disputes: paginatedDisputes,
    total,
  };
};

/**
 * updateDisputeStatus
 * 
 * Purpose: Update dispute status manually
 * 
 * @param disputeId - Dispute identifier
 * @param newStatus - New status to set
 * @returns Updated dispute object
 */
export const updateDisputeStatus = async (
  disputeId: string,
  newStatus: DisputeStatus
): Promise<any> => {
  if (!disputeId || typeof disputeId !== 'string') {
    throw new Error('Invalid disputeId');
  }

  const validStatuses: DisputeStatus[] = [
    'Pending',
    'EvidenceSubmitted',
    'AI_SummaryGenerated',
    'AdminReview',
    'Resolved',
  ];

  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const dispute = disputesDB.get(disputeId);
  if (!dispute) {
    throw new Error('Dispute not found');
  }

  dispute.status = newStatus;
  dispute.lastModified = new Date().toISOString();

  if (newStatus === 'Resolved' && !dispute.resolvedAt) {
    dispute.resolvedAt = new Date().toISOString();
  }

  disputesDB.set(disputeId, dispute);
  return dispute;
};

/**
 * listDisputes
 * 
 * Purpose: Retrieve all disputes from storage
 * @returns Array of dispute objects
 */
export const listDisputes = async (): Promise<any[]> => {
  return Array.from(disputesDB.values());
};

/**
 * resolveDisputeRecord
 * 
 * Purpose: Finalize a dispute with an admin decision
 * Status transition: Any → Resolved
 * NO blockchain calls here. Purely updates stored record.
 * 
 * @param disputeId - Dispute identifier
 * @param decision - "client" or "freelancer"
 * @returns Updated dispute object
 */
export const resolveDisputeRecord = async (
  disputeId: string,
  decision: 'client' | 'freelancer'
): Promise<any> => {
  // Validate inputs
  if (!disputeId || typeof disputeId !== 'string') {
    throw new Error('Invalid disputeId');
  }
  if (decision !== 'client' && decision !== 'freelancer') {
    throw new Error('Invalid decision: must be "client" or "freelancer"');
  }

  // Fetch dispute from database
  const dispute = disputesDB.get(disputeId);
  if (!dispute) {
    throw new Error('Dispute not found');
  }

  // Check if already resolved
  if (dispute.status === 'Resolved') {
    throw new Error('Dispute already finalized');
  }

  // Update dispute status to Resolved
  dispute.status = 'Resolved' as DisputeStatus;
  dispute.resolution = decision === 'client' ? 'client_wins' : 'freelancer_wins';
  dispute.resolvedAt = new Date().toISOString();
  dispute.lastModified = new Date().toISOString();

  // Save AI summary if it exists but hasn't been persisted yet
  // (This ensures we preserve any AI analysis done before resolution)
  if (dispute.aiSummary && !dispute.aiSummaryPersisted) {
    dispute.aiSummaryPersisted = true;
  }

  // Persist updated dispute record
  disputesDB.set(disputeId, dispute);
  
  return dispute;
};
