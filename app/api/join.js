export default function handler(req, res) {
  // Устанавливаем заголовок, чтобы Farcaster понял: это SNAP
  res.setHeader('Content-Type', 'application/vnd.farcaster.snap+json');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Разрешаем доступ для Farcaster

  // Содержимое твоего Снапа-визитки
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
          "type": "rows",
          "elements": [
            { "type": "text", "content": "✨ RECENT APPRENTICES:" },
            // Здесь мы можем позже добавить динамику, пока оставим заглушку
            { "type": "text", "content": "Node #5021, Node #5034, Node #5048" }
          ]
        },
        {
          "type": "button",
          "content": "1. Join the Sequence (Recast)",
          "action": {
            "type": "post",
            "target": "https://warpcast.com/~/recast?text=I am becoming an apprentice of the Oracle 👁️" 
            // Примечание: Мы можем сделать рекаст через внешний URL или внутренний экшен
          }
        },
        {
          "type": "button",
          "content": "2. Enter the Vault ↗",
          "action": {
            "type": "link",
            "target": "https://www.prosperitypass.xyz"
          }
        }
      ]
    }
  };

  return res.status(200).json(snapResponse);
}