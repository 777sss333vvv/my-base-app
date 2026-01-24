"use client";
import { ReactNode, useMemo } from "react";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { coinbaseWallet } from "wagmi/connectors";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector"; // Специальный коннектор
import "@coinbase/onchainkit/styles.css";

// Создаем клиент для запросов (нужен для Wagmi)
const queryClient = new QueryClient();

export function RootProvider({ children }: { children: ReactNode }) {
  // Настраиваем Wagmi вручную, чтобы добавить Farcaster
  const wagmiConfig = useMemo(() => {
    return createConfig({
      chains: [base],
      connectors: [
        farcasterFrame(), // Это заставляет Warpcast видеть встроенный кошелек
        coinbaseWallet({ 
          appName: "Build Together",
          preference: 'all' 
        }),
      ],
      transports: {
        [base.id]: http(),
      },
    });
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
          config={{
            appearance: {
              mode: "auto",
            },
          }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}