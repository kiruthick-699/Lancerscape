# Dispute Resolution Flow - Sequence Diagram

## Overview
This document illustrates the complete end-to-end flow of a dispute in LancerScape, from work submission to final resolution.

---

## Mermaid Sequence Diagram

```mermaid
sequenceDiagram
    participant Client
    participant FreelancerUI as Freelancer UI
    participant ClientUI as Client UI
    participant AdminUI as Admin UI
    participant Backend as Backend API
    participant AIEngine as AI Dispute Engine
    participant Project as Project Contract
    participant Escrow as Escrow Contract
    participant Blockchain

    Note over Client,Blockchain: Phase 1: Work Submission & Dispute Opening
    
    FreelancerUI->>Project: submitWork(milestoneId, evidenceHash)
    activate Project
    Project->>Blockchain: Update milestone status to "Submitted"
    Blockchain-->>Project: Transaction confirmed
    Project-->>FreelancerUI: Work submitted successfully
    deactivate Project
    
    Note over ClientUI: Client reviews work and finds issues
    
    ClientUI->>Project: openDispute(milestoneId, reason)
    activate Project
    Project->>Project: Validate milestone is "Funded" or "Submitted"
    Project->>Blockchain: Update milestone status to "Disputed"
    Blockchain-->>Project: Transaction confirmed
    Project-->>ClientUI: Dispute opened on-chain
    deactivate Project
    
    ClientUI->>Backend: POST /api/disputes (projectId, milestoneId, reason)
    activate Backend
    Backend->>Backend: Create dispute record
    Backend-->>ClientUI: Dispute created (disputeId)
    deactivate Backend
    
    Note over Client,Backend: Phase 2: Evidence Submission
    
    ClientUI->>Backend: POST /api/disputes/:id/evidence (client evidence files)
    activate Backend
    Backend->>Backend: Store evidence hashes/metadata
    Backend-->>ClientUI: Evidence uploaded
    deactivate Backend
    
    FreelancerUI->>Backend: POST /api/disputes/:id/evidence (freelancer response + evidence)
    activate Backend
    Backend->>Backend: Store freelancer evidence
    Backend->>Backend: Update dispute with freelancer response
    Backend-->>FreelancerUI: Evidence uploaded
    deactivate Backend
    
    Note over Backend,AIEngine: Phase 3: AI Analysis
    
    AdminUI->>Backend: POST /api/disputes/ai-summary (disputeId)
    activate Backend
    Backend->>AIEngine: Analyze dispute
    activate AIEngine
    
    AIEngine->>AIEngine: Review client statement
    AIEngine->>AIEngine: Review freelancer response
    AIEngine->>AIEngine: Analyze evidence hashes
    AIEngine->>AIEngine: Identify strengths for both parties
    AIEngine->>AIEngine: Detect inconsistencies
    AIEngine->>AIEngine: Generate recommendation (approve/reject/partial)
    AIEngine->>AIEngine: Calculate confidence score
    
    AIEngine-->>Backend: AI Summary (summary, recommendation, reasoning)
    deactivate AIEngine
    
    Backend->>Backend: Store AI summary in dispute record
    Backend->>Backend: Update dispute status to "ai_generated"
    Backend-->>AdminUI: AI summary generated
    deactivate Backend
    
    Note over AdminUI: Phase 4: Admin Review
    
    AdminUI->>Backend: GET /api/admin/disputes/:id
    activate Backend
    Backend-->>AdminUI: Dispute details with AI summary
    deactivate Backend
    
    AdminUI->>AdminUI: Admin reviews:<br/>- Milestone details<br/>- Client statement<br/>- Freelancer response<br/>- Evidence files<br/>- AI recommendation
    
    Note over AdminUI: Admin makes decision:<br/>Release to Freelancer OR Refund Client
    
    Note over AdminUI,Blockchain: Phase 5: Blockchain Resolution
    
    alt Admin decides: Release Funds to Freelancer
        AdminUI->>Project: resolveDispute(milestoneId, clientWins=false)
        activate Project
        Project->>Project: Validate milestone status = "Disputed"
        Project->>Project: Update status to "Resolved"
        Project->>Escrow: releaseFunds(milestoneId)
        activate Escrow
        Escrow->>Blockchain: Transfer funds to freelancer
        Blockchain-->>Escrow: Transfer confirmed
        Escrow-->>Project: Funds released
        deactivate Escrow
        Project-->>AdminUI: Dispute resolved (freelancer wins)
        deactivate Project
        
        AdminUI->>Backend: POST /api/admin/disputes/:id/resolve (decision: "freelancer")
        activate Backend
        Backend->>Backend: Update dispute status to "resolved"
        Backend->>Backend: Record resolution decision
        Backend-->>AdminUI: Resolution recorded
        deactivate Backend
        
    else Admin decides: Refund Client
        AdminUI->>Project: resolveDispute(milestoneId, clientWins=true)
        activate Project
        Project->>Project: Validate milestone status = "Disputed"
        Project->>Project: Update status to "Resolved"
        Project->>Escrow: refundFunds(milestoneId)
        activate Escrow
        Escrow->>Blockchain: Transfer funds back to client
        Blockchain-->>Escrow: Refund confirmed
        Escrow-->>Project: Funds refunded
        deactivate Escrow
        Project-->>AdminUI: Dispute resolved (client wins)
        deactivate Project
        
        AdminUI->>Backend: POST /api/admin/disputes/:id/resolve (decision: "client")
        activate Backend
        Backend->>Backend: Update dispute status to "resolved"
        Backend->>Backend: Record resolution decision
        Backend-->>AdminUI: Resolution recorded
        deactivate Backend
    end
    
    Note over Client,Blockchain: Phase 6: Finalization
    
    AdminUI->>AdminUI: Display success message
    Backend->>Backend: Dispute marked as "resolved"
    Blockchain->>Blockchain: Milestone state permanently recorded
    
    Note over Client,Blockchain: Dispute resolution complete!
```

