import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(req: Request) {
  try {
    const { userAddress } = await req.json();
    
    const pKey = process.env.ORACLE_PRIVATE_KEY;
    if (!pKey) return NextResponse.json({ error: 'Config error' }, { status: 500 });

    const wallet = new ethers.Wallet(pKey);

    // Хэшируем только адрес по стандарту Solidity solidityKeccak256
    const messageHash = ethers.utils.solidityKeccak256(["address"], [userAddress]);

    // Подписываем (wallet.signMessage автоматически добавляет префикс Ethereum Signed Message)
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    return NextResponse.json({ signature });
  } catch (err: any) {
    return NextResponse.json({ error: 'Sign failed', details: err.message }, { status: 500 });
  }
}