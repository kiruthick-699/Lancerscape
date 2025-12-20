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

---

## Frontend

### User Flows

**Submit Work** (`/milestones/[id]/submit`)
- Freelancer connects wallet, enters IPFS evidence hash
- Calls `useSubmitWork()` hook → sends blockchain tx
- On confirmation, milestone marked Submitted on-chain

**Approve Milestone** (`/milestones/[id]/approve`)
- Client reviews submitted work, clicks approve
- Calls `useApproveMilestone()` hook → releases escrow
- Funds transferred to freelancer

**Open Dispute** (`/milestones/[id]/dispute`)
- Either party clicks dispute with reason (min 10 chars)
- Calls `useOpenDispute()` hook → marks milestone Disputed on-chain
- Triggers backend to create dispute record

**Resolve Dispute** (`/disputes/[id]`)
- Only visible if wallet matches `NEXT_PUBLIC_ADMIN_ADDRESS`
- Admin uploads evidence, generates AI summary (stub), then clicks "Award to Client" or "Award to Freelancer"
- Two-step:
  1. On-chain tx via `useResolveDispute()` hook
  2. Backend POST to record decision
- Dispute resolved; funds distributed based on decision

### Technical Details
- All interactions require wallet connection (RainbowKit)
- Input sanitization before API calls (XSS prevention)
- Ethereum address validation on backend and frontend
- Toast notifications for tx states (pending → confirming → confirmed)
- Loading spinners during blockchain confirmation

### Wagmi Hooks
Seven hooks cover all contract operations:
- Write: `useCreateMilestone`, `useFundMilestone`, `useSubmitWork`, `useApproveMilestone`, `useOpenDispute`, `useResolveDispute`
- Read: `useGetMilestone`, `useGetMilestoneCount`

Each returns `{ write, isPending, isConfirming, isConfirmed, isError, error, data }` for proper state management.

---

## Backend

### Why a Backend?

Smart contracts are immutable and expensive to update. Backend handles:
- **Dispute metadata**: Who opened it, why, current status, timestamps
- **Evidence storage**: File uploads, metadata (size, MIME type)
- **Decision support**: AI summary generation (currently stubbed)
- **Admin workflow**: Recording admin decisions in a queryable database

**Trust assumption**: Backend is run by project maintainers and can be trusted to accurately record dispute state. No data is verified on-chain.

### Key Models (Mongoose)

**Dispute**
- `projectId`, `milestoneId`, `openedBy`, `reason`
- `status`: Pending → EvidenceSubmitted → AI_SummaryGenerated → AdminReview → Resolved
- `aiSummary`, `resolvedAt` (optional)

**Evidence**
- `disputeId`, `uploadedBy`, `filename`, `mimeType`, `size`, `hash` (IPFS CID optional)
- Metadata-only; files not stored in backend (deferred to IPFS or cloud storage)

### API Endpoints

**Disputes**:
- `POST /api/disputes/open`: Validates input (Zod), creates dispute with Pending status
- `POST /api/disputes/upload-evidence`: Multer file upload (max 5, 10MB each), stores metadata
- `POST /api/disputes/ai-summary`: Generates summary (MVP: returns stub)
- `GET /api/disputes/:id`: Returns full dispute details
- `GET /api/disputes`: Lists disputes with optional filters (status, projectId, pagination)

**Admin**:
- `POST /api/admin/disputes/:id/resolve`: Requires `x-admin-address` header matching `ADMIN_ADDRESS` env; updates status to Resolved
- `GET /api/admin/disputes`: Lists all disputes
- `GET /api/admin/disputes/:id`: Fetches single dispute

### Validation & Sanitization
- All endpoints validate input with Zod (missing fields → 400)
- String sanitization: trim, remove `<>`, limit to 5000 chars
- Address validation: 0x + 40 hex chars, lowercase
- File validation: MIME type, size, count limits enforced before storage
- Error responses: Full details in development, minimal in production

### Admin Resolution Flow
1. Admin calls `POST /api/admin/disputes/:id/resolve` with `resolverDecision: "client" | "freelancer"`
2. Backend validates header `x-admin-address` against `ADMIN_ADDRESS` env
3. On match, updates dispute status to Resolved, sets `resolvedAt` timestamp
4. Response confirms decision recorded; frontend can then poll for updated dispute state

