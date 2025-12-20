#!/usr/bin/env zsh
set -euo pipefail

# Deployment Automation Script
# - Deploy smart contracts to Base Sepolia
# - Save addresses to frontend env
# - Build frontend
# - Deploy backend to Railway/Render
# - Deploy frontend to Vercel
# Note: Uses environment variables; no private keys stored in script.

echo "== Lancerscape Deployment Script =="

# Required environment variables
: ${PRIVATE_KEY:?"PRIVATE_KEY is required (deployer)"}
: ${BASE_SEPOLIA_RPC_URL:?"BASE_SEPOLIA_RPC_URL is required"}
: ${VERCEL_TOKEN:?"VERCEL_TOKEN is required"}
: ${VERCEL_ORG_ID:?"VERCEL_ORG_ID is required"}
: ${VERCEL_PROJECT_ID:?"VERCEL_PROJECT_ID is required"}

# Optional: Railway or Render
RAILWAY_TOKEN=${RAILWAY_TOKEN:-}
RENDER_API_KEY=${RENDER_API_KEY:-}

ROOT_DIR="$PWD"
CONTRACTS_DIR="$ROOT_DIR/contracts"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_DIR="$ROOT_DIR/backend"
SCRIPTS_DIR="$ROOT_DIR/scripts"

CHAIN_NAME="base-sepolia"
CHAIN_ID=84532

echo "Step 1: Deploy smart contracts to $CHAIN_NAME ($CHAIN_ID)"
pushd "$CONTRACTS_DIR" >/dev/null

# Prepare Hardhat network config via env vars
export HARDHAT_NETWORK="$CHAIN_NAME"
export BASE_SEPOLIA_RPC_URL
export PRIVATE_KEY

# Create a temporary hardhat network extension if needed (assumes hardhat.config.ts supports env)
echo "- Running Hardhat compile"
npx hardhat compile

echo "- Deploying Project contract"
DEPLOY_OUTPUT=$(npx hardhat run --network "$CHAIN_NAME" scripts/deploy.ts 2>&1)
echo "$DEPLOY_OUTPUT" | tail -n 50

# Try to parse address from output (adjust if your deploy script prints differently)
PROJECT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -Eo 'Project deployed to: 0x[a-fA-F0-9]{40}' | awk '{print $4}' | head -n1)
if [[ -z "$PROJECT_ADDRESS" ]]; then
  echo "Failed to parse Project address from deploy output. Please ensure scripts/deploy.ts logs 'Project deployed to: <address>'"
  exit 1
fi
echo "- Deployed Project at: $PROJECT_ADDRESS"

popd >/dev/null

echo "Step 2: Save addresses to frontend env"
FRONTEND_ENV="$FRONTEND_DIR/.env.local"
mkdir -p "$FRONTEND_DIR"
touch "$FRONTEND_ENV"

grep -v '^NEXT_PUBLIC_PROJECT_ADDRESS=' "$FRONTEND_ENV" > "$FRONTEND_ENV.tmp" || true
mv "$FRONTEND_ENV.tmp" "$FRONTEND_ENV"
echo "NEXT_PUBLIC_PROJECT_ADDRESS=$PROJECT_ADDRESS" >> "$FRONTEND_ENV"
echo "NEXT_PUBLIC_CHAIN_ID=$CHAIN_ID" >> "$FRONTEND_ENV"
echo "NEXT_PUBLIC_RPC_URL=$BASE_SEPOLIA_RPC_URL" >> "$FRONTEND_ENV"
echo "- Updated $FRONTEND_ENV"

echo "Step 3: Build frontend"
pushd "$FRONTEND_DIR" >/dev/null
npm install
npm run build
popd >/dev/null

echo "Step 4: Deploy backend (Railway or Render)"
pushd "$BACKEND_DIR" >/dev/null
npm install

if [[ -n "$RAILWAY_TOKEN" ]]; then
  echo "- Deploying to Railway"
  # Assumes railway CLI installed and project already initialized
  railway up --service backend --detach || echo "Railway deploy attempted; verify in dashboard."
elif [[ -n "$RENDER_API_KEY" ]]; then
  echo "- Deploying to Render (API-driven)"
  echo "Please configure Render service and use their CLI/API with RENDER_API_KEY."
else
  echo "- No Railway or Render token provided; skipping backend deploy."
fi
popd >/dev/null

echo "Step 5: Deploy frontend to Vercel"
pushd "$FRONTEND_DIR" >/dev/null

# Use Vercel CLI (requires vercel to be installed and env vars set)
if ! command -v vercel >/dev/null 2>&1; then
  echo "vercel CLI not found. Installing locally..."
  npm install --no-save vercel
  VERCEL_BIN="$(npm bin)/vercel"
else
  VERCEL_BIN="vercel"
fi

echo "- Running Vercel deploy"
$VERCEL_BIN --token "$VERCEL_TOKEN" --prod --confirm --env NEXT_PUBLIC_PROJECT_ADDRESS="$PROJECT_ADDRESS" --env NEXT_PUBLIC_CHAIN_ID="$CHAIN_ID" --env NEXT_PUBLIC_RPC_URL="$BASE_SEPOLIA_RPC_URL" --scope "$VERCEL_ORG_ID" --project "$VERCEL_PROJECT_ID" || echo "Vercel deploy attempted; verify in dashboard."

popd >/dev/null

echo "== Deployment Completed (check logs/dashboards for confirmations) =="