---

## Flow Breakdown

### Phase 1: Work Submission & Dispute Opening
1. **Freelancer submits work** on-chain with evidence hash
2. **Client reviews work** and decides to dispute
3. **Client opens dispute** on-chain (milestone → "Disputed")
4. **Backend creates dispute record** for tracking

### Phase 2: Evidence Submission
5. **Client uploads evidence** to backend (statements, files)
6. **Freelancer uploads counter-evidence** and response
7. **Backend stores all evidence** with metadata

### Phase 3: AI Analysis
8. **Admin triggers AI analysis** via backend
9. **AI Engine processes:**
   - Client's reason/statement
   - Freelancer's response
   - Evidence file hashes
   - Identifies strengths for both parties
   - Detects inconsistencies
10. **AI generates recommendation** with confidence score
11. **Backend stores AI summary** and updates dispute status

### Phase 4: Admin Review
12. **Admin views dispute details** including AI recommendation
13. **Admin reviews all evidence** and AI reasoning
14. **Admin makes final decision** (release or refund)

### Phase 5: Blockchain Resolution
15. **Admin calls resolveDispute()** on Project contract
16. **Smart contract validates** dispute status
17. **Escrow contract executes:**
    - `releaseFunds()` → Pay freelancer, OR
    - `refundFunds()` → Refund client
18. **Blockchain confirms transaction**
19. **Backend records resolution** for audit trail

### Phase 6: Finalization
20. **Dispute marked as resolved** in all systems
21. **Milestone state permanently recorded** on-chain
22. **Success notifications** to all parties

---

## Key Decision Points

| Step | Decision Maker | Action | Outcome |
|------|---------------|--------|---------|
| 1 | Freelancer | Submit work | Evidence hash on-chain |
| 2 | Client | Accept or Dispute | Continue or open dispute |
| 8 | Admin | Trigger AI | Get AI recommendation |
| 14 | Admin | Final decision | Release funds or refund |
| 16 | Smart Contract | Validate state | Execute or revert |

---

## Smart Contract State Transitions

```
Milestone States:
  Pending → Funded → Submitted → Approved ✅
                               ↓
                          Disputed → Resolved ⚖️
```

### During Dispute Flow:
- **Submitted** → `openDispute()` → **Disputed**
- **Disputed** → `resolveDispute(false)` → **Resolved** (Freelancer wins)
- **Disputed** → `resolveDispute(true)` → **Resolved** (Client wins)

---

## Data Stored

### Backend (Dispute Record)
```typescript
{
  id: "dispute-uuid",
  projectId: "0x...",
  milestoneId: 1,
  openedBy: "0x...", // client address
  reason: "Work incomplete, missing features X and Y",
  freelancerResponse: "All features delivered as per contract",
  status: "resolved",
  evidenceHashes: ["QmHash1...", "QmHash2..."],
  aiSummary: {
    summary: "...",
    recommendation: "approve",
    confidence: 0.85,
    reasoning: { ... }
  },
  resolution: "freelancer_wins",
  resolvedAt: "2025-11-28T12:00:00Z"
}
```

### Blockchain (Milestone State)
```solidity
struct Milestone {
    string title;
    uint256 amount;
    MilestoneStatus status; // "Disputed" → "Resolved"
    string evidenceHash;
    address freelancer;
}
```

---

## Error Handling

### Potential Failures

| Failure Point | Error | Mitigation |
|--------------|-------|------------|
| Work submission | Gas failure | Retry with higher gas |
| Evidence upload | Network error | Client-side retry logic |
| AI analysis | API timeout | Retry with exponential backoff |
| Blockchain resolution | Invalid state | Contract validation prevents |
| Fund transfer | Insufficient balance | Escrow pre-validation |

---

## Security Considerations

1. **Only admin can resolve disputes** (access control on contract)
2. **Dispute must be in "Disputed" state** (contract validation)
3. **Evidence tampering prevented** by storing hashes on-chain
4. **Double-resolution prevented** by status checks
5. **Funds locked in escrow** until resolution
6. **All actions emit events** for audit trail

---

## Future Enhancements

- **Multi-signature admin** (require 2+ admins to resolve)
- **Time-locked resolutions** (cooldown period)
- **Appeal mechanism** (allow one appeal per party)
- **Partial refunds** (split funds based on AI confidence)
- **DAO voting** (community resolves disputes)

---

**Document Version**: 1.0  
**Last Updated**: November 28, 2025  
**Status**: Phase 1 Implementation Complete
