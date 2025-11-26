"use client";

import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { useCreateMilestone } from "@/lib/hooks/useProject";
import { useFundMilestone } from "@/lib/hooks/useFundMilestone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { parseEther, formatEther } from "viem";
import { projectABI } from "@/lib/contracts";

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
  const [milestoneId, setMilestoneId] = useState("");
  const [fundAmountEth, setFundAmountEth] = useState("");


  const { createMilestone, isPending, isConfirming, isSuccess, error } =
    useCreateMilestone(contractAddress as `0x${string}`);
  const {
    fundMilestone,
    isPending: isFunding,
    isConfirming: isFundingConfirming,
    isSuccess: isFundingSuccess,
    error: fundError,
    hash: fundTxHash,
  } = useFundMilestone(contractAddress as `0x${string}`);

  // Read on-chain milestone data
  const isValidAddress =
    !!contractAddress && contractAddress.startsWith("0x") && contractAddress.length === 42;

  const milestoneIdArg = (() => {
    try {
      return milestoneId.trim() !== "" ? BigInt(milestoneId) : undefined;
    } catch {
      return undefined;
    }
  })();

  const {
    data: milestoneData,
    isLoading: isReading,
    refetch: refetchMilestone,
    error: readError,
  } = useReadContract({
    address: (isValidAddress ? (contractAddress as `0x${string}`) : undefined) as
      | `0x${string}`
      | undefined,
    abi: projectABI,
    functionName: "milestones",
    args: milestoneIdArg !== undefined ? [milestoneIdArg] : undefined,
    query: { enabled: Boolean(isValidAddress && milestoneIdArg !== undefined) },
  });

  const statusLabels = [
    "Pending",
    "Funded",
    "Submitted",
    "Approved",
    "Disputed",
    "Resolved",
  ] as const;
  // Fund milestone handler
  const handleFundMilestone = async (e: React.FormEvent) => {
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
      alert("Please enter a milestone ID");
      return;
    }

    const fundAmountStr = fundAmountEth.trim();
    if (!fundAmountStr) {
      alert("Please enter an amount in ETH");
      return;
    }

    let fundAmountWei: bigint;
    try {
      fundAmountWei = parseEther(fundAmountStr as `${number}`);
    } catch {
      alert("Invalid ETH amount");
      return;
    }

    let milestoneIdNum: bigint;
    try {
      milestoneIdNum = BigInt(milestoneId);
    } catch {
      alert("Invalid milestone ID");
      return;
    }

    try {
      await fundMilestone(milestoneIdNum, fundAmountWei);
    } catch (err) {
      console.error(err);
      alert("Failed to fund milestone");
    }
  };

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

        {/* Fund Milestone Form */}
        <form onSubmit={handleFundMilestone} className="space-y-4 border-t pt-6 mt-6">
          <h2 className="text-lg font-semibold">Fund a Milestone</h2>
          <div>
            <label htmlFor="milestoneId" className="block text-sm font-medium mb-2">
              Milestone ID
            </label>
            <input
              id="milestoneId"
              type="text"
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              placeholder="e.g., 0"
              className="w-full px-3 py-2 border rounded-md bg-background"
              disabled={isFunding || isFundingConfirming}
            />
          </div>
          <div>
            <label htmlFor="fundAmount" className="block text-sm font-medium mb-2">
              Amount to Fund (ETH)
            </label>
            <input
              id="fundAmount"
              type="text"
              value={fundAmountEth}
              onChange={(e) => setFundAmountEth(e.target.value)}
              placeholder="e.g., 0.1"
              className="w-full px-3 py-2 border rounded-md bg-background"
              disabled={isFunding || isFundingConfirming}
            />
          </div>
          {fundError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-800 dark:text-red-200 text-sm">
              Error: {fundError.message}
            </div>
          )}
          {isFundingSuccess && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-green-800 dark:text-green-200 text-sm">
              Milestone funded successfully!
            </div>
          )}
          {fundTxHash && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-blue-800 dark:text-blue-200 text-sm break-all">
              Transaction Hash: {fundTxHash}
            </div>
          )}
          <Button
            type="submit"
            disabled={!isConnected || isFunding || isFundingConfirming}
            className="w-full"
          >
            {isFunding && "Waiting for approval..."}
            {isFundingConfirming && "Confirming transaction..."}
            {!isFunding && !isFundingConfirming && "Fund Milestone"}
          </Button>
        </form>

        {/* Milestone On-chain Data */}
        <div className="space-y-3 border-t pt-6 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Milestone Details</h2>
            <Button
              type="button"
              variant="ghost"
              onClick={() => refetchMilestone?.()}
              disabled={!isValidAddress || milestoneIdArg === undefined || isReading}
            >
              {isReading ? "Loading..." : "Refresh"}
            </Button>
          </div>

          {readError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-800 dark:text-red-200 text-sm">
              Error: {readError.message}
            </div>
          )}

          {milestoneData ? (
            <div className="rounded-md border p-4 text-sm space-y-1">
              <div>
                <span className="font-medium">Title:</span> {String((milestoneData as any).title)}
              </div>
              <div>
                <span className="font-medium">Amount:</span> {String((milestoneData as any).amount)} wei
                <span className="text-muted-foreground">
                  {" "}(~{formatEther((milestoneData as any).amount as bigint)} ETH)
                </span>
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                {statusLabels[Number((milestoneData as any).status)] ?? String((milestoneData as any).status)}
              </div>
              <div className="break-all">
                <span className="font-medium">Evidence Hash:</span> {String((milestoneData as any).evidenceHash)}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter a valid milestone ID and refresh to load details.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
