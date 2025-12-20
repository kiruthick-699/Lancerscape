# LancerScape 💼

[![Base Sepolia](https://img.shields.io/badge/Base%20Sepolia-84532-5c54db)]()
[![Smart Contracts](https://img.shields.io/badge/Solidity-0.8.27-363636)]()
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)]()
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)]()

Blockchain-based milestone escrow for freelancing. Transparent fund management, decentralized dispute resolution, human-verified outcomes.

## 🎯 The Problem

Centralized escrow platforms (Upwork, Fiverr) hold billions in freelancer earnings. Single points of failure, censorship risk, and opacity on fund movement. Disputes resolved by opaque algorithms or human moderators with no accountability.

**LancerScape's answer**: On-chain milestone escrow with human-verified disputes.

---

## 💡 Core Idea

1. **Escrow on-chain**: Client funds locked in smart contract until milestone approved or dispute resolved
2. **Transparent milestones**: Freelancer submits evidence; client sees everything on-chain
3. **Hybrid dispute resolution**: Backend analyzes evidence, admin decides outcome, smart contract executes
4. **No intermediary**: Funds move directly peer-to-peer; platform never holds custody

**Trade-offs**: Requires Web3 wallet, testnet only (MVP), admin still needed for dispute resolution.

---

## ⚡ Quick Start

### Prerequisites
- Node 18+, npm
- Web3 wallet (MetaMask)
- Base Sepolia RPC + test ETH

### 1. Clone & Install

```bash
git clone https://github.com/kiruthick-699/Lancerscape.git
cd Lancerscape
npm install
```

### 2. Deploy Smart Contracts

```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network baseSepolia

# Copy deployed address to .env files
NEXT_PUBLIC_PROJECT_ADDRESS="0x..."
```

### 3. Start Backend (Dispute API)

```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
DATABASE_URL="mongodb+srv://..."
ADMIN_ADDRESS="0x..."
PORT=4000
NODE_ENV=development
EOF

npm run dev  # Backend runs on http://localhost:4000
```

### 4. Start Frontend (dApp)

```bash
cd frontend
npm install

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_PROJECT_ADDRESS=0x...
NEXT_PUBLIC_ADMIN_ADDRESS=0x...
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_CHAIN_ID=84532
EOF

npm run dev  # Frontend runs on http://localhost:3000
```

Open **http://localhost:3000**, connect wallet, create a milestone. Done.

---

## 🔧 How It Works

### Milestone Lifecycle

```
Created → Funded → Submitted → Approved ✓
                      ↓
                   Disputed → Resolved
```

### User Flows

**Client Flow:**
1. Create milestone (on-chain)
2. Fund milestone (locks ETH in escrow)
3. Wait for freelancer to submit work
4. Approve milestone (releases funds) OR open dispute

**Freelancer Flow:**
1. View funded milestone
2. Submit work (evidence hash + description)
3. Wait for client approval OR dispute

**Admin Flow:**
1. View open disputes at `/disputes/[id]`
2. Review evidence, AI analysis, both sides' statements
3. Click "Resolve" → decide client win or freelancer win
4. Backend records decision; smart contract executes payment

### Smart Contract Details

**Key Functions:**
- `createMilestone(amount)` - Create new milestone
- `fundMilestone(milestoneId)` - Client deposits ETH (escrow locked)
- `submitWork(milestoneId, evidenceHash)` - Freelancer provides proof
- `approveMilestone(milestoneId)` - Client releases funds to freelancer
- `openDispute(milestoneId, reason)` - Either party escalates
- `resolveDispute(milestoneId, decision)` - Admin settles dispute

**Escrow Semantics:**
- Funds locked until approval or dispute resolution
- On approval → instant transfer to freelancer
- On dispute → admin decides: refund client or release to freelancer
- No mid-dispute withdrawals; state machine enforces all transitions

---

## 📋 Core Features

### Smart Contract Layer (On-Chain)
✅ Milestone creation & state transitions  
✅ Escrow fund locking & release  
✅ Dispute opening & resolution  
✅ Event emission for all state changes  
✅ Hardhat tests (6 scenarios covering all flows)

### Frontend (dApp)
✅ Wallet connection via RainbowKit  
✅ Create/fund milestones  
✅ Submit work with evidence  
✅ Approve or open disputes  
✅ Admin dispute resolution UI  
✅ Toast notifications for all actions  
✅ Input sanitization & validation  

### Backend API
✅ Dispute metadata management  
✅ Evidence file uploads  
✅ AI analysis (stubbed to MVP text)  
✅ Admin resolution endpoint with header-based gating  
✅ Mongoose models for all entities  
✅ Zod validation on all endpoints  
✅ Jest + Supertest API tests

