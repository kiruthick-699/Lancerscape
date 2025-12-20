# LancerScape Backend API Documentation

**Version**: 1.0.0  
**Base URL**: `http://localhost:4000` (development) | `https://api.lancerscape.io` (production)  
**Last Updated**: November 28, 2025

---

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Dispute Endpoints](#dispute-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Response Codes](#response-codes)

---

## Overview

The LancerScape backend API provides endpoints for dispute management, evidence submission, AI-powered dispute analysis, and administrative functions. All endpoints accept and return JSON data unless otherwise specified.

### Base URL
```
Development: http://localhost:4000
Production: https://api.lancerscape.io
```

---

## Authentication

**Current Status**: Phase 1 - No authentication required  
**Future**: JWT-based authentication with wallet signature verification

---

## Error Handling

All error responses follow this format:

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {} // Optional additional context
}
```

### Common Error Codes
- `400` - Bad Request (invalid input)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (already exists or invalid state)
- `500` - Internal Server Error

---

## Dispute Endpoints

### 1. Open a Dispute

Create a new dispute record for a milestone.

**Endpoint**: `POST /api/disputes`

**Description**: Opens a dispute for a specific milestone and stores the client's reason/statement.

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "disputeId": "dispute-uuid-123",
  "projectId": "0x1234567890abcdef1234567890abcdef12345678",
  "milestoneId": 1,
  "openedBy": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
  "reason": "Work delivered does not match agreed specifications. Missing features X, Y, and Z."
}
```

**Required Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `disputeId` | string | Unique identifier for the dispute |
| `projectId` | string | Project contract address (0x...) |
| `milestoneId` | number | Milestone ID within the project |
| `openedBy` | string | Wallet address of dispute opener |
| `reason` | string | Client's statement explaining the dispute |

**Success Response** (201 Created):
```json
{
  "success": true,
  "dispute": {
    "id": "dispute-uuid-123",
    "projectId": "0x1234567890abcdef1234567890abcdef12345678",
    "milestoneId": 1,
    "openedBy": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "reason": "Work delivered does not match agreed specifications...",
    "status": "open",
    "createdAt": "2025-11-28T10:30:00Z",
    "evidenceHashes": []
  }
}
```

**Error Responses**:

400 Bad Request - Missing required fields:
```json
{
  "error": "Missing required field: disputeId"
}
```

409 Conflict - Dispute already exists:
```json
{
  "error": "Dispute with this ID already exists"
}
```

---

### 2. Upload Evidence

Submit evidence files or freelancer response to an existing dispute.

**Endpoint**: `POST /api/disputes/:id/evidence`

**Description**: Uploads evidence files, metadata, or freelancer's response to a dispute.

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Dispute ID |

**Request Headers**:
```
Content-Type: application/json
```

**Request Body** (Evidence Upload):
```json
{
  "evidenceHash": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  "metadata": {
    "filename": "screenshot-proof.png",
    "description": "Screenshot showing incomplete feature",
    "uploadedBy": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "timestamp": "2025-11-28T10:35:00Z"
  }
}
```

**Request Body** (Freelancer Response):
```json
{
  "freelancerResponse": "All agreed features have been delivered as per the original contract. The client's concerns are based on misunderstanding of scope.",
  "evidenceHash": "QmHash456..."
}
```

**Required Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `evidenceHash` | string | IPFS hash or unique identifier for evidence file |
| `metadata` | object | (Optional) File metadata |
| `freelancerResponse` | string | (Optional) Freelancer's counter-statement |

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Evidence uploaded successfully",
  "dispute": {
    "id": "dispute-uuid-123",
    "evidenceHashes": ["QmHash123...", "QmHash456..."],
    "freelancerResponse": "All agreed features have been delivered..."
  }
}
```

**Error Responses**:

404 Not Found:
```json
{
  "error": "Dispute not found"
}
```

400 Bad Request:
```json
{
  "error": "Missing evidenceHash or freelancerResponse"
}
```

---

### 3. Generate AI Summary

Request AI-powered analysis of a dispute.

**Endpoint**: `POST /api/disputes/ai-summary`

**Description**: Triggers AI analysis of dispute evidence, statements, and generates a recommendation.

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "disputeId": "dispute-uuid-123"
}
```

**Required Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `disputeId` | string | Dispute ID to analyze |

**Success Response** (200 OK):
```json
{
  "success": true,
  "aiSummary": {
    "summary": "This dispute centers on disagreement about feature completeness. The client claims features X, Y, and Z are missing, while the freelancer asserts all agreed-upon work was delivered.",
    "recommendation": "approve",
    "confidence": 0.75,
    "reasoning": {
      "clientStrengths": [
        "Provided specific examples of missing features",
        "Screenshots support claims of incomplete work"
      ],
      "freelancerStrengths": [
        "Original contract supports freelancer's position",
        "Evidence shows features were delivered in different form"
      ],
      "inconsistencies": [
        "Client's interpretation of 'feature complete' differs from contract language",
        "Timeline suggests client changed requirements mid-project"
      ]
    },
    "generatedAt": "2025-11-28T10:45:00Z"
  }
}
```

