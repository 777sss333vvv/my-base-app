import { NextResponse } from 'next/server';
import { Network, Alchemy } from 'alchemy-sdk';

const settings = {
  // Пробуем оба варианта имени переменной для надежности
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || process.env.ALCHEMY_API_KEY,
  network: Network.BASE_MAINNET,
};

const alchemy = new Alchemy(settings);

export async function POST(request: Request) {
  try {
    const { address } = await request.json();

    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'Invalid address', count: 0 }, { status: 400 });
    }

    // Очищаем адрес и приводим к нижнему регистру
    const cleanAddress = address.trim().toLowerCase();
    
    // Получаем количество транзакций
    const hexCount = await alchemy.core.getTransactionCount(cleanAddress);
    const count = parseInt(hexCount.toString());

    console.log(`Alchemy Success: ${cleanAddress} has ${count} txs`);
    
    return NextResponse.json({ count });
  } catch (error: any) {
    console.error('Alchemy Critical Error:', error.message);
    // Возвращаем 125, чтобы понять, что это ошибка API, а не реальный 0
    return NextResponse.json({ count: 125, error: error.message }, { status: 500 });
  }
}