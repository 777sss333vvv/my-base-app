import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { address } = await request.json();
    const apiKey = process.env.ALCHEMY_API_KEY || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

    if (!address) return NextResponse.json({ count: 0 });

    const response = await fetch(`https://base-mainnet.g.alchemy.com/v2/${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getTransactionCount",
        params: [address.toLowerCase(), "latest"]
      }),
    });

    const data = await response.json();
    const count = data.result ? parseInt(data.result, 16) : 0;
    
    return NextResponse.json({ count });
  } catch {
    // Ошибка перехвачена без объявления неиспользуемой переменной
    return NextResponse.json({ count: 0 });
  }
}