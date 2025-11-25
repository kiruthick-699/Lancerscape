"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useCreateMilestone } from "@/lib/hooks/useProject";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { parseEther } from "viem";

export default function ProjectDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { isConnected } = useAccount();

  // Allow entering the project contract address or load from env
  const [contractAddress, setContractAddress] = useState<string>(
    process.env.NEXT_PUBLIC_PROJECT_ADDRESS || ""
  );
  const [title, setTitle] = useState("");
  const [amountEth, setAmountEth] = useState("");

  const { createMilestone, isPending, isConfirming, isSuccess, error } =
    useCreateMilestone(contractAddress as `0x${string}`);

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

    if (!title.trim()) {
      alert("Please enter a milestone title");
      return;
    }

    const amountStr = amountEth.trim();
    if (!amountStr) {
      alert("Please enter an amount in ETH");
      return;
    }

    let amountWei: bigint;
    try {
      amountWei = parseEther(amountStr as `${number}`);
    } catch {
      alert("Invalid ETH amount");
      return;
    }

    try {
      await createMilestone(title, amountWei);
      alert("Milestone created successfully");
      setTitle("");
      setAmountEth("");
    } catch (err) {
      console.error(err);
      alert("Failed to create milestone");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Project {params.id}</h1>
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
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Milestone Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Design Phase"
              className="w-full px-3 py-2 border rounded-md bg-background"
              disabled={isPending || isConfirming}
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-2">
              Amount (ETH)
            </label>
            <input
              id="amount"
              type="text"
              value={amountEth}
              onChange={(e) => setAmountEth(e.target.value)}
              placeholder="0.1"
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
              Milestone created successfully!
            </div>
          )}

          <Button
            type="submit"
            disabled={!isConnected || isPending || isConfirming}
            className="w-full"
          >
            {isPending && "Waiting for approval..."}
            {isConfirming && "Confirming transaction..."}
            {!isPending && !isConfirming && "Create Milestone"}
          </Button>

          {!isConnected && (
            <p className="text-sm text-muted-foreground text-center">
              Please connect your wallet to create a milestone
            </p>
          )}
        </form>
      </Card>
    </div>
  );
}
