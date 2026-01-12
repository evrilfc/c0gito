/**
 * Process transfers on Sapphire PrivateTransferVault
 */

import { createWalletClient, createPublicClient, http, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sapphireTestnet } from 'viem/chains';
import { config } from './config.js';
import { PrivateTransferVaultAbi } from '../abis/PrivateTransferVault.js';

// Create clients once for reuse
const account = privateKeyToAccount(config.ownerPrivateKey);
const walletClient = createWalletClient({
  account,
  chain: sapphireTestnet,
  transport: http(config.sapphireRpcUrl),
});
const publicClient = createPublicClient({
  chain: sapphireTestnet,
  transport: http(config.sapphireRpcUrl),
});

/**
 * Check if transfer is already processed on-chain
 * Returns true if transfer is acknowledged (processed)
 */
export async function isTransferProcessedOnChain(transferId: Hex): Promise<boolean> {
  try {
    const transferData = await publicClient.readContract({
      address: config.vaultAddress,
      abi: PrivateTransferVaultAbi,
      functionName: 'encryptedTransfers',
      args: [transferId],
    });

    // encryptedTransfers returns: [originDomain, originRouter, envelope, acknowledged]
    // envelope is a struct: { senderPublicKey, nonce, ciphertext }
    // So the tuple is: [uint32, bytes32, {bytes32, bytes16, bytes}, bool]
    const acknowledged = transferData[3] as boolean;
    
    if (acknowledged) {
      console.log(`[Processor] Transfer ${transferId} is already acknowledged on-chain`);
    }
    
    return acknowledged === true;
  } catch (error) {
    console.error(`[Processor] Failed to check on-chain status for ${transferId}:`, error);
    return false; // Assume not processed if check fails (will try to process)
  }
}

/**
 * Process a single transfer on PrivateTransferVault
 * This decrypts the payload and dispatches release instruction back to Mantle
 */
export async function processTransfer(transferId: Hex): Promise<{ success: boolean; txHash?: Hex; error?: string }> {
  try {
    console.log(`[Processor] Processing transfer: ${transferId}`);
    console.log(`[Processor] Account: ${account.address}`);
    console.log(`[Processor] Vault Address: ${config.vaultAddress}`);

    // Call processTransfer (no native value needed, IGP not configured)
    const hash = await walletClient.writeContract({
      address: config.vaultAddress,
      abi: PrivateTransferVaultAbi,
      functionName: 'processTransfer',
      args: [transferId],
      value: 0n, // No native gas payment supported yet
    });

    console.log(`[Processor] Transaction sent: ${hash}`);

    // Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === 'success') {
      // Double-check on-chain status after transaction
      const verified = await isTransferProcessedOnChain(transferId);
      if (verified) {
        console.log(`[Processor] ✅ Transfer processed successfully: ${transferId}`);
        console.log(`[Processor] Release instruction dispatched to Mantle`);
        return { success: true, txHash: hash };
      } else {
        console.warn(`[Processor] ⚠️ Transaction succeeded but transfer not acknowledged on-chain: ${transferId}`);
        // Still return success since transaction succeeded
      return { success: true, txHash: hash };
      }
    } else {
      console.error(`[Processor] ❌ Transaction failed: ${hash}`);
      return { success: false, error: 'Transaction reverted' };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check if error is "duplicate transaction" or "already processed"
    if (errorMessage.includes('duplicate') || 
        errorMessage.includes('already processed') ||
        errorMessage.includes('already acknowledged')) {
      console.log(`[Processor] Transfer ${transferId} already processed (duplicate transaction), verifying on-chain...`);
      // Verify on-chain
      const verified = await isTransferProcessedOnChain(transferId);
      if (verified) {
      return { success: true };
      }
      // If not verified, treat as error to allow retry
      return { success: false, error: 'Duplicate transaction but not acknowledged on-chain' };
    }
    
    console.error(`[Processor] ❌ Failed to process transfer ${transferId}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Process transfer with retry logic
 * Checks on-chain status before each attempt
 */
export async function processTransferWithRetry(
  transferId: Hex,
  maxRetries: number = config.maxRetries,
  delay: number = config.retryDelay
): Promise<{ success: boolean; txHash?: Hex; error?: string }> {
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // Check if already processed on-chain before each attempt
    const alreadyProcessed = await isTransferProcessedOnChain(transferId);
    if (alreadyProcessed) {
      console.log(`[Processor] Transfer ${transferId} already processed on-chain, skipping`);
      return { success: true };
    }

    console.log(`[Processor] Attempt ${attempt}/${maxRetries} for transfer ${transferId}`);

    const result = await processTransfer(transferId);

    if (result.success) {
      // Verify on-chain after success
      const verified = await isTransferProcessedOnChain(transferId);
      if (verified) {
        console.log(`[Processor] ✅ Transfer verified on-chain: ${transferId}`);
      return result;
      } else {
        console.warn(`[Processor] ⚠️ Transaction succeeded but not verified on-chain, will retry...`);
        lastError = 'Transaction succeeded but not acknowledged on-chain';
        // Continue to retry
      }
    } else {
      lastError = result.error;
    }

    // Don't retry if it's a duplicate transaction error (already handled in processTransfer)
    if (lastError?.includes('duplicate') && lastError?.includes('not acknowledged')) {
      // This means duplicate but not processed, so we should retry
      // Continue to retry logic below
    }

    if (attempt < maxRetries) {
      const waitTime = delay * attempt; // Exponential backoff
      console.log(`[Processor] Retrying in ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  // Final check on-chain before giving up
  const finalCheck = await isTransferProcessedOnChain(transferId);
  if (finalCheck) {
    console.log(`[Processor] ✅ Transfer ${transferId} processed on-chain after retries`);
    return { success: true };
  }

  console.error(`[Processor] ❌ Failed after ${maxRetries} attempts: ${transferId}`);
  return { success: false, error: lastError || 'Max retries exceeded' };
}
