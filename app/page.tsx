/* eslint-disable @typescript-eslint/no-unused-vars */
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

// Импорты
import { getTier } from '../utils/scoreLogic'; 
import { getRecentTransactions } from './alchemy'; 

const MY_WALLET_ADDRESS = '0x31DB887337778319761330f79E4699a3f9A5F6c3'; 

export default function Page() {
  const [user, setUser] = useState<any>(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [txCount, setTxCount] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(false);

  const { isConnected, address: connectedAddress } = useAccount();
  const { connect, connectors } = useConnect();
  const publicClient = usePublicClient();

  const currentTier = getTier(txCount || 0);

  // Загрузка транзакций из Alchemy
  useEffect(() => {
    async function fetchAlchemyData() {
      const targetAddress = connectedAddress || user?.custodyAddress || user?.verifiedAddresses?.ethAddresses?.[0];
      if (targetAddress) {
        setIsLoadingTx(true);
        try {
          const data = await getRecentTransactions(targetAddress);
          setTransactions(data || []);
        } catch (err) {
          console.error("Alchemy error:", err);
        } finally {
          setIsLoadingTx(false);
        }
      }
    }
    fetchAlchemyData();
  }, [connectedAddress, user]);

  const handleShare = useCallback(() => {
    const tierText = txCount !== null 
      ? `My Base Rank: ${currentTier.name} ${currentTier.icon} (${txCount} tx)` 
      : "Checking my Base Builder status 🏗️";
    
    const shareText = `${tierText}\n\nJoin the elite onchain movement on @base 🔵\nBuilt with Prosperity Pass.`;
    const targetUrl = "https://www.prosperitypass.xyz";
    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(targetUrl)}`;
    sdk.actions.openUrl(shareUrl);
  }, [txCount, currentTier]);

  useEffect(() => {
    const load = async () => {
      try {
        sdk.actions.ready();
        const context = await sdk.context;
        if (context?.user) {
          setUser(context.user);
          const farcasterConnector = connectors.find((c) => c.id === 'farcaster');
          if (farcasterConnector && !isConnected) {
            connect({ connector: farcasterConnector });
          }
        }
      } catch (error) {
        console.warn("SDK check finished.");
      } finally {
        setIsSDKLoaded(true);
      }
    };
    load();
  }, [connectors, isConnected, connect]);

  useEffect(() => {
    const fetchScore = async () => {
      const targetAddress = connectedAddress || user?.custodyAddress || user?.verifiedAddresses?.ethAddresses?.[0];
      if (targetAddress && publicClient) {
        try {
          const count = await publicClient.getTransactionCount({
            address: targetAddress as `0x${string}`,
          });
          setTxCount(count);
        } catch {
          setTxCount(0);
        }
      }
    };
    fetchScore();
  }, [user, connectedAddress, publicClient]);

  const calls = [{ to: MY_WALLET_ADDRESS as `0x${string}`, data: '0x' as `0x${string}`, value: BigInt(35000000000000) }];

  return (
    <div className="min-h-screen bg-[#0052FF] text-white flex flex-col items-center p-4 font-sans overflow-x-hidden">
      <header className="w-full max-w-md flex justify-between items-center mb-6 px-2">
        <h1 className="text-sm font-black tracking-tighter italic opacity-80">PROSPERITY PASS</h1>
        <div className="scale-75 origin-right">
          <Wallet>
            <ConnectWallet className="bg-white text-[#0052FF] font-bold" />
          </Wallet>
        </div>
      </header>

      <main className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-[2.5rem] p-6 border border-white/20 shadow-2xl relative flex flex-col">
        <div className="flex flex-col items-center text-center">
          {/* УВЕЛИЧЕННЫЙ АВАТАР */}
          {user?.pfpUrl ? (
            <img src={user.pfpUrl} alt="PFP" className="w-24 h-24 rounded-full border-4 border-white/30 mb-4 shadow-xl" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 mb-4 flex items-center justify-center text-4xl shadow-inner">🏗️</div>
          )}
          
          <h2 className="text-2xl font-black mb-6">
            {user ? user.username : "Base Builder"}
          </h2>

          <div className="flex items-center gap-4 w-full mb-8">
            <div className="flex-1 bg-black/20 rounded-2xl py-4 border border-white/5 shadow-inner">
              <p className="text-[9px] uppercase tracking-widest opacity-50 mb-1 font-bold">Activity Score</p>
              <p className="text-3xl font-mono font-black">{txCount ?? "..."}</p>
            </div>
            <div className="flex-1 rounded-2xl py-4 border border-white/20 bg-white/5">
              <p className="text-[9px] uppercase tracking-widest opacity-50 mb-1 font-bold">Global Rank</p>
              <p className="text-base font-black flex items-center justify-center gap-1" style={{color: currentTier.color}}>
                {currentTier.icon} {currentTier.name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-8">
          <div className="flex-[2.5]">
            <Transaction chainId={8453} calls={calls as any}>
              <TransactionButton className="w-full bg-white text-[#0052FF] font-black py-4 rounded-2xl text-xs active:scale-95 transition-all shadow-xl" text="Support & Get Verified" />
            </Transaction>
          </div>
          <button onClick={handleShare} className="flex-1 bg-white/10 border border-white/20 text-white font-bold py-4 rounded-2xl text-xs hover:bg-white/20 transition-all flex items-center justify-center">
            Share ↗
          </button>
        </div>

        {/* БЛОК ТРАНЗАКЦИЙ РАСТЯНУТ */}
        <div className="text-left flex-grow min-h-[250px]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 px-1">Live Onchain Activity</p>
          <div className="space-y-3">
            {isLoadingTx ? (
              <div className="text-[10px] text-white/30 animate-pulse text-center py-10 font-bold tracking-widest">
                SCANNING BASE MAINNET...
              </div>
            ) : transactions.length > 0 ? (
              transactions.map((tx: any, i: number) => (
                <div key={i} className="bg-white/5 border border-white/5 p-3 rounded-2xl flex justify-between items-center transition-all hover:bg-white/10 group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center text-sm shadow-sm group-hover:scale-110 transition-transform">
                      {tx.asset === 'ETH' ? '🔵' : '📦'}
                    </div>
                    <div>
                      <p className="text-[12px] font-bold leading-tight">{tx.category === 'erc721' ? 'NFT Mint' : 'Transfer'}</p>
                      <p className="text-[9px] text-white/40 uppercase tracking-tighter font-medium">to {tx.to?.slice(0, 6)}...{tx.to?.slice(-4)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-mono font-black">{parseFloat(tx.value).toFixed(3)}</p>
                    <p className="text-[8px] text-white/30 font-bold">{tx.asset}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 opacity-20">
                <div className="text-2xl mb-2">🔍</div>
                <p className="text-[10px] uppercase font-bold tracking-widest">No recent tx found</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ОБНОВЛЕННЫЙ ФУТЕР */}
      <footer className="mt-8 pb-8 text-white/30 text-[9px] uppercase tracking-[0.3em] text-center leading-relaxed font-medium">
        Score 3.0 Live • Alchemy Engine <br/>
        Securely Powered by <span className="text-white/50 font-black">Base Network</span> 🔵 <br/>
        Built by Solo Developer
      </footer>
    </div>
  );
}