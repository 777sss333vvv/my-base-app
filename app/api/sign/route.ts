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

    // 1. Приводим адрес к нижнему регистру и проверяем формат 0x...
    // Это гарантирует, что Solidity и JS видят одни и те же байты.
    const cleanAddress = userAddress.toLowerCase();

    // 2. Хэшируем точно так же, как abi.encodePacked в Solidity
    // Используем keccak256 от упакованных байтов адреса
    const messageHash = ethers.utils.keccak256(cleanAddress);

    // 3. Подписываем массив байтов (EIP-191)
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    return NextResponse.json({ signature });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Sign failed', details: errorMessage }, { status: 500 });
  }
}