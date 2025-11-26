"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useApproveMilestone } from "@/lib/hooks/useProject";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ApproveMilestonePage({ params }: { params: { id: string } }) {
  const { address, isConnected } = useAccount();
  // Placeholder: contract address should be loaded from context or query in real app
  const [contractAddress, setContractAddress] = useState<string>(process.env.NEXT_PUBLIC_PROJECT_ADDRESS || "");
  const [milestoneId, setMilestoneId] = useState<string>(params.id || "");
  const [clientAddress, setClientAddress] = useState<string>("");

  const {
    approveMilestone,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  } = useApproveMilestone(contractAddress as `0x${string}`);

  // Fetch client address from contract (placeholder: set manually or via prop in real app)
  useEffect(() => {
    // TODO: Replace with actual contract call to fetch client address
    setClientAddress(process.env.NEXT_PUBLIC_CLIENT_ADDRESS || "");
  }, []);

  const isClient = isConnected && address && clientAddress && address.toLowerCase() === clientAddress.toLowerCase();

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isClient) {
      alert("Only the client can approve milestones");
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
      await approveMilestone(BigInt(milestoneId));
    } catch (err) {
      console.error(err);
      alert("Failed to approve milestone");
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Approve Milestone {milestoneId}</h1>
      <Card className="p-6 space-y-4">
        <form onSubmit={handleApprove} className="space-y-4">
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
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-800 dark:text-red-200 text-sm">
              Error: {error.message}
            </div>
          )}
          {isSuccess && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-green-800 dark:text-green-200 text-sm">
              Milestone approved successfully!
            </div>
          )}
          {hash && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-blue-800 dark:text-blue-200 text-sm break-all">
              Transaction Hash: {hash}
            </div>
          )}
          <Button
            type="submit"
            disabled={!isClient || isPending || isConfirming}
            className="w-full"
          >
            {isPending && "Waiting for approval..."}
            {isConfirming && "Confirming transaction..."}
            {!isPending && !isConfirming && "Approve Milestone"}
          </Button>
          {!isClient && (
            <p className="text-sm text-muted-foreground text-center">
              Only the client can approve milestones
            </p>
          )}
        </form>
      </Card>
    </div>
  );
}