**Error Responses**:

404 Not Found:
```json
{
  "error": "Dispute not found"
}
```

500 Internal Server Error - AI service failure:
```json
{
  "error": "AI service unavailable. Please try again later."
}
```

---

### 4. Get Dispute Summary

Retrieve the AI-generated summary for a dispute.

**Endpoint**: `GET /api/disputes/:id/summary`

**Description**: Fetches the stored AI summary and dispute details.

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Dispute ID |

**Success Response** (200 OK):
```json
{
  "summary": {
    "disputeId": "dispute-uuid-123",
    "status": "ai_generated",
    "aiSummary": {
      "summary": "This dispute centers on disagreement about feature completeness...",
      "recommendation": "approve",
      "confidence": 0.75,
      "reasoning": {
        "clientStrengths": ["..."],
        "freelancerStrengths": ["..."],
        "inconsistencies": ["..."]
      }
    },
    "milestoneTitle": "Phase 1 - Design Mockups",
    "amount": "0.5 ETH"
  }
}
```

**Error Responses**:

404 Not Found:
```json
{
  "error": "Dispute not found"
}
```

404 Not Found - No AI summary:
```json
{
  "error": "AI summary not yet generated for this dispute"
}
```

---

## Admin Endpoints

### 5. List All Disputes

Retrieve all disputes in the system (admin only).

**Endpoint**: `GET /api/admin/disputes`

**Description**: Fetches a list of all disputes with their current status.

**Query Parameters** (Optional):
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `open`, `ai_generated`, `resolved` |
| `limit` | number | Maximum results to return (default: 50) |
| `offset` | number | Pagination offset (default: 0) |

**Success Response** (200 OK):
```json
{
  "disputes": [
    {
      "id": "dispute-uuid-123",
      "projectId": "0x1234...",
      "milestoneId": 1,
      "openedBy": "0xabcd...",
      "status": "ai_generated",
      "createdAt": "2025-11-28T10:30:00Z",
      "aiSummary": {
        "recommendation": "approve",
        "confidence": 0.75
      }
    },
    {
      "id": "dispute-uuid-456",
      "projectId": "0x5678...",
      "milestoneId": 2,
      "openedBy": "0xefgh...",
      "status": "open",
      "createdAt": "2025-11-27T14:20:00Z"
    }
  ],
  "total": 2,
  "limit": 50,
  "offset": 0
}
```

**Error Responses**:

500 Internal Server Error:
```json
{
  "error": "Failed to fetch disputes"
}
```

---

### 6. Get Single Dispute (Admin)

Retrieve detailed information about a specific dispute (admin only).

**Endpoint**: `GET /api/admin/disputes/:id`

**Description**: Fetches complete dispute details including evidence, AI summary, and all statements.

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Dispute ID |

**Success Response** (200 OK):
```json
{
  "dispute": {
    "id": "dispute-uuid-123",
    "projectId": "0x1234567890abcdef1234567890abcdef12345678",
    "milestoneId": 1,
    "openedBy": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "reason": "Work delivered does not match agreed specifications. Missing features X, Y, and Z.",
    "freelancerResponse": "All agreed features have been delivered as per the original contract.",
    "status": "ai_generated",
    "evidenceHashes": [
      "QmHash123...",
      "QmHash456..."
    ],
    "aiSummary": {
      "summary": "This dispute centers on disagreement about feature completeness...",
      "recommendation": "approve",
      "confidence": 0.75,
      "reasoning": {
        "clientStrengths": ["Provided specific examples..."],
        "freelancerStrengths": ["Original contract supports..."],
        "inconsistencies": ["Client's interpretation differs..."]
      }
    },
    "milestoneTitle": "Phase 1 - Design Mockups",
    "amount": "0.5 ETH",
    "createdAt": "2025-11-28T10:30:00Z",
    "updatedAt": "2025-11-28T10:45:00Z"
  }
}
```

**Error Responses**:

404 Not Found:
```json
{
  "error": "Dispute not found"
}
```

---

### 7. Resolve Dispute

Record the admin's resolution decision in the backend (admin only).

**Endpoint**: `POST /api/admin/disputes/:id/resolve`

