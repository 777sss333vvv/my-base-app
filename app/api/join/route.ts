import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// Клиент для проверки времени прямо в блокчейне Base
const publicClient = createPublicClient({ 
  chain: base,
  transport: http()
});

// СТРОГИЕ ПАРАМЕТРЫ B3
const B3_CONTRACT_ADDRESS = '0x81c74b0749F528f322CCb8C0539a3F5e0196D154';
const B3_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "lastClaimTime",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Лимит по IP (анти-спам)
const ipCache = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const { userAddress } = await req.json();
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const now = Math.floor(Date.now() / 1000);

    // 1. Защита от спама (30 секунд)
    const lastIpRequest = ipCache.get(ip) || 0;
    if (now - lastIpRequest < 30) {
      return NextResponse.json({ error: 'Oracle is thinking...' }, { status: 429 });
    }
    ipCache.set(ip, now);

    // 2. Проверка 12 часов в контракте B3 (защита ключа 0xd9eC95...)
    const lastClaim = await publicClient.readContract({
      address: B3_CONTRACT_ADDRESS,
      abi: B3_ABI,
      functionName: 'lastClaimTime',
      args: [userAddress as `0x${string}`],
    }) as bigint;

    if (now - Number(lastClaim) < 43200) { 
      return NextResponse.json({ error: 'Wait 12h' }, { status: 403 });
    }

    // 3. Генерация подписи (СИНГЕР: 0xd9eC951845FF2E0a93811d932f435Ba790768aF1)
    const pKey = process.env.ORACLE_BLESSING_KEY; 
    if (!pKey) return NextResponse.json({ error: 'Config error' }, { status: 500 });

const wallet = new ethers.Wallet(pKey);

    // ВАЖНО: solidityKeccak256 упаковывает адрес как 20-байтовое значение, а не как строку.
    // Это единственный способ получить хэш, идентичный abi.encodePacked(msg.sender) в Solidity.
    const messageHash = ethers.utils.solidityKeccak256(['address'], [userAddress]);
    
    // Подписываем массив байтов (arrayify), чтобы подпись была валидна для ecrecover
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    return NextResponse.json({ signature });

  } catch (e) {
    console.error('B3 Sign error:', e);
    return NextResponse.json({ error: 'Sign failed' }, { status: 500 });
  }
}