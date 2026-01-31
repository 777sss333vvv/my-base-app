import type { Metadata } from 'next';
import './globals.css';
import { RootProvider } from './rootProvider';

export const metadata: Metadata = {
  title: 'Prosperity Pass',
  description: 'Your ultimate gateway to the Base ecosystem',
  other: {
    'base:app_id': '697e512e2aafa0bc9ad8a312',
    'fc:frame': JSON.stringify({
      version: "next",
      imageUrl: `https://www.prosperitypass.xyz/og-image.png`, 
      button: {
        title: "Launch App",
        action: {
          type: "launch_frame",
          name: "Prosperity Pass",
          url: `https://www.prosperitypass.xyz/`, 
        },
      },
    }),
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/@coinbase/onchainkit@latest/dist/assets/style.css" 
        />
      </head>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}