### Database Layer
✅ MongoDB/Mongoose integration  
✅ 5 models: User, Project, Milestone, Dispute, Evidence  
✅ Proper indexing & relationships  

### Deployment
✅ Automated bash script for Base Sepolia  
✅ Environment variable handling  
✅ Vercel & Railway compatible  

---

## 🏗️ Architecture

### On-Chain
- **Project.sol**: Milestone lifecycle, escrow, dispute resolution
- Chain: Base Sepolia (chainId 84532)
- No on-chain access control (MVP uses env-based gating)

### Frontend
- **Next.js 16** + TypeScript
- **Wagmi v3** + RainbowKit for wallet connections
- **9 custom hooks** for contract interactions
- **shadcn/ui** + Tailwind CSS for components
- Pages: `/`, `/dashboard`, `/milestones/[id]/{submit,approve,dispute}`, `/disputes/[id]`

### Backend
- **Express** + TypeScript
- **MongoDB/Mongoose** for data persistence
- **5 models**: User, Project, Milestone, Dispute, Evidence
- Routes: `/api/disputes`, `/api/admin/disputes`
- Zod validation + admin gating via x-admin-address header

### Data Flow
1. Client funds milestone on-chain → escrow locked
2. Freelancer submits work → backend stores evidence reference
3. Client approves (release funds) OR opens dispute (backend record)
4. If dispute → admin views evidence, clicks resolve → on-chain tx + backend update

---

## 🚀 API Endpoints

### Dispute Endpoints
```
POST   /api/disputes                 # Open new dispute
POST   /api/disputes/:id/evidence    # Upload evidence files
POST   /api/disputes/ai-summary      # Generate AI analysis (stubbed)
GET    /api/disputes/:id             # Get dispute details
GET    /api/disputes                 # List all disputes
```

### Admin Endpoints
```
POST   /api/admin/disputes/:id/resolve  # Resolve dispute (requires x-admin-address header)
GET    /api/admin/disputes              # List all disputes (admin only)
GET    /api/admin/disputes/:id          # Get dispute details (admin only)
```

---

## 🧪 Testing

### Smart Contracts

```bash
cd contracts
npx hardhat test
```

**Coverage**: 6 test scenarios
- Milestone creation
- Funding escrow
- Work submission
- Milestone approval
- Dispute opening
- Dispute resolution

### Backend API

```bash
cd backend
npm test
```

**Coverage**: Jest + Supertest validation tests for all endpoints

---

## 🔐 Security & Trust Model

### What's Trustless
✅ Funds locked in smart contract (no platform custody)  
✅ All milestone states on-chain (transparent)  
✅ Deterministic state machine (no arbitrary transitions)  

### What Requires Trust
⚠️ **Admin integrity**: Resolves disputes; can choose "wrong" winner  
⚠️ **Backend availability**: Dispute metadata & evidence stored off-chain  
⚠️ **Database security**: MongoDB holds dispute records & evidence files  

### Known Risks
1. **Admin single point of failure**: No on-chain role enforcement yet
2. **Backend outage**: Can't upload evidence or view disputes
3. **Evidence tampering**: No cryptographic proof-of-work (can add IPFS)
4. **Private key loss**: User loses access to funds (standard Web3 risk)

### Mitigations (MVP)
- Admin address checked via env variables (frontend + backend)
- Input sanitization on all API endpoints
- Zod schema validation for all requests
- No private keys exposed in code

---

## 📦 Project Structure

```
Lancerscape/
├── frontend/                       # Next.js dApp
│   ├── src/
│   │   ├── app/                   # Pages & layouts
│   │   │   ├── page.tsx           # Landing
│   │   │   ├── dashboard/         # Dashboard
│   │   │   ├── milestones/        # Milestone flows
│   │   │   └── disputes/          # Dispute management
│   │   ├── components/            # React components
│   │   ├── hooks/                 # wagmi hooks (useProjectContract.ts + 8 others)
│   │   ├── lib/
│   │   │   ├── api/               # Fetch client (disputes.ts)
│   │   │   ├── contracts/         # ABI & addresses
│   │   │   └── utils/             # Security helpers
│   │   └── styles/
│   └── package.json
│
├── backend/                        # Express API
│   ├── src/
│   │   ├── controllers/           # Request handlers
│   │   │   ├── disputeController.ts
│   │   │   └── adminController.ts
│   │   ├── models/                # Mongoose models (5)
│   │   ├── routes/                # API routes
│   │   ├── services/              # Business logic
│   │   ├── db.ts                  # MongoDB connection
│   │   └── index.ts               # Express app
│   ├── tests/                     # Jest tests
│   └── package.json
│
├── contracts/                      # Solidity contracts
│   ├── contracts/
│   │   └── Project.sol            # Milestone + escrow + disputes
│   ├── scripts/
│   │   └── deploy.js              # Deployment script
│   ├── test/
│   │   └── Project.test.ts        # Hardhat tests (6 scenarios)
│   └── hardhat.config.js
│
├── scripts/
│   └── deploy.sh                  # Automation script (contracts + backend + frontend)
│
└── README.md
```

