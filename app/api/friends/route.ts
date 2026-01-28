import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');

    // 1. Проверяем наличие FID
    if (!fid) {
      return NextResponse.json({ error: 'Missing FID' }, { status: 400 });
    }

    const apiKey = process.env.NEYNAR_API_KEY;

    // 2. Проверяем, видит ли сервер ключ (если нет — увидишь эту ошибку)
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key not found in environment' }, { status: 500 });
    }

    // 3. Делаем запрос к Neynar v2
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/following?fid=${fid}&limit=15`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'api_key': apiKey, // Убедись, что в Vercel имя именно NEYNAR_API_KEY
        },
      }
    );

    const data = await response.json();

    // 4. Если Neynar вернул ошибку (например, ключ невалиден)
    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Neynar API Error', 
        details: data 
      }, { status: response.status });
    }
    
    // 5. Безопасно вытаскиваем пользователей
    const friends = data.users?.map((u: any) => ({
      fid: u.fid,
      username: u.username,
      pfp_url: u.pfp_url,
    })) || [];

    return NextResponse.json(friends);

  } catch (error: any) {
    console.error('Fatal API Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: error.message 
    }, { status: 500 });
  }
}