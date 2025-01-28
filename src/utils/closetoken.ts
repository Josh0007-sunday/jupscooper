import * as splToken from '@solana/spl-token';
import { 
  Connection, 
  PublicKey, 
  Transaction,
  Commitment,
  clusterApiUrl
} from '@solana/web3.js';

// It's better to use environment variables for API keys
const HELIUS_RPC_URL = process.env.REACT_APP_HELIUS_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=4c4a4f43-145d-4406-b89c-36ad977bb738';

const getConnection = () => {
  return new Connection(HELIUS_RPC_URL, {
    commitment: 'confirmed' as Commitment,
    confirmTransactionInitialTimeout: 60000, // 60 seconds
    wsEndpoint: undefined // Disable WebSocket for this use case
  });
};

export const closeTokenAccount = async (
  connection: Connection,
  sendTransaction: any,
  tokenAccountPublicKey: PublicKey,
  walletPublicKey: PublicKey
) => {
  try {
    // Get the latest blockhash with specific commitment
    const { blockhash, lastValidBlockHeight } = 
      await connection.getLatestBlockhash('confirmed');

    // Create the transaction
    const transaction = new Transaction();
    
    // Add the close instruction
    transaction.add(
      splToken.createCloseAccountInstruction(
        tokenAccountPublicKey,    // The account to close
        walletPublicKey,         // The destination for remaining SOL
        walletPublicKey          // The authority
      )
    );

    // Set the transaction parameters
    transaction.feePayer = walletPublicKey;
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    try {
      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation with specific commitment
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
      }

      return signature;
    } catch (error) {
      console.error('Transaction error:', error);
      if (error instanceof Error) {
        throw new Error(`Transaction failed: ${error.message}`);
      }
      throw error;
    }
  } catch (error) {
    console.error('Failed to close token account:', error);
    throw error;
  }
};