export const PrivateTransferVaultAbi = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "mailbox",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "transferId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "uint32",
          "name": "originDomain",
          "type": "uint32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "originRouter",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "ciphertext",
          "type": "bytes"
        }
      ],
      "name": "EncryptedTransferStored",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "_hook",
          "type": "address"
        }
      ],
      "name": "HookSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "version",
          "type": "uint8"
        }
      ],
      "name": "Initialized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "_ism",
          "type": "address"
        }
      ],
      "name": "IsmSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "transferId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "isNative",
          "type": "bool"
        }
      ],
      "name": "PrivatePayloadProcessed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "transferId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "uint32",
          "name": "destinationDomain",
          "type": "uint32"
        }
      ],
      "name": "TransferAcknowledged",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "PACKAGE_VERSION",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "domains",
      "outputs": [
        {
          "internalType": "uint32[]",
          "name": "",
          "type": "uint32[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "encryptedTransfers",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "originDomain",
          "type": "uint32"
        },
        {
          "internalType": "bytes32",
          "name": "originRouter",
          "type": "bytes32"
        },
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "senderPublicKey",
              "type": "bytes32"
            },
            {
              "internalType": "bytes16",
              "name": "nonce",
              "type": "bytes16"
            },
            {
              "internalType": "bytes",
              "name": "ciphertext",
              "type": "bytes"
            }
          ],
          "internalType": "struct PrivateTransferVault.EncryptedEnvelope",
          "name": "envelope",
          "type": "tuple"
        },
        {
          "internalType": "bool",
          "name": "acknowledged",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "_domain",
          "type": "uint32"
        },
        {
          "internalType": "bytes32",
          "name": "_router",
          "type": "bytes32"
        }
      ],
      "name": "enrollRemoteRouter",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32[]",
          "name": "_domains",
          "type": "uint32[]"
        },
        {
          "internalType": "bytes32[]",
          "name": "_addresses",
          "type": "bytes32[]"
        }
      ],
      "name": "enrollRemoteRouters",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "_origin",
          "type": "uint32"
        },
        {
          "internalType": "bytes32",
          "name": "_sender",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "_message",
          "type": "bytes"
        }
      ],
      "name": "handle",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "hook",
      "outputs": [
        {
          "internalType": "contract IPostDispatchHook",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "interchainSecurityModule",
      "outputs": [
        {
          "internalType": "contract IInterchainSecurityModule",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "localDomain",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "",
          "type": "uint32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "mailbox",
      "outputs": [
        {
          "internalType": "contract IMailbox",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "transferId",
          "type": "bytes32"
        }
      ],
      "name": "processTransfer",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "processedPayloads",
      "outputs": [
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isNative",
          "type": "bool"
        },
        {
          "internalType": "bytes",
          "name": "memo",
          "type": "bytes"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "transferId",
          "type": "bytes32"
        }
      ],
      "name": "revealTransfer",
      "outputs": [
        {
          "internalType": "bytes",
          "name": "plaintext",
          "type": "bytes"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "_domain",
          "type": "uint32"
        }
      ],
      "name": "routers",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_hook",
          "type": "address"
        }
      ],
      "name": "setHook",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_module",
          "type": "address"
        }
      ],
      "name": "setInterchainSecurityModule",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "_domain",
          "type": "uint32"
        }
      ],
      "name": "unenrollRemoteRouter",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32[]",
          "name": "_domains",
          "type": "uint32[]"
        }
      ],
      "name": "unenrollRemoteRouters",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "vaultPublicKey",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
] as const;
