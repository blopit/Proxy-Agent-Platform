import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
// import { CopilotKit } from '@copilotkit/react-core'
// import { CopilotSidebar } from '@copilotkit/react-ui'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Proxy Agent Platform',
  description: 'Personal productivity platform with AI proxy agents',
  manifest: '/manifest.json',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress hydration warnings for browser extension attributes
              if (typeof window !== 'undefined') {
                const originalError = console.error;
                console.error = function(...args) {
                  if (
                    args[0] &&
                    typeof args[0] === 'string' &&
                    (args[0].includes('Hydration failed') ||
                     args[0].includes('hydration') ||
                     args[0].includes('data-new-gr-c-s-check-loaded') ||
                     args[0].includes('data-gr-ext-installed') ||
                     args[0].includes('__gchrome_remoteframetoken'))
                  ) {
                    return; // Suppress browser extension hydration errors
                  }
                  originalError.apply(console, args);
                };
              }
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <div className="min-h-screen bg-gray-50">
          {/* CopilotSidebar temporarily disabled */}
          <main className="w-full">
            {children}
          </main>
        </div>
        <Toaster
          position="top-center"
          toastOptions={{
            // Solarized theme
            style: {
              background: '#073642', // base02
              color: '#93a1a1', // base1
              border: '1px solid #586e75', // base01
            },
            success: {
              iconTheme: {
                primary: '#859900', // green
                secondary: '#073642',
              },
            },
            error: {
              iconTheme: {
                primary: '#dc322f', // red
                secondary: '#073642',
              },
              style: {
                border: '1px solid #dc322f',
              },
            },
          }}
        />
      </body>
    </html>
  )
}