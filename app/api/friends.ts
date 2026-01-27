import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');

  if (!fid) return NextResponse.json({ error: 'Missing FID' }, { status: 400 });

  try {
    // Запрос к Neynar: получаем тех, на кого подписан пользователь (following)
    // Neynar автоматически сортирует их по релевантности
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/following?fid=${fid}&limit=10`,
      {
        headers: {
          'api_key': process.env.NEYNAR_API_KEY || '',
        },
      }
    );

    const data = await response.json();
    
    // Возвращаем только нужные данные: fid, username и аватарку
    const friends = data.users.map((u: any) => ({
      fid: u.fid,
      username: u.username,
      pfp_url: u.pfp_url,
    }));

    return NextResponse.json(friends);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 });
  }
}