export async function getRecentTransactions(address: string) {
  const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  const url = `https://base-mainnet.g.alchemy.com/v2/${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "alchemy_getAssetTransfers",
      params: [
        {
          fromBlock: "0x0",
          toBlock: "latest",
          fromAddress: address,
          category: ["external", "erc20", "erc721", "erc1155"],
          order: "desc",
          maxCount: "0x5" // Получаем последние 5
        }
      ]
    })
  });

  const data = await response.json();
  return data.result.transfers;
}