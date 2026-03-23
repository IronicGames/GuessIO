import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { AppHeader } from '@components/Header/AppHeader';
import { AuthProvider } from '@providers/auth-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <MantineProvider defaultColorScheme="dark">
          <AuthProvider>
            <div
              style={{
                minHeight: '100vh',
                background: 'radial-gradient(#394d67 0%, #1b2430 100%)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Persistent Header */}
              <AppHeader />

              {/* Main Content */}
              <main
                style={{
                  flex: 1,
                  alignContent: 'center',
                }}
              >
                {children}
              </main>
            </div>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
