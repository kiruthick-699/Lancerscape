import { projectABI } from '@/lib/contracts';
import { Address } from 'viem';
import { useContractWrite } from './useContractWrite';

/**
 * Hook to fund a milestone in a project contract
 * @param projectAddress - Address of the Project contract
 */
export function useFundMilestone(projectAddress: Address) {
  const { execute, isPending, isConfirming, isSuccess, error, hash } = useContractWrite();

  // This hook expects the caller to provide the milestoneId and amount (in wei)
  const fundMilestone = async (milestoneId: bigint, amount: bigint) => {
    await execute({
      address: projectAddress,
      abi: projectABI,
      functionName: 'fundMilestone',
      args: [milestoneId],
      value: amount,
    });
  };

  return {
    fundMilestone,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