---

## 🌐 Deployment

### Smart Contracts (Base Sepolia)

```bash
cd contracts
npx hardhat run scripts/deploy.js --network baseSepolia
```

### Backend (Railway, Render, Heroku)

```bash
cd backend
npm run build
# Deploy to platform with env vars:
# - DATABASE_URL
# - ADMIN_ADDRESS
# - PORT
```

### Frontend (Vercel, Netlify)

```bash
cd frontend
npm run build
# Deploy with env vars:
# - NEXT_PUBLIC_API_URL
# - NEXT_PUBLIC_PROJECT_ADDRESS
# - NEXT_PUBLIC_ADMIN_ADDRESS
# - NEXT_PUBLIC_RPC_URL
# - NEXT_PUBLIC_CHAIN_ID
```

### Automated Deployment

Use the included `scripts/deploy.sh` for one-command deployment:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

---

## 🗺️ Roadmap

### MVP (Current) ✅
- [x] On-chain milestone escrow
- [x] Client fund & approval flows
- [x] Dispute opening & resolution
- [x] Backend dispute API
- [x] Admin gating (env-based)
- [x] Evidence uploads
- [x] AI analysis (stubbed)
- [x] Full test coverage (Hardhat + Jest)

### Phase 2 🚧
- [ ] On-chain admin role enforcement (OpenZeppelin AccessControl)
- [ ] IPFS integration for evidence files
- [ ] Real AI integration (OpenAI/Anthropic)
- [ ] Email notifications for milestones & disputes
- [ ] User reputation scores
- [ ] Milestone templates & project management

### Phase 3 🔮
- [ ] Multi-chain support (Ethereum, Polygon, Arbitrum)
- [ ] DAO governance for platform decisions
- [ ] Freelancer portfolio showcase
- [ ] Advanced dispute analytics
- [ ] Escrow insurance pool
- [ ] Batch milestone creation

---

## 🛠️ Development

### Build Contracts

```bash
cd contracts
npm run compile
```

### Watch Mode (Frontend)

```bash
cd frontend
npm run dev
```

### Run Backend in Dev Mode

```bash
cd backend
npm run dev
```

### Lint & Format

```bash
# Frontend
cd frontend && npm run lint

# Backend
cd backend && npm run lint

# Contracts
cd contracts && npm run lint
```

---

## 📚 Documentation

- **[API Documentation](backend/DISPUTE_API_DOCUMENTATION.md)** - Full endpoint specs with examples
- **[Smart Contract Summary](contracts/PROJECT_CONTRACT_SUMMARY.md)** - Contract design & functions
- **[Wagmi Hooks Guide](frontend/WAGMI_HOOKS_DOCUMENTATION.md)** - Hook usage & examples
- **[Deployment Guide](docs/deployment_guide.md)** - Step-by-step deployment
- **[Security Checklist](docs/security_checklist.md)** - Security review items

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new functionality
4. Ensure all tests pass
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

**Guidelines:**
- Follow existing code style (TypeScript, Tailwind)
- Add tests for smart contract changes
- Update documentation for API changes
- Never commit `.env` files or private keys

---

## ⚠️ Important Disclaimers

**FOR TESTNET USE ONLY**

This project is a proof-of-concept MVP. Production deployment requires:
- ✅ Professional smart contract audit
- ✅ Comprehensive security review
- ✅ Legal compliance review
- ✅ Extended testing on public testnet
- ✅ Insurance or bonding for admin role
- ✅ Real AI integration (currently stubbed)

**You are using this at your own risk.** The developers are not liable for:
- Loss of funds due to smart contract bugs
- Disputes settled unfairly by admin
- Backend outages or data loss
- Private key exposure or loss

**Never deploy to mainnet without professional audits.**

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- OpenZeppelin for smart contract libraries
- Hardhat for contract development tools
- Wagmi + RainbowKit for wallet integration
- shadcn/ui for component primitives
- Base for the Sepolia testnet

---

**Built with ❤️ for transparent freelancing**

[![GitHub](https://img.shields.io/badge/GitHub-kiruthick--699-black)]()
[![Solidity](https://img.shields.io/badge/Solidity-0.8.27-363636)]()
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)]()
