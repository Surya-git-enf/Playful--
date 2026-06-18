import type { Metadata, Viewport } from 'next'
import {
  Orbitron,
  Space_Mono,
  Instrument_Serif,
  Press_Start_2P,
  Bebas_Neue,
  Cinzel_Decorative,
} from 'next/font/google'
import '../styles/globals.css'

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-orbitron',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const pressStart2P = Press_Start_2P({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-pixel',
  display: 'swap',
})

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas',
  display: 'swap',
})

const cinzelDecorative = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-cinzel',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://surya-lemon.vercel.app'),
  title: 'Playful - Turn Words Into Worlds',
  description: 'Type a prompt, get a playable game in seconds. No code required.',
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    title: 'Playful - Turn Words Into Worlds',
    description: 'Type a prompt, get a playable game in seconds.',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Playful - Turn Words Into Worlds',
    description: 'Type a prompt, get a playable game in seconds.',
    images: ['/logo.png'],
  },
}

// themeColor must live in viewport export (Next.js 15+)
export const viewport: Viewport = {
  themeColor: '#020510',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={[
      orbitron.variable,
      spaceMono.variable,
      instrumentSerif.variable,
      pressStart2P.variable,
      bebasNeue.variable,
      cinzelDecorative.variable,
    ].join(' ')}>
      <body>{children}</body>
    </html>
  )
}
