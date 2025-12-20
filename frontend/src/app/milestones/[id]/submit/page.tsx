"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useSubmitWork } from "@/hooks/useProjectContract";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Address } from "viem";

export default function SubmitWorkPage({ params }: { params: { id: string } }) {
  const { isConnected } = useAccount();
  const { toast } = useToast();
  
  // Placeholder: contract address should be loaded from context or query in real app
  const [contractAddress, setContractAddress] = useState<string>(process.env.NEXT_PUBLIC_PROJECT_ADDRESS || "");
  const [evidenceHash, setEvidenceHash] = useState<string>("");
  const milestoneId = parseInt(params.id || "0");

  const {
    write,
    isPending,
    isConfirming,
    isConfirmed,
    isError,
    error,
    data: hash,
  } = useSubmitWork(contractAddress as Address);

  // Show toast on success
  useEffect(() => {
    if (isConfirmed) {
      toast({
        title: "Success!",
        description: "Work submitted successfully to the blockchain.",
        variant: "default",
      });
    }
  }, [isConfirmed, toast]);

  // Show toast on error
  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to submit work",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  const handleSubmit = (e: React.FormEvent) => {
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
    
    if (!evidenceHash.trim()) {
      toast({
        title: "Evidence Required",
        description: "Please provide an evidence hash (e.g., IPFS hash)",
        variant: "destructive",
      });
      return;
    }

    try {
      // Call writeContract via the hook
      write?.({ milestoneId, evidenceHash: evidenceHash.trim() });
    } catch (err) {
      console.error("Submit work error:", err);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Submit Work for Milestone #{milestoneId}</h1>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <label htmlFor="evidence" className="block text-sm font-medium mb-2">
              Evidence Hash / IPFS CID
            </label>
            <input
              id="evidence"
              type="text"
              value={evidenceHash}
              onChange={(e) => setEvidenceHash(e.target.value)}
              placeholder="QmXxx... or ipfs://..."
              className="w-full px-3 py-2 border rounded-md bg-background"
              disabled={isPending || isConfirming}
            />
            <p className="text-xs text-muted-foreground mt-1">
              IPFS hash or URL pointing to your submitted work
            </p>
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
            disabled={!isConnected || isPending || isConfirming || !evidenceHash.trim()}
            className="w-full"
          >
            {isPending && "⏳ Waiting for Wallet Approval..."}
            {isConfirming && "⛓️ Confirming Transaction..."}
            {!isPending && !isConfirming && "Submit Work to Blockchain"}
          </Button>

          {/* Wallet Connection Warning */}
          {!isConnected && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                ⚠️ Please connect your wallet to submit work
              </p>
            </div>
          )}

          {/* Status Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• This will call <code className="px-1 py-0.5 bg-muted rounded">submitWork()</code> on the blockchain</p>
            <p>• You must be the assigned freelancer for this project</p>
            <p>• The milestone must be in "Funded" status</p>
            <p>• Gas fees will be required for this transaction</p>
          </div>
        </form>
      </Card>
    </div>
  );
}
