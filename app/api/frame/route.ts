import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<Response> {
  // Этот код срабатывает, когда пользователь нажимает кнопку в Farcaster
  return new NextResponse(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>Build Together Success</title>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://${req.nextUrl.host}/og-image.png" />
        <meta property="fc:frame:button:1" content="Launch Full App" />
        <meta property="fc:frame:button:1:action" content="post_redirect" />
        <meta property="fc:frame:post_url" content="https://${req.nextUrl.host}/api/end" />
      </head>
      <body>
        <h1>Transaction Initiated!</h1>
      </body>
    </html>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    }
  );
}

export const dynamic = 'force-dynamic';