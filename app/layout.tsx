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
  other: {
    'fc:frame': JSON.stringify({
      version: "next",
      imageUrl: `https://my-base-app.vercel.app/og-image.png`,
      button: {
        title: "Launch App",
        action: {
          type: "launch_frame",
          name: "Build Together",
          url: `https://your-app-name.vercel.app/`,
          splashImageUrl: `https://your-app-name.vercel.app/og-image.png`,
          splashBackgroundColor: "#0052FF",
        },
      },
    }),
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