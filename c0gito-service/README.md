# c0gito Transfer Processor Service

Automated service for processing transfers on Oasis Sapphire PrivateTransferVault. This service monitors pending transfers from the Ponder indexer and calls `processTransfer()` to decrypt and dispatch release instructions back to Mantle.

## 🎯 Functionality

1. **Monitor Pending Transfers**: Queries transfers with status `STORED` from Ponder GraphQL API
2. **Process Transfer**: Calls `processTransfer(transferId)` on PrivateTransferVault
3. **Auto Retry**: Automatic retry on failure with exponential backoff
4. **Duplicate Prevention**: Prevents duplicate processing with tracking mechanism
5. **On-chain Verification**: Verifies transfer status on-chain before processing

## 📋 Prerequisites

- Node.js >= 18.14
- Ponder indexer running at `http://localhost:42069`
- PrivateTransferVault deployed on Oasis Sapphire Testnet
- Owner private key to call `processTransfer()`

## 🚀 Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Setup environment variables** (create `.env` file):
```env
# Ponder GraphQL API
PONDER_API_URL=http://localhost:42069/graphql

# Sapphire RPC
SAPPHIRE_RPC_URL=https://testnet.sapphire.oasis.io
# Or use:
# SAPPHIRE_TESTNET_RPC=https://testnet.sapphire.oasis.io

# Vault Contract (on Sapphire Testnet)
VAULT_ADDRESS=0x418A949474971a1947d932f856FB3eAA695BDdE5
# Or use:
# NEXT_PUBLIC_VAULT_ADDRESS=0x418A949474971a1947d932f856FB3eAA695BDdE5

# Owner Private Key (for calling processTransfer)
# WARNING: Never commit this to version control!
OWNER_PRIVATE_KEY=0x...

# Optional: Polling & Retry Configuration
POLL_INTERVAL=10000  # Polling interval in ms (default: 10s)
MAX_RETRIES=3        # Maximum retry attempts (default: 3)
RETRY_DELAY=5000     # Retry delay base in ms (default: 5s)

# Optional: Logging
LOG_LEVEL=info       # Options: debug, info, warn, error
```

3. **Run the service:**
```bash
# Development mode (with watch)
npm run dev

# Production mode
npm run build
npm start
```

## 🔄 Workflow

1. **Monitor**: Service queries Ponder for transfers with status `STORED`
2. **Verify**: Checks on-chain that transfer is still stored (not yet processed)
3. **Process**: Calls `processTransfer(transferId)` on Vault contract
4. **Result**: 
   - **Success** → Transfer is decrypted, release instruction sent to Mantle
   - **Failed** → Retry with exponential backoff

## 📊 Transfer Status Flow

```
PENDING → STORED → ACKNOWLEDGED → COMPLETED
           ↑
           └── Service processes here
```

- **PENDING**: Transfer newly created on Mantle
- **STORED**: Transfer received on Sapphire Vault (this is what gets processed)
- **ACKNOWLEDGED**: Transfer decrypted and release instruction sent
- **COMPLETED**: Transfer completed, funds released on Mantle

## 🛠️ Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PONDER_API_URL` | No | `http://localhost:42069/graphql` | Ponder GraphQL endpoint |
| `SAPPHIRE_RPC_URL` | No | `https://testnet.sapphire.oasis.io` | Sapphire RPC endpoint |
| `VAULT_ADDRESS` | Yes | - | PrivateTransferVault contract address |
| `OWNER_PRIVATE_KEY` | Yes | - | Private key for calling processTransfer |
| `POLL_INTERVAL` | No | `10000` | Polling interval in milliseconds |
| `MAX_RETRIES` | No | `3` | Maximum retry attempts |
| `RETRY_DELAY` | No | `5000` | Base retry delay in milliseconds |
| `LOG_LEVEL` | No | `info` | Logging level |

## 🔍 Monitoring

The service logs:
- ✅ Successfully processed transfers
- ❌ Failed transfers (will retry)
- ⏳ Currently processing transfers
- 🔄 Retry attempts
- 🔍 On-chain verification results

## ⚠️ Important Notes

1. **Owner Permission**: Private key must be the owner of the Vault contract
2. **Gas**: Service does not need to send native tokens (IGP not configured)
3. **Duplicate Prevention**: Service tracks processed transfers for 5 minutes
4. **Concurrent Processing**: Service prevents concurrent processing with lock mechanism
5. **On-chain Verification**: Service verifies transfer status on-chain before processing to prevent duplicates

## 🐛 Troubleshooting

### Transfer Not Being Processed

- Check Ponder indexer has synced to the latest block
- Check transfer status is still `STORED` in Ponder
- Verify owner private key is correct
- Verify Vault address is correct
- Check Sapphire RPC connection

### Transaction Failed

- Verify owner is the owner of the Vault contract
- Check transfer hasn't been processed before
- Check Sapphire RPC connection
- Verify transfer is still in `STORED` status on-chain

### Service Won't Start

- Check all required environment variables are set
- Verify Ponder API is accessible
- Verify Sapphire RPC is accessible
- Check private key format (must start with `0x`)

## 📝 Example Logs

```
🚀 c0gito Transfer Processor Service starting...
[Config] Ponder API: http://localhost:42069/graphql
[Config] Sapphire RPC: https://testnet.sapphire.oasis.io
[Config] Vault Address: 0x418A949474971a1947d932f856FB3eAA695BDdE5
[Config] Poll Interval: 10000ms
✅ Service started. Polling every 10000ms

[Monitor] Checking for pending transfers...
[Monitor] Found 1 pending transfer(s)
[Monitor] Processing transfer: 0xabc123...
[Monitor]   - Deposit ID: 0xdef456...
[Monitor]   - Sender: 0x789abc...
[Monitor]   - Status: STORED
[Processor] Processing transfer: 0xabc123...
[Processor] Account: 0x...
[Processor] Vault Address: 0x418A949474971a1947d932f856FB3eAA695BDdE5
[Processor] Verifying on-chain status...
[Processor] ✅ Transfer is stored, proceeding...
[Processor] Transaction sent: 0x...
[Processor] ✅ Transfer processed successfully: 0xabc123...
[Processor] Release instruction dispatched to Mantle
[Monitor] ✅ Successfully processed transfer 0xabc123...
```

## 🔗 Related Documentation

- [Main README](../README.md)
- [Deployment Guide](../scripts/deploy/README.md)
- [Ponder Indexer](../c0gito-indexer/README.md)
