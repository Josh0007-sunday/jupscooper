import React, { useState, useEffect } from 'react';
import './App.css';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { closeTokenAccount } from './utils/closetoken';
import JupiterSwapComponent from './component/Jupiterswap';
import { Buffer } from 'buffer';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
window.Buffer = Buffer;

const App: React.FC = () => {
  const { connected, publicKey, wallet, sendTransaction } = useWallet();
  const [tokenAccounts, setTokenAccounts] = useState<{ pubkey: PublicKey; mint: PublicKey }[]>([]);
  const [selectedTokenAccounts, setSelectedTokenAccounts] = useState<PublicKey[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=4c4a4f43-145d-4406-b89c-36ad977bb738');

  // Fetch token accounts associated with the connected wallet
  const fetchTokenAccounts = async () => {
    if (!publicKey) return;

    try {
      const accounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      });

      const tokenAccounts = accounts.value.map((account) => ({
        pubkey: account.pubkey,
        mint: account.account.data.parsed.info.mint,
      }));

      setTokenAccounts(tokenAccounts);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Failed to fetch token accounts:', error);
      setError('Failed to fetch token accounts. Please check your connection and try again.');
    }
  };

  useEffect(() => {
    if (connected) {
      fetchTokenAccounts();
    }
  }, [connected, publicKey]);

  const handleCloseAccount = async () => {
    if (!publicKey || selectedTokenAccounts.length === 0) return;

    try {
      for (const tokenAccount of selectedTokenAccounts) {
        await closeTokenAccount(connection, sendTransaction, tokenAccount, publicKey);
      }
      setSelectedTokenAccounts([]);
      fetchTokenAccounts(); // Refresh the token accounts list after closing
    } catch (error) {
      console.error('Failed to close token account:', error);
      setError('Failed to close token account. Please try again.');
    }
  };

  const toggleFaq = (index: number) => {
    setFaqOpenIndex(faqOpenIndex === index ? null : index);
  };

  const faqItems = [
    {
      question: 'What happens when I close a token account?',
      answer: 'Closing a token account removes it from your wallet and reclaims the SOL used for rent.',
    },
    {
      question: 'Can I reopen a closed token account?',
      answer: 'No, once closed, a token account cannot be reopened. You’ll need to create a new one.',
    },
    {
      question: 'Why close unused token accounts?',
      answer: 'It helps reclaim SOL used for rent and reduces clutter in your wallet.',
    },
  ];

  return (
    <div className="min-h-screen bg-[url('assets/background.webp')] bg-cover bg-center bg-fixed relative before:content-[''] before:absolute before:inset-0 before:bg-black/40">
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50">
        <h1 className="text-3xl font-bold text-white">JupScooper</h1>
        <WalletMultiButton className="bg-white/80 hover:bg-white/90 text-gray-800 font-medium py-2 px-4 rounded-md" />
      </nav>

      {/* Main Content */}
      <div className="pt-20 pb-8 flex flex-col items-center justify-center min-h-screen">
        {/* Card */}
        <div className="bg-white/20 backdrop-blur-md p-6 rounded-lg w-full max-w-md shadow-lg border border-white/10">
          {connected ? (
            <>
              {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

              <div className="mb-4">
                <h2 className="text-lg font-semibold text-white mb-2">Token Accounts</h2>
                <div className="max-h-48 overflow-y-auto">
                  {tokenAccounts.length > 0 ? (
                    tokenAccounts.map((account) => (
                      <div
                        key={account.pubkey.toString()}
                        className="p-2 mb-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedTokenAccounts.some((selected) => selected.equals(account.pubkey))}
                            onChange={() => {
                              if (selectedTokenAccounts.some((selected) => selected.equals(account.pubkey))) {
                                setSelectedTokenAccounts(selectedTokenAccounts.filter((selected) => !selected.equals(account.pubkey)));
                              } else {
                                setSelectedTokenAccounts([...selectedTokenAccounts, account.pubkey]);
                              }
                            }}
                          />
                          <div className="flex flex-col">
                            <p className="text-xs text-white">
                              <span className="font-medium">Mint:</span> {account.mint.toString().slice(0, 12)}...
                            </p>
                            <p className="text-xs text-white/70">
                              <span className="font-medium">Account:</span> {account.pubkey.toString().slice(0, 12)}...
                            </p>
                          </div>
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-700 text-sm">No token accounts found.</p>
                  )}
                </div>
              </div>

              <button
                onClick={handleCloseAccount}
                disabled={selectedTokenAccounts.length === 0}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md mb-4 w-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Close Selected Token Accounts
              </button>

              <JupiterSwapComponent wallet={wallet} />
            </>
          ) : (
            <p className="text-gray-700 text-sm">Connect your wallet to get started.</p>
          )}
        </div>

        {/* FAQ Section (Outside the Card) */}
        <div className="mt-6 w-full max-w-md">
          <h2 className="text-lg font-semibold text-white mb-2">FAQ</h2>
          <div className="max-h-64 overflow-y-auto">
            {faqItems.map((faq, index) => (
              <div key={index} className="mb-2">
                <div
                  className="p-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                  onClick={() => toggleFaq(index)}
                >
                  <p className="text-sm text-white">{faq.question}</p>
                </div>
                {faqOpenIndex === index && (
                  <div className="p-2 mt-1 bg-white/10 rounded-md">
                    <p className="text-sm text-white">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;