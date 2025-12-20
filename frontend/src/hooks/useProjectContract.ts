/**
 * Wagmi Hooks for Project Contract Interactions
 * 
 * Features:
 * - Loads contract addresses from environment variables
 * - Uses writeContract/readContract from wagmi
 * - Provides loading, success, and error states
 * - NO hardcoded addresses or RPC URLs
 * - NO private keys or sensitive data
 */

'use client';

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, type Address } from 'viem';
import { projectABI } from '@/lib/contracts/projectABI';
import { isValidAddress } from '@/lib/contracts/addresses';

/**
 * Hook return type for write operations
 */
export interface UseContractWriteResult {
  write: ((args?: any) => void) | undefined;
  writeAsync: ((args?: any) => Promise<any>) | undefined;
  data: any;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * useCreateProject
 * 
 * Hook for creating a new project via ProjectFactory
 * NOTE: Requires ProjectFactory contract implementation
 * 
 * @param factoryAddress - ProjectFactory contract address
 * @returns Write contract hook with status
 */
export function useCreateProject(factoryAddress?: Address) {
  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    isError: isWriteError,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Create a new project
   * @param params.client - Client wallet address
   * @param params.admin - Admin wallet address
   * @param params.title - Project title
   * @param params.description - Project description
   * @param params.escrowAddress - MilestoneEscrow contract address
   */
  const write = (params: {
    client: Address;
    admin: Address;
    title: string;
    description: string;
    escrowAddress: Address;
  }) => {
    if (!factoryAddress || !isValidAddress(factoryAddress)) {
      throw new Error('Invalid factory address');
    }

    // NOTE: This assumes ProjectFactory has a createProject() function
    // Update ABI when ProjectFactory is implemented
    writeContract({
      address: factoryAddress,
      abi: projectABI, // Replace with factoryABI when available
      functionName: 'createProject',
      args: [
        params.client,
        params.admin,
        params.title,
        params.description,
        params.escrowAddress,
      ],
    });
  };

  return {
    write,
    writeAsync: undefined, // Can be implemented if needed
    data: hash,
    isPending: isWritePending,
    isConfirming,
    isConfirmed,
    isSuccess: isConfirmed,
    isError: isWriteError,
    error: writeError,
    reset,
  };
}

/**
 * useCreateMilestone
 * 
 * Hook for creating a milestone in a project
 * Client-only function
 * 
 * @param projectAddress - Project contract address
 * @returns Write contract hook with status
 */
export function useCreateMilestone(projectAddress?: Address) {
  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    isError: isWriteError,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Create a new milestone
   * @param params.title - Milestone title
   * @param params.amountInEth - Milestone amount in ETH (will be converted to wei)
   */
  const write = (params: { title: string; amountInEth: string }) => {
    if (!projectAddress || !isValidAddress(projectAddress)) {
      throw new Error('Invalid project address');
    }

    if (!params.title || params.title.trim().length === 0) {
      throw new Error('Milestone title is required');
    }

    if (!params.amountInEth || parseFloat(params.amountInEth) <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    writeContract({
      address: projectAddress,
      abi: projectABI,
      functionName: 'createMilestone',
      args: [params.title, parseEther(params.amountInEth)],
    });
  };

  return {
    write,
    writeAsync: undefined,
    data: hash,
    isPending: isWritePending,
    isConfirming,
    isConfirmed,
    isSuccess: isConfirmed,
    isError: isWriteError,
    error: writeError,
    reset,
  };
}

/**
 * useFundMilestone
 * 
 * Hook for funding a milestone with ETH
 * Client-only function, sends ETH to escrow
 * 
 * @param projectAddress - Project contract address
 * @returns Write contract hook with status
 */
export function useFundMilestone(projectAddress?: Address) {
  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    isError: isWriteError,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Fund a milestone with ETH
   * @param params.milestoneId - Milestone index
   * @param params.amountInEth - Amount to fund in ETH (must match milestone.amount)
   */
  const write = (params: { milestoneId: number; amountInEth: string }) => {
    if (!projectAddress || !isValidAddress(projectAddress)) {
      throw new Error('Invalid project address');
    }

    if (params.milestoneId < 0) {
      throw new Error('Invalid milestone ID');
    }

    if (!params.amountInEth || parseFloat(params.amountInEth) <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    writeContract({
      address: projectAddress,
      abi: projectABI,
      functionName: 'fundMilestone',
      args: [BigInt(params.milestoneId)],
      value: parseEther(params.amountInEth), // Send ETH with transaction
    });
  };

  return {
    write,
    writeAsync: undefined,
    data: hash,
    isPending: isWritePending,
    isConfirming,
    isConfirmed,
    isSuccess: isConfirmed,
    isError: isWriteError,
    error: writeError,
    reset,
  };
}

/**
 * useSubmitWork
 * 
 * Hook for submitting work evidence for a milestone
 * Freelancer-only function
 * 
 * @param projectAddress - Project contract address
 * @returns Write contract hook with status
 */
export function useSubmitWork(projectAddress?: Address) {
  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    isError: isWriteError,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Submit work evidence for a milestone
   * @param params.milestoneId - Milestone index
   * @param params.evidenceHash - IPFS hash or reference to submitted work
   */
  const write = (params: { milestoneId: number; evidenceHash: string }) => {
    if (!projectAddress || !isValidAddress(projectAddress)) {
      throw new Error('Invalid project address');
    }

    if (params.milestoneId < 0) {
      throw new Error('Invalid milestone ID');
    }

    if (!params.evidenceHash || params.evidenceHash.trim().length === 0) {
      throw new Error('Evidence hash is required');
    }

    writeContract({
      address: projectAddress,
      abi: projectABI,
      functionName: 'submitWork',
      args: [BigInt(params.milestoneId), params.evidenceHash],
    });
  };

  return {
    write,
    writeAsync: undefined,
    data: hash,
    isPending: isWritePending,
    isConfirming,
    isConfirmed,
    isSuccess: isConfirmed,
    isError: isWriteError,
    error: writeError,
    reset,
  };
}

/**
 * useApproveMilestone
 * 
 * Hook for approving a milestone and releasing funds
 * Client-only function, releases funds to freelancer
 * 
 * @param projectAddress - Project contract address
 * @returns Write contract hook with status
 */
export function useApproveMilestone(projectAddress?: Address) {
  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    isError: isWriteError,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Approve a milestone and release funds to freelancer
   * @param params.milestoneId - Milestone index
   */
  const write = (params: { milestoneId: number }) => {
    if (!projectAddress || !isValidAddress(projectAddress)) {
      throw new Error('Invalid project address');
    }

    if (params.milestoneId < 0) {
      throw new Error('Invalid milestone ID');
    }

    writeContract({
      address: projectAddress,
      abi: projectABI,
      functionName: 'approveMilestone',
      args: [BigInt(params.milestoneId)],
    });
  };

  return {
    write,
    writeAsync: undefined,
    data: hash,
    isPending: isWritePending,
    isConfirming,
    isConfirmed,
    isSuccess: isConfirmed,
    isError: isWriteError,
    error: writeError,
    reset,
  };
}

/**
 * useOpenDispute
 * 
 * Hook for opening a dispute on a milestone
 * Client or Freelancer can call this
 * 
 * @param projectAddress - Project contract address
 * @returns Write contract hook with status
 */
export function useOpenDispute(projectAddress?: Address) {
  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    isError: isWriteError,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Open a dispute for a milestone
   * @param params.milestoneId - Milestone index
   * @param params.reason - Reason for opening the dispute
   */
  const write = (params: { milestoneId: number; reason: string }) => {
    if (!projectAddress || !isValidAddress(projectAddress)) {
      throw new Error('Invalid project address');
    }

    if (params.milestoneId < 0) {
      throw new Error('Invalid milestone ID');
    }

    if (!params.reason || params.reason.trim().length === 0) {
      throw new Error('Dispute reason is required');
    }

    writeContract({
      address: projectAddress,
      abi: projectABI,
      functionName: 'openDispute',
      args: [BigInt(params.milestoneId), params.reason],
    });
  };

  return {
    write,
    writeAsync: undefined,
    data: hash,
    isPending: isWritePending,
    isConfirming,
    isConfirmed,
    isSuccess: isConfirmed,
    isError: isWriteError,
    error: writeError,
    reset,
  };
}

/**
 * useResolveDispute
 * 
 * Hook for resolving a dispute (Admin only)
 * Releases funds to winner based on decision
 * 
 * @param projectAddress - Project contract address
 * @returns Write contract hook with status
 */
export function useResolveDispute(projectAddress?: Address) {
  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    isError: isWriteError,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Resolve a dispute (Admin only)
   * @param params.milestoneId - Milestone index
   * @param params.clientWins - true to refund client, false to release to freelancer
   */
  const write = (params: { milestoneId: number; clientWins: boolean }) => {
    if (!projectAddress || !isValidAddress(projectAddress)) {
      throw new Error('Invalid project address');
    }

    if (params.milestoneId < 0) {
      throw new Error('Invalid milestone ID');
    }

    writeContract({
      address: projectAddress,
      abi: projectABI,
      functionName: 'resolveDispute',
      args: [BigInt(params.milestoneId), params.clientWins],
    });
  };

  return {
    write,
    writeAsync: undefined,
    data: hash,
    isPending: isWritePending,
    isConfirming,
    isConfirmed,
    isSuccess: isConfirmed,
    isError: isWriteError,
    error: writeError,
    reset,
  };
}

/**
 * useGetMilestone
 * 
 * Hook for reading milestone data from contract
 * 
 * @param projectAddress - Project contract address
 * @param milestoneId - Milestone index
 * @returns Read contract hook with milestone data
 */
export function useGetMilestone(projectAddress?: Address, milestoneId?: number) {
  const { data, isError, isLoading, error, refetch } = useReadContract({
    address: projectAddress,
    abi: projectABI,
    functionName: 'getMilestone',
    args: milestoneId !== undefined ? [BigInt(milestoneId)] : undefined,
    query: {
      enabled: !!projectAddress && milestoneId !== undefined,
    },
  });

  return {
    milestone: data as any,
    isLoading,
    isError,
    error,
    refetch,
  };
}

/**
 * useGetMilestoneCount
 * 
 * Hook for reading total milestone count from contract
 * 
 * @param projectAddress - Project contract address
 * @returns Read contract hook with count
 */
export function useGetMilestoneCount(projectAddress?: Address) {
  const { data, isError, isLoading, error, refetch } = useReadContract({
    address: projectAddress,
    abi: projectABI,
    functionName: 'getMilestoneCount',
    query: {
      enabled: !!projectAddress,
    },
  });

  return {
    count: data ? Number(data) : 0,
    isLoading,
    isError,
    error,
    refetch,
  };
}
