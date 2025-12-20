'use client';

import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { Address } from 'viem';

/**
 * Generic hook for writing to smart contracts
 * Handles wallet connection validation and transaction waiting
 */
export function useContractWrite() {
  const { address: walletAddress } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const execute = async (config: {
    address: Address;
    abi: any;
    functionName: string;
    args?: any[];
    value?: bigint;
  }) => {
    if (!walletAddress) {
      throw new Error('Wallet not connected');
    }

    writeContract(config);
  };

  return {
    execute,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
