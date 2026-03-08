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

    // @ts-ignore
    const provider = new ethers.providers.JsonRpcProvider(`https://base-mainnet.g.alchemy.com/v2/${aKey}`);
    // @ts-ignore
    const wallet = new ethers.Wallet(pKey, provider);

    // @ts-ignore
    const messageHash = ethers.utils.solidityKeccak256(["address"], [userAddress]);
    // @ts-ignore
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    return NextResponse.json({ signature });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to sign', details: err.message }, { status: 500 });
  }
}