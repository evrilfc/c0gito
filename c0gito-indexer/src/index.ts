import { ponder } from "ponder:registry";
import { deposit, transfer, userActivity } from "ponder:schema";
import { decodeFunctionData } from "viem";

// Sapphire domain ID
const SAPPHIRE_DOMAIN = 23295;

// ============================================================================
// PrivateTransferIngress Events (Mantle Sepolia)
// ============================================================================

ponder.on("PrivateTransferIngress:DepositCreated", async ({ event, context }) => {
  const { depositId, depositor, token, amount, isNative } = event.args;
  const blockTimestamp = Number(event.block.timestamp);
  const blockNumber = Number(event.block.number);

  // Insert deposit
  await context.db.insert(deposit).values({
    depositId,
      depositor,
      token,
    initialAmount: amount,
    remainingAmount: amount, // Initially same as initialAmount
      isNative,
      released: false,
    createdAt: blockTimestamp,
    createdAtBlock: blockNumber,
    txHash: event.transaction.hash,
  });

  // Create user activity for deposit
  const activityId = `${depositor}-${blockTimestamp}-DEPOSIT`;
  await context.db.insert(userActivity).values({
    id: activityId,
    user: depositor,
    type: "DEPOSIT",
    depositId,
    transferId: null,
    amount,
    token,
    isNative,
    timestamp: blockTimestamp,
    blockNumber,
    txHash: event.transaction.hash,
    receiver: null,
    sender: null,
  });
});

ponder.on("PrivateTransferIngress:EncryptedInstructionsReceived", async ({ event, context }) => {
  const { encryptedDataHash } = event.args;
  const blockTimestamp = Number(event.block.timestamp);
  const blockNumber = Number(event.block.number);

  // Read contract state to get transferId and depositId
  let transferId: `0x${string}` | null = null;
  let depositId: `0x${string}` | null = null;
  let sender: `0x${string}` | null = null;
  let destinationDomain: number | null = null;

  try {
    // Get transferId from contract using encryptedDataHash
    transferId = await context.client.readContract({
      abi: context.contracts.PrivateTransferIngress.abi,
      address: context.contracts.PrivateTransferIngress.address,
      functionName: "getTransferIdByCiphertextHash",
      args: [encryptedDataHash],
    });

    if (transferId && transferId !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
      // Get transfer metadata to get sender and destinationDomain
      const transferMetadata = await context.client.readContract({
        abi: context.contracts.PrivateTransferIngress.abi,
        address: context.contracts.PrivateTransferIngress.address,
        functionName: "transfers",
        args: [transferId],
      });

      // transferMetadata = [sender, destinationDomain, dispatchedAt, acknowledged]
      sender = transferMetadata[0] as `0x${string}`;
      destinationDomain = Number(transferMetadata[1]);

      // Try to decode depositId from transaction input
      // Function: initiateTransfer(uint32 destinationDomain, bytes32 depositId, bytes calldata ciphertext)
      // 
      // ABI Encoding Structure:
      // ┌─────────────────────────────────────────────────────────────┐
      // │ Bytes 0-4:   Function selector (4 bytes)                   │
      // │ Bytes 4-36:  destinationDomain (uint32, padded to 32 bytes)│
      // │ Bytes 36-68: depositId (bytes32 = 32 bytes)                │
      // │ Bytes 68+:   ciphertext (dynamic bytes)                     │
      // └─────────────────────────────────────────────────────────────┘
      //
      // Total offset untuk depositId = 4 (selector) + 32 (destinationDomain) = 36 bytes
      // Dalam hex string: 36 bytes = 72 hex characters (setiap byte = 2 hex chars)
      try {
        const tx = await context.client.getTransaction({ hash: event.transaction.hash });
        if (tx && tx.input) {
          // Method 1: Use viem's decodeFunctionData (preferred)
          try {
            const decoded = decodeFunctionData({
              abi: context.contracts.PrivateTransferIngress.abi,
              data: tx.input as `0x${string}`,
            });

            // decoded.args = [destinationDomain, depositId, ciphertext]
            if (decoded.args && decoded.args.length >= 2) {
              depositId = decoded.args[1] as `0x${string}`;
            }
          } catch (viemErr) {
            // Method 2: Fallback to manual hex string parsing
            // Remove "0x" prefix, then slice at correct positions
            const inputWithoutPrefix = tx.input.slice(2); // Remove "0x"
            if (inputWithoutPrefix.length >= 136) {
              // Start at byte 36 (72 hex chars), read 32 bytes (64 hex chars)
              const depositIdHex = "0x" + inputWithoutPrefix.slice(72, 136);
              if (depositIdHex && depositIdHex !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
                depositId = depositIdHex as `0x${string}`;
              }
            }
          }
        }
      } catch (decodeErr) {
        console.error("Failed to decode depositId from transaction input:", decodeErr);
        // If both methods fail, depositId will remain null and be updated later
      }
      }
  } catch (err) {
    console.error("Failed to read contract state for EncryptedInstructionsReceived:", err);
    // Fallback: use transaction from as sender
    sender = event.transaction.from;
    destinationDomain = SAPPHIRE_DOMAIN; // Default to Sapphire
    }

  // If we couldn't get transferId, use transaction hash as fallback
  if (!transferId) {
    transferId = event.transaction.hash;
  }

  await context.db
    .insert(transfer)
    .values({
      transferId: transferId as `0x${string}`,
      depositId: depositId || ("0x0" as `0x${string}`), // Will be updated later if needed
      sender: sender || event.transaction.from,
      destinationDomain: destinationDomain || SAPPHIRE_DOMAIN,
        encryptedDataHash,
      initiatedAt: blockTimestamp,
      initiatedAtBlock: blockNumber,
      initiatedTxHash: event.transaction.hash,
        status: "PENDING",
    })
    .onConflictDoNothing();

  // Create user activity for send
  if (sender) {
    const activityId = `${sender}-${blockTimestamp}-SEND-${transferId}`;
    await context.db.insert(userActivity).values({
      id: activityId,
      user: sender,
      type: "SEND",
      depositId: depositId || null,
      transferId: transferId as `0x${string}`,
      amount: 0n, // Amount unknown until decrypted
      token: "0x0", // Token unknown until decrypted
      isNative: false, // Unknown until decrypted
      timestamp: blockTimestamp,
      blockNumber,
      txHash: event.transaction.hash,
      receiver: null, // Unknown until decrypted
      sender: null,
    });
  }
});

