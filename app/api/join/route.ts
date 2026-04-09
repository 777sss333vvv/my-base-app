import { NextResponse } from 'next/server';

export async function GET() {

  // Временно используем текстовую заглушку с эмодзи Шара, пока нет арт-отдела
  // Это гарантирует, что эмулятор не покажет 404.
  const imageUrl = "https://placehold.co/600x400?text=🔮+Oracle+is+Watching+🔮";

  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta property="fc:frame" content="vNext" />
      
      <meta property="fc:frame:image" content="${imageUrl}" />
      
      <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />

      <meta property="fc:frame:button:1" content="📜 Become a Disciple" />
      <meta property="fc:frame:button:1:action" content="recast" />

      <meta property="fc:frame:button:2" content="🔮 Enter via Oracle Orb" />
      <meta property="fc:frame:button:2:action" content="link" />
      <meta property="fc:frame:button:2:target" content="https://www.prosperitypass.xyz/" />

      <meta property="fc:frame:post_url" content="https://www.prosperitypass.xyz/api/join" />
    </head>
  </html>
  `;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

export async function POST() {
  return GET();
}