---

## AI (MVP Scope)

**Current Implementation**: Stub.
- `POST /api/disputes/ai-summary` returns a deterministic text: `"MVP summary: review submitted evidence and proceed to admin decision."`
- No external API call; no model inference
- Saves stub to database for consistency

**Purpose**: Decision *support* only. AI is not the final arbiter; admin reviews and decides.

**Deferred Post-MVP**:
- Real LLM integration (OpenAI, Anthropic, or self-hosted)
- Evidence file analysis (OCR, PDF parsing)
- Confidence scoring and structured reasoning
- Caching to avoid re-analysis

---

## Security & Trust Model

### What is Trustless
- Funds locked in smart contract; no platform can access
- Milestone state visible on-chain; anyone can verify history
- Transactions immutable; anyone can audit settlement

### What Requires Trust
- **Admin wallet**: Must be controlled by a single trusted individual or DAO; can resolve any dispute
- **Backend**: Must accurately record dispute metadata; no verification on-chain
- **Private keys**: Users must manage their own keys; lost keys = lost access
- **RPC endpoint**: Node RPC (`NEXT_PUBLIC_RPC_URL`) must not be compromised or serve stale state

### Known Attack Vectors (Not Yet Mitigated)
- Admin private key compromise → arbitrary dispute resolution
- Backend data loss → dispute history lost (on-chain history survives)
- Sybil attacks on dispute opening (no cost to open dispute in MVP)
- User error: sending funds to wrong address, losing keys
- Reentrancy: Not present in MVP (no external calls in escrow logic), but should be audited

### Mitigation Strategy
- Small testnet MVP; production deployment deferred
- Admin wallet managed via hardware wallet or multisig
- Backend runs with DB backups and audit logging
- Dispute opening could charge fee (deferred)
- Smart contract audit before mainnet (deferred)

---

## Testing

### Smart Contract Tests (Hardhat + Chai)
- Six scenarios covering full lifecycle: create, fund, submit, approve, dispute, resolve
- Tests verify events emitted, state transitions correct, amounts locked and released
- No formal verification; tests are behavioral

### Backend API Tests (Jest + Supertest)
- Validation tests: missing fields return 400
- Endpoint shape tests: responses match expected structure
- Admin gating tests: confirm header check works
- No database fixtures; tests assume in-memory or test MongoDB

### Coverage
- Happy path fully tested (contract and API)
- Error cases partially tested (validation, 404s)
- Deferred: Edge cases, concurrent dispute resolution, replay attacks

---

## Deployment

### Testnet
- **Chain**: Base Sepolia (chainId 84532)
- **Why**: No mainnet real value; fast finality; cheap test ETH
- **Contract**: Deployed once; address saved to `NEXT_PUBLIC_PROJECT_ADDRESS`

### Automated Script
`scripts/deploy.sh` orchestrates:
1. Hardhat compile and deploy to Base Sepolia (uses `PRIVATE_KEY` env)
2. Save contract address to `frontend/.env.local`
3. Build frontend (Next.js)
4. Deploy backend (Railway or Render via CLI)
5. Deploy frontend (Vercel via `vercel` CLI)

All secrets passed via environment variables; no keys hardcoded.

### Environment Variables

**Backend**:
- `DATABASE_URL` or `MONGODB_URI`: MongoDB connection
- `ADMIN_ADDRESS`: Wallet address allowed to resolve disputes

**Frontend**:
- `NEXT_PUBLIC_API_URL`: Backend API base URL
- `NEXT_PUBLIC_PROJECT_ADDRESS`: Deployed contract address
- `NEXT_PUBLIC_ADMIN_ADDRESS`: Wallet allowed to resolve
- `NEXT_PUBLIC_RPC_URL`: Base Sepolia RPC endpoint
- `NEXT_PUBLIC_CHAIN_ID`: 84532

---

## MVP Status

