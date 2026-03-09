import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(req: Request) {
  try {
    const { userAddress } = await req.json();
    
    const pKey = process.env.ORACLE_PRIVATE_KEY;
    const aKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

    if (!pKey || !aKey) {
      return NextResponse.json({ error: 'Config error' }, { status: 500 });
    }

    // Инициализация провайдера и кошелька через unknown для линтера
    const ProviderClass = ethers.providers.JsonRpcProvider as unknown as {
      new (url: string): ethers.providers.JsonRpcProvider;
    };
    const provider = new ProviderClass(`https://base-mainnet.g.alchemy.com/v2/${aKey}`);

    const WalletClass = ethers.Wallet as unknown as {
      new (key: string, provider: ethers.providers.Provider): ethers.Wallet;
    };
    const wallet = new WalletClass(pKey, provider);

    // --- ИСПРАВЛЕННЫЙ БЛОК ПОДПИСИ ---
    // 1. Превращаем адрес в массив байтов (стандарт для подписи в Solidity)
    const messageBytes = ethers.utils.arrayify(userAddress);

    // 2. Подписываем. signMessage автоматически добавит префикс "\x19Ethereum Signed Message:\n32"
    // Это именно то, что проверяет функция ECDSA.recover в контракте.
    const signature = await wallet.signMessage(messageBytes);
    // ---------------------------------

    return NextResponse.json({ signature });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Sign failed', details: errorMessage }, { status: 500 });
  }
}