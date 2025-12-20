# LancerScape Architecture Block Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                   FRONTEND LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐               │
│  │              │         │              │         │              │               │
│  │  Client UI   │         │ Freelancer   │         │  Admin UI    │               │
│  │              │         │     UI       │         │              │               │
│  │ - Projects   │         │ - Projects   │         │ - Disputes   │               │
│  │ - Milestones │         │ - Milestones │         │ - Review     │               │
│  │ - Fund       │         │ - Submit     │         │ - Resolve    │               │
│  │ - Approve    │         │ - Dispute    │         │              │               │
│  │              │         │              │         │              │               │
│  └──────┬───────┘         └──────┬───────┘         └──────┬───────┘               │
│         │                        │                        │                        │
└─────────┼────────────────────────┼────────────────────────┼────────────────────────┘
          │                        │                        │
          │    Wagmi/Viem (Web3)   │                        │  API Calls
          │         +              │                        │      +
          │      API Calls         │                        │   Wagmi
          │                        │                        │
          ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND SERVICES LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────┐    │
│  │                         Backend API Server (Express)                        │    │
│  │                                                                              │    │
│  │  ┌────────────────┐      ┌────────────────┐      ┌────────────────┐        │    │
│  │  │   Dispute      │      │    Admin       │      │   Evidence     │        │    │
│  │  │   Controller   │      │   Controller   │      │   Controller   │        │    │
│  │  └────────┬───────┘      └────────┬───────┘      └────────┬───────┘        │    │
│  │           │                       │                       │                 │    │
│  │           ▼                       ▼                       ▼                 │    │
│  │  ┌────────────────────────────────────────────────────────────────┐        │    │
│  │  │                    Dispute Service Layer                        │        │    │
│  │  │  - Create disputes                                              │        │    │
│  │  │  - Store evidence                                               │        │    │
│  │  │  - Track status                                                 │        │    │
│  │  │  - Resolve disputes                                             │        │    │
│  │  └────────────────┬───────────────────────┬────────────────────────┘        │    │
│  │                   │                       │                                 │    │
│  └───────────────────┼───────────────────────┼─────────────────────────────────┘    │
│                      │                       │                                      │
│                      ▼                       ▼                                      │
│  ┌──────────────────────────┐    ┌──────────────────────────┐                     │
│  │                          │    │                          │                     │
│  │   AI Dispute Engine      │    │   Evidence Storage       │                     │
│  │                          │    │                          │                     │
│  │  - Analyze statements    │    │  - In-memory (Phase 1)   │                     │
│  │  - Review evidence       │    │  - IPFS (Future)         │                     │
│  │  - Generate summary      │    │  - File metadata         │                     │
│  │  - Recommend outcome     │    │                          │                     │
│  │                          │    │                          │                     │
│  └──────────────────────────┘    └──────────────────────────┘                     │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Read/Write
                                      │ Contract Calls
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           SMART CONTRACT LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                          ProjectFactory.sol                                  │   │
│  │                                                                               │   │
│  │  - createProject()          - getProject()                                   │   │
│  │  - totalProjects()          - projectsByClient()                             │   │
│  └─────────────────────────────┬───────────────────────────────────────────────┘   │
│                                │                                                    │
│                                │ Deploys                                            │
│                                ▼                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                              Project.sol                                     │   │
│  │                                                                               │   │
│  │  ┌────────────────────┐         ┌────────────────────┐                      │   │
│  │  │ Milestone Logic    │         │ Dispute Logic      │                      │   │
│  │  │                    │         │                    │                      │   │
│  │  │ - createMilestone()│         │ - openDispute()    │                      │   │
│  │  │ - fundMilestone()  │◄───────►│ - resolveDispute() │                      │   │
│  │  │ - submitWork()     │         │                    │                      │   │
│  │  │ - approveMilestone()│        │                    │                      │   │
│  │  └──────────┬─────────┘         └────────────────────┘                      │   │
│  │             │                                                                │   │
│  │             │ Calls                                                          │   │
│  │             ▼                                                                │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐    │   │
│  │  │                        Escrow.sol                                    │    │   │
│  │  │                                                                       │    │   │
│  │  │  - depositFunds()      - releaseFunds()      - refundFunds()        │    │   │
│  │  │  - Holds client funds in escrow until milestone completion          │    │   │
│  │  └───────────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                               │   │
│  └───────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ State Changes
                                      │ Transactions
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           BLOCKCHAIN NETWORK                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│                            ⛓️  Base Sepolia Testnet  ⛓️                            │
│                                                                                      │
│  - Transaction Processing                                                           │
│  - State Storage                                                                    │
│  - Event Emission                                                                   │
│  - Immutable Audit Trail                                                            │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Patterns

