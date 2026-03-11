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
const TREASURY_ADDRESS = '0x2dAbB90b88AAA212cfa01913d2C9a7D7fC592e49'; 
const TOKEN_IMAGE = "/oracle.png"; 

const TREASURY_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "lastClaimTime",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes", "name": "signature", "type": "bytes" }],
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
  
  // Состояния для подписи и времени
  const [oracleSignature, setOracleSignature] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [lastClaimTime, setLastClaimTime] = useState<bigint>(0n);
  
  const { isConnected, address: connectedAddress } = useAccount();
  const { connect, connectors } = useConnect();
  const publicClient = usePublicClient();

  useEffect(() => {
    const savedScore = localStorage.getItem('oracle_score_v5');
    if (savedScore) setOracleScore(Number(savedScore));
    const claimed = localStorage.getItem('oracle_loyalty_v1');
    if (claimed === 'true') setIsBonusClaimed(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('oracle_score_v5', oracleScore.toString());
  }, [oracleScore]);

  const triggerBonus = useCallback((text: string) => {
    setShowBonus({ show: true, text });
    setTimeout(() => setShowBonus({ show: false, text: "" }), 4000);
  }, []);

  // 1. ПОЛУЧЕНИЕ ВРЕМЕНИ ИЗ КОНТРАКТА
  const fetchContractData = useCallback(async () => {
    const targetAddress = connectedAddress || user?.custodyAddress;
    if (targetAddress && publicClient) {
      try {
        const time = await publicClient.readContract({
          address: TREASURY_ADDRESS as `0x${string}`,
          abi: TREASURY_ABI,
          functionName: 'lastClaimTime',
          args: [targetAddress as `0x${string}`],
        });
        setLastClaimTime(time as bigint);
      } catch (e) {
        console.error("Error reading lastClaimTime", e);
      }
    }
  }, [connectedAddress, user, publicClient]);

  useEffect(() => {
    fetchContractData();
  }, [fetchContractData]);

  // 2. ПОЛУЧЕНИЕ ПОДПИСИ
  const getSignatureFromOracle = async () => {
    const targetAddress = connectedAddress || user?.custodyAddress;
    
    if (!targetAddress) {
      alert("Status: Address Missing");
      return;
    }

    alert("Stage A: Requesting Signature...");
    setIsSigning(true);

    try {
      const response = await fetch('/api/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userAddress: targetAddress,
          lastClaimTime: lastClaimTime.toString() // Теперь передается актуальное время
        }),
      });
      
      const data = await response.json();
      
      if (data.signature) {
        setOracleSignature(data.signature);
        triggerBonus("ORACLE SIGNED V3");
        alert("Stage B: Signature Received");
      } else {
        alert("Stage C: API Error - " + (data.error || data.details || "Unknown"));
      }
    } catch (err) {
      alert("Stage D: Network Error");
      console.error("Signing failed", err);
    } finally {
      setIsSigning(false);
    }
  };

  const prophecies = useMemo(() => [
    "The Oracle has recalibrated. The $USERBOX era begins now. 🔮",
    "The signals have formed a constellation. Your path is now illuminated by the Oracle's light. ✨",
    "Base is the soil, $USERBOX is the seed. Watch it break the surface. 🌱",
    "The Treasury is breathing. Can you hear the rhythm of the chain? 💎",
    "The zero is a veil. Beyond it lies the true destiny of $USERBOX. 🗝️",
    "Silence in the charts is the Oracle’s meditation. 🧘‍♂️",
    "Every claim is a pact. Every transaction is a prayer. 📜",
    "The stars over Base align. A new liquidity tide is coming. 🌊",
    "Oracle Score is the currency of the wise. Build yours. 📈",
    "A surge of energy is detected. The Base network is waking up. ⚡",
    "The prophecy is carved in code. It cannot be erased. 🛠️",
    "Your Oracle Score is your shield against the bear. 🐻",
    "Hold the fragment. Become the legend. $USERBOX. 🏆"
  ], []);

  const getNewProphecy = () => {
    if (isOracleLoading) return;
    setIsOracleLoading(true);
    setTimeout(() => {
      const randomMsg = prophecies[Math.floor(Math.random() * prophecies.length)];
      setOracleMessage(randomMsg);
      setIsOracleLoading(false);
      getSignatureFromOracle();
    }, 600);
  };

  const handleShare = useCallback(() => {
    const intro = lastChoice === 'accept' ? `🔮 I accept the Oracle's prophecy: "${oracleMessage}"` 
                 : lastChoice === 'defy' ? `⚔️ I defy my fate! The prophecy was: "${oracleMessage}"`
                 : `🔮 My Oracle Prophecy: "${oracleMessage}"`;

    const shareText = `${intro}\n\n` +
                      `🛡️ Base Score: ${txCount ?? 0}\n` +
                      `✨ Oracle Score: ${oracleScore}\n\n` +
                      `🎁 Claiming my daily $USERBOX V3 reward!\n` + 
                      `Tap the Oracle's head & hit "Claim".\n\n` +
                      `Want more score? Accept or Defy your fate inside! ⚡`;

    const targetUrl = "https://www.prosperitypass.xyz";
    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(targetUrl)}`;
    sdk.actions.openUrl(shareUrl);
  }, [oracleMessage, txCount, oracleScore, lastChoice]);

  const handleScoreUpdate = useCallback((choice: 'accept' | 'defy', txHash: string) => {
    if (!txHash) return;
    setOracleScore(prev => prev + 100);
    setLastChoice(choice);
    triggerBonus("+100 ORACLE SCORE");
    fetchContractData(); // Обновляем данные контракта после транзакции
  }, [triggerBonus, fetchContractData]);

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
      `}</style>

      {showBonus.show && (
          <div style={{ zIndex: 10000 }} className="fixed top-24 left-1/2 bg-white text-[#FF00FF] px-8 py-3 rounded-full font-black text-lg shadow-[0_10px_40px_rgba(0,0,0,0.3)] animate-fade-center border-4 border-[#FF00FF] whitespace-nowrap pointer-events-none">
              {showBonus.text} 🔮
          </div>
      )}

      <header className="w-full max-w-md flex justify-between items-center mb-4 px-2">
        <h1 className="text-sm font-black italic opacity-80 uppercase tracking-tighter">Score 5.5: Oracle V3</h1>
        <div className="scale-75 origin-right"><Wallet><ConnectWallet className="bg-white text-[#0052FF]" /></Wallet></div>
      </header>

      <main className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-[2.5rem] p-6 border border-white/20 shadow-2xl relative flex flex-col">
        
        <div className="flex flex-col items-center text-center mb-6">
          <img src={user?.pfpUrl || "/oracle.png"} alt="PFP" className="w-16 h-16 rounded-full border-4 border-white/30 shadow-xl" />
          <h2 className="text-lg font-black mt-2 tracking-tight">{user ? `@${user.username}` : "Base Builder"}</h2>
        </div>

        <div className="mb-4 bg-black/40 p-5 rounded-[1.5rem] border border-[#FF00FF]/50 relative min-h-[110px] flex items-center justify-center shadow-[0_0_15px_rgba(255,0,255,0.2)]">
          <button onClick={getNewProphecy} className="absolute -left-8 top-1/2 -translate-y-1/2 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_20px_rgba(59,130,246,0.6)] flex items-center justify-center animate-oracle-sync hover:scale-110 transition-all z-20 overflow-hidden" style={{ width: '4.8rem', height: '4.8rem' }}>
            <img src={TOKEN_IMAGE} className="w-full h-full object-cover rounded-full" alt="Oracle" />
          </button>
          <p className="text-sm italic font-medium pl-12 pr-2 text-center">&quot;{oracleMessage}&quot;</p>
        </div>

        <div className="flex gap-3 mb-4">
          <Transaction chainId={8453} calls={[{ to: MY_WALLET_ADDRESS as `0x${string}`, value: BigInt(35000000000000), data: '0x' } as any]} onSuccess={(res: any) => handleScoreUpdate('accept', res.transactionHash)}>
            <TransactionButton className="w-full bg-white !text-[#FF00FF] font-black py-4 rounded-2xl text-[10px] uppercase border-2 border-[#FF00FF]" text="FAITH (+100)" />
          </Transaction>
          <Transaction chainId={8453} calls={[{ to: MY_WALLET_ADDRESS as `0x${string}`, value: BigInt(35000000000000), data: '0x' } as any]} onSuccess={(res: any) => handleScoreUpdate('defy', res.transactionHash)}>
            <TransactionButton className="w-full bg-white !text-[#0052FF] font-black py-4 rounded-2xl text-[10px] uppercase border-2 border-[#0052FF]" text="DEFY (+100)" />
          </Transaction>
        </div>

        {/* КНОПКА КЛЕЙМА V3 */}
        <div className="mb-6">
          {oracleSignature ? (
            <Transaction 
              chainId={8453} 
              calls={[{ 
                to: TREASURY_ADDRESS as `0x${string}`, 
                abi: TREASURY_ABI, 
                functionName: 'claim', 
                args: [oracleSignature as `0x${string}`] 
              }]}
            >
              <TransactionButton 
                className="w-full bg-gradient-to-r from-green-400 to-blue-500 !text-white font-black py-5 rounded-2xl text-xs uppercase shadow-[0_0_20px_rgba(74,222,128,0.4)]" 
                text="Claim 15,000 $USERBOX (V3)" 
              />
            </Transaction>
          ) : (
            <button 
              onClick={getNewProphecy}
              disabled={isSigning}
              className="w-full bg-gray-500/20 border-2 border-white/10 text-white/40 font-black py-4 rounded-2xl text-[10px] uppercase transition-all"
            >
              {isSigning ? "Oracle is signing..." : "Tap Oracle Head to Unlock Claim"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/30 rounded-[1.5rem] py-4 border border-white/10 text-center">
            <p className="text-[9px] uppercase opacity-50 mb-1 font-bold">Wallet Rank</p>
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

        <div className="bg-black/20 rounded-[1.5rem] p-5 border border-white/5">
          <p className="text-[8px] font-black uppercase text-white/40 mb-4 flex justify-between">
            <span>Live Activity</span>
            <span className="text-blue-400">by Alchemy</span>
          </p>
          <div className="space-y-2 max-h-[100px] overflow-y-auto text-[10px]">
            {transactions.slice(0, 3).map((tx: any, i: number) => (
                <div key={i} className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-white/5">
                  <p className="font-bold uppercase opacity-80">{tx.asset}</p>
                  <p className="font-mono text-blue-400 font-bold">{parseFloat(tx.value).toFixed(4)}</p>
                </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="mt-8 mb-10 text-center opacity-40">
        <p className="text-[9px] uppercase tracking-[0.4em] font-bold">Powered by Base • V3 Secure</p>
      </footer>
    </div>
  );
}