ponder.on("PrivateTransferIngress:EncryptedInstructionsProcessed", async ({ event, context }) => {
  const { encryptedDataHash } = event.args;
  const blockTimestamp = Number(event.block.timestamp);
  const blockNumber = Number(event.block.number);

  // Find transfer by encryptedDataHash
  // Note: Ponder Store API doesn't support WHERE on non-primary keys directly
  // We need to use a workaround - query all transfers and filter
  // For now, we'll read transferId from contract state
  let transferId: `0x${string}` | null = null;

  try {
    transferId = await context.client.readContract({
      abi: context.contracts.PrivateTransferIngress.abi,
      address: context.contracts.PrivateTransferIngress.address,
      functionName: "getTransferIdByCiphertextHash",
      args: [encryptedDataHash],
    });

    if (transferId && transferId !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
      // Find transfer by transferId
      const foundTransfer = await context.db.find(transfer, { transferId });

      if (foundTransfer) {
        // Update transfer status to COMPLETED
        await context.db
          .update(transfer, { transferId })
          .set({
        status: "COMPLETED",
            completedAt: blockTimestamp,
            completedAtBlock: blockNumber,
            completedTxHash: event.transaction.hash,
    });

        // Update deposit remainingAmount if we have amount
        if (foundTransfer.amount && foundTransfer.amount > 0n && foundTransfer.depositId !== "0x0") {
          const foundDeposit = await context.db.find(deposit, { depositId: foundTransfer.depositId });

          if (foundDeposit) {
            const newRemainingAmount =
              foundDeposit.remainingAmount >= foundTransfer.amount
                ? foundDeposit.remainingAmount - foundTransfer.amount
                : 0n;

            await context.db
              .update(deposit, { depositId: foundTransfer.depositId })
              .set({
            remainingAmount: newRemainingAmount,
                released: newRemainingAmount === 0n,
                lastUsedAt: blockTimestamp,
              });
          }
        }

        // Update user activity for SEND type with actual amount
        if (foundTransfer.amount && foundTransfer.amount > 0n) {
          const sendActivityId = `${foundTransfer.sender}-${foundTransfer.initiatedAt}-SEND-${transferId}`;
          const existingSendActivity = await context.db.find(userActivity, { id: sendActivityId });
          
          if (existingSendActivity) {
            await context.db
              .update(userActivity, { id: sendActivityId })
              .set({
                amount: foundTransfer.amount,
                token: foundTransfer.token || "0x0",
                isNative: foundTransfer.isNative || false,
                receiver: foundTransfer.receiver,
        });
      }
    }

        // Update user activity for receiver if we have receiver info
        if (foundTransfer.receiver && foundTransfer.receiver !== "0x0") {
          const activityId = `${foundTransfer.receiver}-${blockTimestamp}-RECEIVE-${transferId}`;
          await context.db
            .insert(userActivity)
            .values({
              id: activityId,
              user: foundTransfer.receiver,
          type: "RECEIVE",
              depositId: foundTransfer.depositId !== "0x0" ? foundTransfer.depositId : null,
          transferId,
              amount: foundTransfer.amount || 0n,
              token: foundTransfer.token || "0x0",
              isNative: foundTransfer.isNative || false,
              timestamp: blockTimestamp,
              blockNumber,
              txHash: event.transaction.hash,
          receiver: null,
              sender: foundTransfer.sender,
            })
            .onConflictDoNothing();
        }
      }
    }
  } catch (err) {
    console.error("Failed to process EncryptedInstructionsProcessed:", err);
    }
});

