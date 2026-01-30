/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

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
import { useAccount, useConnect, usePublicClient } from 'wagmi';

const MY_WALLET_ADDRESS = '0x31DB887337778319761330f79E4699a3f9A5F6c3'; 

export default function Page() {
  const [isWaitlistJoined, setIsWaitlistJoined] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [topFriends, setTopFriends] = useState<any[]>([]);
  const [txCount, setTxCount] = useState<number | null>(null);

  const { isConnected, address: connectedAddress } = useAccount();
  const { connect, connectors } = useConnect();
  const publicClient = usePublicClient();

  // 1. Общий шеринг
  const handleShare = useCallback(() => {
    const shareText = "I'm building onchain with Build Together! 🏗️ Join the movement on @base";
    const targetUrl = "https://www.prosperitypass.xyz";
    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(targetUrl)}`;
    sdk.actions.openUrl(shareUrl);
  }, []);

  // 2. Персональный инвайт
  const handleInviteFriend = useCallback((friendUsername: string) => {
    const shareText = `Hey @${friendUsername}, I'm already building onchain with Build Together! 🏗️🔵 Join me on @base.`;
    const targetUrl = "https://www.prosperitypass.xyz";
    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(targetUrl)}`;
    sdk.actions.openUrl(shareUrl);
  }, []);

  // Загрузка контекста Farcaster и друзей
  useEffect(() => {
    const load = async () => {
      try {
        const context = await sdk.context;
        if (context?.user) {
          setUser(context.user);
          
          const res = await fetch(`/api/friends?fid=${context.user.fid}`);
          const friendsData = await res.json();
          if (Array.isArray(friendsData)) {
            setTopFriends(friendsData);
          }

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

  // Загрузка Onchain Score
  useEffect(() => {
    const fetchScore = async () => {
      const targetAddress = 
        connectedAddress || 
        user?.custodyAddress || 
        user?.verifiedAddresses?.ethAddresses?.[0];

      if (targetAddress && publicClient) {
        try {
          const count = await publicClient.getTransactionCount({
            address: targetAddress as `0x${string}`,
          });
          setTxCount(count);
        } catch (e) {
          console.error("Score fetch error:", e);
          setTxCount(0);
        }
      } else if (isSDKLoaded) {
        setTxCount(0);
      }
    };
    fetchScore();
  }, [user, connectedAddress, publicClient, isSDKLoaded]);

  const calls = [
    {
      to: MY_WALLET_ADDRESS as `0x${string}`,
      data: '0x' as `0x${string}`,
      value: BigInt(35000000000000), 
    },
  ];

  return (
    <div className="min-h-screen bg-[#0052FF] text-white flex flex-col items-center p-6 font-sans">
      <header className="w-full max-w-md flex justify-between items-center mb-10">
        <h1 className="text-xl font-bold tracking-tight italic">BUILD TOGETHER</h1>
        <div className="scale-90 origin-right">
          <Wallet>
            <ConnectWallet className="bg-white text-[#0052FF] hover:bg-blue-50 font-bold" />
          </Wallet>
        </div>
      </header>

      <main className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
          {user?.pfpUrl ? (
            <img 
              src={user.pfpUrl} 
              alt="Profile" 
              className="w-20 h-20 rounded-full border-4 border-white/30 mb-4 shadow-xl"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/20 mb-4 flex items-center justify-center text-3xl font-bold">
              🏗️
            </div>
          )}
          
          <h2 className="text-2xl font-extrabold mb-1">
            {user ? `Welcome, ${user.username}` : "Hello, Builder"}
          </h2>

          {/* BASE ACTIVITY SCORE BLOCK */}
          <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-2 mb-4 flex flex-col items-center shadow-inner min-w-[140px]">
            <span className="text-[9px] uppercase tracking-[0.2em] opacity-60 font-bold text-blue-100">
              Base Activity Score
            </span>
            <span className="text-2xl font-mono font-extrabold text-white my-1">
              {txCount !== null ? txCount : "..."}
            </span>
            <span className="text-[8px] opacity-40 uppercase tracking-widest font-medium">
              Total Transactions
            </span>
          </div>
          
          <div className="space-y-4 mt-2">
            <p className="text-blue-50 text-md leading-relaxed">
              This Mini App is living proof that <span className="font-bold underline">anyone</span> can build onchain.
            </p>
            <div className="h-[1px] w-1/2 bg-white/20 mx-auto" />
            <p className="text-sm italic opacity-80">
              Our mission: empowering others to build.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {isSDKLoaded ? (
            <>
              <Transaction chainId={8453} calls={calls as any}>
                <TransactionButton 
                  className="w-full bg-white text-[#0052FF] font-bold py-4 rounded-2xl active:scale-95 transition-all shadow-lg shadow-blue-900/20" 
                  text="Check-in & Support"
                />
                <TransactionStatus className="text-center mt-2">
                  <TransactionStatusLabel className="text-white text-xs" />
                  <TransactionStatusAction className="text-blue-200 text-xs underline" />
                </TransactionStatus>
              </Transaction>

              <button
                onClick={handleShare}
                className="w-full bg-transparent border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-medium py-3 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>Share the Movement</span>
                <span className="opacity-50">↗</span>
              </button>

              {topFriends.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-white/60 text-[10px] mb-4 text-center uppercase tracking-[0.2em] font-bold">
                    Invite your inner circle
                  </p>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {topFriends.map((friend) => (
                      <button
                        key={friend.fid}
                        onClick={() => handleInviteFriend(friend.username)}
                        className="flex-shrink-0 flex flex-col items-center gap-1 group transition-transform active:scale-90"
                      >
                        <img 
                          src={friend.pfp_url} 
                          alt={friend.username}
                          className="w-12 h-12 rounded-full border-2 border-transparent group-hover:border-[#0052FF] transition-all object-cover bg-white/5"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${friend.username}&background=ffffff&color=0052FF`;
                          }}
                        />
                        <span className="text-[10px] text-white/40 group-hover:text-white truncate w-14">
                          @{friend.username}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full py-4 text-center animate-pulse text-white/50 bg-white/5 rounded-2xl border border-white/10">
              Initializing App...
            </div>
          )}
        </div>
      </main>

      <section className="w-full max-w-md mt-6">
        <button 
          onClick={() => setIsWaitlistJoined(true)}
          className="w-full py-4 rounded-2xl bg-black/20 border border-white/10 text-white font-medium hover:bg-black/30 transition-all"
        >
          {isWaitlistJoined ? "✅ Added to App #2 (Builder's Path)" : "Join App #2 Waitlist"}
        </button>
      </section>

      <footer className="mt-auto pt-8 text-white/40 text-[9px] uppercase tracking-[0.2em] text-center">
        Built by a Solo Developer <br/>
        Base Network • Powered by OnchainKit
      </footer>
    </div>
  );
}