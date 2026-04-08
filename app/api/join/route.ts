import { NextResponse } from 'next/server';

export async function GET() {
  const snapResponse = {
    "type": "frame",
    "version": "1.0",
    "ui": {
      "elements": [
        {
          "type": "text",
          "content": "👁️ THE ORACLE IS WATCHING \n Become an Apprentice to unlock the Vault."
        },
        {
          "type": "button",
          "content": "1. Join the Sequence (Recast)",
          "action": {
            "type": "post",
            "target": "https://warpcast.com/~/recast?text=I am becoming an apprentice of the Oracle 👁️ by @userbox" 
          }
        },
        {
          "type": "button",
          "content": "2. Enter the Vault ↗",
          "action": {
            "type": "link",
            "target": "https://www.prosperitypass.xyz/"
          }
        }
      ]
    }
  };

  return new NextResponse(JSON.stringify(snapResponse), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.farcaster.snap+json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function POST() {
  return GET();
}