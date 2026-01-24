'use client';

import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/frame-sdk';
import { 
  Transaction, 
  TransactionButton 
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

const MY_WALLET_ADDRESS = '0x31DB887337778319761330f79E4699a3f9A5F6c3';

export default function Page() {
  const [isWaitlistJoined, setIsWaitlistJoined] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      if (context?.user) {
        setUser(context.user);
      }
      sdk.actions.ready();
    };
    load();
  }, []);

  const calls = [
    {
      to: MY_WALLET_ADDRESS as `0x${string}`,
      data: '0x' as `0x${string}`,
      value: BigInt(35000000000000), // 0.000035 ETH
    },
  ];

  return (
    <div className="min-h-screen bg-[#0052FF] text-white flex flex-col items-center p-6 font-sans">
      {/* Header */}
      <header className="w-full max-w-md flex justify-between items-center mb-10">
        <h1 className="text-xl font-bold tracking-tight italic">BUILD TOGETHER</h1>
        <div className="scale-90 origin-right">
          <Wallet>
            <ConnectWallet className="bg-white text-[#0052FF] hover:bg-blue-50 font-bold" />
          </Wallet>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
          {user?.pfpUrl ? (
            <img 
              src={user.pfpUrl} 
              alt="Profile" 
              className="w-20 h-20 rounded-full border-4 border-white/30 mb-4 shadow-xl"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/20 mb-4 flex items-center justify-center text-3xl">
              🏗️
            </div>
          )}
          
          <h2 className="text-2xl font-extrabold mb-2">
            {user ? `Welcome, ${user.username}` : "Hello, Builder"}
          </h2>
          
          {/* THE VISION TEXT */}
          <div className="space-y-4 mt-2">
            <p className="text-blue-50 text-md leading-relaxed">
              This Mini App is living proof that <span className="font-bold underline">anyone</span> can build onchain. No massive teams, no huge budgets.
            </p>
            <div className="h-[1px] w-1/2 bg-white/20 mx-auto" />
            <p className="text-sm italic opacity-80">
              Our mission: empowering others to build. Check-in to support the movement and learn how to create your own.
            </p>
          </div>
        </div>

        {/* Transaction Block */}
        <div className="space-y-4">
          <Transaction 
            chainId={8453} 
            calls={calls as any}
          >
            <TransactionButton 
              className="w-full bg-white text-[#0052FF] font-bold py-4 rounded-2xl active:scale-95 transition-all shadow-lg shadow-blue-900/20" 
              text="Check-in & Support"
            />
          </Transaction>
        </div>
      </main>

      {/* Waitlist Section */}
      <section className="w-full max-w-md mt-6">
        <button 
          onClick={() => setIsWaitlistJoined(true)}
          className="w-full py-4 rounded-2xl bg-black/20 border border-white/10 text-white font-medium hover:bg-black/30 transition-all"
        >
          {isWaitlistJoined ? "✅ Added to App #2 (Builder's Path)" : "Join App #2 Waitlist"}
        </button>
        <p className="text-[10px] text-center mt-3 opacity-50 uppercase tracking-widest">
          Next: Step-by-step guide for solo builders
        </p>
      </section>

      {/* Footer */}
      <footer className="mt-auto pt-8 text-white/40 text-[9px] uppercase tracking-[0.2em] text-center">
        Built by a Solo Developer <br/>
        Base Network • Powered by OnchainKit
      </footer>
    </div>
  );
}