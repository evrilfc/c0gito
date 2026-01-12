/**
 * c0gito Transfer Processor Service
 * 
 * Monitors pending transfers from Ponder and processes them on Sapphire PrivateTransferVault
 * This service automatically acknowledges transfers by calling processTransfer()
 */

import { config } from './config.js';
import { getPendingTransfers } from './monitor.js';
import { processTransferWithRetry, isTransferProcessedOnChain } from './processor.js';
import type { Hex } from 'viem';

// Track transfers currently being processed (lock mechanism to prevent concurrent processing)
const processingTransfers = new Set<string>();

/**
 * Main processing loop
 */
async function processPendingTransfers() {
  // Prevent concurrent execution
  if (processingTransfers.size > 0) {
    console.log(`[Monitor] Previous batch still processing, skipping...`);
    return;
  }

  try {
    console.log(`[Monitor] Checking for pending transfers...`);

    const pendingTransfers = await getPendingTransfers();

    if (pendingTransfers.length === 0) {
      console.log(`[Monitor] No pending transfers found`);
      return;
    }

    console.log(`[Monitor] Found ${pendingTransfers.length} pending transfer(s)`);

    for (const transfer of pendingTransfers) {
      const transferId = transfer.transferId as Hex;

      // Skip if currently being processed
      if (processingTransfers.has(transferId)) {
        console.log(`[Monitor] Transfer ${transferId} is currently being processed, skipping`);
        continue;
      }

      // Check on-chain status first - if already processed, skip
      const alreadyProcessed = await isTransferProcessedOnChain(transferId);
      if (alreadyProcessed) {
        console.log(`[Monitor] Transfer ${transferId} already processed on-chain, skipping`);
        continue;
      }

      // Mark as processing
      processingTransfers.add(transferId);

      console.log(`[Monitor] Processing transfer: ${transferId}`);
      console.log(`[Monitor]   - Deposit ID: ${transfer.depositId}`);
      console.log(`[Monitor]   - Sender: ${transfer.sender}`);
      console.log(`[Monitor]   - Status: ${transfer.status}`);

      try {
        // Process transfer with retry
        const result = await processTransferWithRetry(transferId);

        if (result.success) {
          console.log(`[Monitor] ✅ Successfully processed transfer ${transferId}`);
          if (result.txHash) {
            console.log(`[Monitor]   Transaction: ${result.txHash}`);
          }
        } else {
          console.error(`[Monitor] ❌ Failed to process transfer ${transferId}: ${result.error}`);
          // Will retry in next poll cycle
        }
      } catch (error) {
        console.error(`[Monitor] ❌ Error processing transfer ${transferId}:`, error);
        // Will retry in next poll cycle
      } finally {
        // Always remove from processing set
        processingTransfers.delete(transferId);
      }
    }
  } catch (error) {
    console.error(`[Monitor] Error in processing loop:`, error);
  } finally {
    // Clear processing set in case of error
    processingTransfers.clear();
  }
}

/**
 * Start the service
 */
function start() {
  console.log('🚀 c0gito Transfer Processor Service starting...');
  console.log(`[Config] Ponder API: ${config.ponderApiUrl}`);
  console.log(`[Config] Sapphire RPC: ${config.sapphireRpcUrl}`);
  console.log(`[Config] Vault Address: ${config.vaultAddress}`);
  console.log(`[Config] Poll Interval: ${config.pollInterval}ms`);

  // Process immediately on start
  processPendingTransfers();

  // Then process every pollInterval
  setInterval(() => {
    processPendingTransfers();
  }, config.pollInterval);

  console.log(`✅ Service started. Polling every ${config.pollInterval}ms`);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down service...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down service...');
  process.exit(0);
});

// Start the service
start();
