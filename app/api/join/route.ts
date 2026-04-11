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
  const url = `https://www.prosperitypass.xyz/api/join?i=${nextIndex}`;

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta property="og:title" content="Oracle: Become a Disciple" />
    <meta property="og:image" content="https://placehold.co/1200x630/000000/FFFFFF?text=Become+an+Oracle+Disciple" />
    
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="https://placehold.co/600x400/000000/FFFFFF?text=Oracle+Hierarchy%0ACurrent:+@${current.name}%0A%0AJoin+the+Prophecy" />
    
    <meta property="fc:frame:button:1" content="Next Disciple 📜" />
    <meta property="fc:frame:button:1:action" content="post" />
    <meta property="fc:frame:post_url" content="${url}" />
    
    <meta property="fc:frame:button:2" content="Become a Disciple 🔮" />
    <meta property="fc:frame:button:2:action" content="link" />
    <meta property="fc:frame:button:2:target" content="https://www.prosperitypass.xyz/" />

    <meta http-equiv="refresh" content="0; url=https://www.prosperitypass.xyz/" />
  </head>
  <body></body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}


export async function POST(req: Request) {
  return GET(req);
}
