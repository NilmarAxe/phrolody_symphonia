import type { Metadata } from 'next';
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Phrolody Symphonia',
    template: '%s | Phrolody Symphonia',
  },
  description: 'Classical music streaming platform with sophisticated design and premium experience',
  keywords: ['classical music', 'streaming', 'symphony', 'opera', 'concerto', 'piano', 'orchestra'],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://phrolodysymphonia.com',
    title: 'Phrolody Symphonia',
    description: 'Classical music streaming platform',
    siteName: 'Phrolody Symphonia',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Phrolody Symphonia',
    description: 'Classical music streaming platform',
    creator: '@phrolodysymphonia',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}