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

    // Используем unknown вместо any, чтобы пройти проверку линтера
    const ProviderClass = ethers.providers.JsonRpcProvider as unknown as {
      new (url: string): ethers.providers.JsonRpcProvider;
    };
    const provider = new ProviderClass(`https://base-mainnet.g.alchemy.com/v2/${aKey}`);

    const WalletClass = ethers.Wallet as unknown as {
      new (key: string, provider: ethers.providers.Provider): ethers.Wallet;
    };
    const wallet = new WalletClass(pKey, provider);

    const messageHash = ethers.utils.solidityKeccak256(["address"], [userAddress]);
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    return NextResponse.json({ signature });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Sign failed', details: errorMessage }, { status: 500 });
  }
}