### Implemented
- ✅ Smart contract: Full milestone + dispute lifecycle
- ✅ Frontend: Submit work, approve milestone, dispute, admin resolve
- ✅ Backend: Dispute API, evidence uploads, admin gating
- ✅ Database: Mongoose models for disputes, evidence
- ✅ Testing: Hardhat tests (contract), Jest tests (API)
- ✅ Deployment: Automated script for Base Sepolia + Vercel/Railway
- ✅ Security: Input validation, sanitization, admin header check

### Deferred / Out of Scope
- ❌ On-chain admin role enforcement (rely on frontend + backend header check)
- ❌ Real AI integration (stubbed deterministic response)
- ❌ Project creation and listing UI
- ❌ Multi-admin support / DAO governance
- ❌ Mainnet deployment
- ❌ Payment streaming or installments
- ❌ Dispute appeal or escalation
- ❌ Formal smart contract audit
- ❌ Advanced access control (roles, time locks)

---

## Roadmap (Short Term)

1. **Smart contract audit** → Verify no reentrancy, overflow, or access control bugs before mainnet
2. **On-chain admin role** → Add OpenZeppelin Ownable; gate `resolveDispute()` to owner
3. **Real AI integration** → Wire LLM API; analyze evidence files; structured recommendations
4. **Project UI** → Allow clients to create projects and milestones via frontend (currently hardcoded to milestone ID 1)
5. **Evidence storage** → Integrate IPFS or S3; reference files by hash instead of backend URLs
6. **Dispute appeal** → Allow either party to challenge admin decision within timelock
7. **Mainnet migration** → Deploy to Ethereum mainnet with real ETH; add guardrails (caps, insurance)

---

## Getting Started

### Prerequisites
- Node 18+, npm
- MongoDB instance (local or cloud)
- Base Sepolia test ETH
- Wallets: client, freelancer, admin (can use same for testing)

### Run Backend
```bash
cd backend
npm install
DATABASE_URL="mongodb+srv://..." npm run dev
```

### Run Frontend
```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL="http://localhost:4000" \
NEXT_PUBLIC_PROJECT_ADDRESS="0x..." \
NEXT_PUBLIC_ADMIN_ADDRESS="0x..." \
NEXT_PUBLIC_RPC_URL="https://sepolia.base.org" \
NEXT_PUBLIC_CHAIN_ID="84532" \
npm run dev
```

### Run Contract Tests
```bash
cd contracts
npm install
npx hardhat test
```

---

## Code Organization

```
LANCERSCAPE1/
├── contracts/                 # Solidity + Hardhat
│   ├── contracts/
│   │   └── Project.sol       # Main milestone + dispute contract
│   ├── test/
│   │   └── Project.test.ts   # Test suite
│   └── hardhat.config.ts
│
├── backend/                   # Express + Mongoose
│   ├── src/
│   │   ├── app.ts            # Express setup
│   │   ├── db.ts             # Mongoose connection
│   │   ├── models/           # Dispute, Evidence, User, Project, Milestone
│   │   ├── routes/           # disputeRoutes, adminRoutes
│   │   ├── controllers/      # disputeController, adminController
│   │   └── middleware/       # auth, upload (multer), validation
│   ├── tests/
│   │   └── disputes.api.test.ts  # API validation tests
│   └── package.json
│
├── frontend/                  # Next.js + wagmi
│   ├── src/
│   │   ├── app/              # Page router
│   │   │   ├── page.tsx      # Landing (MVP minimal)
│   │   │   ├── dashboard/    # Quick links to core flows
│   │   │   ├── disputes/     # Dispute detail + admin resolve
│   │   │   └── milestones/   # Submit, approve, dispute pages
│   │   ├── hooks/            # useProjectContract (wagmi hooks)
│   │   ├── lib/
│   │   │   ├── api/          # disputes.ts (fetch client)
│   │   │   └── contracts/    # ABIs
│   │   └── components/       # UI (shadcn/ui)
│   └── package.json
│
├── scripts/
│   └── deploy.sh             # Deployment automation
│
├── README.md                 # This file
└── package.json
```

---

## Contributors & License

MIT License. Open to contributions; submit issues and PRs on GitHub.

For questions, contact the maintainers or open a discussion.
