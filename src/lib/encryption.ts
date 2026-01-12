import { encodeAbiParameters, hexToBytes, bytesToHex, type Address, type Hex } from "viem"
import { X25519DeoxysII } from "@oasisprotocol/sapphire-paratime"

export interface TransferPayload {
  receiver: Address
  token: Address
  amount: bigint
  isNative: boolean
  memo: Uint8Array
}

/**
 * Encrypt transfer payload untuk PrivateTransferVault
 */
export function encryptTransferPayload(
  vaultPublicKey: Hex,
  payload: TransferPayload
): {
  senderPublicKey: Uint8Array
  nonce: Uint8Array
  ciphertext: Uint8Array
} {
  // Convert memo Uint8Array to Hex string for encodeAbiParameters
  // viem's encodeAbiParameters expects Hex string for bytes type
  // Convert Uint8Array to hex manually to ensure compatibility
  let memoHex: Hex
  if (payload.memo.length === 0) {
    memoHex = "0x" as Hex
  } else {
    // Convert Uint8Array to hex string
    const hexString = Array.from(payload.memo)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
    memoHex = `0x${hexString}` as Hex
  }
  
  // Encode payload sebagai ABI tuple (sesuai ReferensiService.md line 176-179)
  // Referensi: ethers.AbiCoder.defaultAbiCoder().encode(
  //   ["tuple(address receiver,address token,uint256 amount,bool isNative,bytes memo)"],
  //   [payload]
  // )
  // Format tuple dengan components untuk match referensi
  const plaintext = encodeAbiParameters(
    [
      {
        components: [
          { name: "receiver", type: "address" },
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "isNative", type: "bool" },
          { name: "memo", type: "bytes" },
        ],
        name: "payload",
        type: "tuple",
      },
    ],
    [
      {
        receiver: payload.receiver,
        token: payload.token,
        amount: payload.amount,
        isNative: payload.isNative,
        memo: memoHex,
      },
    ]
  )

  // Convert hex to bytes (sesuai ReferensiService.md line 181)
  // Referensi: const plainBytes = ethers.getBytes(plaintext);
  const plainBytes = hexToBytes(plaintext)

  // Get vault public key bytes (sesuai ReferensiService.md line 183)
  // Referensi: ethers.getBytes(vaultPublicKey)
  const vaultPublicKeyBytes = hexToBytes(vaultPublicKey)

  // Encrypt dengan X25519DeoxysII (sesuai ReferensiService.md line 182-185)
  // Referensi: const cipher = X25519DeoxysII.ephemeral(ethers.getBytes(vaultPublicKey));
  //            const { nonce, ciphertext } = cipher.encrypt(plainBytes);
  const cipher = X25519DeoxysII.ephemeral(vaultPublicKeyBytes)
  const { nonce, ciphertext } = cipher.encrypt(plainBytes)

  // Ensure senderPublicKey is exactly 32 bytes (bytes32)
  // Sesuai referensi line 188: const senderPublicKeyBytes = ethers.getBytes(cipher.publicKey);
  // cipher.publicKey sudah Uint8Array, tapi kita pastikan length 32
  const senderPublicKeyBytes = new Uint8Array(cipher.publicKey)
  if (senderPublicKeyBytes.length !== 32) {
    throw new Error(
      `Invalid public key length: ${senderPublicKeyBytes.length}, expected 32`
    )
  }

  // Ensure nonce is exactly 16 bytes (bytes16)
  // Sesuai referensi line 197: let nonceBytes = ethers.getBytes(nonce);
  // nonce dari cipher.encrypt() sudah Uint8Array
  let nonceBytes = new Uint8Array(nonce)
  if (nonceBytes.length !== 15 && nonceBytes.length !== 16) {
    throw new Error(
      `Unexpected nonce length: ${nonceBytes.length}. Expected 15 bytes (Deoxys-II nonce).`
    )
  }
  // Sesuai referensi line 206-210: If the library returns 15 bytes, pad to 16 bytes
  if (nonceBytes.length === 15) {
    const padded = new Uint8Array(16)
    padded.set(nonceBytes, 0)
    nonceBytes = padded
  }

  return {
    senderPublicKey: senderPublicKeyBytes,
    nonce: nonceBytes,
    ciphertext,
  }
}

/**
 * Encode encrypted envelope untuk contract call (sesuai ReferensiService.md line 226-229)
 * Referensi: ethers.AbiCoder.defaultAbiCoder().encode(
 *   ["tuple(bytes32 senderPublicKey, bytes16 nonce, bytes ciphertext)"],
 *   [envelope]
 * )
 * 
 * IMPORTANT: Di referensi, envelope di-encode sebagai tuple, lalu di-convert ke bytes dengan ethers.getBytes()
 * Lalu pass sebagai bytes ke contract. Di viem/wagmi, kita pass Hex string langsung.
 */
export function encodeEnvelope(envelope: {
  senderPublicKey: Uint8Array
  nonce: Uint8Array
  ciphertext: Uint8Array
}): Hex {
  // Encode sebagai ABI tuple: tuple(bytes32 senderPublicKey, bytes16 nonce, bytes ciphertext)
  // Format sama persis dengan referensi line 226-229
  // Di referensi: envelope adalah object dengan senderPublicKey, nonce, ciphertext
  // Kita encode sebagai tuple dengan format yang sama
  return encodeAbiParameters(
    [
      {
        components: [
          { name: "senderPublicKey", type: "bytes32" },
          { name: "nonce", type: "bytes16" },
          { name: "ciphertext", type: "bytes" },
        ],
        name: "envelope",
        type: "tuple",
      },
    ],
    [
      {
        senderPublicKey: bytesToHex(envelope.senderPublicKey) as Hex,
        nonce: bytesToHex(envelope.nonce) as Hex,
        ciphertext: bytesToHex(envelope.ciphertext) as Hex,
      },
    ]
  )
}

