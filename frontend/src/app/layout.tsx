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
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-50">
          {/* CopilotSidebar temporarily disabled */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}