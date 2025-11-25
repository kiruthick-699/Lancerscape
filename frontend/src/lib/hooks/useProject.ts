'use client';

import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { projectABI } from '@/lib/contracts';
import { Address } from 'viem';

/**
 * Hook to create a milestone in a project contract
 * @param projectAddress - Address of the Project contract
 */
export function useCreateMilestone(projectAddress: Address) {
  const { address: walletAddress } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createMilestone = async (title: string, amount: bigint) => {
    if (!walletAddress) {
      throw new Error('Wallet not connected');
    }

    writeContract({
      address: projectAddress,
      abi: projectABI,
      functionName: 'createMilestone',
      args: [title, amount],
    });
  };

  return {
    createMilestone,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook to submit work for a milestone
 * @param projectAddress - Address of the Project contract
 */
export function useSubmitWork(projectAddress: Address) {
  const { address: walletAddress } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const submitWork = async (milestoneId: bigint, evidenceHash: string) => {
    if (!walletAddress) {
      throw new Error('Wallet not connected');
    }

    writeContract({
      address: projectAddress,
      abi: projectABI,
      functionName: 'submitWork',
      args: [milestoneId, evidenceHash],
    });
  };

  return {
    submitWork,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook to approve a milestone
 * @param projectAddress - Address of the Project contract
 */
export function useApproveMilestone(projectAddress: Address) {
  const { address: walletAddress } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approveMilestone = async (milestoneId: bigint) => {
    if (!walletAddress) {
      throw new Error('Wallet not connected');
    }

    writeContract({
      address: projectAddress,
      abi: projectABI,
      functionName: 'approveMilestone',
      args: [milestoneId],
    });
  };

  return {
    approveMilestone,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook to open a dispute for a milestone
 * @param projectAddress - Address of the Project contract
 */
export function useOpenDispute(projectAddress: Address) {
  const { address: walletAddress } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const openDispute = async (milestoneId: bigint, reason: string) => {
    if (!walletAddress) {
      throw new Error('Wallet not connected');
    }

    writeContract({
      address: projectAddress,
      abi: projectABI,
      functionName: 'openDispute',
      args: [milestoneId, reason],
    });
  };

  return {
    openDispute,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
