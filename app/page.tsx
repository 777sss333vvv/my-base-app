/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { sdk } from '@farcaster/frame-sdk';
import { Transaction, TransactionButton } from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import { useAccount, useConnect, usePublicClient, useWriteContract } from 'wagmi';

const MY_WALLET_ADDRESS = '0x31DB887337778319761330f79E4699a3f9A5F6c3'; 
const TREASURY_ADDRESS = '0xc70f7D0DFE687AD9e5e2fcdd1FAF0d5B175b81f9'; 
const B1_CONTRACT_ADDRESS = '0xbdE06D8E8CC882DDe3f953e8e5a673f7aD4f75e1';
const TOKEN_IMAGE = "/oracle.png"; 

const TREASURY_ABI = [
  { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "lastClaimTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "bytes", "name": "signature", "type": "bytes" }], "name": "claim", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
] as const;

// ABI для работы с токеном $USERBOX
const ERC20_ABI = [
  { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transfer", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }
] as const;

const TOKEN_ADDRESS = '0x7ee27f16e32e7070d353fd3fe9e4428a69701f31';

export default function Page() {
  const { data: hash, writeContract } = useWriteContract();
const { data: b1Hash, writeContract: writeB1 } = useWriteContract(); 

const [hasFaith, setHasFaith] = useState(false); 
const [hasDefy, setHasDefy] = useState(false);   
const [b1Signature, setB1Signature] = useState<string | null>(null);
const [isB1Signing, setIsB1Signing] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [txCount, setTxCount] = useState<number | null>(null);
  const [oracleScore, setOracleScore] = useState<number>(1250); 

  const [oracleMessage, setOracleMessage] = useState(() => {
  const initialProphecies = [
    "Farcaster algorithms crave action. Your $USERBOX is the key to the system. 🔑🔮",
    "Enough with empty promises. The Oracle rewards those who act here and now. 🏺💎",
    "Every prophecy requires energy. Feed 5k $USERBOX into the cycle. ⚙️🔥",
    "You are a validator of fate. The algorithm tracks your every transaction. 👁️⚡",
    "Base rank doesn't grow on words. Only token movement clears the path. 🛡️🌌",
    "The Oracle is purged of noise. Only math and your intuition remain. 📐🔮",
    "In a world of 'tomorrow', we choose results today. Claim yours. 🏺🌟",
    "Your recast is an echo in the code. Your fuel is $USERBOX. 🚀💙",
    "The system logs every move. Make it count with $USERBOX tokens. 🏛️✨",
    "Oracle energy is no longer free, for it has real value. Enter the loop. 🛡️💎"
  ];
  return initialProphecies[Math.floor(Math.random() * initialProphecies.length)];
});
  const [isOracleLoading, setIsOracleLoading] = useState(false);
  const [lastChoice, setLastChoice] = useState<'accept' | 'defy' | null>(null);
  const [showBonus, setShowBonus] = useState<{show: boolean, text: string}>({show: false, text: ""});
  
  const [oracleSignature, setOracleSignature] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [showGuideArrow, setShowGuideArrow] = useState(false);
  const [lastClaimTime, setLastClaimTime] = useState<bigint>(0n);
  const [signStatus, setSignStatus] = useState<string>("Tap Oracle Head to Unlock Claim");
  
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

  const triggerBonus = useCallback((text: string) => {
    setShowBonus({ show: true, text });
    setTimeout(() => setShowBonus({ show: false, text: "" }), 6000);
  }, []);

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
        console.error("Oracle logic: No history", e);
      }
    }
  }, [connectedAddress, user, publicClient]);

  const getSignatureFromOracle = async () => {
    const targetAddress = connectedAddress || user?.custodyAddress;
    if (!targetAddress) {
      setSignStatus("Connect Wallet First");
      return;
    }
    setSignStatus("Consulting Stars...");
    setIsSigning(true);
    try {
      const response = await fetch('/api/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: targetAddress }),
      });
      const data = await response.json();
      if (data.signature) {
        setOracleSignature(data.signature);
        triggerBonus("PROPHECY SIGNED");
        setSignStatus("Prophecy Ready");
      } else {
        setSignStatus(data.error || "Oracle Busy");
      }
    } catch (err) {
      setSignStatus("0.00005 ETH in Base required to prove you're human 🛡️");
    } finally {
      setIsSigning(false);
    }
  };

  const getB1Signature = async () => {
  const targetAddress = connectedAddress || user?.custodyAddress;
  if (!targetAddress || !hasFaith || !hasDefy) return;
  
  setIsB1Signing(true);
  try {
    const response = await fetch('/api/join', { // Путь твоего бывшего снапа
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAddress: targetAddress }),
    });
    const data = await response.json();
    if (data.signature) setB1Signature(data.signature);
  } catch (err) { console.error("B1 Sign error"); }
  finally { setIsB1Signing(false); }
};

