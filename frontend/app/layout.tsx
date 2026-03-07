import type { Metadata } from 'next';
import "../styles/globals.css";

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
      <body className="min-h-dvh bg-radial text-white">{children}</body>
    </html>
  );
}
