'use client';

import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/frame-sdk';
import { 
  Transaction, 
  TransactionButton 
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

// TODO: REPLACE WITH YOUR REAL WALLET ADDRESS
const MY_WALLET_ADDRESS = '0x31DB887337778319761330f79E4699a3f9A5F6c3'; 

export default function Page() {
  const [isWaitlistJoined, setIsWaitlistJoined] = useState(false);

  useEffect(() => {
    const load = async () => {
      sdk.actions.ready();
    };
    load();
  }, []);

  // В новых версиях OnchainKit используем 'calls' вместо 'contracts'
  const calls = [
    {
      to: MY_WALLET_ADDRESS as `0x${string}`,
      data: '0x' as `0x${string}`, // Пустые данные для перевода ETH
      value: BigInt(35000000000000), // 0.000035 ETH
    },
  ];

  return (
    <div className="min-h-screen bg-[#0052FF] text-white flex flex-col items-center p-6 font-sans">
      {/* Header */}
      <header className="w-full max-w-md flex justify-between items-center mb-10">
        <h1 className="text-xl font-bold tracking-tight">BUILD TOGETHER</h1>
        <div className="scale-90 origin-right">
          <Wallet>
            <ConnectWallet className="bg-white text-[#0052FF] hover:bg-blue-50 font-bold" />
          </Wallet>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold mb-3">Build #1</h2>
          <p className="text-blue-50 text-lg leading-relaxed opacity-90">
            Every journey starts with a single step. Join the movement of open onchain building and secure your spot among the first pioneers.
          </p>
        </div>

        {/* Transaction Block */}
        <div className="space-y-4">
          <div className="bg-black/20 rounded-2xl p-4 flex justify-between items-center border border-white/10">
            <span className="text-sm font-medium opacity-80">Support development</span>
            <span className="font-mono font-bold">0.000035 ETH</span>
          </div>
          
          <Transaction 
            chainId={8453} 
            calls={calls as any}
          >
            <TransactionButton 
              className="w-full bg-white text-[#0052FF] font-bold py-4 rounded-2xl transition-all active:scale-95 hover:shadow-lg" 
              text="Check-in & Support"
            />
          </Transaction>
        </div>
      </main>

      {/* Future Section (Waitlist) */}
      <section className="w-full max-w-md mt-8">
        <button 
          onClick={() => setIsWaitlistJoined(true)}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-white/30 text-white font-medium hover:border-white/60 hover:bg-white/5 transition-all"
        >
          {isWaitlistJoined ? "✅ Added to Waitlist for App #2" : "Join Waitlist for Next App"}
        </button>
      </section>

      {/* Footer */}
      <footer className="mt-auto pt-10 text-white/40 text-[10px] uppercase tracking-widest">
        Base Network • Powered by OnchainKit
      </footer>
    </div>
  );
}