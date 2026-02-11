/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  const [oracleScore, setOracleScore] = useState<number>(1250); 
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const [oracleMessage, setOracleMessage] = useState("Tap the Oracle and get a prophecy");
  const [isOracleLoading, setIsOracleLoading] = useState(false);
  const [lastChoice, setLastChoice] = useState<'accept' | 'defy' | null>(null);
  
  const isUpdatingScore = useRef(false);

  const { isConnected, address: connectedAddress } = useAccount();
  const { connect, connectors } = useConnect();
  const publicClient = usePublicClient();

  useEffect(() => {
    const savedScore = localStorage.getItem('oracle_score_v5');
    if (savedScore) setOracleScore(Number(savedScore));
  }, []);

  useEffect(() => {
    localStorage.setItem('oracle_score_v5', oracleScore.toString());
  }, [oracleScore]);

  const prophecies = useMemo(() => [
    "The charts whisper green. Patience is your strongest shield.",
    "A red candle is not the end, but a test of your faith.",
    "The Oracle sees a golden exit. Know your target.",
    "Liquidity flows where conviction grows. Stay steady.",
    "A forgotten wallet holds a future fortune. Seek the keys.",
    "The trend is your friend until the Oracle sees the bend.",
    "High gas is the price of entry to the kingdom of gains.",
    "Silence in the market is the calm before the ultimate pump.",
    "To defy the prophecy is to create your own moon.",
    "Fear is the thief of generational wealth. Lock the door.",
    "The stars align for a breakout. Are you positioned?",
    "A whale moves in the shadows. Watch the on-chain ripples.",
    "Small caps carry big dreams. Choose your seed wisely.",
    "The dip you fear is the entry you prayed for.",
    "Greed blinds the eye; logic secures the bag.",
    "On the Base chain, every transaction is a step toward destiny.",
    "Your Oracle Score reflects your devotion. Keep building.",
    "A sudden bridge will bring new tides of capital.",
    "FOMO is a false prophet. Listen to the cold numbers.",
    "The smartest move is often the one you didn't make.",
    "Wealth is moving from the impatient to the diamond-handed.",
    "An ecosystem bloom is coming. Base is the soil.",
    "Your vision is clear, but the timing is the Oracle’s secret.",
    "Don't chase the green candle; let it find you.",
    "The decentralized path is narrow but leads to the sun.",
    "Security is not an option; it is the foundation of your empire.",
    "A strategic hedge will save you from the storm.",
    "The Oracle detects a shift in the DAO. Power is moving.",
    "Trust the code, for the code has no ego.",
    "Your path to 100x starts with a single honest swap.",
    "The bear sleeps, but the bull is already sharpening its horns.",
    "Scarcity creates value. Hold what is rare.",
    "The bridge to financial freedom is built with $USERBOX.",
    "Look beyond the hype; the real alpha is in the utility.",
    "A mystery airdrop awaits those who interact with the light.",
    "Double your Oracle Score, double your luck in the next epoch.",
    "The ledger never lies. Your history is your legacy.",
    "When others panic, the Oracle finds opportunity.",
    "A new protocol emerges. Be the first to witness.",
    "Volatility is the heartbeat of a living market.",
    "Your conviction will be tested at the resistance line.",
    "The moon is not a destination, it’s a mindset.",
    "A transfer of wealth is happening right now. Are you ready?",
    "Wisdom is knowing when to take profit and when to hold.",
    "The Oracle sees a multiplier in your near future.",
    "Your Base Score is the map; your will is the compass.",
    "Avoid the noise of the crowd. The signal is quiet.",
    "Evolution requires burning the old to make way for the new.",
    "Every block added is a brick in your digital fortress.",
    "The Oracle is pleased with your activity. Fortune follows."
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
    const intro = lastChoice === 'accept' ? `🔮 I accept the Oracle's prophecy: "${oracleMessage}"` 
               : lastChoice === 'defy' ? `⚔️ I defy my fate! The prophecy was: "${oracleMessage}"`
               : `🔮 My Oracle Prophecy: "${oracleMessage}"`;

    const shareText = `${intro}\n\n🛡️ Base Score: ${txCount}\n✨ Oracle Score: ${oracleScore}\n\nWhat choice would you make?`;
    const targetUrl = "https://www.prosperitypass.xyz";
    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(targetUrl)}`;
    sdk.actions.openUrl(shareUrl);
  }, [oracleMessage, txCount, oracleScore, lastChoice]);

  const handleScoreUpdate = (choice: 'accept' | 'defy') => {
    if (!isUpdatingScore.current) {
      isUpdatingScore.current = true;
      setOracleScore(prev => prev + 100);
      setLastChoice(choice);
      setTimeout(() => { isUpdatingScore.current = false; }, 5000);
    }
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

  useEffect(() => {
    async function fetchAlchemyData() {
      const targetAddress = connectedAddress || user?.custodyAddress;
      if (targetAddress) {
        setIsLoadingTx(true);
        try {
          const data = await getRecentTransactions(targetAddress);
          setTransactions(data || []);
        } catch (err) { console.error("Alchemy error:", err); } 
        finally { setIsLoadingTx(false); }
      }
    }
    fetchAlchemyData();
  }, [connectedAddress, user]);

  return (
    <div className="min-h-screen bg-[#0052FF] text-white flex flex-col items-center p-4 font-sans overflow-x-hidden">
      <style jsx global>{`
        @keyframes floatSync {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes bounceHorizontal {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-10px); }
        }
        .animate-oracle-sync {
          animation: floatSync 3s ease-in-out infinite;
        }
        .animate-bounce-horizontal {
          animation: bounceHorizontal 1s infinite;
        }
      `}</style>

      <header className="w-full max-w-md flex justify-between items-center mb-4 px-2">
        <h1 className="text-sm font-black tracking-tighter italic opacity-80 uppercase">Score 5.0: Oracle</h1>
        <div className="scale-75 origin-right"><Wallet><ConnectWallet className="bg-white text-[#0052FF]" /></Wallet></div>
      </header>

      <main className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-[2.5rem] p-6 border border-white/20 shadow-2xl relative flex flex-col">
        
        {/* User Avatar */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative">
            {user?.pfpUrl ? (
              <img src={user.pfpUrl} alt="PFP" className="w-16 h-16 rounded-full border-4 border-white/30 shadow-xl" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-mono">?</div>
            )}
          </div>
          <h2 className="text-lg font-black mt-2 tracking-tight">{user ? `@${user.username}` : "Base Builder"}</h2>
        </div>

        {/* --- HOW TO PLAY SECTION --- */}
        <div className="flex flex-col items-center mb-4 space-y-1">
          <p className="text-[10px] font-black text-purple-300 uppercase tracking-[0.2em] animate-pulse">
            🔮 How to play:
          </p>
          <div className="flex items-center gap-2 bg-black/20 px-4 py-1.5 rounded-full border border-white/10">
            <p className="text-[11px] font-bold text-white uppercase italic">Tap Oracle to start</p>
            <span className="text-lg animate-bounce-horizontal">👈</span>
          </div>
        </div>

        {/* Oracle Prophecy Board */}
<div className="mb-4 bg-black/40 p-5 rounded-[1.5rem] border border-[#FF00FF]/50 relative min-h-[110px] flex items-center justify-center shadow-[0_0_15px_rgba(255,0,255,0.2)]">
  
  {/* Кнопка Оракула (она остается на месте слева) */}
  <button 
    onClick={getNewProphecy}
    className="absolute -left-8 top-1/2 -translate-y-1/2 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_20px_rgba(59,130,246,0.6)] flex items-center justify-center animate-oracle-sync hover:scale-110 active:scale-95 transition-all overflow-hidden z-20"
    style={{ width: '4.8rem', height: '4.8rem' }} 
  >
    <img src={TOKEN_IMAGE} className="w-full h-full object-cover" alt="Oracle" />
  </button>

  {/* ВТОРАЯ СТРЕЛКА: Она находится внутри темного блока и указывает на Оракула */}
  <div className="absolute left-12 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
    <span className="text-2xl animate-bounce-horizontal inline-block rotate-180">
      👉
    </span>
  </div>

  <div className="absolute -top-2.5 left-12 bg-[#0052FF] border border-[#FF00FF]/50 text-[9px] px-3 py-0.5 rounded-full font-bold uppercase tracking-widest text-white shadow-lg">
    Oracle Prophecy
  </div>
  
  <p className={`text-sm italic font-medium pl-12 pr-2 leading-relaxed text-center ${isOracleLoading ? 'animate-pulse opacity-50' : ''}`}>
    &quot;{oracleMessage}&quot;
  </p>
</div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-2">
          <div className="flex-1 animate-oracle-sync" style={{ animationDelay: '0.2s' }}>
            <Transaction 
              chainId={8453} 
              calls={[{ to: MY_WALLET_ADDRESS as `0x${string}`, value: BigInt(35000000000000), data: '0x' } as any]}
              onStatus={(s: any) => { if (s.statusName === 'success') handleScoreUpdate('accept'); }}
            >
              <TransactionButton 
                className="w-full bg-white !text-[#FF00FF] font-black py-4 rounded-2xl text-[10px] uppercase border-2 border-[#FF00FF] shadow-[0_0_10px_rgba(255,0,255,0.3)] hover:scale-105 transition-transform" 
                text="ACCEPT FATE" 
              />
            </Transaction>
          </div>

          <div className="flex-1 animate-oracle-sync" style={{ animationDelay: '0.4s' }}>
            <Transaction 
              chainId={8453} 
              calls={[{ to: MY_WALLET_ADDRESS as `0x${string}`, value: BigInt(35000000000000), data: '0x' } as any]}
              onStatus={(s: any) => { if (s.statusName === 'success') handleScoreUpdate('defy'); }}
            >
              <TransactionButton 
                className="w-full bg-white !text-[#0052FF] font-black py-4 rounded-2xl text-[10px] uppercase border-2 border-[#0052FF] shadow-[0_0_10px_rgba(0,82,255,0.3)] hover:scale-105 transition-transform" 
                text="DEFY THE PROPHECY" 
              />
            </Transaction>
          </div>
        </div>

        {/* Transaction Disclaimer */}
        <p className="text-[8px] text-center mb-4 text-white/40 uppercase tracking-wider font-bold">
          ⚔️ Actions above will <span className="text-purple-400">seal your destiny onchain</span> (requires gas)
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/30 rounded-[1.5rem] py-4 border border-white/10 text-center shadow-inner">
            <p className="text-[9px] uppercase opacity-50 mb-1 tracking-widest font-bold">Base Score</p>
            <p className="text-2xl font-mono font-black text-white">{txCount ?? "..."}</p>
          </div>
          <div className="bg-black/30 rounded-[1.5rem] py-4 border border-[#FF00FF]/20 text-center shadow-inner">
            <p className="text-[9px] uppercase opacity-50 mb-1 tracking-widest font-bold">Oracle Score</p>
            <p className="text-2xl font-mono font-black text-[#FF00FF] shadow-[#FF00FF]/20 shadow-sm">{oracleScore}</p>
          </div>
        </div>

        <button 
          onClick={handleShare} 
          className="w-full bg-white text-[#0052FF] font-black py-4 rounded-2xl text-xs shadow-xl mb-4 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tighter"
        >
          Share My Prophecy ↗
        </button>

        <p className="text-[9px] text-center mb-6 opacity-60 font-bold uppercase tracking-tight">
          Hold $USERBOX to boost your Oracle Score
        </p>

        <div className="mb-4 bg-black/20 rounded-[1.5rem] p-5 border border-white/5">
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 flex justify-between items-center">
            <span>Live Onchain Activity</span>
            <span className="text-blue-400">by Alchemy</span>
          </p>
          <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
            {isLoadingTx ? (
              <div className="text-[10px] text-white/30 text-center py-4 animate-pulse italic">Scanning ledger...</div>
            ) : transactions.length > 0 ? (
              transactions.slice(0, 3).map((tx: any, i: number) => (
                <div key={i} className="bg-white/5 border border-white/5 p-3 rounded-xl flex justify-between items-center text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{tx.asset === 'ETH' ? '🔵' : '📦'}</span>
                    <p className="font-bold opacity-80 uppercase tracking-tighter">{tx.category === 'erc721' ? 'NFT' : 'Transfer'}</p>
                  </div>
                  <p className="font-mono text-blue-400 font-bold">{parseFloat(tx.value).toFixed(4)} {tx.asset}</p>
                </div>
              ))
            ) : (
              <div className="text-[10px] text-white/20 text-center py-4">No recent activity detected</div>
            )}
          </div>
        </div>

        <footer className="text-center pb-2">
           <p className="text-[8px] text-white/30 uppercase tracking-[0.4em] font-bold">
             Powered by Base • Solo Building
           </p>
        </footer>
      </main>
    </div>
  );
}