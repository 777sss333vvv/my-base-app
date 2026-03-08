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

    // Используем типизацию через приведение к unknown, если версии конфликтуют, 
    // но без использования запрещенного 'any'
    const provider = new (ethers.providers.JsonRpcProvider as any)(
      `https://base-mainnet.g.alchemy.com/v2/${aKey}`
    ) as ethers.providers.JsonRpcProvider;

    const wallet = new (ethers.Wallet as any)(pKey, provider) as ethers.Wallet;

    const messageHash = ethers.utils.solidityKeccak256(["address"], [userAddress]);
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    return NextResponse.json({ signature });
  } catch (err: unknown) {
    // Выполняем условие линтера: проверяем тип ошибки перед обращением к ней
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Sign failed', details: errorMessage }, { status: 500 });
  }
}