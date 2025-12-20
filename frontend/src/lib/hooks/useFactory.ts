'use client';

import { useReadContract } from 'wagmi';
import { projectFactoryABI } from '@/lib/contracts';
import { Address } from 'viem';
import { useContractWrite } from './useContractWrite';

const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '0x') as Address;

/**
 * Hook to create a new project via ProjectFactory
 */
export function useCreateProject() {
  const { execute, isPending, isConfirming, isSuccess, error, hash } = useContractWrite();

  const createProject = async (title: string, description: string, clientAddress: Address) => {
    if (!FACTORY_ADDRESS || FACTORY_ADDRESS === '0x') {
      throw new Error('Factory address not configured. Set NEXT_PUBLIC_FACTORY_ADDRESS in environment variables.');
    }

    await execute({
      address: FACTORY_ADDRESS,
      abi: projectFactoryABI,
      functionName: 'createProject',
      args: [title, description, clientAddress],
    });
  };

  return {
    createProject,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook to fetch all projects from ProjectFactory
 */
export function useFetchAllProjects() {
  // Get total number of projects
  const { 
    data: totalProjects, 
    isLoading: isLoadingTotal,
    error: totalError,
    refetch: refetchTotal
  } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: projectFactoryABI,
    functionName: 'totalProjects',
  });

  return {
    totalProjects: totalProjects ? Number(totalProjects) : 0,
    isLoading: isLoadingTotal,
    error: totalError,
    refetch: refetchTotal,
  };
}

/**
 * Hook to fetch a specific project by ID
 * @param projectId - The ID of the project to fetch
 */
export function useFetchProject(projectId: bigint) {
  const { 
    data: project, 
    isLoading,
    error,
    refetch
  } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: projectFactoryABI,
    functionName: 'getProject',
    args: [projectId],
  });

  return {
    project,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch projects by client address
 * @param clientAddress - The client address to filter projects
 * @param index - The index in the client's project list
 */
export function useFetchProjectsByClient(clientAddress: Address, index: bigint) {
  const { 
    data: projectId, 
    isLoading,
    error,
    refetch
  } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: projectFactoryABI,
    functionName: 'projectsByClient',
    args: [clientAddress, index],
  });

  return {
    projectId,
    isLoading,
    error,
    refetch,
  };
}
