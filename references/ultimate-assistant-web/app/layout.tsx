import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from './providers/theme-provider'

export const metadata: Metadata = {
  title: "Ultimate Assistant",
  description: "Your AI assistant for everything",
  metadataBase: new URL('https://shrenp.com'),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
