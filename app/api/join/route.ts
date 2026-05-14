import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Кэш для анти-спама
const ipCache = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const { userAddress } = await req.json();
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const now = Math.floor(Date.now() / 1000);

    // 1. АНТИ-СПАМ: 60 секунд между запросами
    const lastIpRequest = ipCache.get(ip) || 0;
    if (now - lastIpRequest < 60) {
      return NextResponse.json({ error: 'Oracle is gathering energy...' }, { status: 429 });
    }
    ipCache.set(ip, now);

    // --- ПРОВЕРКА V17 ПОЛНОСТЬЮ УДАЛЕНА ---
    // Теперь Сингер не проверяет lastClaimTime. 
    // Логика "Face + DeFi" теперь обрабатывается на фронтенде перед вызовом этого роутера.

    // 2. ГЕНЕРАЦИЯ ПОДПИСИ (АККАУНТ #2: 0xd9eC95...)
    const pKey = process.env.ORACLE_PRIVATE_KEY_B1; 
    if (!pKey) return NextResponse.json({ error: 'B1 Signer not configured' }, { status: 500 });

    const wallet = new ethers.Wallet(pKey);
    const cleanAddress = userAddress.toLowerCase();
    
    // Хэш: keccak256(abi.encodePacked(userAddress))
    const messageHash = ethers.utils.keccak256(cleanAddress);
    
    // Подпись сообщения
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    return NextResponse.json({ signature });

  } catch (e) {
    console.error('B2 Sign error:', e);
    return NextResponse.json({ error: 'Oracle B2 failed' }, { status: 500 });
  }
}