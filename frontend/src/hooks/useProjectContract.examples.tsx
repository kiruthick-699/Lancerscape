/**
 * Wagmi Contract Hooks - Usage Examples
 * 
 * Demonstrates how to use the contract interaction hooks in components
 */

'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import {
  useCreateMilestone,
  useFundMilestone,
  useSubmitWork,
  useApproveMilestone,
  useOpenDispute,
  useResolveDispute,
  useGetMilestone,
  useGetMilestoneCount,
} from './useProjectContract';
import type { Address } from 'viem';

/**
 * Example: Create Milestone Component
 */
export function ExampleCreateMilestone({ projectAddress }: { projectAddress: Address }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  const { write, isPending, isConfirming, isConfirmed, error } = useCreateMilestone(projectAddress);

  const handleCreate = () => {
    if (!write) return;

    try {
      write({ title, amountInEth: amount });
    } catch (err) {
      console.error('Failed to create milestone:', err);
    }
  };

  return (
    <div className="space-y-4">
      <h2>Create Milestone</h2>
      
      <input
        type="text"
        placeholder="Milestone title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isPending || isConfirming}
      />
      
      <input
        type="number"
        placeholder="Amount in ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={isPending || isConfirming}
      />
      
      <button 
        onClick={handleCreate}
        disabled={isPending || isConfirming || !title || !amount}
      >
        {isPending && 'Waiting for wallet approval...'}
        {isConfirming && 'Confirming transaction...'}
        {!isPending && !isConfirming && 'Create Milestone'}
      </button>

      {isConfirmed && <p className="text-green-600">✓ Milestone created successfully!</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
    </div>
  );
}

/**
 * Example: Fund Milestone Component
 */
export function ExampleFundMilestone({ 
  projectAddress, 
  milestoneId,
  milestoneAmount 
}: { 
  projectAddress: Address;
  milestoneId: number;
  milestoneAmount: string;
}) {
  const { write, isPending, isConfirming, isConfirmed, error } = useFundMilestone(projectAddress);

  const handleFund = () => {
    if (!write) return;

    try {
      write({ milestoneId, amountInEth: milestoneAmount });
    } catch (err) {
      console.error('Failed to fund milestone:', err);
    }
  };

  return (
    <div className="space-y-4">
      <h3>Fund Milestone #{milestoneId}</h3>
      <p>Amount: {milestoneAmount} ETH</p>
      
      <button 
        onClick={handleFund}
        disabled={isPending || isConfirming}
      >
        {isPending && 'Waiting for wallet approval...'}
        {isConfirming && 'Confirming transaction...'}
        {!isPending && !isConfirming && 'Fund Milestone'}
      </button>

      {isConfirmed && <p className="text-green-600">✓ Milestone funded!</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
    </div>
  );
}

/**
 * Example: Submit Work Component
 */
export function ExampleSubmitWork({ 
  projectAddress, 
  milestoneId 
}: { 
  projectAddress: Address;
  milestoneId: number;
}) {
  const [evidenceHash, setEvidenceHash] = useState('');
  const { write, isPending, isConfirming, isConfirmed, error } = useSubmitWork(projectAddress);

  const handleSubmit = () => {
    if (!write || !evidenceHash) return;

    try {
      write({ milestoneId, evidenceHash });
    } catch (err) {
      console.error('Failed to submit work:', err);
    }
  };

  return (
    <div className="space-y-4">
      <h3>Submit Work for Milestone #{milestoneId}</h3>
      
      <input
        type="text"
        placeholder="IPFS hash (e.g., QmXxx...)"
        value={evidenceHash}
        onChange={(e) => setEvidenceHash(e.target.value)}
        disabled={isPending || isConfirming}
      />
      
      <button 
        onClick={handleSubmit}
        disabled={isPending || isConfirming || !evidenceHash}
      >
        {isPending && 'Waiting for wallet approval...'}
        {isConfirming && 'Confirming transaction...'}
        {!isPending && !isConfirming && 'Submit Work'}
      </button>

      {isConfirmed && <p className="text-green-600">✓ Work submitted!</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
    </div>
  );
}

/**
 * Example: Approve Milestone Component
 */
export function ExampleApproveMilestone({ 
  projectAddress, 
  milestoneId 
}: { 
  projectAddress: Address;
  milestoneId: number;
}) {
  const { write, isPending, isConfirming, isConfirmed, error } = useApproveMilestone(projectAddress);

  const handleApprove = () => {
    if (!write) return;

    try {
      write({ milestoneId });
    } catch (err) {
      console.error('Failed to approve milestone:', err);
    }
  };

  return (
    <div className="space-y-4">
      <h3>Approve Milestone #{milestoneId}</h3>
      <p className="text-sm text-gray-600">This will release funds to the freelancer</p>
      
      <button 
        onClick={handleApprove}
        disabled={isPending || isConfirming}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {isPending && 'Waiting for wallet approval...'}
        {isConfirming && 'Confirming transaction...'}
        {!isPending && !isConfirming && 'Approve & Release Funds'}
      </button>

      {isConfirmed && <p className="text-green-600">✓ Milestone approved! Funds released.</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
    </div>
  );
}

/**
 * Example: Open Dispute Component
 */
export function ExampleOpenDispute({ 
  projectAddress, 
  milestoneId 
}: { 
  projectAddress: Address;
  milestoneId: number;
}) {
  const [reason, setReason] = useState('');
  const { write, isPending, isConfirming, isConfirmed, error } = useOpenDispute(projectAddress);

  const handleOpenDispute = () => {
    if (!write || !reason) return;

    try {
      write({ milestoneId, reason });
    } catch (err) {
      console.error('Failed to open dispute:', err);
    }
  };

  return (
    <div className="space-y-4">
      <h3>Open Dispute for Milestone #{milestoneId}</h3>
      
      <textarea
        placeholder="Reason for dispute..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        disabled={isPending || isConfirming}
        className="w-full p-2 border rounded"
        rows={4}
      />
      
      <button 
        onClick={handleOpenDispute}
        disabled={isPending || isConfirming || !reason}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        {isPending && 'Waiting for wallet approval...'}
        {isConfirming && 'Confirming transaction...'}
        {!isPending && !isConfirming && 'Open Dispute'}
      </button>

      {isConfirmed && <p className="text-green-600">✓ Dispute opened!</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
    </div>
  );
}

/**
 * Example: Resolve Dispute Component (Admin only)
 */
export function ExampleResolveDispute({ 
  projectAddress, 
  milestoneId 
}: { 
  projectAddress: Address;
  milestoneId: number;
}) {
  const { address } = useAccount();
  const { write, isPending, isConfirming, isConfirmed, error } = useResolveDispute(projectAddress);

  const handleResolve = (clientWins: boolean) => {
    if (!write) return;

    try {
      write({ milestoneId, clientWins });
    } catch (err) {
      console.error('Failed to resolve dispute:', err);
    }
  };

  return (
    <div className="space-y-4">
      <h3>Resolve Dispute for Milestone #{milestoneId}</h3>
      <p className="text-sm text-gray-600">Admin only</p>
      
      <div className="flex gap-4">
        <button 
          onClick={() => handleResolve(true)}
          disabled={isPending || isConfirming}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Refund Client
        </button>

        <button 
          onClick={() => handleResolve(false)}
          disabled={isPending || isConfirming}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Pay Freelancer
        </button>
      </div>

      {isPending && <p className="text-yellow-600">Waiting for wallet approval...</p>}
      {isConfirming && <p className="text-yellow-600">Confirming transaction...</p>}
      {isConfirmed && <p className="text-green-600">✓ Dispute resolved!</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
    </div>
  );
}

/**
 * Example: Read Milestone Data Component
 */
export function ExampleMilestoneViewer({ 
  projectAddress, 
  milestoneId 
}: { 
  projectAddress: Address;
  milestoneId: number;
}) {
  const { milestone, isLoading, error, refetch } = useGetMilestone(projectAddress, milestoneId);

  if (isLoading) return <p>Loading milestone data...</p>;
  if (error) return <p>Error loading milestone: {error.message}</p>;
  if (!milestone) return <p>No milestone found</p>;

  const statusNames = ['Pending', 'Funded', 'Submitted', 'Approved', 'Disputed', 'Resolved'];

  return (
    <div className="space-y-2">
      <h3>Milestone #{milestone.id.toString()}</h3>
      <p><strong>Title:</strong> {milestone.title}</p>
      <p><strong>Amount:</strong> {milestone.amount.toString()} wei</p>
      <p><strong>Status:</strong> {statusNames[milestone.status] || 'Unknown'}</p>
      {milestone.evidenceHash && (
        <p><strong>Evidence:</strong> {milestone.evidenceHash}</p>
      )}
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}

/**
 * Example: Milestone List Component
 */
export function ExampleMilestoneList({ projectAddress }: { projectAddress: Address }) {
  const { count, isLoading, error } = useGetMilestoneCount(projectAddress);

  if (isLoading) return <p>Loading milestone count...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h3>Total Milestones: {count}</h3>
      <div className="space-y-4">
        {Array.from({ length: count }, (_, i) => (
          <ExampleMilestoneViewer 
            key={i} 
            projectAddress={projectAddress} 
            milestoneId={i} 
          />
        ))}
      </div>
    </div>
  );
}
