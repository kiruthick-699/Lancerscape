"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useOpenDispute } from "@/hooks/useProjectContract";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Address } from "viem";

export default function OpenDisputePage({ params }: { params: { id: string } }) {
  const { isConnected } = useAccount();
  const { toast } = useToast();
  
  const [contractAddress, setContractAddress] = useState<string>(process.env.NEXT_PUBLIC_PROJECT_ADDRESS || "");
  const milestoneId = parseInt(params.id || "0");
  const [reason, setReason] = useState<string>("");

  const {
    write,
    isPending,
    isConfirming,
    isConfirmed,
    isError,
    error,
    data: hash,
  } = useOpenDispute(contractAddress as Address);

  // Show toast on success
  useEffect(() => {
    if (isConfirmed) {
      toast({
        title: "Dispute Opened",
        description: "Your dispute has been submitted to the blockchain.",
        variant: "default",
      });
    }
  }, [isConfirmed, toast]);

  // Show toast on error
  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to open dispute",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  const handleOpenDispute = (e: React.FormEvent) => {
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

    if (!reason.trim() || reason.trim().length < 10) {
      toast({
        title: "Reason Required",
        description: "Please provide a detailed reason (minimum 10 characters)",
        variant: "destructive",
      });
      return;
    }

    try {
      // Call writeContract via the hook
      write?.({ milestoneId, reason: reason.trim() });
    } catch (err) {
      console.error("Open dispute error:", err);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Open Dispute for Milestone #{milestoneId}</h1>
      
      <Card className="p-6">
        <form onSubmit={handleOpenDispute} className="space-y-6">
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

          <div>
            <label htmlFor="reason" className="block text-sm font-medium mb-2">
              Dispute Reason
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you are opening this dispute (minimum 10 characters)..."
              className="w-full px-3 py-2 border rounded-md bg-background min-h-[120px]"
              disabled={isPending || isConfirming}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Provide a clear explanation of the issue
            </p>
          </div>

          {/* Warning Box */}
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
              ⚠️ Opening a Dispute
            </p>
            <ul className="text-xs text-red-800 dark:text-red-200 space-y-1">
              <li>• This will freeze the milestone and prevent normal completion</li>
              <li>• Both client and freelancer can open disputes</li>
              <li>• An admin will review and resolve the dispute</li>
              <li>• This action should only be taken for serious issues</li>
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

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isConnected || isPending || isConfirming || reason.trim().length < 10}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {isPending && "⏳ Waiting for Wallet Approval..."}
            {isConfirming && "⛓️ Confirming Transaction..."}
            {!isPending && !isConfirming && "⚠️ Open Dispute"}
          </Button>

          {/* Wallet Connection Warning */}
          {!isConnected && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                ⚠️ Please connect your wallet to open a dispute
              </p>
            </div>
          )}

          {/* Status Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• This will call <code className="px-1 py-0.5 bg-muted rounded">openDispute()</code> on the blockchain</p>
            <p>• The milestone must be in "Funded" or "Submitted" status</p>
            <p>• You must be either the client or freelancer</p>
            <p>• Gas fees will be required for this transaction</p>
          </div>
        </form>
      </Card>
    </div>
  );
}
  );
}
