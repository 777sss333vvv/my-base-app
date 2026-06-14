import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// Клиент для проверки времени прямо в блокчейне Base
const publicClient = createPublicClient({ 
  chain: base,
  transport: http()
});

const TREASURY_ADDRESS = '0x2e0bFFE74d68053c1382B8ae9A87823cCA5799e8';
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

    if (now - Number(lastClaim) < 43200) { // 12 часов в секундах
      return NextResponse.json({ error: 'Wait 12h' }, { status: 403 });
    }

    // 3. Генерация подписи
    const pKey = process.env.ORACLE_PRIVATE_KEY;
    if (!pKey) return NextResponse.json({ error: 'Config error' }, { status: 500 });

    const wallet = new ethers.Wallet(pKey);
    const cleanAddress = userAddress.toLowerCase();
    
    // Хэшируем точно как в контракте: keccak256(abi.encodePacked(msg.sender))
    const messageHash = ethers.utils.keccak256(cleanAddress);
    
    // Подписываем (добавляет префикс Ethereum Signed Message)
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    return NextResponse.json({ signature });
} catch {
    return NextResponse.json({ error: 'Sign failed' }, { status: 500 });
  }
}