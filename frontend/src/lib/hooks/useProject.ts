'use client';

import { projectABI } from '@/lib/contracts';
import { Address } from 'viem';
import { useContractWrite } from './useContractWrite';

/**
 * Hook to create a milestone in a project contract
 * @param projectAddress - Address of the Project contract
 */
export function useCreateMilestone(projectAddress: Address) {
  const { execute, isPending, isConfirming, isSuccess, error, hash } = useContractWrite();

  const createMilestone = async (title: string, amount: bigint) => {
    await execute({
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
  const { execute, isPending, isConfirming, isSuccess, error, hash } = useContractWrite();

  const submitWork = async (milestoneId: bigint, evidenceHash: string) => {
    await execute({
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
  const { execute, isPending, isConfirming, isSuccess, error, hash } = useContractWrite();

  const approveMilestone = async (milestoneId: bigint) => {
    await execute({
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
  const { execute, isPending, isConfirming, isSuccess, error, hash } = useContractWrite();

  const openDispute = async (milestoneId: bigint, reason: string) => {
    await execute({
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
