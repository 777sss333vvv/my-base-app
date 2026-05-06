import { NextResponse } from 'next/server';
import { Network, Alchemy } from 'alchemy-sdk';

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || process.env.ALCHEMY_API_KEY,
  network: Network.BASE_MAINNET,
};

const alchemy = new Alchemy(settings);

export async function POST(request: Request) {
  try {
    const body = await request.json() as { address?: string };
    const address = body.address;

    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'Invalid address', count: 0 }, { status: 400 });
    }

    const cleanAddress = address.trim().toLowerCase();
    const hexCount = await alchemy.core.getTransactionCount(cleanAddress);
    const count = Number(hexCount);

    console.log(`Alchemy Success: ${cleanAddress} has ${count} txs`);
    
    return NextResponse.json({ count });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown alchemy error';
    console.error('Alchemy Critical Error:', message);
    
    // Возвращаем 125 только для отладки, если API ключ не сработал
    return NextResponse.json(
      { count: 125, error: message }, 
      { status: 500 }
    );
  }
}