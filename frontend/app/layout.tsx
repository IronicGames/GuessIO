import type { Metadata } from 'next';

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
      <body>{children}</body>
    </html>
  );
}
