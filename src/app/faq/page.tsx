import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently asked questions | TeddyPups U.A.E.',
  description:
    'Answers about our teacup puppies, showroom visits in Downtown Dubai, vaccinations, microchipping, reservations, and delivery.',
};

export default function FAQPage() {
  const filePath = path.join(process.cwd(), 'public', 'processed_faq.html');
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
