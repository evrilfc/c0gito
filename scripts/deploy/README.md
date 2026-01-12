# Smart Contract Deployment Guide

This guide walks you through deploying the c0gito smart contracts to Mantle Sepolia and Oasis Sapphire Testnet.

## Prerequisites

1. **Node.js** 18+ and npm/yarn
2. **Hardhat** installed globally or in project
3. **Wallet** with testnet tokens:
   - Mantle Sepolia MNT for gas
   - Oasis Sapphire Testnet tokens for gas
4. **Environment variables** configured (see below)

## Environment Setup

Create a `.env` file in the project root:

```env
# Private key for deployment (DO NOT commit this!)
PRIVATE_KEY=your_private_key_here

# Mantle Sepolia RPC
MANTLE_SEPOLIA_RPC=https://rpc.sepolia.mantle.xyz

# Oasis Sapphire Testnet RPC
SAPPHIRE_TESTNET_RPC=https://testnet.sapphire.oasis.io

# Hyperlane Mailbox Addresses
MANTLE_MAILBOX=0x598facE78a4302f11E3de0bee1894Da0b2Cb71F8
SAPPHIRE_MAILBOX=0x... # Get from Hyperlane docs

# ISM (Interchain Security Module) - deploy this first
ISM_ADDRESS=0x... # After deploying TrustedRelayerIsm
```

## Deployment Order

Deploy contracts in this order:

1. **TrustedRelayerIsm** (on Mantle Sepolia)
2. **PrivateTransferIngress** (on Mantle Sepolia)
3. **PrivateTransferVault** (on Oasis Sapphire Testnet)

## Step-by-Step Deployment

### 1. Deploy TrustedRelayerIsm (Mantle Sepolia)

This is the Interchain Security Module that authorizes messages between chains.

```bash
npx hardhat run scripts/deploy/deployISM.ts --network mantleSepolia
```

**Output:**
```
TrustedRelayerIsm deployed at 0x...
```

**Save this address** - you'll need it for the next step.

### 2. Deploy PrivateTransferIngress (Mantle Sepolia)

Deploy the main ingress contract that handles deposits and escrow.

```bash
# Set the mailbox address (or use default)
export MANTLE_MAILBOX=0x598facE78a4302f11E3de0bee1894Da0b2Cb71F8

npx hardhat run scripts/deploy/deployIngress.ts --network mantleSepolia
```

**Output:**
```
PrivateTransferIngress deployed at 0x...
```

**Save this address** for frontend configuration.

### 3. Enroll Ingress with Hyperlane

After deploying Ingress, you need to enroll it with Hyperlane:

```bash
npx hardhat run scripts/enroll/enrollIngress.ts --network mantleSepolia
```

This will:
- Set the ISM for the Ingress router
- Configure the destination domain (Sapphire Testnet = 23295)

### 4. Deploy PrivateTransferVault (Oasis Sapphire Testnet)

Deploy the vault contract on Sapphire that handles confidential decryption.

```bash
# Set the Sapphire mailbox address
export SAPPHIRE_MAILBOX=0x...

npx hardhat run scripts/deploy/deployVault.ts --network sapphireTestnet
```

**Output:**
```
PrivateTransferVault deployed at 0x...
Public Key: 0x...
```

**Save both the address and public key** - you'll need the public key for frontend encryption.

### 5. Enroll Vault with Hyperlane

Enroll the Vault with Hyperlane to enable cross-chain messaging:

```bash
npx hardhat run scripts/enroll/enrollVault.ts --network sapphireTestnet
```

### 6. Configure Frontend

Update your frontend `.env.local` with the deployed addresses:

```env
NEXT_PUBLIC_INGRESS_ADDRESS=0x... # From step 2
NEXT_PUBLIC_VAULT_ADDRESS=0x... # From step 4
NEXT_PUBLIC_VAULT_PUBLIC_KEY=0x... # From step 4
NEXT_PUBLIC_ROUTER_ADDRESS=0x... # Same as INGRESS_ADDRESS
NEXT_PUBLIC_ISM_ADDRESS=0x... # From step 1
```

## Network Configuration

### Hardhat Networks

Ensure your `hardhat.config.ts` includes:

```typescript
networks: {
  mantleSepolia: {
    url: process.env.MANTLE_SEPOLIA_RPC || "https://rpc.sepolia.mantle.xyz",
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    chainId: 5003,
  },
  sapphireTestnet: {
    url: process.env.SAPPHIRE_TESTNET_RPC || "https://testnet.sapphire.oasis.io",
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    chainId: 23295,
  },
}
```

## Verification

After deployment, verify contracts on block explorers:

### Mantle Sepolia
```bash
npx hardhat verify --network mantleSepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### Oasis Sapphire Testnet
```bash
npx hardhat verify --network sapphireTestnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## Troubleshooting

### Common Issues

1. **Insufficient Gas**
   - Ensure wallet has enough testnet tokens
   - Check gas price settings

2. **Hyperlane Enrollment Fails**
   - Verify mailbox addresses are correct
   - Check ISM is deployed and configured
   - Ensure domain IDs are correct (Mantle = 5003, Sapphire = 23295)

3. **Sapphire Deployment Issues**
   - Verify RPC endpoint is accessible
   - Check Sapphire-specific gas settings
   - Ensure private key has Sapphire testnet tokens

## Next Steps

After successful deployment:

1. Update indexer configuration with contract addresses
2. Update service configuration with vault address
3. Test deposit and transfer flows
4. Monitor contracts on block explorers

## Security Notes

⚠️ **Never commit private keys or `.env` files to version control**

- Use environment variables for sensitive data
- Consider using hardware wallets for mainnet deployments
- Review contract code before deployment
- Test thoroughly on testnets first

