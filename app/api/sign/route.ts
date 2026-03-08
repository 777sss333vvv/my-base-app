import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(request: Request) {
  try {
    const { userAddress } = await request.json();

    if (!userAddress) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    const privateKey = process.env.ORACLE_PRIVATE_KEY;
    const alchemyUrl = `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
    
    if (!privateKey || !process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
      return NextResponse.json({ error: 'Config error' }, { status: 500 });
    }

    // Синтаксис ethers v5
    const provider = new ethers.providers.JsonRpcProvider(alchemyUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const CONTRACT_ADDRESS = "0x2dAbB90b88AAA212cfa01913d2C9a7D7fC592e49";
    const ABI = ["function lastClaimTime(address) view returns (uint256)"];
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    // 1. Получаем время из контракта
    const lastTime = await contract.lastClaimTime(userAddress);

    // 2. Создаем хэш (v5 синтаксис)
    const messageHash = ethers.utils.solidityKeccak256(
      ["address", "uint256"],
      [userAddress, lastTime]
    );

    // 3. Подписываем (v5 использует arrayify)
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    return NextResponse.json({ signature });
  } catch (error) {
    console.error('Oracle Error:', error);
    return NextResponse.json({ error: 'Failed to sign' }, { status: 500 });
  }
}