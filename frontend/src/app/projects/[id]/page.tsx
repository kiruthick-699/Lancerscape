"use client";

import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { useCreateMilestone } from "@/lib/hooks/useProject";
import { useFundMilestone } from "@/lib/hooks/useFundMilestone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { parseEther, formatEther } from "viem";
import { projectABI } from "@/lib/contracts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const milestoneSchema = z.object({
  contractAddress: z.string()
    .min(1, "Contract address is required")
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid contract address format"),
  title: z.string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters"),
  amountEth: z.string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Amount must be a positive number"),
});

const fundMilestoneSchema = z.object({
  milestoneId: z.string()
    .min(1, "Milestone ID is required")
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, "Milestone ID must be a non-negative number"),
  fundAmountEth: z.string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Amount must be a positive number"),
});

type MilestoneFormData = z.infer<typeof milestoneSchema>;
type FundMilestoneFormData = z.infer<typeof fundMilestoneSchema>;

export default function ProjectDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { isConnected } = useAccount();

  const [milestoneId, setMilestoneId] = useState("");

  const {
    register: registerMilestone,
    handleSubmit: handleSubmitMilestone,
    formState: { errors: milestoneErrors },
    watch: watchMilestone,
    reset: resetMilestone,
  } = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      contractAddress: process.env.NEXT_PUBLIC_PROJECT_ADDRESS || "",
    },
  });

  const {
    register: registerFund,
    handleSubmit: handleSubmitFund,
    formState: { errors: fundErrors },
    reset: resetFund,
  } = useForm<FundMilestoneFormData>({
    resolver: zodResolver(fundMilestoneSchema),
  });

  const contractAddress = watchMilestone("contractAddress");

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

  const onSubmitMilestone = async (data: MilestoneFormData) => {
    if (!isConnected) {
      return;
    }

    try {
      const amountWei = parseEther(data.amountEth as `${number}`);
      await createMilestone(data.title, amountWei);
      resetMilestone({
        contractAddress: data.contractAddress,
        title: "",
        amountEth: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmitFund = async (data: FundMilestoneFormData) => {
    if (!isConnected) {
      return;
    }

    try {
      const fundAmountWei = parseEther(data.fundAmountEth as `${number}`);
      const milestoneIdNum = BigInt(data.milestoneId);
      await fundMilestone(milestoneIdNum, fundAmountWei);
      resetFund();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Project {params.id}</h1>
      <Card className="p-6 space-y-4">
        <form onSubmit={handleSubmitMilestone(onSubmitMilestone)} className="space-y-4">
          <FormField name="contractAddress" error={milestoneErrors.contractAddress?.message}>
            <FormLabel>Project Contract Address</FormLabel>
            <FormControl>
              <input
                {...registerMilestone("contractAddress")}
                type="text"
                placeholder="0x..."
                className="w-full px-3 py-2 border rounded-md bg-background"
                disabled={isPending || isConfirming}
              />
            </FormControl>
            <FormMessage />
          </FormField>

          <FormField name="title" error={milestoneErrors.title?.message}>
            <FormLabel>Milestone Title</FormLabel>
            <FormControl>
              <input
                {...registerMilestone("title")}
                type="text"
                placeholder="e.g., Design Phase"
                className="w-full px-3 py-2 border rounded-md bg-background"
                disabled={isPending || isConfirming}
              />
            </FormControl>
            <FormMessage />
          </FormField>

          <FormField name="amountEth" error={milestoneErrors.amountEth?.message}>
            <FormLabel>Amount (ETH)</FormLabel>
            <FormControl>
              <input
                {...registerMilestone("amountEth")}
                type="text"
                placeholder="0.1"
                className="w-full px-3 py-2 border rounded-md bg-background"
                disabled={isPending || isConfirming}
              />
            </FormControl>
            <FormMessage />
          </FormField>


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
        <form onSubmit={handleSubmitFund(onSubmitFund)} className="space-y-4 border-t pt-6 mt-6">
          <h2 className="text-lg font-semibold">Fund a Milestone</h2>
          <FormField name="milestoneId" error={fundErrors.milestoneId?.message}>
            <FormLabel>Milestone ID</FormLabel>
            <FormControl>
              <input
                {...registerFund("milestoneId")}
                type="text"
                placeholder="e.g., 0"
                className="w-full px-3 py-2 border rounded-md bg-background"
                disabled={isFunding || isFundingConfirming}
                onChange={(e) => {
                  setMilestoneId(e.target.value);
                  registerFund("milestoneId").onChange(e);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormField>
          <FormField name="fundAmountEth" error={fundErrors.fundAmountEth?.message}>
            <FormLabel>Amount to Fund (ETH)</FormLabel>
            <FormControl>
              <input
                {...registerFund("fundAmountEth")}
                type="text"
                placeholder="e.g., 0.1"
                className="w-full px-3 py-2 border rounded-md bg-background"
                disabled={isFunding || isFundingConfirming}
              />
            </FormControl>
            <FormMessage />
          </FormField>
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
