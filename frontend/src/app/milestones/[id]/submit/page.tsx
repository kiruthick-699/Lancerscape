"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useSubmitWork } from "@/lib/hooks/useProject";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SubmitWorkPage({ params }: { params: { id: string } }) {
  const { isConnected } = useAccount();
  // Placeholder: contract address should be loaded from context or query in real app
  const [contractAddress, setContractAddress] = useState<string>(process.env.NEXT_PUBLIC_PROJECT_ADDRESS || "");
  const [evidenceHash, setEvidenceHash] = useState<string>("placeholder-evidence-hash");
  const [milestoneId, setMilestoneId] = useState<string>(params.id || "");

  const {
    submitWork,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  } = useSubmitWork(contractAddress as `0x${string}`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    if (!contractAddress || !contractAddress.startsWith("0x") || contractAddress.length !== 42) {
      alert("Please provide a valid project contract address");
      return;
    }
    if (!milestoneId.trim()) {
      alert("Milestone ID is required");
      return;
    }
    try {
      await submitWork(BigInt(milestoneId), evidenceHash);
    } catch (err) {
      console.error(err);
      alert("Failed to submit work");
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Submit Work for Milestone {milestoneId}</h1>
      <Card className="p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="contract" className="block text-sm font-medium mb-2">
              Project Contract Address
            </label>
            <input
              id="contract"
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 border rounded-md bg-background"
              disabled={isPending || isConfirming}
            />
          </div>
          <div>
            <label htmlFor="evidence" className="block text-sm font-medium mb-2">
              Evidence Hash
            </label>
            <input
              id="evidence"
              type="text"
              value={evidenceHash}
              onChange={(e) => setEvidenceHash(e.target.value)}
              placeholder="placeholder-evidence-hash"
              className="w-full px-3 py-2 border rounded-md bg-background"
              disabled={isPending || isConfirming}
            />
          </div>
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-800 dark:text-red-200 text-sm">
              Error: {error.message}
            </div>
          )}
          {isSuccess && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-green-800 dark:text-green-200 text-sm">
              Work submitted successfully!
            </div>
          )}
          {hash && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-blue-800 dark:text-blue-200 text-sm break-all">
              Transaction Hash: {hash}
            </div>
          )}
          <Button
            type="submit"
            disabled={!isConnected || isPending || isConfirming}
            className="w-full"
          >
            {isPending && "Waiting for approval..."}
            {isConfirming && "Confirming transaction..."}
            {!isPending && !isConfirming && "Submit Work"}
          </Button>
          {!isConnected && (
            <p className="text-sm text-muted-foreground text-center">
              Please connect your wallet to submit work
            </p>
          )}
        </form>
      </Card>
    </div>
  );
}
