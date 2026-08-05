import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Discord Bot Hosting',
  description: 'Platformă gratuită pentru găzduirea bot-urilor Discord',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" className="dark">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
