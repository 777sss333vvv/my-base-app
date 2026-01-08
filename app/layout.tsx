import type { Metadata } from 'next';
import './globals.css';
import { RootProvider } from './rootProvider';

// Базовая настройка метаданных
export const metadata: Metadata = {
  title: 'Build Together',
  description: 'My first onchain application on Base',
  openGraph: {
    title: 'Build Together',
    description: 'My first onchain application on Base',
    images: ['/og-image.png'], // Упрощенный путь
  },
  other: {
    // Теги для Farcaster Frames v2
    'fc:frame': 'vNext',
    'fc:frame:image': '/og-image.png',
    'fc:frame:button:1': 'Check in Now',
    'fc:frame:post_url': '/api/frame',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}