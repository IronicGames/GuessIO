import type { Metadata } from 'next';
import '../styles/globals.css';
import { AuthProvider } from './providers/auth-provider';
import { AlertProvider } from './providers/alert-provider';
import AlertUrlHandler from '@/components/ui/Alert/AlertHandler';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

export const metadata: Metadata = {
  title: 'Guess.io',
  description: 'A multiplayer character guessing game.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-radial text-white">
        <MantineProvider>
          <AuthProvider>
            <AlertProvider>
              <AlertUrlHandler />
              {children}
            </AlertProvider>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
