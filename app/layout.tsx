import type { Metadata } from 'next';
import { getFrameMetadata } from '@coinbase/onchainkit/frame'; // Импорт для фреймов
import './globals.css';
import { RootProvider } from './rootProvider';

// Настройка того, как приложение выглядит в соцсетях и Base
export const metadata: Metadata = {
  title: 'Build Together Mini App',
  description: 'My first onchain application on Base',
  openGraph: {
    title: 'Build Together',
    description: 'My first onchain application on Base',
    images: [`https://${process.env.VERCEL_URL}/og-image.png`],
  },
  // Специальные теги для Farcaster и Base
  other: {
    ...getFrameMetadata({
      buttons: [{ label: 'Check in Now', action: 'post' }],
      image: { src: `https://${process.env.VERCEL_URL}/og-image.png` },
      input: { text: 'Your message' },
      postUrl: `https://${process.env.VERCEL_URL}/api/frame`,
    }),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}