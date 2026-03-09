import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Минимальный ABI, чтобы узнать время последнего клейма из контракта
const contractAbi = [
  "function lastClaimTime(address) view returns (uint256)"
];

export async function POST(req: Request) {
  try {
    const { userAddress } = await req.json();
    
    const pKey = process.env.ORACLE_PRIVATE_KEY;
    const aKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    const contractAddress = "0x2dAbB90b88AAA212cfa01913d2C9a7D7fC592e49";

    if (!pKey || !aKey || !contractAddress) {
      return NextResponse.json({ error: 'Config error' }, { status: 500 });
    }

    const provider = new ethers.providers.JsonRpcProvider(`https://base-mainnet.g.alchemy.com/v2/${aKey}`);
    const wallet = new ethers.Wallet(pKey, provider);

    // 1. Получаем lastClaimTime прямо из контракта (это критически важно!)
    const contract = new ethers.Contract(contractAddress, contractAbi, provider);
    const lastClaimTime = await contract.lastClaimTime(userAddress);

    // 2. Создаем хэш точно так же, как в Solidity: keccak256(abi.encodePacked(address, uint256))
    const messageHash = ethers.utils.solidityKeccak256(
      ["address", "uint256"],
      [userAddress, lastClaimTime]
    );

    // 3. Подписываем этот хэш (signMessage добавит префикс Ethereum автоматически)
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    return NextResponse.json({ signature });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Sign failed', details: errorMessage }, { status: 500 });
  }
}