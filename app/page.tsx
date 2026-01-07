'use client';

import { useState } from 'react'; // 1. Добавили состояние
import { 
  ConnectWallet, 
  Wallet, 
  WalletDropdown, 
  WalletDropdownDisconnect 
} from '@coinbase/onchainkit/wallet';
import { 
  Transaction, 
  TransactionButton,
  TransactionStatus,
  TransactionToast, // Красивое всплывающее уведомление
  TransactionToastIcon,
  TransactionToastLabel,
  TransactionToastAction,
} from '@coinbase/onchainkit/transaction';
import { base } from 'viem/chains';

export default function Page() {
  // Переменная, которая запоминает, всё ли прошло успешно
  const [successful, setSuccessful] = useState(false);

  // Функция, которая срабатывает при обновлении статуса транзакции
  const handleStatus = (status: any) => {
    console.log('Status:', status); // Для отладки в консоли
    if (status.statusName === 'success') {
      setSuccessful(true); // Включаем режим успеха!
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0052FF] text-white font-sans">
      
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-2">
          Build Together
        </h1>
        <p className="text-lg opacity-90">My First Base Mini App</p>
      </header>

      <main className="flex flex-col items-center gap-6 bg-white p-10 rounded-[32px] shadow-2xl w-full max-w-sm text-black">
        
        {/* Если успех — показываем поздравление, иначе — обычный экран */}
        {successful ? (
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Success!</h2>
            <p className="text-gray-600 mb-6">You have successfully checked in on Base.</p>
            <button 
              onClick={() => setSuccessful(false)}
              className="bg-gray-100 hover:bg-gray-200 text-black px-6 py-2 rounded-xl font-semibold transition"
            >
              Back
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold">Welcome</h2>
            
            <div className="w-full flex justify-center">
              <Wallet>
                <ConnectWallet className="bg-[#0052FF] hover:bg-[#0042CC] text-white rounded-xl px-8 py-3 font-semibold transition-all" />
                <WalletDropdown>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            </div>

            <div className="w-full mt-4">
              <Transaction
                chainId={base.id}
                calls={[{
                  to: "0x31DB887337778319761330f79E4699a3f9A5F6c3", // Ваш адрес
                  value: BigInt(0), // Используем безопасный формат
                }]}
                onStatus={handleStatus} // <-- Вот тут магия, слушаем статус
              >
                <TransactionButton 
                  className="w-full bg-black hover:bg-zinc-800 text-white rounded-xl py-4 font-bold text-lg transition-transform active:scale-95"
                  text="Check in" 
                />
                
                {/* Всплывающее уведомление от OnchainKit */}
                <TransactionToast>
                  <TransactionToastIcon />
                  <TransactionToastLabel />
                  <TransactionToastAction />
                </TransactionToast>
              </Transaction>
            </div>
          </>
        )}
      </main>

      <footer className="mt-10 opacity-60 text-sm text-white">
        Powered by Base
      </footer>
    </div>
  );
}