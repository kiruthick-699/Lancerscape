"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useApproveMilestone } from "@/hooks/useProjectContract";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Address } from "viem";

export default function ApproveMilestonePage({ params }: { params: { id: string } }) {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  
  // Placeholder: contract address should be loaded from context or query in real app
  const [contractAddress, setContractAddress] = useState<string>(process.env.NEXT_PUBLIC_PROJECT_ADDRESS || "");
  const milestoneId = parseInt(params.id || "0");

  const {
    write,
    isPending,
    isConfirming,
    isConfirmed,
    isError,
    error,
    data: hash,
  } = useApproveMilestone(contractAddress as Address);

  // Show toast on success
  useEffect(() => {
    if (isConfirmed) {
      toast({
        title: "Success!",
        description: "Milestone approved! Funds released to freelancer.",
        variant: "default",
      });
    }
  }, [isConfirmed, toast]);

  // Show toast on error
  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to approve milestone",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }
    
    if (!contractAddress || !contractAddress.startsWith("0x") || contractAddress.length !== 42) {
      toast({
        title: "Invalid Address",
        description: "Please provide a valid project contract address",
        variant: "destructive",
      });
      return;
    }

    try {
      // Call writeContract via the hook
      write?.({ milestoneId });
    } catch (err) {
      console.error("Approve milestone error:", err);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Approve Milestone #{milestoneId}</h1>
      
      <Card className="p-6">
        <form onSubmit={handleApprove} className="space-y-6">
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
            <p className="text-xs text-muted-foreground mt-1">
              The deployed Project contract address
            </p>
          </div>

          {/* Warning Box */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
              ⚠️ Important
            </p>
            <ul className="text-xs text-yellow-800 dark:text-yellow-200 space-y-1">
              <li>• This will release funds from escrow to the freelancer</li>
              <li>• This action cannot be undone</li>
              <li>• Make sure you have reviewed the submitted work</li>
              <li>• You must be the project client to approve</li>
            </ul>
          </div>

          {/* Transaction Hash Display */}
          {hash && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Transaction Submitted
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 break-all font-mono">
                {hash}
              </p>
            </div>
          )}

          {/* Approve Button */}
          <Button
            type="submit"
            disabled={!isConnected || isPending || isConfirming}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isPending && "⏳ Waiting for Wallet Approval..."}
            {isConfirming && "⛓️ Confirming Transaction..."}
            {!isPending && !isConfirming && "✓ Approve & Release Funds"}
          </Button>

          {/* Wallet Connection Warning */}
          {!isConnected && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                ⚠️ Please connect your wallet to approve
              </p>
            </div>
          )}

          {/* Status Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• This will call <code className="px-1 py-0.5 bg-muted rounded">approveMilestone()</code> on the blockchain</p>
            <p>• The milestone must be in "Submitted" status</p>
            <p>• Funds will be released immediately upon confirmation</p>
            <p>• Gas fees will be required for this transaction</p>
          </div>
        </form>
      </Card>
    </div>
  );
}

