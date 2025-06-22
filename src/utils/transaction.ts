import { Connection, VersionedTransaction } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";

export interface TransactionStatus {
  signature?: string;
  status: "pending" | "confirming" | "confirmed" | "failed";
  error?: string;
}

export const executeSwapTransaction = async (
  connection: Connection,
  wallet: WalletContextState,
  swapTransaction: string
): Promise<TransactionStatus> => {
  if (!wallet.connected || !wallet.signTransaction) {
    throw new Error("Wallet not connected");
  }

  try {
    // Decode the serialized transaction
    const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    // Sign the transaction
    const signedTransaction = await wallet.signTransaction(transaction);

    // Send the transaction
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    return {
      signature,
      status: "pending",
    };
  } catch (error) {
    console.error("Transaction execution failed:", error);
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const confirmTransaction = async (
  connection: Connection,
  signature: string
): Promise<TransactionStatus> => {
  try {
    const confirmation = await connection.confirmTransaction(
      signature,
      "confirmed"
    );

    if (confirmation.value.err) {
      return {
        signature,
        status: "failed",
        error: "Transaction failed during confirmation",
      };
    }

    return {
      signature,
      status: "confirmed",
    };
  } catch (error) {
    console.error("Transaction confirmation failed:", error);
    return {
      signature,
      status: "failed",
      error: error instanceof Error ? error.message : "Confirmation failed",
    };
  }
};

export const getTransactionUrl = (signature: string): string => {
  return `https://solscan.io/tx/${signature}`;
};
