import { NextResponse } from 'next/server';

export async function GET() {
  const featuredBuilders = [
    { 
      fid: 12142, 
      username: 'base', 
      pfp_url: 'https://github.com/base-org.png' 
    },
    { 
      fid: 5650, 
      username: 'vitalik.eth', 
      pfp_url: 'https://github.com/vbuterin.png' 
    },
    { 
      fid: 3, 
      username: 'dwr.eth', 
      pfp_url: 'https://github.com/danromero.png' 
    }
  ];

  return NextResponse.json(featuredBuilders);
}