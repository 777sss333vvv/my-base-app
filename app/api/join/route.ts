import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// Настройка клиента только для проверок
const publicClient = createPublicClient({ 
  chain: base,
  transport: http()
});

const V17_CONTRACT = '0xc70f7D0DFE687AD9e5e2fcdd1FAF0d5B175b81f9';

const ABI_VIEW = [
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "lastClaimTime",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Лимиты для нового роутера (можно сделать жестче)
const ipCache = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const { userAddress } = await req.json();
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const now = Math.floor(Date.now() / 1000);

    // Анти-спам: 60 секунд для B1 (пусть думают дольше)
    const lastIpRequest = ipCache.get(ip) || 0;
    if (now - lastIpRequest < 60) {
      return NextResponse.json({ error: 'Oracle is gathering energy...' }, { status: 429 });
    }
    ipCache.set(ip, now);

    // --- ПРОВЕРКА АКТИВНОСТИ В V17 ---
    // Читаем время последнего клейма в основном контракте
    const lastV17Claim = await publicClient.readContract({
      address: V17_CONTRACT,
      abi: ABI_VIEW,
      functionName: 'lastClaimTime',
      args: [userAddress as `0x${string}`],
    }) as bigint;

    // Проверка: был ли клейм в последние 3 часа (10800 сек)
    if (lastV17Claim === 0n || (now - Number(lastV17Claim) > 10800)) {
      return NextResponse.json({ error: 'Stay active in V17 first' }, { status: 403 });
    }

    // --- ГЕНЕРАЦИЯ ПОДПИСИ (АККАУНТ #2) ---
    const pKey = process.env.ORACLE_PRIVATE_KEY_B1; // Ключ от 0xd9
    if (!pKey) return NextResponse.json({ error: 'B1 Signer not configured' }, { status: 500 });

    const wallet = new ethers.Wallet(pKey);
    const cleanAddress = userAddress.toLowerCase();
    
    // Хэш: keccak256(abi.encodePacked(userAddress))
    const messageHash = ethers.utils.keccak256(cleanAddress);
    
    // Подпись
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    return NextResponse.json({ signature });

  } catch (e) {
    console.error('B1 Sign error:', e);
    return NextResponse.json({ error: 'Oracle B1 failed' }, { status: 500 });
  }
}