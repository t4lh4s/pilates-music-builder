import type { Metadata } from 'next'
import { ClerkProvider, UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pilates Music Builder',
  description: 'The trusted class planning app for Pilates instructors worldwide',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
