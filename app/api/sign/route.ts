import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(req: Request) {
  try {
    const { userAddress, lastClaimTime } = await req.json();
    
    const pKey = process.env.ORACLE_PRIVATE_KEY;
    if (!pKey) {
      return NextResponse.json({ error: 'Config error: Key missing' }, { status: 500 });
    }

    // Создаем кошелек для подписи (провайдер не нужен)
    const WalletClass = ethers.Wallet as unknown as {
      new (key: string): ethers.Wallet;
    };
    const wallet = new WalletClass(pKey);

    // ВАЖНО: Превращаем время в BigNumber для точного соответствия uint256 в Solidity
    const timeValue = ethers.BigNumber.from(lastClaimTime);

    // Генерируем хеш точно по логике контракта: keccak256(abi.encodePacked(address, uint256))
    const messageHash = ethers.utils.solidityKeccak256(
      ["address", "uint256"],
      [userAddress, timeValue]
    );

    // Подписываем бинарное представление хеша
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    return NextResponse.json({ signature });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Sign failed', details: errorMessage }, { status: 500 });
  }
}