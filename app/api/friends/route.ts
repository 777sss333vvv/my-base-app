import { NextResponse } from 'next/server';

// Описываем структуру пользователя из Neynar, чтобы не использовать any
interface NeynarUser {
  fid: number;
  username: string;
  pfp_url: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');

    if (!fid) {
      return NextResponse.json({ error: 'Missing FID' }, { status: 400 });
    }

    const apiKey = process.env.NEYNAR_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key not found' }, { status: 500 });
    }

    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/following?fid=${fid}&limit=15`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'api_key': apiKey,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'Neynar Error', details: data }, { status: response.status });
    }
    
    // Используем созданный интерфейс NeynarUser
    const friends = data.users?.map((u: NeynarUser) => ({
      fid: u.fid,
      username: u.username,
      pfp_url: u.pfp_url,
    })) || [];

    return NextResponse.json(friends);

  } catch (error: unknown) {
    // Для ошибок используем unknown + проверку, чтобы ублажить TypeScript
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Fatal API Error:', errorMessage);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: errorMessage 
    }, { status: 500 });
  }
}