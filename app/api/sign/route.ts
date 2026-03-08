import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(req: Request) {
  try {
    const { userAddress } = await req.json();
    
    const pKey = process.env.ORACLE_PRIVATE_KEY;
    const aKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

    if (!pKey || !aKey) {
      return NextResponse.json({ 
        error: 'Config error', 
        details: `P:${!!pKey} A:${!!aKey}` 
      }, { status: 500 });
    }

    // @ts-expect-error: ethers v5/v6 compatibility
    const provider = new ethers.providers.JsonRpcProvider(`https://base-mainnet.g.alchemy.com/v2/${aKey}`);
    // @ts-expect-error: ethers v5/v6 compatibility
    const wallet = new ethers.Wallet(pKey, provider);

    // @ts-expect-error: ethers v5/v6 compatibility
    const messageHash = ethers.utils.solidityKeccak256(["address"], [userAddress]);
    // @ts-expect-error: ethers v5/v6 compatibility
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    return NextResponse.json({ signature });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to sign', details: errorMessage }, { status: 500 });
  }
}