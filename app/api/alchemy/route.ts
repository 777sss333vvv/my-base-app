import { NextResponse } from 'next/server';
import { Network, Alchemy } from 'alchemy-sdk';

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
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
  } catch (error: unknown) {
    // Безопасно извлекаем сообщение об ошибке для TypeScript
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Alchemy Route Error:', errorMessage);
    
    return NextResponse.json(
      { count: 0, error: errorMessage }, 
      { status: 500 }
    );
  }
}