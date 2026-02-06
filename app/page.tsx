/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { sdk } from '@farcaster/frame-sdk';
import { Transaction, TransactionButton } from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import { useAccount, useConnect, usePublicClient } from 'wagmi';
import { getTier } from '../utils/scoreLogic'; 
import { getRecentTransactions } from './alchemy'; 

const MY_WALLET_ADDRESS = '0x31DB887337778319761330f79E4699a3f9A5F6c3'; 
const TOKEN_IMAGE = "/oracle.png"; 

export default function Page() {
  const [user, setUser] = useState<any>(null);
  const [txCount, setTxCount] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const [oracleMessage, setOracleMessage] = useState("Tap the Oracle for your destiny...");
  const [isOracleLoading, setIsOracleLoading] = useState(false);

  const { isConnected, address: connectedAddress } = useAccount();
  const { connect, connectors } = useConnect();
  const publicClient = usePublicClient();

  const currentTier = getTier(txCount || 0);

  // Загрузка транзакций Alchemy
  useEffect(() => {
    async function fetchAlchemyData() {
      const targetAddress = connectedAddress || user?.custodyAddress;
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

  const prophecies = useMemo(() => [
    "The Oracle rewards the bold. Enter the Weekly Drop to seal your fate! 💎",
    "On-chain destiny is written in Base. Your support fuels the wisdom. 🔵",
    "Greatness comes to those who wait. Your Weekly Drop is brewing... 🔮",
    "The blue cloud sees your loyalty. Multiplied rewards await the faithful. ☁️",
    "Fortune favors the builder. Join the circle of prosperity today. ⚔️",
    "Wisdom is a journey. Every Weekly Entry brings you closer to the edge. 🚀"
  ], []);

  const getNewProphecy = () => {
    setIsOracleLoading(true);
    setTimeout(() => {
      const randomMsg = prophecies[Math.floor(Math.random() * prophecies.length)];
      setOracleMessage(randomMsg);
      setIsOracleLoading(false);
    }, 600);
  };

  const handleShare = useCallback(() => {
    const shareText = `My Base Rank: ${currentTier.name} ${currentTier.icon}\n🔮 Oracle Prophecy: "${oracleMessage}"\n\nJoin Score 4.0 & get your Weekly Drop 🔵`;
    const targetUrl = "https://www.prosperitypass.xyz";
    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(targetUrl)}`;
    sdk.actions.openUrl(shareUrl);
  }, [currentTier, oracleMessage]);

  const handleBuyNow = () => {
    sdk.actions.openUrl('https://zora.co/collect/base:0x7ee27f16e32e7070d353fd3fe9e4428a69701f31');
  };

  useEffect(() => {
    const load = async () => {
      sdk.actions.ready();
      const context = await sdk.context;
      if (context?.user) {
        setUser(context.user);
        const farcasterConnector = connectors.find((c) => c.id === 'farcaster');
        if (farcasterConnector && !isConnected) connect({ connector: farcasterConnector });
      }
    };
    load();
  }, [connectors, isConnected, connect]);

  useEffect(() => {
    const fetchScore = async () => {
      const targetAddress = connectedAddress || user?.custodyAddress;
      if (targetAddress && publicClient) {
        try {
          const count = await publicClient.getTransactionCount({ address: targetAddress as `0x${string}` });
          setTxCount(count);
        } catch { setTxCount(0); }
      }
    };
    fetchScore();
  }, [user, connectedAddress, publicClient]);

  return (
    <div className="min-h-screen bg-[#0052FF] text-white flex flex-col items-center p-4 font-sans overflow-x-hidden">
      <header className="w-full max-w-md flex justify-between items-center mb-6">
        <h1 className="text-sm font-black tracking-tighter italic opacity-80 uppercase">Score 4.0: Oracle</h1>
        <div className="scale-75 origin-right"><Wallet><ConnectWallet className="bg-white text-[#0052FF]" /></Wallet></div>
      </header>

      <main className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-[2.5rem] p-6 border border-white/20 shadow-2xl relative flex flex-col">
        
        {/* АВАТАР И ОРАКУЛ */}
        <div className="flex flex-col items-center text-center relative mb-6">
          <div className="relative">
            {user?.pfpUrl ? (
              <img src={user.pfpUrl} alt="PFP" className="w-20 h-20 rounded-full border-4 border-white/30 shadow-xl" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-mono">?</div>
            )}
            <button 
              onClick={getNewProphecy}
              className="absolute -top-4 -right-6 w-14 h-14 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-bounce hover:scale-110 transition-transform overflow-hidden"
              style={{ animationDuration: '3s' }}
            >
              <img src={TOKEN_IMAGE} className="w-full h-full object-cover" alt="Oracle" />
            </button>
          </div>
          <h2 className="text-xl font-black mt-4">{user ? `@${user.username}` : "Base Builder"}</h2>

          <div className="mt-4 bg-black/40 p-3 rounded-2xl border border-blue-400/50 relative min-h-[70px] flex items-center justify-center">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-500 text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest shadow-blue-500/50 shadow-lg">
              Oracle Prophecy
            </div>
            <p className={`text-xs italic font-medium px-2 ${isOracleLoading ? 'animate-pulse opacity-50' : ''}`}>
              &quot;{oracleMessage}&quot;
            </p>
          </div>
        </div>

        {/* КНОПКИ ДЕЙСТВИЯ */}
        <div className="flex gap-2 mb-6">
          <button 
            onClick={handleBuyNow}
            className="flex-[1] bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl flex flex-col items-center justify-center p-2 transition-all"
          >
            <img src={TOKEN_IMAGE} className="w-6 h-6 rounded-full mb-1" alt="Token" />
            <span className="text-[8px] font-black uppercase">Buy Token</span>
          </button>

          <div className="flex-[2] relative group">
            <Transaction chainId={8453} calls={[{
              to: MY_WALLET_ADDRESS as `0x${string}`,
              value: BigInt(35000000000000),
              data: '0x' as `0x${string}`
            } as any]}>
              <TransactionButton 
                className="w-full bg-indigo-600 text-white font-black py-3 rounded-xl text-[10px] uppercase shadow-xl border-none animate-pulse hover:animate-none" 
                text="Weekly Drop Entry 🎁" 
              />
            </Transaction>
            <p className="text-[7px] text-center mt-1 opacity-50 uppercase font-bold tracking-tighter">
              Get 2x-3x Drop every Sunday
            </p>
          </div>
        </div>

        {/* СТАТИСТИКА */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-black/20 rounded-2xl py-3 border border-white/5 text-center">
            <p className="text-[8px] uppercase opacity-50 mb-1 tracking-widest font-bold">Base Score</p>
            <p className="text-xl font-mono font-black">{txCount ?? "..."}</p>
          </div>
          <div className="bg-white/5 rounded-2xl py-3 border border-white/10 text-center">
            <p className="text-[8px] uppercase opacity-50 mb-1 tracking-widest font-bold">Rank</p>
            <p className="text-xs font-black" style={{color: currentTier.color}}>{currentTier.icon} {currentTier.name}</p>
          </div>
        </div>

        {/* ЛОГ ТРАНЗАКЦИЙ ALCHEMY */}
        <div className="mb-6 bg-black/20 rounded-3xl p-4 border border-white/5">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-3">Live Onchain Activity</p>
          <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
            {isLoadingTx ? (
              <div className="text-[10px] text-white/30 text-center py-4 animate-pulse italic">Scanning ledger...</div>
            ) : transactions.length > 0 ? (
              transactions.slice(0, 5).map((tx: any, i: number) => (
                <div key={i} className="bg-white/5 border border-white/5 p-2 rounded-xl flex justify-between items-center text-[9px]">
                  <div className="flex items-center gap-2">
                    <span className="opacity-50">{tx.asset === 'ETH' ? '🔵' : '📦'}</span>
                    <p className="font-bold opacity-80">{tx.category === 'erc721' ? 'NFT Mint' : 'Transfer'}</p>
                  </div>
                  <p className="font-mono text-blue-400">{parseFloat(tx.value).toFixed(4)} {tx.asset}</p>
                </div>
              ))
            ) : (
              <div className="text-[10px] text-white/20 text-center py-4">No recent activity found</div>
            )}
          </div>
        </div>

        <button onClick={handleShare} className="w-full bg-white text-[#0052FF] font-black py-4 rounded-xl text-xs shadow-xl mb-4 hover:scale-[1.02] transition-all">
          Share My Prophecy ↗
        </button>

        <footer className="text-center pb-2">
           <p className="text-[7px] text-white/30 uppercase tracking-[0.3em] font-bold">
             Oracle v1.1 • Stability Update
           </p>
        </footer>
      </main>
    </div>
  );
}