# Wagmi Contract Hooks Documentation

## Overview

This module provides type-safe wagmi hooks for interacting with LancerScape smart contracts (Project and MilestoneEscrow). All hooks follow best practices with proper error handling, loading states, and NO hardcoded values.

---

## ✅ Security Features

- ✅ **NO hardcoded addresses** - All addresses loaded from environment variables
- ✅ **NO hardcoded RPC URLs** - Uses wagmi's configured providers
- ✅ **NO private keys** - All signing done via user's wallet (MetaMask, WalletConnect, etc.)
- ✅ **Input validation** - All parameters validated before contract calls
- ✅ **Type safety** - Full TypeScript support with proper types
- ✅ **Error handling** - Comprehensive error states and messages

---

## 📦 Available Hooks

### Write Operations (Transactions)

1. **`useCreateProject(factoryAddress)`** - Create new project via factory
2. **`useCreateMilestone(projectAddress)`** - Create milestone (client only)
3. **`useFundMilestone(projectAddress)`** - Fund milestone with ETH (client only)
4. **`useSubmitWork(projectAddress)`** - Submit work evidence (freelancer only)
5. **`useApproveMilestone(projectAddress)`** - Approve milestone, release funds (client only)
6. **`useOpenDispute(projectAddress)`** - Open dispute (client or freelancer)
7. **`useResolveDispute(projectAddress)`** - Resolve dispute (admin only)

### Read Operations (Queries)

8. **`useGetMilestone(projectAddress, milestoneId)`** - Read milestone data
9. **`useGetMilestoneCount(projectAddress)`** - Read total milestone count

---

## 🔧 Setup

### 1. Environment Variables

Create `.env.local` in your frontend directory:

```env
# Contract Addresses (fill after deployment)
NEXT_PUBLIC_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_ADMIN_ADDRESS=0x...

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Optional: Local Hardhat RPC
NEXT_PUBLIC_HARDHAT_RPC_URL=http://127.0.0.1:8545
```

### 2. Import Hooks

```typescript
import {
  useCreateMilestone,
  useFundMilestone,
  useSubmitWork,
  useApproveMilestone,
  useOpenDispute,
  useResolveDispute,
  useGetMilestone,
  useGetMilestoneCount,
} from '@/hooks/useProjectContract';
```

---

## 📖 Hook Documentation

### useCreateMilestone

Create a new milestone in a project. **Client only**.

**Parameters:**
- `projectAddress: Address` - Project contract address

**Returns:**
- `write: (params) => void` - Execute transaction
- `isPending: boolean` - Waiting for wallet approval
- `isConfirming: boolean` - Transaction confirming on-chain
- `isConfirmed: boolean` - Transaction confirmed
- `isSuccess: boolean` - Alias for isConfirmed
- `isError: boolean` - Error occurred
- `error: Error | null` - Error details
- `reset: () => void` - Reset hook state

**Usage:**
```typescript
const { write, isPending, isConfirmed, error } = useCreateMilestone(projectAddress);

const handleCreate = () => {
  write({
    title: "Design Homepage",
    amountInEth: "0.5" // Will be converted to wei
  });
};
```

---

### useFundMilestone

Fund a milestone with ETH (sends ETH to escrow). **Client only**.

**Parameters:**
- `projectAddress: Address` - Project contract address

**Returns:** Same as useCreateMilestone

**Usage:**
```typescript
const { write, isPending, isConfirmed, error } = useFundMilestone(projectAddress);

const handleFund = () => {
  write({
    milestoneId: 0,
    amountInEth: "0.5" // Must match milestone.amount
  });
};
```

**Important:** Amount must exactly match the milestone's required amount.

---

### useSubmitWork

Submit work evidence for a milestone. **Freelancer only**.

**Parameters:**
- `projectAddress: Address` - Project contract address

**Returns:** Same as useCreateMilestone

**Usage:**
```typescript
const { write, isPending, isConfirmed, error } = useSubmitWork(projectAddress);

const handleSubmit = () => {
  write({
    milestoneId: 0,
    evidenceHash: "QmXxx..." // IPFS hash or URL
  });
};
```

---

### useApproveMilestone

Approve milestone and release funds to freelancer. **Client only**.

**Parameters:**
- `projectAddress: Address` - Project contract address

**Returns:** Same as useCreateMilestone

**Usage:**
```typescript
const { write, isPending, isConfirmed, error } = useApproveMilestone(projectAddress);

const handleApprove = () => {
  write({ milestoneId: 0 });
};
```

**Important:** This releases funds from escrow to freelancer immediately.

---

### useOpenDispute

Open a dispute on a milestone. **Client or Freelancer**.

**Parameters:**
- `projectAddress: Address` - Project contract address

**Returns:** Same as useCreateMilestone

**Usage:**
```typescript
const { write, isPending, isConfirmed, error } = useOpenDispute(projectAddress);

const handleDispute = () => {
  write({
    milestoneId: 0,
    reason: "Work does not match requirements"
  });
};
```

---

### useResolveDispute

Resolve a dispute. **Admin only**.

**Parameters:**
- `projectAddress: Address` - Project contract address

**Returns:** Same as useCreateMilestone

**Usage:**
```typescript
const { write, isPending, isConfirmed, error } = useResolveDispute(projectAddress);

const handleResolve = (clientWins: boolean) => {
  write({
    milestoneId: 0,
    clientWins // true = refund client, false = pay freelancer
  });
};
```

---

### useGetMilestone

Read milestone data from contract (no transaction).

**Parameters:**
- `projectAddress: Address` - Project contract address
- `milestoneId: number` - Milestone index

**Returns:**
- `milestone: Milestone` - Milestone data object
- `isLoading: boolean` - Data loading
- `isError: boolean` - Error occurred
- `error: Error | null` - Error details
- `refetch: () => void` - Manually refresh data

