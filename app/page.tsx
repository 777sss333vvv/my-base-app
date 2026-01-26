'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { sdk } from '@farcaster/frame-sdk';
import { 
  Transaction, 
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import { useAccount, useConnect } from 'wagmi';

const MY_WALLET_ADDRESS = '0x31DB887337778319761330f79E4699a3f9A5F6c3'; 

export default function Page() {
const [isWaitlistJoined, setIsWaitlistJoined] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  // Добавляем функцию шеринга сюда
  const handleShare = useCallback(() => {
    const shareText = "I'm building onchain with Build Together! 🏗️ Join the movement on @base";
    const targetUrl = "https://www.prosperitypass.xyz";
    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(targetUrl)}`;
    
    sdk.actions.openUrl(shareUrl);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const context = await sdk.context;
        
        // Умный фильтр: работаем с Farcaster только если мы внутри него
        if (context?.user) {
          setUser(context.user);
          
          const farcasterConnector = connectors.find((c) => c.id === 'farcaster');
          if (farcasterConnector && !isConnected) {
            connect({ connector: farcasterConnector });
          }
        }
      } catch (error) {
        console.error("SDK load error:", error);
      } finally {
        setIsSDKLoaded(true);
        sdk.actions.ready();
      }
    };
    load();
  }, [connectors, isConnected, connect]);

  const calls = [
    {
      to: MY_WALLET_ADDRESS as `0x${string}`,
      data: '0x' as `0x${string}`,
      value: BigInt(35000000000000), 
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
          
          <div className="space-y-4 mt-2">
            <p className="text-blue-50 text-md leading-relaxed">
              This Mini App is living proof that <span className="font-bold underline">anyone</span> can build onchain. No massive teams, no huge budgets.
            </p>
            <div className="h-[1px] w-1/2 bg-white/20 mx-auto" />
            <p className="text-sm italic opacity-80">
              Our mission: empowering others to build. Check-in to support the movement.
            </p>
          </div>
        </div>

{/* Transaction Block - ТЕПЕРЬ С ПРОВЕРКОЙ ЗАГРУЗКИ */}
        <div className="space-y-4">
          {isSDKLoaded ? (
            <>
              <Transaction 
                chainId={8453} 
                calls={calls as any}
              >
                <TransactionButton 
                  className="w-full bg-white text-[#0052FF] font-bold py-4 rounded-2xl active:scale-95 transition-all shadow-lg shadow-blue-900/20" 
                  text="Check-in & Support"
                />
                <TransactionStatus className="text-center mt-2">
                  <TransactionStatusLabel className="text-white text-xs" />
                  <TransactionStatusAction className="text-blue-200 text-xs underline" />
                </TransactionStatus>
              </Transaction>

              {/* Кнопка шеринга — добавлена здесь */}
              <button
                onClick={handleShare}
                className="w-full bg-transparent border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-medium py-3 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>Share the Movement</span>
                <span className="opacity-50">↗</span>
              </button>
            </>
          ) : (
            <div className="w-full py-4 text-center animate-pulse text-white/50 bg-white/5 rounded-2xl border border-white/10">
              Initializing App...
            </div>
          )}
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