# LancerScape Local Development Quickstart

Get LancerScape running locally in 5 minutes.

---

## Prerequisites

- **Node.js** 18+ installed
- **npm** or **pnpm** installed
- **MetaMask** or similar Web3 wallet

---

## Step 1: Install Dependencies

From the project root:

```bash
# Install all dependencies
npm install

# Install contracts dependencies
cd contracts && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

---

## Step 2: Start Local Blockchain

Open a **new terminal** and run:

```bash
cd contracts
npx hardhat node
```

Keep this terminal running. You'll see 20 test accounts with 10,000 ETH each.

**Important**: Copy the first private key (Account #0) - you'll need it for MetaMask.

---

## Step 3: Deploy Smart Contracts

Open a **new terminal** and run:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

You'll see output like:

```
✅ MilestoneEscrow deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✅ ProjectFactory deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

**Copy these addresses!**

---

## Step 4: Configure Frontend

Edit `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_HARDHAT_RPC_URL=http://127.0.0.1:8545

# Paste the ProjectFactory address here
NEXT_PUBLIC_FACTORY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

# Admin address (use first Hardhat account)
NEXT_PUBLIC_ADMIN_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

**Get WalletConnect Project ID** (optional but recommended):
1. Go to https://cloud.walletconnect.com
2. Create a free account
3. Create a new project
4. Copy the Project ID

---

## Step 5: Start Backend

Open a **new terminal**:

```bash
cd backend
npm run dev
```

You should see: `Backend running on port 4000`

---

## Step 6: Start Frontend

Open a **new terminal**:

```bash
cd frontend
npm run dev
```

Visit: **http://localhost:3000**

---

## Step 7: Connect MetaMask

### Add Hardhat Network to MetaMask:

1. Open MetaMask
2. Click network dropdown → "Add Network" → "Add network manually"
3. Fill in:
   - **Network Name**: Hardhat Local
   - **RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH
4. Save

### Import Test Account:

1. MetaMask → Click account icon → "Import Account"
2. Paste the **private key** from Step 2 (Account #0)
3. The account should have 10,000 ETH

### Connect Wallet:

1. In the app, click "Connect Wallet"
2. Select MetaMask
3. Approve connection

---

## Step 8: Test the App

Try creating a project:

1. Go to **Projects** → **Create New Project**
2. Fill in:
   - Title: "My First Project"
   - Description: "Testing LancerScape"
   - Client Address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` (Account #1 from Hardhat)
3. Click **Create Project**
4. Approve transaction in MetaMask

---

## Running Everything (Quick Commands)

After initial setup, you need **4 terminals**:

```bash
# Terminal 1: Blockchain
cd contracts && npx hardhat node

# Terminal 2: Backend
cd backend && npm run dev

# Terminal 3: Frontend
cd frontend && npm run dev

# Terminal 4: For commands (optional)
```

---

## Troubleshooting

### "Nonce too high" error
MetaMask cached old transactions. Fix:
1. MetaMask → Settings → Advanced → Clear activity tab data

### "Cannot connect to wallet"
1. Ensure Hardhat node is running
2. Check MetaMask is on "Hardhat Local" network (Chain ID 31337)
3. Refresh the page

### Contract function fails
1. Check contract addresses in `frontend/.env.local` match deployed addresses
2. Restart Hardhat node and redeploy contracts
3. Update addresses in `.env.local`
4. Clear MetaMask activity data

### Backend not responding
1. Check backend is running on port 4000
2. Verify `NEXT_PUBLIC_API_URL=http://localhost:4000` in frontend `.env.local`

---

## Next Steps

- Read [README.md](./README.md) for full documentation
- Check [docs/API_Documentation.md](./docs/API_Documentation.md) for API details
- Review [docs/security_checklist.md](./docs/security_checklist.md) before production

---

**Happy Building! 🚀**
