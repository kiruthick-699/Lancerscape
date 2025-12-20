# LancerScape Deployment Guide

Version: 1.0
Last Updated: November 28, 2025

Do NOT include private keys anywhere in this process. Use placeholders like `<YOUR_RPC_URL>` and configure secrets only in environment managers.

---

## Overview

This guide walks through deploying the LancerScape stack:
- Smart contracts → Testnet (Base Sepolia or your preferred EVM testnet)
- Frontend → Vercel
- Backend → Railway or Render
- Environment variables → Frontend and Backend (no values included)
- Contract verification → BaseScan/Etherscan

---

## Prerequisites

- Node.js 18+
- `pnpm` or `npm`
- Funded testnet wallet (use a faucet; never mainnet funds)
- Access to hosting providers:
  - Vercel (frontend)
  - Railway or Render (backend)
- RPC endpoint for testnet: `<YOUR_RPC_URL>`

---

## 1) Deploy Smart Contracts to Testnet

Assuming Hardhat is set up in the repository.

### Configure Network

Create or update `hardhat.config.ts` (or `.js`) with a testnet network. Use placeholders and environment variables; do NOT hardcode secrets.

```ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    baseSepolia: {
      url: process.env.RPC_URL || "<YOUR_RPC_URL>",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },
  },
};

export default config;
```

Environment variables (example names only; do not include values):
- `RPC_URL`
- `DEPLOYER_PRIVATE_KEY` (configure only in your local `.env` and hosting secrets; never commit)

### Compile & Deploy

From the project root:

```bash
# install deps
npm install

# compile
npx hardhat compile

# run deployment script (example)
npx hardhat run scripts/deploy.ts --network baseSepolia
```

Typical deployment script (`scripts/deploy.ts`) outline:

```ts
import { ethers } from "hardhat";

async function main() {
  const Factory = await ethers.getContractFactory("ProjectFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();

  console.log("ProjectFactory deployed at:", await factory.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Record deployed addresses for later steps (e.g., `ProjectFactory` address).

---

## 2) Update Frontend Environment with Contract Addresses

Update `frontend` environment variables. Use `.env.local` during development and provider-managed secrets in production.

Create or update `frontend/.env.local` (do not commit):

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_FACTORY_ADDRESS=<DEPLOYED_FACTORY_ADDRESS>
NEXT_PUBLIC_PROJECT_CONTRACT_ADDRESS=<OPTIONAL_PROJECT_ADDRESS_IF_STATIC>
NEXT_PUBLIC_ADMIN_ADDRESS=<YOUR_ADMIN_WALLET_ADDRESS>
NEXT_PUBLIC_CHAIN_ID=<TESTNET_CHAIN_ID>
NEXT_PUBLIC_RPC_URL=<YOUR_RPC_URL>
```

For Vercel production/staging, set the same keys in Project → Settings → Environment Variables.

Ensure the frontend reads these values via `process.env.NEXT_PUBLIC_*` and that addresses are validated in forms/hooks.

---

## 3) Deploy Backend (Railway or Render)

### Prepare Server

- Ensure backend has a start script in `package.json`:

```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc -p ."
  }
}
```

- Build output should generate `dist/server.js`.

### Environment Variables (Backend)

Configure in Railway/Render (names only, no values):

```bash
PORT=4000
NODE_ENV=production
AI_PROVIDER=<AI_PROVIDER_NAME>
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
ALLOWED_ORIGINS=<YOUR_FRONTEND_URLS_COMMA_SEPARATED>
FACTORY_ADDRESS=<DEPLOYED_FACTORY_ADDRESS>
PROJECT_CONTRACT_ADDRESS=<OPTIONAL_PROJECT_ADDRESS>
RPC_URL=<YOUR_RPC_URL>
```

Do not commit actual values. Use the provider’s secrets manager.

### Deploy on Railway

- Create new project → Deploy from GitHub repo or connect via CLI
- Set Environment Variables
- Add a service (Node.js) → Build & deploy
- Expose port `PORT`

### Deploy on Render

- Create new Web Service → Connect repo
- Set Build Command: `npm install && npm run build`
- Set Start Command: `npm run start`
- Set Environment Variables
- Choose region close to users

### Verify Backend

