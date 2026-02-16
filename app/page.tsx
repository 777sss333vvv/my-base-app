/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { sdk } from '@farcaster/frame-sdk';
import { Transaction, TransactionButton } from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import { useAccount, useConnect, usePublicClient } from 'wagmi';
import { getRecentTransactions } from './alchemy'; 

const MY_WALLET_ADDRESS = '0x31DB887337778319761330f79E4699a3f9A5F6c3'; 
const TREASURY_ADDRESS = '0x0039b008B0F0E60a7b42734147e52ca38c132416'; 
const TOKEN_IMAGE = "/oracle.png"; 

const TREASURY_ABI = [
  {
    "inputs": [],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export default function Page() {
  const [user, setUser] = useState<any>(null);
  const [txCount, setTxCount] = useState<number | null>(null);
  const [oracleScore, setOracleScore] = useState<number>(1250); 
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const [oracleMessage, setOracleMessage] = useState("Tap the Oracle and get a prophecy");
  const [isOracleLoading, setIsOracleLoading] = useState(false);
  const [lastChoice, setLastChoice] = useState<'accept' | 'defy' | null>(null);
  const [showBonus, setShowBonus] = useState<{show: boolean, text: string}>({show: false, text: ""});
  const [isBonusClaimed, setIsBonusClaimed] = useState(false);
  
  // СОСТОЯНИЯ ДЛЯ КЛЕЙМА
  const [hasClaimedTokens, setHasClaimedTokens] = useState(false); 
  const [isProphecyReceived, setIsProphecyReceived] = useState(false); 
  
  const { isConnected, address: connectedAddress } = useAccount();
  const { connect, connectors } = useConnect();
  const publicClient = usePublicClient();

  useEffect(() => {
    const savedScore = localStorage.getItem('oracle_score_v5');
    if (savedScore) setOracleScore(Number(savedScore));
    
    const claimed = localStorage.getItem('oracle_loyalty_v1');
    if (claimed === 'true') setIsBonusClaimed(true);

    // Проверка таймера клейма (24 часа)
    const lastClaim = localStorage.getItem('last_userbox_claim_v1');
    if (lastClaim) {
      const hoursSince = (Date.now() - Number(lastClaim)) / (1000 * 60 * 60);
      if (hoursSince < 24) setHasClaimedTokens(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('oracle_score_v5', oracleScore.toString());
  }, [oracleScore]);

  const triggerBonus = useCallback((text: string) => {
    setShowBonus({ show: true, text });
    setTimeout(() => setShowBonus({ show: false, text: "" }), 4000);
  }, []);

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
    "The bridge to financial freedom is built with code and soul.",
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
    "Every block added is a brick in your digital fortress.",
    "Diamond hands are forged in the heat of the market. Hold tight.",
    "Love is on-chain today. Build with heart, trade with mind.",
    "Your loyalty to the protocol will be rewarded in the next cycle.",
    "The Oracle is pleased with your activity. Fortune follows."
  ], []);

  const getNewProphecy = () => {
    if (isOracleLoading) return;
    setIsOracleLoading(true);
    setTimeout(() => {
      const randomMsg = prophecies[Math.floor(Math.random() * prophecies.length)];
      setOracleMessage(randomMsg);
      setIsOracleLoading(false);
      setIsProphecyReceived(true); // Открываем кнопку клейма
    }, 600);
  };

const handleShare = useCallback(() => {
    const intro = lastChoice === 'accept' ? `🔮 I accept the Oracle's prophecy: "${oracleMessage}"` 
               : lastChoice === 'defy' ? `⚔️ I defy my fate! The prophecy was: "${oracleMessage}"`
               : `🔮 My Oracle Prophecy: "${oracleMessage}"`;

    const shareText = `${intro}\n\n` +
                      `🛡️ Base Score: ${txCount}\n` +
                      `✨ Oracle Score: ${oracleScore}\n\n` +
                      `🎁 Get your daily 10,000 $USERBOX!\n` +
                      `Tap the Oracle's head & hit "Claim".\n\n` +
                      `Want more score? Accept or Defy your fate inside! ⚡`;

    const targetUrl = "https://www.prosperitypass.xyz";
    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(targetUrl)}`;
    sdk.actions.openUrl(shareUrl);
  }, [oracleMessage, txCount, oracleScore, lastChoice]);

  const handleScoreUpdate = useCallback((choice: 'accept' | 'defy', txHash: string) => {
    if (!txHash) return;
    const usedHashes = JSON.parse(localStorage.getItem('oracle_used_hashes_v1') || '[]');
    if (usedHashes.includes(txHash)) return;
    usedHashes.push(txHash);
    localStorage.setItem('oracle_used_hashes_v1', JSON.stringify(usedHashes));
    setOracleScore(prev => prev + 100);
    setLastChoice(choice);
    triggerBonus("+100 ORACLE SCORE");
  }, [triggerBonus]);

  const handleAddApp = async () => {
    if (isBonusClaimed) return;
    try {
        await sdk.actions.addFrame();
        setOracleScore(prev => prev + 250);
        triggerBonus("+250 LOYALTY BONUS");
        localStorage.setItem('oracle_loyalty_v1', 'true');
        setIsBonusClaimed(true);
    } catch (e) { console.error(e); }
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
        } catch (err) { console.error(err); } 
        finally { setIsLoadingTx(false); }
      }
    }
    fetchAlchemyData();
  }, [connectedAddress, user]);

  return (
    <div className="min-h-screen bg-[#0052FF] text-white flex flex-col items-center p-4 font-sans overflow-x-hidden relative">
      <style jsx global>{`
        @keyframes floatSync { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes bounceHorizontal { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-10px); } }
        @keyframes fadeUpCenter {
            0% { opacity: 0; transform: translate(-50%, 20px); }
            15% { opacity: 1; transform: translate(-50%, 0); }
            85% { opacity: 1; transform: translate(-50%, 0); }
            100% { opacity: 0; transform: translate(-50%, -20px); }
        }
        .animate-oracle-sync { animation: floatSync 3s ease-in-out infinite; }
        .animate-bounce-horizontal { animation: bounceHorizontal 1s infinite; }
        .animate-fade-center { animation: fadeUpCenter 4s forwards; }
        .animate-slide-up { animation: slideUp 0.4s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {showBonus.show && (
          <div style={{ zIndex: 10000 }} className="fixed top-24 left-1/2 bg-white text-[#FF00FF] px-8 py-3 rounded-full font-black text-lg shadow-[0_10px_40px_rgba(0,0,0,0.3)] animate-fade-center border-4 border-[#FF00FF] whitespace-nowrap pointer-events-none">
              {showBonus.text} 🔮
          </div>
      )}

      <header className="w-full max-w-md flex justify-between items-center mb-4 px-2">
        <h1 className="text-sm font-black italic opacity-80 uppercase tracking-tighter">Score 5.0: Oracle</h1>
        <div className="scale-75 origin-right"><Wallet><ConnectWallet className="bg-white text-[#0052FF]" /></Wallet></div>
      </header>

      <main className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-[2.5rem] p-6 border border-white/20 shadow-2xl relative flex flex-col">
        
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

        <div className="mb-4 bg-black/40 p-5 rounded-[1.5rem] border border-[#FF00FF]/50 relative min-h-[110px] flex items-center justify-center shadow-[0_0_15px_rgba(255,0,255,0.2)]">
          <button onClick={getNewProphecy} className="absolute -left-8 top-1/2 -translate-y-1/2 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_20px_rgba(59,130,246,0.6)] flex items-center justify-center animate-oracle-sync hover:scale-110 transition-all z-20 overflow-hidden ring-4 ring-blue-500/20" style={{ width: '4.8rem', height: '4.8rem' }}>
            <img src={TOKEN_IMAGE} className="w-full h-full object-cover rounded-full" alt="Oracle" />
          </button>
          <div className="absolute left-12 top-1/2 -translate-y-1/2 z-30 pointer-events-none animate-bounce-horizontal text-2xl">👈</div>
          <div className="absolute -top-2.5 left-12 bg-[#0052FF] border border-[#FF00FF]/50 text-[9px] px-3 py-0.5 rounded-full font-bold uppercase text-white shadow-lg">Oracle Prophecy</div>
          <p className="text-sm italic font-medium pl-12 pr-2 leading-relaxed text-center italic">
            &quot;{oracleMessage}&quot;
          </p>
        </div>

        <div className="flex gap-3 mb-2">
          <div className="flex-1">
            <Transaction chainId={8453} calls={[{ to: MY_WALLET_ADDRESS as `0x${string}`, value: BigInt(35000000000000), data: '0x' } as any]} onSuccess={(res: any) => {
                const h = res.transactionReceipts?.[0]?.transactionHash || res.transactionHash;
                if (h) handleScoreUpdate('accept', h);
            }}>
              <TransactionButton className="w-full bg-white !text-[#FF00FF] font-black py-4 rounded-2xl text-[10px] uppercase border-2 border-[#FF00FF]" text="ACCEPT FATE (+100)" />
            </Transaction>
          </div>
          <div className="flex-1">
            <Transaction chainId={8453} calls={[{ to: MY_WALLET_ADDRESS as `0x${string}`, value: BigInt(35000000000000), data: '0x' } as any]} onSuccess={(res: any) => {
                const h = res.transactionReceipts?.[0]?.transactionHash || res.transactionHash;
                if (h) handleScoreUpdate('defy', h);
            }}>
              <TransactionButton className="w-full bg-white !text-[#0052FF] font-black py-4 rounded-2xl text-[10px] uppercase border-2 border-[#0052FF]" text="DEFY FATE (+100)" />
            </Transaction>
          </div>
        </div>

        {!isBonusClaimed ? (
          <button onClick={handleAddApp} className="mb-4 w-full bg-black/40 border border-[#0052FF]/50 py-3 rounded-2xl text-[10px] font-black uppercase text-blue-400">
            ➕ Add App to Farcaster (+250 BONUS)
          </button>
        ) : (
          <div className="mb-4 w-full py-3 text-[10px] text-green-400 font-black uppercase text-center border border-green-400/20 rounded-2xl bg-green-400/5">
            ✅ Loyalty Bonus Claimed
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/30 rounded-[1.5rem] py-4 border border-white/10 text-center">
            <p className="text-[9px] uppercase opacity-50 mb-1 font-bold">Base Score</p>
            <p className="text-2xl font-mono font-black text-white">{txCount ?? "..."}</p>
          </div>
          <div className="bg-black/30 rounded-[1.5rem] py-4 border border-[#FF00FF]/20 text-center">
            <p className="text-[9px] uppercase opacity-50 mb-1 font-bold">Oracle Score</p>
            <p className="text-2xl font-mono font-black text-[#FF00FF]">{oracleScore}</p>
          </div>
        </div>

<button onClick={handleShare} className="w-full bg-white text-[#0052FF] font-black py-4 rounded-2xl text-xs mb-4 uppercase shadow-xl">
          Share My Prophecy ↗
        </button>

        {/* НОВАЯ СЕКЦИЯ КЛЕЙМА С ПОДСКАЗКАМИ */}
        <div className="mb-4">
          <div className="text-center mb-2 animate-slide-up">
            {!isProphecyReceived ? (
              <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                <span className="text-red-500 text-lg mr-1">●</span> Step 1: Tap the Oracle Head
              </p>
            ) : !hasClaimedTokens ? (
              <p className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">
                <span className="text-green-500 text-lg mr-1">●</span> Step 2: Claim your tokens!
              </p>
            ) : null}
          </div>

          {!hasClaimedTokens ? (
            isProphecyReceived ? (
              <div className="animate-slide-up">
                <Transaction 
                  chainId={8453} 
                  calls={[
                    { 
                      to: "0x0039b008B0F0E60a7b42734147e52ca38c132416", 
                      data: "0x4e71d92d", 
                      value: BigInt(0)
                    }
                  ]}
                  onSuccess={() => {
                    setHasClaimedTokens(true);
                    localStorage.setItem('last_userbox_claim_v1', Date.now().toString());
                    triggerBonus("10,000 $USERBOX RECEIVED!");
                  }}
                >
                  <TransactionButton 
                    className="w-full bg-gradient-to-r from-[#FF00FF] to-[#0052FF] !text-white font-black py-4 rounded-2xl text-xs uppercase shadow-xl border-2 border-white/20" 
                    text="🎁 Claim 10,000 $USERBOX" 
                  />
                </Transaction>
              </div>
            ) : (
              <button 
                onClick={getNewProphecy}
                className="w-full bg-black/40 border-2 border-white/10 text-white/40 font-black py-4 rounded-2xl text-[10px] uppercase cursor-pointer hover:border-white/30 transition-all"
              >
                👇 Tap Oracle Head to Unlock Claim
              </button>
            )
          ) : (
            <div className="animate-slide-up">
              <button disabled className="w-full bg-green-500/10 border-2 border-green-500/30 text-green-400 font-black py-4 rounded-2xl text-[10px] uppercase cursor-not-allowed">
                ✅ $USERBOX Claimed (Back in 24h)
              </button>
            </div>
          )}
        </div>

        <div className="bg-black/20 rounded-[1.5rem] p-5 border border-white/5">
          <p className="text-[8px] font-black uppercase text-white/40 mb-4 flex justify-between">
            <span>Live Onchain Activity</span>
            <span className="text-blue-400">by Alchemy</span>
          </p>
          <div className="space-y-2 max-h-[100px] overflow-y-auto pr-1 text-[10px]">
            {transactions.slice(0, 3).map((tx: any, i: number) => (
                <div key={i} className="bg-white/5 border border-white/5 p-3 rounded-xl flex justify-between items-center">
                  <p className="font-bold opacity-80 uppercase">{tx.asset}</p>
                  <p className="font-mono text-blue-400 font-bold">{parseFloat(tx.value).toFixed(4)}</p>
                </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="mt-8 mb-10 text-center opacity-40">
        <p className="text-[9px] uppercase tracking-[0.4em] font-bold">Powered by Base • Solo Building</p>
      </footer>
    </div>
  );
}