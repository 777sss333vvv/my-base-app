import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(req: Request) {
  try {
    const { userAddress } = await req.json();
    
    const pKey = process.env.ORACLE_PRIVATE_KEY;
    const aKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    // ВСТАВЬ СВОЙ АДРЕС КОНТРАКТА НИЖЕ:
    const contractAddress = "0x2dAbB90b88AAA212cfa01913d2C9a7D7fC592e49"; 

    if (!pKey || !aKey || !contractAddress || contractAddress === "0x2dAbB90b88AAA212cfa01913d2C9a7D7fC592e49") {
      return NextResponse.json({ error: 'Config error: Check contract address' }, { status: 500 });
    }

    const provider = new ethers.providers.JsonRpcProvider(`https://base-mainnet.g.alchemy.com/v2/${aKey}`);
    const wallet = new ethers.Wallet(pKey, provider);

    // Получаем время последнего клейма прямо из маппинга контракта
    const contract = new ethers.Contract(
      contractAddress, 
      ["function lastClaimTime(address) view returns (uint256)"], 
      provider
    );
    
    const lastClaim = await contract.lastClaimTime(userAddress);

    // Хешируем точно так же, как в Solidity: keccak256(abi.encodePacked(address, uint256))
    const messageHash = ethers.utils.solidityKeccak256(
      ["address", "uint256"],
      [userAddress, lastClaim]
    );

    // Подписываем хэш
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    return NextResponse.json({ signature });
 } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Sign failed', details: errorMessage }, { status: 500 });
  }
}