// ============================================================================
// PrivateTransferVault Events (Sapphire Testnet)
// ============================================================================

ponder.on("PrivateTransferVault:EncryptedTransferStored", async ({ event, context }) => {
  const { transferId, originDomain, originRouter } = event.args;
  const blockTimestamp = Number(event.block.timestamp);
  const blockNumber = Number(event.block.number);

  // Find transfer by transferId
  const foundTransfer = await context.db.find(transfer, { transferId });

  if (foundTransfer) {
    // Update existing transfer
    await context.db
      .update(transfer, { transferId })
      .set({
        status: "STORED",
        storedAt: blockTimestamp,
        storedAtBlock: blockNumber,
      });
  } else {
    // Create new transfer record if not found (might be from different chain indexing order)
    await context.db.insert(transfer).values({
      transferId,
      depositId: "0x0" as `0x${string}`, // Unknown until we can link it
      sender: "0x0" as `0x${string}`, // Unknown until decrypted
      destinationDomain: Number(originDomain),
      encryptedDataHash: null, // Unknown from this event
      initiatedAt: blockTimestamp, // Approximate
      initiatedAtBlock: blockNumber,
      initiatedTxHash: event.transaction.hash,
        status: "STORED",
      storedAt: blockTimestamp,
      storedAtBlock: blockNumber,
    });
  }
});

ponder.on("PrivateTransferVault:TransferAcknowledged", async ({ event, context }) => {
  const { transferId, destinationDomain } = event.args;
  const blockTimestamp = Number(event.block.timestamp);
  const blockNumber = Number(event.block.number);

  // Find transfer by transferId
  const foundTransfer = await context.db.find(transfer, { transferId });

  if (foundTransfer) {
    // Update transfer status
    await context.db
      .update(transfer, { transferId })
      .set({
        status: "ACKNOWLEDGED",
        acknowledgedAt: blockTimestamp,
        acknowledgedAtBlock: blockNumber,
      });
  } else {
    // Create new transfer record if not found
    await context.db.insert(transfer).values({
      transferId,
      depositId: "0x0" as `0x${string}`,
      sender: "0x0" as `0x${string}`,
      destinationDomain: Number(destinationDomain),
      encryptedDataHash: null,
      initiatedAt: blockTimestamp,
      initiatedAtBlock: blockNumber,
      initiatedTxHash: event.transaction.hash,
      status: "ACKNOWLEDGED",
      acknowledgedAt: blockTimestamp,
      acknowledgedAtBlock: blockNumber,
    });
  }
});

ponder.on("PrivateTransferVault:PrivatePayloadProcessed", async ({ event, context }) => {
  const { transferId, receiver, token, amount, isNative } = event.args;
  const blockTimestamp = Number(event.block.timestamp);
  const blockNumber = Number(event.block.number);

  // Find transfer by transferId
  const foundTransfer = await context.db.find(transfer, { transferId });

  if (foundTransfer) {
    // Update transfer with decrypted payload info
    await context.db
      .update(transfer, { transferId })
      .set({
        receiver,
        token,
        amount,
        isNative,
        processedAt: blockTimestamp,
        processedAtBlock: blockNumber,
    });

    // Try to get depositId from contract state if not already set
    if (foundTransfer.depositId === "0x0" || !foundTransfer.depositId) {
      try {
        // Read from Ingress contract to get depositId
        // Note: This requires cross-chain query, might not be available
        // We'll leave it as is for now
      } catch (err) {
        console.error("Failed to get depositId from contract:", err);
      }
    }
  } else {
    // Create new transfer record if not found
    await context.db.insert(transfer).values({
      transferId,
      depositId: "0x0" as `0x${string}`,
      sender: "0x0" as `0x${string}`,
      destinationDomain: SAPPHIRE_DOMAIN,
      encryptedDataHash: null,
      initiatedAt: blockTimestamp,
      initiatedAtBlock: blockNumber,
      initiatedTxHash: event.transaction.hash,
      receiver,
      token,
      amount,
      isNative,
      status: "PENDING",
      processedAt: blockTimestamp,
      processedAtBlock: blockNumber,
    });
  }

  // Create user activity for receiver
  const activityId = `${receiver}-${blockTimestamp}-RECEIVE-${transferId}`;
  await context.db
    .insert(userActivity)
    .values({
      id: activityId,
      user: receiver,
      type: "RECEIVE",
      depositId: foundTransfer?.depositId !== "0x0" ? foundTransfer?.depositId || null : null,
      transferId,
            amount,
            token,
            isNative,
      timestamp: blockTimestamp,
      blockNumber,
      txHash: event.transaction.hash,
      receiver: null,
      sender: foundTransfer?.sender || null,
    })
    .onConflictDoNothing();
});
