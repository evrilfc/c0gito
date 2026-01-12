import { onchainTable, primaryKey, relations } from "ponder";

// ============================================================================
// Deposit Table - tracks user deposits in Ingress
// ============================================================================
export const deposit = onchainTable("deposit", (t) => ({
  depositId: t.hex().primaryKey(),
  depositor: t.hex().notNull(),
  token: t.hex().notNull(),
  initialAmount: t.bigint().notNull(),
  remainingAmount: t.bigint().notNull(), // Updated after each transfer completion
  isNative: t.boolean().notNull(),
  released: t.boolean().notNull().default(false),
  createdAt: t.integer().notNull(),
  createdAtBlock: t.integer().notNull(),
  txHash: t.hex().notNull(),
  lastUsedAt: t.integer(),
}));

// ============================================================================
// Transfer Table - tracks transfers from initiation to completion
// ============================================================================
export const transfer = onchainTable("transfer", (t) => ({
  transferId: t.hex().primaryKey(),
  depositId: t.hex().notNull(),
  
  // From Ingress (Mantle)
  sender: t.hex().notNull(),
  destinationDomain: t.integer().notNull(),
  encryptedDataHash: t.hex(), // Hash of encrypted payload
  initiatedAt: t.integer().notNull(),
  initiatedAtBlock: t.integer().notNull(),
  initiatedTxHash: t.hex().notNull(),
  
  // From Vault (Sapphire) - after decryption
  receiver: t.hex(),
  token: t.hex(),
  amount: t.bigint(),
  isNative: t.boolean(),
  
  // Status tracking
  status: t.text().notNull(), // "PENDING" | "STORED" | "ACKNOWLEDGED" | "COMPLETED"
  
  // Vault events timestamps
  storedAt: t.integer(),
  storedAtBlock: t.integer(),
  acknowledgedAt: t.integer(),
  acknowledgedAtBlock: t.integer(),
  processedAt: t.integer(),
  processedAtBlock: t.integer(),
  
  // Completion (back to Ingress)
  completedAt: t.integer(),
  completedAtBlock: t.integer(),
  completedTxHash: t.hex(),
}));

// ============================================================================
// User Activity Table - for frontend activity feed
// ============================================================================
export const userActivity = onchainTable("userActivity", (t) => ({
  id: t.text().primaryKey(), // user address + timestamp + type
  user: t.hex().notNull(),
  type: t.text().notNull(), // "DEPOSIT" | "SEND" | "RECEIVE"
  depositId: t.hex(),
  transferId: t.hex(),
  amount: t.bigint().notNull(),
  token: t.hex().notNull(),
  isNative: t.boolean().notNull(),
  timestamp: t.integer().notNull(),
  blockNumber: t.integer().notNull(),
  txHash: t.hex().notNull(),
  
  // For "SEND" type
  receiver: t.hex(),
  // For "RECEIVE" type
  sender: t.hex(),
}));

// ============================================================================
// Relations - Enrich GraphQL API and Query API
// ============================================================================

// Deposit relations - one deposit can have many transfers
export const depositRelations = relations(deposit, ({ many }) => ({
  transfers: many(transfer),
}));

// Transfer relations - each transfer belongs to one deposit
export const transferRelations = relations(transfer, ({ one }) => ({
  deposit: one(deposit, {
    fields: [transfer.depositId],
    references: [deposit.depositId],
  }),
}));