### 1. Project Creation Flow
```
Client UI → ProjectFactory.createProject() → Blockchain → Event → Frontend Update
```

### 2. Milestone Funding Flow
```
Client UI → Project.fundMilestone() → Escrow.depositFunds() → Blockchain
          → Lock Funds in Escrow → Update Milestone State
```

### 3. Work Submission Flow
```
Freelancer UI → Project.submitWork(evidenceHash) → Blockchain
              → Update Milestone State to "Submitted"
```

### 4. Dispute Opening Flow
```
Client/Freelancer UI → Backend API → disputeService.create()
                    → Project.openDispute() → Blockchain
                    → Store Evidence → AI Engine Analysis
```

### 5. AI Dispute Resolution Flow
```
Admin UI → Backend API → AI Dispute Engine
        → Analyze evidence + statements
        → Generate recommendation
        → Admin reviews → Blockchain resolution
```

### 6. Dispute Resolution (On-Chain) Flow
```
Admin UI → Project.resolveDispute(milestoneId, clientWins)
        → Escrow.releaseFunds() OR Escrow.refundFunds()
        → Transfer funds → Update milestone state
        → Backend API (record decision)
```

---

## Component Interactions

| Layer | Component | Primary Responsibility | Interacts With |
|-------|-----------|----------------------|----------------|
| **Frontend** | Client UI | Create projects, fund milestones, approve work | Smart Contracts, Backend API |
| | Freelancer UI | Submit work, open disputes | Smart Contracts, Backend API |
| | Admin UI | Review disputes, make resolution decisions | Backend API, Smart Contracts |
| **Backend** | API Server | Handle disputes, evidence, AI summaries | AI Engine, Evidence Storage |
| | AI Engine | Analyze disputes, generate recommendations | Dispute Service |
| | Evidence Storage | Store files and metadata | Dispute Service |
| **Blockchain** | ProjectFactory | Deploy new Project contracts | Blockchain |
| | Project | Manage milestones and disputes | Escrow, Blockchain |
| | Escrow | Hold and release funds | Blockchain |
| | Base Sepolia | Persist state, process transactions | All Smart Contracts |

---

## Technology Stack per Layer

### Frontend Layer
- **Framework**: Next.js 16.0 (App Router)
- **Blockchain**: Wagmi v3, Viem, RainbowKit
- **Styling**: Tailwind CSS 4.0, shadcn/ui
- **Validation**: React Hook Form, Zod

### Backend Services Layer
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **AI**: OpenAI/Anthropic SDK
- **Storage**: In-memory Map (Phase 1), IPFS (Future)

### Smart Contract Layer
- **Language**: Solidity 0.8.27
- **Framework**: Hardhat
- **Libraries**: OpenZeppelin
- **Network**: Base Sepolia

### Blockchain Network
- **Chain**: Base (Layer 2 on Ethereum)
- **Testnet**: Base Sepolia
- **Consensus**: Optimistic Rollup

---

## Security Boundaries

```
┌─────────────────────────────────────────────┐
│ Frontend (Client-Side)                      │
│ - Input validation                          │
│ - Wallet signature required                 │
│ - No private keys stored                    │
└──────────────┬──────────────────────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────────────────────┐
│ Backend (Server-Side)                       │
│ - API authentication (future)               │
│ - Rate limiting                             │
│ - Input sanitization                        │
└──────────────┬──────────────────────────────┘
               │ RPC Calls
               ▼
┌─────────────────────────────────────────────┐
│ Smart Contracts (On-Chain)                  │
│ - Access control modifiers                  │
│ - ReentrancyGuard                           │
│ - State validation                          │
│ - Audit trail via events                    │
└─────────────────────────────────────────────┘
```

---

**Last Updated**: November 28, 2025  
**Version**: 1.0 (Phase 1)
