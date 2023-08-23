import type { Metadata } from 'next'
import './globals.css'

import Sidebar from '@/components/Sidebar';

import { Figtree } from 'next/font/google';

const font = Figtree({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AuraTune',
  description: 'Listen and Stream to Music',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={font.className}>
        <Sidebar>
          {children}
        </Sidebar>
      </body>
    </html>
  )
}
