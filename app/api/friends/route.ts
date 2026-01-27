import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');

  if (!fid) {
    return NextResponse.json({ error: 'Missing FID' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/following?fid=${fid}&limit=10`,
      {
        headers: {
          'api_key': process.env.NEYNAR_API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Neynar API fetch failed');
    }

    const data = await response.json();
    
    // Типизируем данные прямо в map, чтобы избежать ошибки "Unexpected any"
    const friends = data.users?.map((u: { fid: number; username: string; pfp_url: string }) => ({
      fid: u.fid,
      username: u.username,
      pfp_url: u.pfp_url,
    })) || [];

    return NextResponse.json(friends);
  } catch (error) {
    // Выводим ошибку в консоль сервера, чтобы переменная error использовалась
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}