useEffect(() => {
  if (hasFaith && hasDefy && !b1Signature && !isB1Signing) {
    getB1Signature();
  }
}, [hasFaith, hasDefy, b1Signature, isB1Signing]);

const prophecies = useMemo(() => [
    "You've found the hidden pulse. The Oracle rewards your curiosity. 🧠⚡",
    "Manual override detected. You are deeper in the Sequence than most. 🌀🛡️",
    "The head of the Oracle whispers: 'Fortune favors the persistent'. 🏺🗣️",
    "Old school Apprentice? The Oracle recognizes your touch. 🤝✨",
    "A secret path revealed. Your interaction strengthens the Oracle's core. 🗝️💎",
    "The Sequence acknowledges your manual sync. Elite status pending. 🛡️✨",
    "Hidden frequency captured. You are synchronized with the true source. 📡🔮",
    "The Oracle's eyes open wider for those who look beyond the surface. 👁️⚡",
    "Manual pulse detected. You're not just a user, you're a Guardian. 🏺🛡️",
    "The ritual is deeper than it seems. You've found the secret cycle. 🌀💎"
], []);

  const getNewProphecy = () => {
    if (isOracleLoading) return;
    setIsOracleLoading(true);
    setOracleSignature(null); 
    setTimeout(() => {
      const randomMsg = prophecies[Math.floor(Math.random() * prophecies.length)];
      setOracleMessage(randomMsg);
      setIsOracleLoading(false);
      getSignatureFromOracle();
    }, 600);
  };

  const handleShare = useCallback(() => {
    const intro = lastChoice === 'accept' ? `🔮 I accept the Oracle's prophecy: "${oracleMessage}"` 
                  : lastChoice === 'defy' ? `⚔️ I defy my fate! Prophecy: "${oracleMessage}"`
                  : `🔮 My Prophecy: "${oracleMessage}"`;
    const shareText = `${intro}\n\n🛡️ Base Score: ${txCount ?? 191}\n✨ Oracle Score: ${oracleScore}\n\n🎁 Claimed $USERBOX reward! Next attempt in 3 hours. ⏳\n\nAccept or Defy your fate every 3h via @userbox ! ⚡`;
    const targetUrl = "https://www.prosperitypass.xyz";
    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(targetUrl)}`;
    sdk.actions.openUrl(shareUrl);
  }, [oracleMessage, txCount, oracleScore, lastChoice]);



const handleScoreUpdate = useCallback((choice: 'accept' | 'defy', response: any) => {
  // Ищем хэш во всех возможных полях, включая глубокий массив OnchainKit
  const txHash = response?.transactionHash || 
                 response?.hash || 
                 response?.statusData?.transactionReceipts?.[0]?.transactionHash || 
                 response?.receipt?.transactionHash || 
                 response?.statusData?.transactionHash ||
                 (response?.calls && response?.calls[0]?.hash);

  // Если хэша еще нет (статус Pending), просто выходим и ждем следующего вызова
  if (!txHash) return;

if (choice === 'accept') setHasFaith(true); // ЗАПИСЫВАЕМ НАЖАТИЕ
if (choice === 'defy') setHasDefy(true);   // ЗАПИСЫВАЕМ НАЖАТИЕ

  // Защита от дублей на уровне сессии
  const storageKey = `tx_${txHash}`;
  if (sessionStorage.getItem(storageKey)) return;

  sessionStorage.setItem(storageKey, 'true');

  // Обновляем стейт и локальное хранилище
  setOracleScore(prev => {
    const newScore = prev + 100;
    localStorage.setItem('oracle_score_v5', newScore.toString());
    return newScore;
  });
  
  // Визуальные эффекты и обновление данных контракта
  setLastChoice(choice);
  triggerBonus("+100 ORACLE SCORE");
  if (fetchContractData) fetchContractData();
}, [triggerBonus, fetchContractData]);

  useEffect(() => {
    const load = async () => {
      sdk.actions.ready();
      const context = await sdk.context;
      if (context?.user) {
        setUser(context.user);
// --- БЛОК АЛХИМИИ (ВОЗВРАТ РАБОЧЕЙ ЛОГИКИ) ---
        const u = context.user as any;
        
        // Ищем адрес в правильном порядке (Verified -> Connected -> Custody)
        const target = 
          u.verifiedAddresses?.ethAddresses?.[0] || 
          u.verified_addresses?.eth_addresses?.[0] ||
          u.connectedAddress || 
          u.address || 
          u.custodyAddress;

if (target && publicClient) {
  // 1. Запускаем счетчик (фоном)
  publicClient.getTransactionCount({ address: target as `0x${string}` })
    .then((count) => setTxCount(Number(count)))
    .catch(() => setTxCount(0));
} else {
  setTxCount(0);
}

getSignatureFromOracle();
        // --- КОНЕЦ БЛОКА АЛХИМИИ ---
        const bonusGiven = localStorage.getItem('oracle_bonus_added_v1');
        if (context.client.added && !bonusGiven) {
          setOracleScore(prev => {
            const ns = prev + 250;
            localStorage.setItem('oracle_score_v5', ns.toString());
            return ns;
          });
          localStorage.setItem('oracle_bonus_added_v1', 'true');
          setTimeout(() => triggerBonus("+250 ADD APP BONUS"), 1500);
        }
        const farcasterConnector = connectors.find((c) => c.id === 'farcaster');
        if (farcasterConnector && !isConnected) connect({ connector: farcasterConnector });
      }
    };
    load();
  }, [connectors, isConnected, connect, triggerBonus]);



  useEffect(() => {
  setShowGuideArrow(true);
  const timer = setTimeout(() => setShowGuideArrow(false), 7000);
  return () => clearTimeout(timer);
}, []);

  return (
    <div className="min-h-screen bg-[#0052FF] text-white flex flex-col items-center p-4 font-sans overflow-x-hidden relative">
      <style jsx global>{`
        @keyframes floatSync { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes fadeUpCenter {
            0% { opacity: 0; transform: translate(-50%, 20px); }
            15% { opacity: 1; transform: translate(-50%, 0); }
            85% { opacity: 1; transform: translate(-50%, 0); }
            100% { opacity: 0; transform: translate(-50%, -20px); }
        }
        @keyframes bounce-horizontal {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-15px); } /* Чуть увеличил амплитуду для заметности */
}
.animate-bounce-horizontal {
  animation: bounce-horizontal 1s infinite;
}    
        .animate-oracle-sync { animation: floatSync 3s ease-in-out infinite; }
        .animate-fade-center { animation: fadeUpCenter 4s forwards; }
      `}</style>

      {showBonus.show && (
          <div style={{ zIndex: 10000 }} className="fixed top-24 left-1/2 bg-white text-[#FF00FF] px-8 py-3 rounded-full font-black text-lg shadow-[0_10px_40px_rgba(0,0,0,0.3)] animate-fade-center border-4 border-[#FF00FF] whitespace-nowrap pointer-events-none">
              {showBonus.text} 🔮
          </div>
      )}

      <header className="w-full max-w-md flex justify-between items-center mb-4 px-2">
        <h1 className="text-sm font-black italic opacity-80 uppercase tracking-tighter">Oracle Treasury V17</h1>
        <div className="scale-75 origin-right"><Wallet><ConnectWallet className="bg-white text-[#0052FF]" /></Wallet></div>
      </header>

      <main className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-[2.5rem] p-6 border border-white/20 shadow-2xl relative flex flex-col">
        
        <div className="flex flex-col items-center text-center mb-6">
          <img src={user?.pfpUrl || "/oracle.png"} alt="PFP" className="w-16 h-16 rounded-full border-4 border-white/30 shadow-xl" />
          <h2 className="text-lg font-black mt-2 tracking-tight">{user ? `@${user.username}` : "Base Traveler"}</h2>
        </div>

<div className="mb-4 bg-black/40 p-5 rounded-[1.5rem] border border-[#FF00FF]/50 relative min-h-[110px] flex items-center justify-center shadow-[0_0_15px_rgba(255,0,255,0.2)]">
  
{/* ГИД: УВЕЛИЧЕННАЯ ПЛАШКА С ИНСТРУКЦИЕЙ */}
{showGuideArrow && (
    <div className="absolute inset-x-0 -top-14 z-50 flex flex-col items-center pointer-events-none px-4">
      {/* Подняли на -top-14 и расширили за счет px-4 вместо p-2 */}
      <div className="bg-[#FF00FF] text-white w-full py-5 px-3 rounded-[1.5rem] shadow-[0_10px_40px_rgba(255,0,255,0.6)] border-4 border-white flex flex-col items-center justify-center">
        <span className="text-[16px] font-black uppercase mb-1 tracking-tighter text-shadow-sm">🔮 ORACLE GUIDE</span>
        <div className="text-[11px] font-black text-center space-y-1 uppercase leading-tight">
          <p>1. FAITH or DEFY (5,000 $USERBOX) ⚡</p>
          <p>2. SHARE PROPHECY 📢</p> {/* Убрали лишнее и поправили опечатку в Prophecy */}
          <p>3. CLAIM 10,000 $USERBOX REWARD 💰</p>
        </div>
        <span className="mt-2 text-[9px] opacity-90 font-black italic">Every 3 Hours • Min balance 0.00005 ETH required 🛡️</span>
      </div>
    </div>
)}

  <button 
    onClick={getNewProphecy} 
    className="absolute -left-8 top-1/2 -translate-y-1/2 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_20px_rgba(59,130,246,0.6)] flex items-center justify-center animate-oracle-sync hover:scale-110 transition-all z-20 overflow-hidden" 
    style={{ width: '4.8rem', height: '4.8rem' }}
  >
    <img src={TOKEN_IMAGE} className="w-full h-full object-cover rounded-full" alt="Oracle" />
  </button>
  
  <p className="text-sm italic font-medium pl-12 pr-2 text-center">&quot;{oracleMessage}&quot;</p>
</div>

<div className="flex gap-3 mb-4">
  <Transaction 
    chainId={8453} 
    calls={[{ 
      address: TOKEN_ADDRESS as `0x${string}`, 
      abi: ERC20_ABI, 
      functionName: 'transfer', 
      args: [MY_WALLET_ADDRESS as `0x${string}`, BigInt(5000 * 10**18)] 
    } as any]} 
    onStatus={((s: any) => handleScoreUpdate('accept', s)) as any}
    onSuccess={((r: any) => handleScoreUpdate('accept', r)) as any}
  >
    <TransactionButton className="w-full bg-white !text-[#FF00FF] font-black py-4 rounded-2xl text-[10px] uppercase border-2 border-[#FF00FF]" text="FAITH (+100)" />
  </Transaction>

  <Transaction 
    chainId={8453} 
    calls={[{ 
      address: TOKEN_ADDRESS as `0x${string}`, 
      abi: ERC20_ABI, 
      functionName: 'transfer', 
      args: [MY_WALLET_ADDRESS as `0x${string}`, BigInt(5000 * 10**18)] 
    } as any]} 
    onStatus={((s: any) => handleScoreUpdate('defy', s)) as any}
    onSuccess={((r: any) => handleScoreUpdate('defy', r)) as any}
  >
    <TransactionButton className="w-full bg-white !text-[#0052FF] font-black py-4 rounded-2xl text-[10px] uppercase border-2 border-[#0052FF]" text="DEFY (+100)" />
  </Transaction>
</div>

<div className="mb-6">
          {(() => {
            const now = Math.floor(Date.now() / 1000);
            const waitTime = Number(lastClaimTime) + 10800; 
            const isWaitMode = now < waitTime && lastClaimTime !== 0n;

            // Логика успеха и анимация отправки
            if (hash && !isWaitMode) {
                if (!sessionStorage.getItem(`claim_viewed_${hash}`)) {
                    sessionStorage.setItem(`claim_viewed_${hash}`, 'true');
                    
                    // Показываем успех (не забудь в функции triggerBonus поставить 6000)
                    triggerBonus("SUCCESS: 10,000 $USERBOX SENT");
                    
                    setOracleScore(prev => {
                        const ns = prev + 100;
                        localStorage.setItem('oracle_score_v5', ns.toString());
                        return ns;
                    });
                    
                    // Опрашиваем контракт, пока не включится Wait Mode
                    const interval = setInterval(() => { 
                      if (fetchContractData) fetchContractData(); 
                    }, 3000);
                    setTimeout(() => clearInterval(interval), 20000);
                }
                
                // Та самая "живая" кнопка вместо серого Processing
                return (
                  <button disabled className="w-full bg-blue-900/40 border-2 border-blue-500/30 text-white font-black py-5 rounded-2xl text-xs uppercase flex items-center justify-center gap-3">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span className="animate-pulse">Sending $USERBOX...</span>
                  </button>
                );
            }

            if (isWaitMode) return <button disabled className="w-full bg-white/5 border-2 border-white/10 text-white/40 font-black py-5 rounded-2xl text-xs uppercase cursor-not-allowed">Wait 3 Hours</button>;
            
            if (oracleSignature && lastChoice) {
              return (
                <button 
                  onClick={() => { 
                    const cleanSig = oracleSignature.startsWith('0x') ? oracleSignature : `0x${oracleSignature}`; 
                    writeContract({ 
                      address: TREASURY_ADDRESS as `0x${string}`, 
                      abi: TREASURY_ABI, 
                      functionName: 'claim', 
                      args: [cleanSig.trim() as `0x${string}`] 
                    }); 
                  }} 
                  className="w-full bg-[#FF00FF] text-white font-black py-5 rounded-2xl text-xs uppercase shadow-[0_0_20px_rgba(255,0,255,0.4)] hover:scale-[1.01] transition-all"
                >
                  Claim 10,000 $USERBOX
                </button>
              );
            }
            
            return <button onClick={getNewProphecy} disabled={isSigning} className="w-full bg-gray-500/20 border-2 border-white/10 text-white/60 font-black py-4 rounded-2xl text-[10px] uppercase transition-all">{isSigning ? "Oracle is signing..." : signStatus}</button>;
          })()}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
  {/* Base Score: теперь показывает реальный счетчик или точки при загрузке */}
  <div className="bg-black/30 rounded-[1.5rem] py-4 border border-white/10 text-center">
    <p className="text-[9px] uppercase opacity-50 mb-1 font-bold">Base Score</p>
    <p className="text-2xl font-mono font-black text-white">
      {txCount !== null ? txCount : "..."}
    </p>
  </div>

  {/* Oracle Score: твои накопленные очки из localStorage */}
  <div className="bg-black/30 rounded-[1.5rem] py-4 border border-[#FF00FF]/20 text-center">
    <p className="text-[9px] uppercase opacity-50 mb-1 font-bold">Oracle Score</p>
    <p className="text-2xl font-mono font-black text-[#FF00FF]">{oracleScore}</p>
  </div>
</div>

        {/* 1. Сначала Share (Рекаст) */}
        <button onClick={handleShare} className="w-full bg-white text-[#0052FF] font-black py-4 rounded-2xl text-xs mb-4 uppercase shadow-xl">
          Share My Prophecy ↗
        </button>

        {/* 2. Теперь Donate (Сразу под кнопкой Share) */}
        <div className="mb-4">
  <Transaction 
    chainId={8453} 
    calls={[{ 
      to: MY_WALLET_ADDRESS as `0x${string}`, 
      value: BigInt(1000000000000000) 
    } as any]}
    onSuccess={() => triggerBonus("BUILDER SUPPORTED! ☕")}
  >
    <TransactionButton 
      className="w-full bg-white !text-[#0052FF] font-black py-4 rounded-2xl text-xs uppercase shadow-xl active:scale-95" 
      text="Support Solo Builder (0.001 ETH) ☕" 
    />
  </Transaction>
</div>

        {/* 3. И только потом блок Alchemy */}
<div className="bg-black/40 p-5 rounded-[2rem] border border-[#0052FF]/30 mb-8">
  <p className="text-[10px] font-black uppercase text-center mb-3 opacity-50 italic">Elite Ritual: Oracle Blessing</p>
  
  {(!hasFaith || !hasDefy) ? (
    <div className="text-center py-2">
      <p className="text-[10px] font-bold text-blue-300 uppercase">Complete Faith & Defy to unlock</p>
      <div className="flex justify-center gap-2 mt-2">
        <div className={`w-2 h-2 rounded-full ${hasFaith ? 'bg-green-500 shadow-[0_0_8px_#4ade80]' : 'bg-white/20'}`} />
        <div className={`w-2 h-2 rounded-full ${hasDefy ? 'bg-green-500 shadow-[0_0_8px_#4ade80]' : 'bg-white/20'}`} />
      </div>
    </div>
  ) : (
    <button 
      disabled={!b1Signature || isB1Signing}
      onClick={() => {
        if (!b1Signature) return getB1Signature(); // Если подпись еще не пришла
        writeB1({ 
          address: '0xbdE06D8E8CC882DDe3f953e8e5a673f7aD4f75e1', // ВСТАВЬ АДРЕС B1 ТУТ
          abi: TREASURY_ABI, 
          functionName: 'claim', 
          args: [b1Signature as `0x${string}`] 
        });
      }}
      className="w-full bg-white text-[#0052FF] font-black py-4 rounded-xl text-xs uppercase shadow-2xl animate-pulse"
    >
      {isB1Signing ? "Blessing Preparing..." : b1Signature ? "The Grand Blessing ✨" : "Unlock Blessing"}
    </button>
  )}
</div>

      </main>

      <footer className="mt-8 mb-10 text-center opacity-40"><p className="text-[9px] uppercase tracking-[0.4em] font-bold">Base Network • Secure Oracle V17</p></footer>
    </div>
  );
}