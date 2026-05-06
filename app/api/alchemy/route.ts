import { NextResponse } from 'next/server';
import { Network, Alchemy } from 'alchemy-sdk';

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY, // Используем твой ключ
  network: Network.BASE_MAINNET,
};

const alchemy = new Alchemy(settings);

export async function POST(request: Request) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json({ error: 'No address provided' }, { status: 400 });
    }

    const count = await alchemy.core.getTransactionCount(address);
    return NextResponse.json({ count: Number(count) });
  } catch (error: any) {
    console.error('Alchemy Route Error:', error);
    return NextResponse.json({ count: 0, error: error.message }, { status: 500 });
  }
}