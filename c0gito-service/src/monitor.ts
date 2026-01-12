/**
 * Monitor pending transfers from Ponder GraphQL API
 */

import { config } from './config.js';

export interface PonderTransfer {
  transferId: string;
  depositId: string;
  sender: string;
  receiver: string | null;
  amount: string | null;
  token: string | null;
  isNative: boolean | null;
  status: string;
  storedAt: number | null;
  acknowledgedAt: number | null;
  processedAt: number | null;
}

/**
 * Query pending transfers from Ponder GraphQL API
 * Transfers dengan status "STORED" perlu di-process (acknowledge)
 */
export async function getPendingTransfers(): Promise<PonderTransfer[]> {
  const query = `
    query GetPendingTransfers {
      transfers(where: { status: "STORED" }) {
        items {
          transferId
          depositId
          sender
          receiver
          amount
          token
          isNative
          status
          storedAt
          acknowledgedAt
          processedAt
        }
        totalCount
      }
    }
  `;

  try {
    const response = await fetch(config.ponderApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL query failed: ${response.statusText}`);
    }

    const result = (await response.json()) as {
      errors?: Array<{ message: string }>;
      data?: {
        transfers: {
          items: PonderTransfer[];
          totalCount: number;
        };
      };
    };

    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data?.transfers.items || [];
  } catch (error) {
    console.error('Failed to fetch pending transfers:', error);
    throw error;
  }
}

/**
 * Check if transfer is still stored (needs processing)
 */
export async function isTransferStored(transferId: string): Promise<boolean> {
  const query = `
    query GetTransfer($transferId: String!) {
      transfer(id: $transferId) {
        transferId
        status
      }
    }
  `;

  try {
    const response = await fetch(config.ponderApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { transferId },
      }),
    });

    if (!response.ok) {
      return false;
    }

    const result = (await response.json()) as {
      errors?: Array<{ message: string }>;
      data?: {
        transfer: {
          transferId: string;
          status: string;
        } | null;
      };
    };
    const transfer = result.data?.transfer;

    return transfer?.status === 'STORED';
  } catch (error) {
    console.error(`Failed to check transfer ${transferId}:`, error);
    return false;
  }
}
