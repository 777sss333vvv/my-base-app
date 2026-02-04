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
import { getRecentTransactions } from './alchemy'; // Наш новый файл

const MY_WALLET_ADDRESS = '0x31DB887337778319761330f79E4699a3f9A5F6c3'; 

export default function Page() {
  const [user, setUser] = useState<any>(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [topFriends, setTopFriends] = useState<any[]>([]);
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
      {/* HEADER УМЕНЬШЕН */}
      <header className="w-full max-w-md flex justify-between items-center mb-6">
        <h1 className="text-sm font-black tracking-tighter italic opacity-80">PROSPERITY PASS</h1>
        <div className="scale-75 origin-right">
          <Wallet>
            <ConnectWallet className="bg-white text-[#0052FF] font-bold" />
          </Wallet>
        </div>
      </header>

      <main className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-[2.5rem] p-6 border border-white/20 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col items-center text-center">
          {/* АВАТАР УМЕНЬШЕН */}
          {user?.pfpUrl ? (
            <img src={user.pfpUrl} alt="PFP" className="w-16 h-16 rounded-full border-2 border-white/30 mb-2 shadow-lg" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/20 mb-2 flex items-center justify-center text-2xl">🏗️</div>
          )}
          
          <h2 className="text-xl font-black mb-4">
            {user ? user.username : "Base Builder"}
          </h2>

          {/* СЕКЦИЯ СКОРА — БОЛЕЕ КОМПАКТНАЯ */}
          <div className="flex items-center gap-4 w-full mb-6">
            <div className="flex-1 bg-black/20 rounded-2xl py-3 border border-white/5">
              <p className="text-[8px] uppercase tracking-widest opacity-50 mb-1">Activity Score</p>
              <p className="text-2xl font-mono font-black">{txCount ?? "..."}</p>
            </div>
            <div className="flex-1 rounded-2xl py-3 border border-white/20 bg-white/5">
              <p className="text-[8px] uppercase tracking-widest opacity-50 mb-1">Global Rank</p>
              <p className="text-sm font-black flex items-center justify-center gap-1" style={{color: currentTier.color}}>
                {currentTier.icon} {currentTier.name}
              </p>
            </div>
          </div>
        </div>

        {/* КНОПКИ В ОДИН РЯД */}
        <div className="flex gap-2 mb-6">
          <div className="flex-[2]">
            <Transaction chainId={8453} calls={calls as any}>
              <TransactionButton className="w-full bg-white text-[#0052FF] font-black py-3 rounded-xl text-xs active:scale-95 transition-all shadow-xl" text="Support & Get" />
            </Transaction>
          </div>
          <button onClick={handleShare} className="flex-1 bg-white/10 border border-white/20 text-white font-bold py-3 rounded-xl text-xs hover:bg-white/20 transition-all">
            Share ↗
          </button>
        </div>

        {/* НОВЫЙ БЛОК: RECENT ACTIVITY */}
        <div className="text-left mb-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-3">Live Onchain Activity</p>
          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-hide">
            {isLoadingTx ? (
              <div className="text-[10px] text-white/30 animate-pulse text-center py-4">Scanning Base Mainnet...</div>
            ) : transactions.length > 0 ? (
              transactions.map((tx: any, i: number) => (
                <div key={i} className="bg-white/5 border border-white/5 p-2.5 rounded-xl flex justify-between items-center transition-all hover:bg-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center text-xs">
                      {tx.asset === 'ETH' ? '🔵' : '📦'}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold leading-tight">{tx.category === 'erc721' ? 'NFT' : 'Transfer'}</p>
                      <p className="text-[8px] text-white/40 uppercase tracking-tighter">to {tx.to?.slice(0, 6)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono font-bold">{parseFloat(tx.value).toFixed(3)} {tx.asset}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-white/20 text-center py-4 italic">No recent tx found</p>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-4 pb-4 text-white/30 text-[8px] uppercase tracking-[0.3em] text-center leading-relaxed">
        Score 3.0 Live • Alchemy Engine <br/>
        Built by Solo Developer
      </footer>
    </div>
  );
}