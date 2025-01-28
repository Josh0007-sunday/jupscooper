import React, { useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { JupiterSwap } from '../utils/swapcomponent';

interface JupiterSwapComponentProps {
  wallet: any;
}

const JupiterSwapComponent: React.FC<JupiterSwapComponentProps> = ({ wallet }) => {
  const [loading, setLoading] = useState(false);
  const [txid, setTxid] = useState<string | null>(null);
  const connection = new Connection('https://api.mainnet-beta.solana.com');

  const handleSwap = async () => {
    if (!wallet) return;

    setLoading(true);
    try {
      const result = await JupiterSwap(
        connection, 
        wallet, 
        'So11111111111111111111111111111111111111112', // SOL mint
        'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', // JUP mint
        1 * 1e9 // 1 SOL in lamports
      );
      setTxid(result);
    } catch (error) {
      console.error('Swap failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md w-full">
      <button onClick={handleSwap} disabled={loading} className="w-full">
        {loading ? 'Swapping...' : 'Swap SOL to JUP'}
      </button>
      {txid && (
        <p>
          Swap successful. Transaction: 
          <a 
            href={`https://solscan.io/tx/${txid}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700"
          >
            View Transaction
          </a>
        </p>
      )}
    </div>
  );
};

export default JupiterSwapComponent;