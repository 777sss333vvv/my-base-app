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

  const url =
  `https://www.prosperitypass.xyz/api/join?i=${nextIndex}`;

  const html = `
<html>

<head>

<meta property="og:title"
content="Oracle Disciples" />

<meta property="og:description"
content="Interactive Snap" />

<meta property="og:image"
content="https://placehold.co/1200x630?text=Oracle" />


<meta property="fc:frame"
content="vNext" />

<meta property="of:accepts:farcaster"
content="vNext" />


<meta property="fc:frame:image"
content="https://placehold.co/600x400?text=Oracle+Disciple" />

<meta property="fc:frame:image:aspect_ratio"
content="1.91:1" />


<meta property="fc:frame:button:1"
content="Next Disciple" />

<meta property="fc:frame:button:1:action"
content="post" />


<meta property="fc:frame:post_url"
content="${url}" />


<meta property="fc:frame:button:2"
content="Open site" />

<meta property="fc:frame:button:2:action"
content="link" />

<meta property="fc:frame:button:2:target"
content="https://www.prosperitypass.xyz/" />


</head>

<body></body>

</html>
`;

  return new Response(html, {

    headers: {

      "Content-Type": "text/html",

      "Access-Control-Allow-Origin": "*",

      "Access-Control-Allow-Headers": "*",

      "Access-Control-Allow-Methods":
      "GET, POST, OPTIONS"

    }

  });

}


export async function POST(req: Request) {

  return GET(req);

}


export async function OPTIONS() {

  return new Response(null, {

    headers: {

      "Access-Control-Allow-Origin": "*",

      "Access-Control-Allow-Headers": "*",

      "Access-Control-Allow-Methods":
      "GET, POST, OPTIONS"

    }

  });

}