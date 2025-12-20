# LancerScape (MVP)

LancerScape implements milestone-based escrow for freelance work using smart contracts on Base Sepolia. Clients lock funds for each milestone; freelancers submit work evidence; clients approve or open a dispute. Disputes are resolved by an admin with blockchain confirmation. This removes the need to trust a platform with escrow, though it introduces new trust assumptions around admin integrity and backend availability.

---

## Problem

Freelancing platforms (Upwork, Fiverr) hold client funds in escrow. Clients must trust the platform to:
- Not freeze or steal funds
- Fairly resolve disputes
- Process payments correctly

This centralized trust model creates risk: platform outages, disputes settled by opaque algorithms, no transparency into fund flow.

---

## Core Idea

Move escrow to a blockchain where:
- Funds are locked in a smart contract, not a platform database
- Everyone sees milestone states and transactions on-chain
- Disputes are resolved by a designated admin with on-chain settlement

**Trade-off**: Removes platform risk, but introduces admin risk and requires users to manage private keys. Still fundamentally dependent on backend for dispute metadata.

---

## Architecture Overview

### On-Chain
- **Project.sol**: Manages milestone lifecycle (Created → Funded → Submitted → Approved/Disputed → Resolved)
- Escrow locks funds until approval or dispute resolution
- Events emit for all state changes

### Frontend
- **Next.js 16 + wagmi v3**: User-facing dApp
- Connects wallet via RainbowKit
- Submits blockchain txs for milestone actions (fund, submit work, approve, open dispute)
- Calls backend API for dispute metadata and evidence uploads

### Backend
- **Express + Mongoose**: Dispute metadata, evidence tracking, admin resolution
- No smart contract state sync—purely auxiliary
- Single admin address gates the resolve endpoint

### Data Flow
1. Client funds milestone on-chain (escrow locked)
2. Freelancer submits work via frontend → backend stores evidence reference
3. Client approves (releases funds) or opens dispute (marks milestone as disputed)
4. If dispute: backend creates dispute record, evidence uploaded to backend
5. Admin views dispute details via `/disputes/[id]`, clicks resolve button
6. Frontend sends on-chain tx to call `resolveDispute()`, then POSTs to backend to record decision

---

## Smart Contract Design

### Milestone Lifecycle

```
Created → Funded → Submitted → Approved ✓
                      ↓
                   Disputed → Resolved
```

**Key Functions**:
- `createMilestone(amount)`: Client creates milestone
- `fundMilestone(milestoneId)`: Client deposits ETH into escrow
- `submitWork(milestoneId, evidenceHash)`: Freelancer provides IPFS hash or similar proof
- `approveMilestone(milestoneId)`: Client releases funds to freelancer
- `openDispute(milestoneId, reason)`: Either party escalates to dispute
- `resolveDispute(milestoneId, decision)`: Admin settles by choosing `"client"` (refund) or `"freelancer"` (release)

### Escrow Semantics
- When funded, amount is locked in contract balance
- On approval, funds transfer to freelancer (no bridge delay)
- On dispute → client win, funds return to client
- On dispute → freelancer win, funds go to freelancer
- No withdrawals mid-dispute; state machine enforces order

### Admin Role
**Current Implementation**: No on-chain role enforcement. Any address can call `resolveDispute()`.
**MVP Mitigations**: Backend checks `x-admin-address` header against `ADMIN_ADDRESS` env var; frontend hides resolve UI unless wallet matches `NEXT_PUBLIC_ADMIN_ADDRESS`.
**Deferred**: On-chain role enforcement (access control via OpenZeppelin Ownable or Role-Based Access Control).

### Events
All state changes emit events: `MilestoneCreated`, `MilestoneFunded`, `WorkSubmitted`, `MilestoneApproved`, `DisputeOpened`, `DisputeResolved`.
