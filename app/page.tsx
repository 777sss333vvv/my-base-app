'use client';

import { 
  ConnectWallet, 
  Wallet, 
  WalletDropdown, 
  WalletDropdownDisconnect 
} from '@coinbase/onchainkit/wallet';
import { 
  Transaction, 
  TransactionButton,
} from '@coinbase/onchainkit/transaction';
import { base } from 'viem/chains';

export default function Page() {
  return (
    // Фоновый слой (Синий градиент в стиле Base)
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0052FF] text-white">
      
      {/* Заголовок */}
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-2">
          Build Together
        </h1>
        <p className="text-lg opacity-90">My First Base Mini App</p>
      </header>

      {/* Основная карточка приложения */}
      <main className="flex flex-col items-center gap-6 bg-white p-10 rounded-[32px] shadow-2xl w-full max-w-sm">
        <h2 className="text-black text-2xl font-bold">Welcome</h2>
        
        {/* Кнопка подключения кошелька */}
        <div className="w-full flex justify-center">
          <Wallet>
            <ConnectWallet className="bg-[#0052FF] hover:bg-[#0042CC] text-white rounded-xl px-8 py-3 font-semibold transition-all" />
            <WalletDropdown>
              <WalletDropdownDisconnect />
            </WalletDropdown>
          </Wallet>
        </div>

        {/* Кнопка Check-in */}
        <div className="w-full mt-4">
          <Transaction
            chainId={base.id}
            calls={[{
              to: "0x31DB887337778319761330f79E4699a3f9A5F6c3", // Пока пустой адрес для теста
              value: BigInt(0),
            }]}
          >
            <TransactionButton 
              className="w-full bg-black hover:bg-zinc-800 text-white rounded-xl py-4 font-bold text-lg transition-transform active:scale-95"
              text="Check in" 
            />
          </Transaction>
        </div>
      </main>

      <footer className="mt-10 opacity-60 text-sm">
        Powered by Base
      </footer>
    </div>
  );
}