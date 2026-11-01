import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Visit & contact | TeddyPups U.A.E.',
  description:
    'Visit our showroom in Downtown Dubai or contact our puppy concierge via WhatsApp or email.',
};

export default function ContactPage() {
  const filePath = path.join(process.cwd(), 'public', 'processed_contact.html');
  const fullHtml = fs.readFileSync(filePath, 'utf8');
  const match = fullHtml.match(/^<main([^>]*)>([\s\S]*?)<\/main>$/i);
  const innerHtml = match ? match[2] : fullHtml;

  return (
    <main
      id="main"
      tabIndex={-1}
      className="relative pt-[var(--header-h)] outline-none"
      dangerouslySetInnerHTML={{ __html: innerHtml }}
    />
  );
}
