export async function GET() {
  const imageUrl = "https://placehold.co/600x400?text=🔮+Oracle+is+Watching+🔮";

  const html = `
  <!DOCTYPE html>
  <html>
    <head>

      <meta property="fc:frame" content="vNext" />

      <meta property="fc:frame:image" content="${imageUrl}" />

      <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />

      <meta property="fc:frame:button:1" content="📜 Become @userbox Oracle Disciple" />
      <meta property="fc:frame:button:1:action" content="recast" />

      <meta property="fc:frame:button:2" content="🔮 Launch App" />
      <meta property="fc:frame:button:2:action" content="link" />
      <meta property="fc:frame:button:2:target" content="https://www.prosperitypass.xyz/" />

      <meta property="fc:frame:post_url" content="https://www.prosperitypass.xyz/api/join" />
    </head>
    <body></body>
  </html>
  `;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      "Access-Control-Allow-Origin": "*", // Чтобы эмулятор не ругался на CORS
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  });
}

// Добавляем OPTIONS, чтобы ошибка со скриншота ушла навсегда
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  });
}

export async function POST() {
  return GET();
}