**Description**: Records the admin's decision after on-chain dispute resolution. This is called AFTER the blockchain transaction succeeds.

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Dispute ID |

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "decision": "freelancer",
  "resolvedBy": "0xadminadminadminadminadminadminadminadmin",
  "notes": "After reviewing evidence and AI analysis, freelancer delivered work as agreed. Client misunderstood scope."
}
```

**Required Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `decision` | string | Resolution outcome: `client` or `freelancer` |
| `resolvedBy` | string | (Optional) Admin wallet address |
| `notes` | string | (Optional) Admin's resolution notes |

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Dispute resolved successfully",
  "dispute": {
    "id": "dispute-uuid-123",
    "status": "resolved",
    "resolution": "freelancer_wins",
    "resolvedBy": "0xadminadminadminadminadminadminadminadmin",
    "resolvedAt": "2025-11-28T11:00:00Z",
    "notes": "After reviewing evidence and AI analysis..."
  }
}
```

**Error Responses**:

404 Not Found:
```json
{
  "error": "Dispute not found"
}
```

400 Bad Request - Invalid decision:
```json
{
  "error": "Invalid decision. Must be 'client' or 'freelancer'"
}
```

409 Conflict - Already resolved:
```json
{
  "error": "Dispute has already been resolved"
}
```

---

## Response Codes

| Code | Status | Description |
|------|--------|-------------|
| `200` | OK | Request succeeded |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid input or missing required fields |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Resource already exists or invalid state |
| `500` | Internal Server Error | Server error occurred |

---

## Data Models

### Dispute Object
```typescript
interface Dispute {
  id: string;                    // Unique dispute identifier
  projectId: string;             // Project contract address
  milestoneId: number;           // Milestone ID within project
  openedBy: string;              // Wallet address of dispute opener
  reason: string;                // Client's dispute statement
  freelancerResponse?: string;   // Freelancer's counter-statement
  status: 'open' | 'ai_generated' | 'resolved';
  evidenceHashes: string[];      // Array of IPFS hashes or file IDs
  aiSummary?: AISummary;         // AI-generated analysis
  resolution?: 'client_wins' | 'freelancer_wins';
  resolvedBy?: string;           // Admin wallet address
  resolvedAt?: string;           // ISO 8601 timestamp
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}
```

### AI Summary Object
```typescript
interface AISummary {
  summary: string;               // Overall dispute summary
  recommendation: 'approve' | 'reject' | 'partial';
  confidence: number;            // 0.0 to 1.0
  reasoning: {
    clientStrengths: string[];
    freelancerStrengths: string[];
    inconsistencies: string[];
  };
  generatedAt: string;           // ISO 8601 timestamp
}
```

---

## Rate Limiting

**Current Status**: No rate limiting (Phase 1)  
**Future**: 
- 100 requests per minute per IP
- 1000 requests per hour per IP
- AI summary endpoint: 10 requests per hour

---

## CORS Policy

**Allowed Origins** (Development):
- `http://localhost:3000`
- `http://localhost:3001`

**Allowed Origins** (Production):
- `https://lancerscape.io`
- `https://www.lancerscape.io`

**Allowed Methods**:
- `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

**Allowed Headers**:
- `Content-Type`, `Authorization`

---

## Testing with cURL

### Example: Open a Dispute
```bash
curl -X POST http://localhost:4000/api/disputes \
  -H "Content-Type: application/json" \
  -d '{
    "disputeId": "test-dispute-001",
    "projectId": "0x1234567890abcdef1234567890abcdef12345678",
    "milestoneId": 1,
    "openedBy": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "reason": "Work incomplete"
  }'
```

### Example: Upload Evidence
```bash
curl -X POST http://localhost:4000/api/disputes/test-dispute-001/evidence \
  -H "Content-Type: application/json" \
  -d '{
    "evidenceHash": "QmTestHash123",
    "metadata": {
      "filename": "proof.png",
      "description": "Screenshot evidence"
    }
  }'
```

### Example: Generate AI Summary
```bash
curl -X POST http://localhost:4000/api/disputes/ai-summary \
  -H "Content-Type: application/json" \
  -d '{
    "disputeId": "test-dispute-001"
  }'
```

### Example: Admin - List Disputes
```bash
curl -X GET "http://localhost:4000/api/admin/disputes?status=ai_generated&limit=10"
```

### Example: Admin - Resolve Dispute
```bash
curl -X POST http://localhost:4000/api/admin/disputes/test-dispute-001/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "freelancer",
    "notes": "Work completed as agreed"
  }'
```

---

## Changelog

### Version 1.0.0 (2025-11-28)
- Initial API documentation
- Dispute management endpoints
- Admin endpoints
- AI summary generation

---

## Support

For API issues or questions:
- GitHub Issues: [https://github.com/kiruthick-699/Lancerscape/issues](https://github.com/kiruthick-699/Lancerscape/issues)
- Documentation: [https://github.com/kiruthick-699/Lancerscape/tree/main/docs](https://github.com/kiruthick-699/Lancerscape/tree/main/docs)

---

**⚠️ Note**: This API is for educational and demonstration purposes. Do not use in production without proper security audits and authentication implementation.

**Last Updated**: November 28, 2025  
**Maintained By**: LancerScape Development Team
