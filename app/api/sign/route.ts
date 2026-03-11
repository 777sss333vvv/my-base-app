import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(req: Request) {
  try {
    const { userAddress } = await req.json();
    
    const pKey = process.env.ORACLE_PRIVATE_KEY;
    if (!pKey) {
      return NextResponse.json({ error: 'Config error: Key missing' }, { status: 500 });
    }

    const wallet = new ethers.Wallet(pKey);

    // Хэшируем только адрес кошелька
    const messageHash = ethers.utils.solidityKeccak256(["address"], [userAddress]);

    // Подписываем
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    return NextResponse.json({ signature });
  } catch (err: unknown) {
    // Исправляем ошибку ESLint: типизируем err как unknown и проверяем тип
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Sign failed', details: errorMessage }, { status: 500 });
  }
}