**Milestone Object:**
```typescript
{
  id: bigint;           // Milestone index
  title: string;        // Milestone title
  amount: bigint;       // Amount in wei
  status: number;       // 0=Pending, 1=Funded, 2=Submitted, 3=Approved, 4=Disputed, 5=Resolved
  evidenceHash: string; // IPFS hash or empty
}
```

**Usage:**
```typescript
const { milestone, isLoading, error } = useGetMilestone(projectAddress, 0);

if (isLoading) return <p>Loading...</p>;
if (error) return <p>Error: {error.message}</p>;

console.log(milestone.title); // "Design Homepage"
console.log(milestone.status); // 1 (Funded)
```

---

### useGetMilestoneCount

Read total number of milestones in a project.

**Parameters:**
- `projectAddress: Address` - Project contract address

**Returns:**
- `count: number` - Total milestone count
- `isLoading: boolean` - Data loading
- `isError: boolean` - Error occurred
- `error: Error | null` - Error details
- `refetch: () => void` - Manually refresh data

**Usage:**
```typescript
const { count, isLoading, error } = useGetMilestoneCount(projectAddress);

console.log(`Total milestones: ${count}`);
```

---

## 🎯 Complete Example

```typescript
'use client';

import { useState } from 'react';
import { useCreateMilestone, useGetMilestoneCount } from '@/hooks/useProjectContract';
import type { Address } from 'viem';

export function MilestoneCreator({ projectAddress }: { projectAddress: Address }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  const { write, isPending, isConfirming, isConfirmed, error, reset } = 
    useCreateMilestone(projectAddress);
  
  const { count, refetch } = useGetMilestoneCount(projectAddress);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!write) {
      console.error('Contract not ready');
      return;
    }

    try {
      // Execute transaction
      write({ title, amountInEth: amount });
    } catch (err) {
      console.error('Transaction failed:', err);
    }
  };

  // Refresh count when confirmed
  React.useEffect(() => {
    if (isConfirmed) {
      refetch();
      setTitle('');
      setAmount('');
      setTimeout(reset, 3000); // Reset after 3s
    }
  }, [isConfirmed, refetch, reset]);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Create Milestone</h2>
      <p className="text-sm text-gray-600 mb-4">Total: {count} milestones</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending || isConfirming}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Amount (ETH)</label>
          <input
            type="number"
            step="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isPending || isConfirming}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isPending || isConfirming || !title || !amount}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:bg-gray-400"
        >
          {isPending && 'Approve in Wallet...'}
          {isConfirming && 'Confirming Transaction...'}
          {!isPending && !isConfirming && 'Create Milestone'}
        </button>
      </form>

      {/* Status Messages */}
      {isConfirmed && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
          ✓ Milestone created successfully!
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
          Error: {error.message}
        </div>
      )}
    </div>
  );
}
```

---

## 🔄 Transaction Lifecycle

All write hooks follow this lifecycle:

1. **Idle** - Initial state, ready for transaction
2. **isPending** - User prompted in wallet, waiting for approval
3. **isConfirming** - Transaction sent, waiting for blockchain confirmation
4. **isConfirmed** - Transaction confirmed successfully
5. **isError** - Error at any stage

```typescript
const { write, isPending, isConfirming, isConfirmed, isError, error, reset } = useHook();

// Check states
if (isPending) console.log('Waiting for wallet...');
if (isConfirming) console.log('Mining transaction...');
if (isConfirmed) console.log('Success!');
if (isError) console.error('Failed:', error?.message);

// Reset to idle state
reset();
```

---

## ⚠️ Error Handling

Common errors and solutions:

### "Invalid project address"
- Ensure project address is properly formatted (0x...)
- Check environment variables are set

### "User rejected transaction"
- User declined in wallet - no action needed

### "Insufficient funds"
- User doesn't have enough ETH for transaction + gas
- For fundMilestone, ensure user has milestone amount + gas

### "Project: caller is not the client"
- Wrong account connected
- Operation requires client wallet

### "Project: milestone not funded"
- Trying to submit work on unfunded milestone
- Fund milestone first

### "Project: incorrect funding amount"
- Amount sent doesn't match milestone.amount
- Check milestone details first

---

## 🧪 Testing Locally

1. **Start Hardhat Node:**
```bash
cd contracts
npx hardhat node
```

2. **Deploy Contracts:**
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

3. **Update .env.local:**
```env
NEXT_PUBLIC_FACTORY_ADDRESS=0x... # From deployment
NEXT_PUBLIC_ADMIN_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

4. **Import Hardhat Account to MetaMask:**
- Use private key from Hardhat node output
- Connect MetaMask to localhost:8545

5. **Test Hooks:**
```typescript
const projectAddress = '0x...'; // Deployed project address
const { write } = useCreateMilestone(projectAddress);
write({ title: "Test", amountInEth: "0.1" });
```

---

## 📚 Additional Resources

- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [Project Contract Source](../../../contracts/contracts/Project.sol)
- [Usage Examples](./useProjectContract.examples.tsx)

---

## ✅ Checklist

Before using hooks in production:

- [ ] Deploy contracts to testnet/mainnet
- [ ] Update `NEXT_PUBLIC_FACTORY_ADDRESS` in .env.local
- [ ] Update `NEXT_PUBLIC_ADMIN_ADDRESS` in .env.local
- [ ] Configure WalletConnect project ID
- [ ] Test all hooks with real transactions
- [ ] Implement proper error UI for users
- [ ] Add transaction notifications (toasts)
- [ ] Add loading skeletons for better UX
- [ ] Set up event listeners for real-time updates
- [ ] Implement proper access control checks in UI
