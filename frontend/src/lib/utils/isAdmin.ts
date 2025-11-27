/**
 * frontend/src/lib/utils/isAdmin.ts
 *
 * Utility to check if a wallet address is an admin
 */

/**
 * isAdmin
 *
 * Checks if the provided wallet address matches the configured admin address
 * from the environment variable.
 *
 * @param address - Wallet address to check (can be undefined if not connected)
 * @returns true if the address matches the admin address, false otherwise
 */
export function isAdmin(address: string | undefined): boolean {
  // Load admin address from environment (do not expose the value)
  const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;

  // If no admin address is configured or no wallet is connected, return false
  if (!adminAddress || !address) {
    return false;
  }

  // Case-insensitive comparison (Ethereum addresses are case-insensitive)
  return address.toLowerCase() === adminAddress.toLowerCase();
}
