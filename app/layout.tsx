import type { Metadata } from 'next';
import '@coinbase/onchainkit/styles.css';
import './globals.css';
import { RootProvider } from './rootProvider';

export const metadata: Metadata = {
  title: 'Build Together',
  description: 'My first onchain application on Base',
  openGraph: {
    title: 'Build Together',
    description: 'My first onchain application on Base',
    images: ['/og-image.png'],
  },
  other: {
    'fc:frame': JSON.stringify({
      version: "next",
      imageUrl: `https://my-base-app.vercel.app/og-image.png`, 
      button: {
        title: "Launch App",
        action: {
          type: "launch_frame",
          name: "Build Together",
          url: `https://my-base-app.vercel.app/`, 
          splashImageUrl: `https://my-base-app.vercel.app/og-image.png`,
          splashBackgroundColor: "#0052FF",
        },
      },
    }),
  } as any
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Это подключит стили в обход сборщика webpack/postcss */}
        <link rel="stylesheet" href="https://unpkg.com/@coinbase/onchainkit@0.17.0/dist/assets/style.css" />
      </head>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}