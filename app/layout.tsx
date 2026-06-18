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
  title: 'Surya Peddishetti | AI & Full-Stack Engineer',
  description:
    'Creative developer building cinematic web experiences, interactive 3D portfolios, and AI-powered full stack apps.',
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    title: 'Surya Peddishetti | AI & Full-Stack Engineer',
    description:
      'Creative developer building cinematic web experiences, interactive 3D portfolios, and AI-powered full stack apps.',
    url: 'https://surya-lemon.vercel.app',
    siteName: 'Surya Peddishetti Portfolio',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Surya Peddishetti - Portfolio Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Surya Peddishetti | AI & Full-Stack Engineer',
    description:
      'Creative developer building cinematic web experiences, interactive 3D portfolios, and AI-powered full stack apps.',
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
