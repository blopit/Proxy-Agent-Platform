import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CopilotKit } from '@copilotkit/react-core'
import { CopilotSidebar } from '@copilotkit/react-ui'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Proxy Agent Platform',
  description: 'Personal productivity platform with AI proxy agents',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CopilotKit url="/api/copilot">
          <div className="flex h-screen bg-gray-50">
            <CopilotSidebar
              labels={{
                title: "Proxy Agent Assistant",
                initial: "How can I help you be more productive today?",
              }}
              className="w-80"
            />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
          <Toaster position="top-right" />
        </CopilotKit>
      </body>
    </html>
  )
}