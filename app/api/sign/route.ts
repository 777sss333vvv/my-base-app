import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(req: Request) {
  try {
    const { userAddress } = await req.json();
    
    const pKey = process.env.ORACLE_PRIVATE_KEY;
    const aKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    // Убедись, что здесь ТВОЙ адрес контракта из файла page.tsx
    const contractAddress = "0x2dAbB90b88AAA212cfa01913d2C9a7D7fC592e49"; 

    if (!pKey || !aKey || !contractAddress) {
      return NextResponse.json({ error: 'Config error' }, { status: 500 });
    }

    // Универсальный способ создания провайдера
    const url = `https://base-mainnet.g.alchemy.com/v2/${aKey}`;
    const provider = new ethers.providers.JsonRpcProvider(url);
    const wallet = new ethers.Wallet(pKey, provider);

    // Получаем lastClaimTime прямо из контракта
    const contract = new ethers.Contract(
      contractAddress,
      ["function lastClaimTime(address) view returns (uint256)"],
      provider
    );

    const lastClaim = await contract.lastClaimTime(userAddress);

    // Хешируем: адрес + время (строго как в Solidity)
    const messageHash = ethers.utils.solidityKeccak256(
      ["address", "uint256"],
      [userAddress, lastClaim]
    );

    // Подписываем массив байтов
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    return NextResponse.json({ signature });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Sign failed', details: msg }, { status: 500 });
  }
}