import { useWriteContract, useWaitForTransactionReceipt, useAccount, usePrepareWriteContract } from 'wagmi';
import { projectABI } from '@/lib/contracts';
import { Address } from 'viem';

/**
 * Hook to fund a milestone in a project contract
 * @param projectAddress - Address of the Project contract
 */
export function useFundMilestone(projectAddress: Address) {
  const { address: walletAddress } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // This hook expects the caller to provide the milestoneId and amount (in wei)
  const fundMilestone = async (milestoneId: bigint, amount: bigint) => {
    if (!walletAddress) {
      throw new Error('Wallet not connected');
    }

    writeContract({
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
