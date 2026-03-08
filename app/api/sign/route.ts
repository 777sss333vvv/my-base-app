import { NextResponse } from 'next/server';
import * as ethers from 'ethers';

export async function POST(req: Request) {
  try {
    const { userAddress } = await req.json();
    
    const pKey = process.env.ORACLE_PRIVATE_KEY;
    const aKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

    if (!pKey || !aKey) {
      return NextResponse.json({ error: 'Config error' }, { status: 500 });
    }

    // Используем "as any" только в одном месте, чтобы обойти проверку типов аккуратно
    const eth: any = ethers;
    
    const provider = new eth.providers.JsonRpcProvider(`https://base-mainnet.g.alchemy.com/v2/${aKey}`);
    const wallet = new eth.Wallet(pKey, provider);

    const messageHash = eth.utils.solidityKeccak256(["address"], [userAddress]);
    const signature = await wallet.signMessage(eth.utils.arrayify(messageHash));

    return NextResponse.json({ signature });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown';
    return NextResponse.json({ error: 'Sign failed', details: msg }, { status: 500 });
  }
}