import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// Клиент для проверки времени прямо в блокчейне Base
const publicClient = createPublicClient({ 
  chain: base,
  transport: http()
});

// ПАРАМЕТРЫ B3 (Зеркально V17)
const TREASURY_ADDRESS = '0x81c74b0749F528f322CCb8C0539a3F5e0196D154';
const TREASURY_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "lastClaimTime",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Лимит по IP (в памяти сервера)
const ipCache = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const { userAddress } = await req.json();
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const now = Math.floor(Date.now() / 1000);

    // 1. Защита от спама (Rate Limit по IP - 30 секунд)
    const lastIpRequest = ipCache.get(ip) || 0;
    if (now - lastIpRequest < 30) {
      return NextResponse.json({ error: 'Oracle is thinking...' }, { status: 429 });
    }
    ipCache.set(ip, now);

// 2. Проверка 12 часов (защита приватного ключа)
    const lastClaim = await publicClient.readContract({
      address: TREASURY_ADDRESS,
      abi: TREASURY_ABI,
      functionName: 'lastClaimTime',
      args: [userAddress as `0x${string}`],
    }) as bigint;

    const lastClaimTime = Number(lastClaim);

    // Если 0 — значит еще не клеймил, пропускаем. 
    // Если больше 0 — проверяем, прошло ли 12 часов.
    if (lastClaimTime > 0 && (now - lastClaimTime < 43200)) { 
      return NextResponse.json({ error: 'Wait 12h' }, { status: 403 });
    }

    // 3. Генерация подписи
    const pKey = process.env.ORACLE_BLESSING_KEY; // Твой ключ для B3
    if (!pKey) return NextResponse.json({ error: 'Config error' }, { status: 500 });

    const wallet = new ethers.Wallet(pKey);
    const cleanAddress = userAddress.toLowerCase();
    
    // Хэшируем точно как в V17: keccak256(адрес)
    const messageHash = ethers.utils.keccak256(cleanAddress);
    
    // Подписываем (добавляет префикс Ethereum Signed Message)
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    return NextResponse.json({ signature });
} catch (error) {
    console.error("B3 Router Error:", error);
    return NextResponse.json({ error: 'Sign failed' }, { status: 500 });
  }
}