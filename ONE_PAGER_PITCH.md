# c0gito: Private Cross-Chain Transfers
## One-Pager Pitch for Mantle Global Hackathon 2025

---

## Project Overview

c0gito is a privacy-preserving cross-chain transfer protocol that enables completely confidential cryptocurrency transfers between users. By leveraging Oasis Sapphire's confidential computing capabilities and Hyperlane's cross-chain messaging, c0gito ensures that transfer details (recipient, amount, memo) remain encrypted and private throughout the entire transaction lifecycle. Users deposit funds on Mantle, initiate encrypted transfers, and recipients receive unlocked funds—all while maintaining complete privacy through end-to-end encryption and confidential decryption on Sapphire's Trusted Execution Environment.

---

## PROBLEM

- **Blockchain transfers expose sensitive financial data** - Every transaction reveals recipient addresses, transfer amounts, and transaction memos, enabling surveillance and tracking
- **Privacy concerns prevent adoption** - Users don't want their financial activity tracked, businesses need private payment channels, and some jurisdictions require privacy-preserving solutions
- **Security risks from transparency** - Public addresses enable targeted attacks and social engineering
- **Current solutions are inadequate** - Mixers are often banned, ZK-proofs are complex, and most privacy tools sacrifice usability

---

## SOLUTION

- **End-to-end encryption** - Transfer details (recipient, amount, memo) are encrypted using X25519DeoxysII before on-chain submission
- **Confidential processing** - Decryption happens on Oasis Sapphire in a Trusted Execution Environment (TEE), keeping data private even during processing
- **Cross-chain architecture** - Hyperlane bridges between Mantle (public escrow) and Sapphire (confidential decryption)
- **Selective disclosure** - Only encrypted hashes appear on-chain; full transfer details remain completely private
- **User-friendly interface** - Simple UI with real-time status tracking, no complex cryptography knowledge required
- **Regulatory-friendly** - No illegal activity, just privacy-preserving infrastructure designed for compliance

**Technical Stack:** Mantle Network (low-cost L2), Oasis Sapphire (confidential computing), Hyperlane (cross-chain messaging), Ponder (real-time indexing)

---

## BUSINESS MODEL

- **Protocol Fees** - Small fee on each private transfer, split between protocol treasury and future governance
- **Protocol Partnerships** - Integration partnerships with DeFi protocols, wallets, and privacy-focused dApps
- **Developer Tools** - SDK and documentation for developers building on c0gito infrastructure

**Target Markets:** Privacy-conscious users, businesses requiring confidential payments, DeFi protocols needing privacy layers, cross-chain transfer users

---

## ROADMAP

**Q1 2026** – ERC20 token support with whitelist management; batch transfer functionality for multiple recipients; gas optimization improvements

**Q2 2026** – Mainnet deployment on Mantle Network; comprehensive security audit by leading firms; protocol governance structure

**Q3 2026** – Mobile app, advanced privacy features

**Q4 2026** – Analytics dashboard with transfer insights; protocol partnerships & integrations
---

## Current Status

- ✅ **Smart Contracts**: Deployed on Mantle Sepolia & Oasis Sapphire Testnet
- ✅ **Frontend**: Fully functional Next.js application with responsive design
- ✅ **Indexer**: Ponder-based GraphQL API for real-time data
- ✅ **Service Layer**: Automated transfer processing on Sapphire
- ✅ **Testing**: Comprehensive unit tests (17+ test cases)
- ✅ **Documentation**: Complete README, deployment guide, and API docs

**Deployed Contracts:**
- PrivateTransferIngress: `0xEE5F31d28F08a011f638fd2b82CCbcb5ce04ab48` (Mantle Sepolia)
- PrivateTransferVault: `0x418A949474971a1947d932f856FB3eAA695BDdE5` (Sapphire Testnet)
- TrustedRelayerIsm: `0xDfA1f3F3865a24ddD7B0A5d89ac4D80c75AD2Bc8` (Mantle Sepolia)

---

## Team

**Evril Fadrekha Cahyani** – Solo Developer & Founder

Full-stack blockchain developer specializing in smart contract development (Solidity, Hardhat), frontend development (Next.js, React, TypeScript), and infrastructure & DevOps (Ponder indexing, GraphQL APIs, service automation).

**Contact**: [Update with contact information]

---

## Compliance Declaration

**This project does NOT involve regulated assets.**

c0gito is a privacy-preserving infrastructure protocol for cryptocurrency transfers. It does not issue securities, provide custody services, handle fiat currency, or require KYC/AML for protocol usage. The protocol enables private transfers of existing cryptocurrencies (MNT, ERC20 tokens) while maintaining compliance with applicable regulations through selective disclosure mechanisms.

---

## Links

- **GitHub Repository**: [Update with repository URL]
- **Live Demo**: [Update with demo URL]
- **Demo Video**: [Update with video URL]
- **Documentation**: See `README.md` for full technical documentation

---

**Built with ❤️ for the Mantle Global Hackathon 2025**

*Track: ZK & Privacy | Status: Production-Ready MVP*
