export async function GET(req: Request) {
  // Находим текущий индекс через параметры запроса, чтобы кнопка "Next" работала
  const { searchParams } = new URL(req.url);
  const index = parseInt(searchParams.get("i") || "0");

  const disciples = [
    { name: "gordi555.base.eth", fid: 421469 }, // @gordi555.base.eth
    { name: "negen", fid: 418146 },             // @negen
    { name: "archii", fid: 433433 }             // @archii
  ];

  // Выбираем текущего ученика по индексу
  const current = disciples[index % disciples.length];
  const nextIndex = (index + 1) % disciples.length;

  const html = `
  <!DOCTYPE html>
  <html>
    <head>
    
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="https://placehold.co/600x400?text=🔮+Oracle+is+Watching+🔮\nDisciple:+@${current.name}" />

      <meta property="fc:frame:button:1" content="📜 Show Next Disciple" />
      <meta property="fc:frame:button:1:action" content="post" />

      <meta property="fc:frame:button:2" content="🔗 View @${current.name}" />
      <meta property="fc:frame:button:2:action" content="link" />
      <meta property="fc:frame:button:2:target" content="https://warpcast.com/~/profiles/${current.fid}" />

      <meta property="fc:frame:post_url" content="https://www.prosperitypass.xyz/api/join?i=${nextIndex}" />
    </head>
    <body></body>
  </html>
  `;

  return new Response(html, {
    headers: {
 
   "Content-Type": "text/html",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  });
}

// Чтобы кнопка "Next" обновляла экран, POST должен возвращать GET с новым индексом
export async function POST(req: Request) {
  return GET(req);
}
