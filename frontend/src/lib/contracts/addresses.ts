/**
 * Contract Addresses Configuration
 * Loads from environment variables - NO hardcoded addresses
 */

import { Address } from 'viem';

/**
 * Get Project Factory contract address from environment
 * @returns Factory contract address or undefined if not set
 */
export function getFactoryAddress(): Address | undefined {
  const address = process.env.NEXT_PUBLIC_FACTORY_ADDRESS;
  if (!address || address === '0x') {
    console.warn('NEXT_PUBLIC_FACTORY_ADDRESS not configured');
    return undefined;
  }
  return address as Address;
}

/**
 * Get Admin address from environment
 * @returns Admin address or undefined if not set
 */
export function getAdminAddress(): Address | undefined {
  const address = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;
  if (!address || address === '0x') {
    console.warn('NEXT_PUBLIC_ADMIN_ADDRESS not configured');
    return undefined;
  }
  return address as Address;
}

/**
 * Validate that a project address is properly formatted
 * @param address - Address to validate
 * @returns true if valid Ethereum address
 */
export function isValidAddress(address: string | undefined): address is Address {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Contract addresses type
 */
export interface ContractAddresses {
  factory?: Address;
  admin?: Address;
}

/**
 * Get all contract addresses from environment
 */
export function getContractAddresses(): ContractAddresses {
  return {
    factory: getFactoryAddress(),
    admin: getAdminAddress(),
  };
}
