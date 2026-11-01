import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppFloating } from '@/components/WhatsAppFloating';
import { AnimationController } from '@/components/AnimationController';
import { PageCurtain } from '@/components/PageCurtain';
import { PupScrollActor } from '@/components/PupScrollActor';
import { PawTrailCanvas } from '@/components/PawTrailCanvas';
import { COMPANY_INFO } from '@/data/puppies';

export const metadata: Metadata = {
  metadataBase: new URL('https://puppy.instabizweb.com'),
  title: 'TeddyPups U.A.E. — Premium teacup puppies in Dubai',
  description:
    'Teddy bear and teacup puppies in Dubai. Meet local puppies in our Downtown Dubai showroom or bring home a rare breed imported from trusted breeders.',
  applicationName: COMPANY_INFO.name,
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'TeddyPups U.A.E. — Premium teacup puppies in Dubai',
    description:
      'Teddy bear and teacup puppies in Dubai. Meet local puppies in our Downtown Dubai showroom or bring home a rare breed imported from trusted breeders.',
    images: ['https://puppy.instabizweb.com/brand/logo.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TeddyPups U.A.E. — Premium teacup puppies in Dubai',
    description:
      'Teddy bear and teacup puppies in Dubai. Meet local puppies in our Downtown Dubai showroom or bring home a rare breed imported from trusted breeders.',
    images: ['https://puppy.instabizweb.com/brand/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col bg-[#fffdf8] text-[#2a170e] antialiased selection:bg-[#f2be6b]/40">
        <PageCurtain />
        <Navbar />
        {children}
        <Footer />
        <WhatsAppFloating />
        <AnimationController />
        <PupScrollActor />
        <PawTrailCanvas />
      </body>
    </html>
  );
}