- Test health endpoint (if available): `GET https://<your-backend-host>/health`
- Test dispute APIs with curl:

```bash
curl -s -X GET https://<your-backend-host>/api/admin/disputes | jq
```

---

## 4) Host Frontend on Vercel

### Project Setup

- Import the repo into Vercel
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.vercel/output` (or default for Next.js)

### Environment Variables (Frontend)

Add these in Vercel → Settings → Environment Variables (names only):

```bash
NEXT_PUBLIC_API_URL=https://<YOUR_BACKEND_HOST>
NEXT_PUBLIC_FACTORY_ADDRESS=<DEPLOYED_FACTORY_ADDRESS>
NEXT_PUBLIC_PROJECT_CONTRACT_ADDRESS=<OPTIONAL_PROJECT_ADDRESS_IF_STATIC>
NEXT_PUBLIC_ADMIN_ADDRESS=<YOUR_ADMIN_WALLET_ADDRESS>
NEXT_PUBLIC_CHAIN_ID=<TESTNET_CHAIN_ID>
NEXT_PUBLIC_RPC_URL=<YOUR_RPC_URL>
```

### Verify Frontend

- Open your Vercel domain: `https://<your-vercel-project>.vercel.app`
- Connect wallet on the testnet
- Ensure contract interactions succeed against the testnet deployment

---

## 5) Environment Variable Setup (Summary)

Never commit actual secret values. Use `.env.example` to document required keys.

Create/update root-level `.env.example` (names only):

```bash
# Frontend
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_FACTORY_ADDRESS=
NEXT_PUBLIC_PROJECT_CONTRACT_ADDRESS=
NEXT_PUBLIC_ADMIN_ADDRESS=
NEXT_PUBLIC_CHAIN_ID=
NEXT_PUBLIC_RPC_URL=

# Backend
PORT=
NODE_ENV=
AI_PROVIDER=
OPENAI_API_KEY=
ALLOWED_ORIGINS=
FACTORY_ADDRESS=
PROJECT_CONTRACT_ADDRESS=
RPC_URL=
```

- Local development: `.env.local` (frontend), `.env` (backend)
- Hosting: provider-managed secrets (Vercel/Railway/Render)

---

## 6) Verify Contracts on BaseScan/Etherscan

Verification lets users and tools read your source on explorers.

### Hardhat Verify (recommended)

Add `@nomicfoundation/hardhat-verify` and configure `etherscan.apiKey` (name only; set value in env):

```bash
npm install -D @nomicfoundation/hardhat-verify
```

Update `hardhat.config.ts`:

```ts
import "@nomicfoundation/hardhat-verify";

const config = {
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || process.env.BASESCAN_API_KEY,
  },
};
```

Run verify (replace with your address and constructor args):

```bash
npx hardhat verify --network baseSepolia <DEPLOYED_FACTORY_ADDRESS> <ARG1> <ARG2>
```

### Manual Verification (alternative)

- Go to BaseScan/Etherscan → Contract → Verify & Publish
- Paste flattened sources or upload metadata/artifacts
- Enter compiler version `0.8.27` and optimization settings

---

## 7) Post-Deployment Checks

- Frontend loads on Vercel and points to backend host
- Backend endpoints respond with 200 OK and correct CORS
- Wallet connects on the correct testnet; addresses are set
- Contract functions work (create project, milestones, fund, approvals)
- Events emit correctly; logs visible on explorer
- AI summary endpoint works with rate limits

---

## 8) Maintenance & Rollouts

- Maintain separate environments: Development / Staging / Production
- Use versioned releases; tag deploys
- Rotate API keys and secrets periodically
- Monitor logs, errors, and contract events
- Document changes in `CHANGELOG.md`

---

## Troubleshooting

- Wrong network: Verify `NEXT_PUBLIC_CHAIN_ID` and wallet network
- 403/401 from backend: Check CORS `ALLOWED_ORIGINS` and auth
- Failed verify: Confirm constructor arguments and bytecode match
- Frontend env missing: Ensure Vercel project has all `NEXT_PUBLIC_*` vars
- Contract calls failing: Check addresses and RPC availability

---

## Notes

- This guide uses placeholders like `<YOUR_RPC_URL>` and does not include private keys.
- Use testnet only (e.g., Base Sepolia) until completing security audit and production hardening.
