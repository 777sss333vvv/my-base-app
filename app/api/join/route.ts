export async function GET(req: Request) {
  
  const { searchParams } = new URL(req.url);
  const index = parseInt(searchParams.get("i") || "0");

  const disciples = [
    { name: "gordi555.base.eth", fid: 421469 },
    { name: "negen", fid: 418146 },
    { name: "archii", fid: 433433 }
  ];


  const current = disciples[index % disciples.length];
  const nextIndex = (index + 1) % disciples.length;
  
  // Ссылка строго на этот же файл
  const baseUrl = "https://www.prosperitypass.xyz/api/join";

  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Oracle View</title>
      
      <meta property="og:title" content="Oracle Disciples" />
      <meta property="og:image" content="https://placehold.co/1200x630/000000/FFFFFF?text=Oracle+Disciple+@${current.name}" />

      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="https://placehold.co/600x400/000000/FFFFFF?text=🔮+Oracle+is+Watching+🔮%0ADisciple:+@${current.name}" />
      <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />

      <meta property="fc:frame:button:1" content="📜 Show Next Disciple" />
      <meta property="fc:frame:button:1:action" content="post" />

      <meta property="fc:frame:button:2" content="🔗 View @${current.name}" />
      <meta property="fc:frame:button:2:action" content="link" />
      <meta property="fc:frame:button:2:target" content="https://warpcast.com/~/profiles/${current.fid}" />

      <meta property="fc:frame:post_url" content="${baseUrl}?i=${nextIndex}" />
    </head>
    <body></body>
  </html>
  `;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      "Access-Control-Allow-Origin": "*",

    },
  });
}


export async function POST(req: Request) {
  return GET(req);
}
