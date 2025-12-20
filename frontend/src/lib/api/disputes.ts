/**
 * Dispute API Client
 * 
 * Handles all backend API calls for dispute management
 * Uses NEXT_PUBLIC_API_URL from environment variables
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Sanitize string input to prevent XSS
 */
function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 5000); // Limit length
}

/**
 * Sanitize Ethereum address
 */
function sanitizeAddress(address: string): string {
  const cleaned = address.trim().toLowerCase();
  if (!/^0x[a-f0-9]{40}$/.test(cleaned)) {
    throw new Error('Invalid Ethereum address format');
  }
  return cleaned;
}

/**
 * Open a new dispute
 */
export async function openDispute(params: {
  projectId: string;
  milestoneId: number;
  reason: string;
  openedBy: string;
  projectDescription?: string;
  milestoneDescription?: string;
}): Promise<{ success: boolean; dispute: any }> {
  // Sanitize inputs
  const sanitized = {
    projectId: sanitizeAddress(params.projectId),
    milestoneId: params.milestoneId,
    reason: sanitizeString(params.reason),
    openedBy: sanitizeAddress(params.openedBy),
    projectDescription: params.projectDescription ? sanitizeString(params.projectDescription) : undefined,
    milestoneDescription: params.milestoneDescription ? sanitizeString(params.milestoneDescription) : undefined,
  };

  // Validate
  if (sanitized.milestoneId < 0) {
    throw new Error('Invalid milestone ID');
  }
  if (sanitized.reason.length < 10) {
    throw new Error('Reason must be at least 10 characters');
  }

  const response = await fetch(`${API_URL}/api/disputes/open`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sanitized),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Upload evidence files for a dispute
 */
export async function uploadEvidence(params: {
  disputeId: string;
  uploadedBy: string;
  files: File[];
}): Promise<{ success: boolean; dispute: any; uploadedFiles: any[] }> {
  // Sanitize inputs
  const disputeId = sanitizeString(params.disputeId);
  const uploadedBy = sanitizeAddress(params.uploadedBy);

  // Validate
  if (!disputeId || disputeId.length === 0) {
    throw new Error('Dispute ID is required');
  }
  if (!params.files || params.files.length === 0) {
    throw new Error('At least one file is required');
  }
  if (params.files.length > 5) {
    throw new Error('Maximum 5 files allowed');
  }

  // Validate file sizes (max 10MB each)
  for (const file of params.files) {
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`File ${file.name} exceeds 10MB limit`);
    }
  }

  // Build FormData
  const formData = new FormData();
  formData.append('disputeId', disputeId);
  formData.append('uploadedBy', uploadedBy);
  params.files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await fetch(`${API_URL}/api/disputes/upload-evidence`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Generate AI summary for a dispute
 */
export async function generateAISummary(disputeId: string): Promise<{
  disputeId: string;
  summary: any;
  message: string;
}> {
  // Sanitize input
  const sanitized = sanitizeString(disputeId);

  if (!sanitized || sanitized.length === 0) {
    throw new Error('Dispute ID is required');
  }

  const response = await fetch(`${API_URL}/api/disputes/ai-summary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ disputeId: sanitized }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'AI summary failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get dispute details by ID
 */
export async function getDispute(disputeId: string): Promise<{ success: boolean; dispute: any | null }> {
  // Sanitize input
  const sanitized = sanitizeString(disputeId);

  if (!sanitized || sanitized.length === 0) {
    throw new Error('Dispute ID is required');
  }

  const response = await fetch(`${API_URL}/api/disputes/${encodeURIComponent(sanitized)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    // Gracefully handle 404 without throwing to reduce console noise
    if (response.status === 404) {
      return { success: false, dispute: null };
    }
    const error = await response.json().catch(() => ({ error: 'Failed to fetch dispute' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * List all disputes with optional filters
 */
export async function listDisputes(params?: {
  status?: string;
  projectId?: string;
  limit?: number;
  offset?: number;
}): Promise<{ success: boolean; total: number; count: number; disputes: any[] }> {
  const queryParams = new URLSearchParams();

  if (params?.status) {
    queryParams.append('status', sanitizeString(params.status));
  }
  if (params?.projectId) {
    queryParams.append('projectId', sanitizeAddress(params.projectId));
  }
  if (params?.limit !== undefined) {
    queryParams.append('limit', Math.min(Math.max(1, params.limit), 100).toString());
  }
  if (params?.offset !== undefined) {
    queryParams.append('offset', Math.max(0, params.offset).toString());
  }

  const url = `${API_URL}/api/disputes?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to list disputes' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Dispute status type
 */
export type DisputeStatus = 
  | 'Pending' 
  | 'EvidenceSubmitted' 
  | 'AI_SummaryGenerated' 
  | 'AdminReview' 
  | 'Resolved';
