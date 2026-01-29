import { NextResponse } from 'next/server';

export async function GET() {
  // Список героев Base (используем реальные данные)
  const featuredBuilders = [
    { 
      fid: 12142, 
      username: 'jessepollak', 
      pfp_url: 'https://wrpcd.net/cdn-cgi/image/anim=false,fit=contain,f=auto,w=144/https%3A%2F%2Fi.imgur.com%2F9676660.jpg' 
    },
    { 
      fid: 3, 
      username: 'dwr.eth', 
      pfp_url: 'https://wrpcd.net/cdn-cgi/image/anim=false,fit=contain,f=auto,w=144/https%3A%2F%2Fi.imgur.com%2Fm88at3N.jpg' 
    },
    { 
      fid: 2, 
      username: 'v', 
      pfp_url: 'https://wrpcd.net/cdn-cgi/image/anim=false,fit=contain,f=auto,w=144/https%3A%2F%2Fi.imgur.com%2F0626360.png' 
    }
  ];

  try {
    // Просто возвращаем список
    return NextResponse.json(featuredBuilders); 
  } catch {
    // Убрали (error), чтобы линтер не ругался на неиспользуемую переменную
    return NextResponse.json(featuredBuilders);
  }
}