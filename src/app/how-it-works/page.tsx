import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { prefixHtmlWithBasePath } from '@/utils/htmlUtils';

export const metadata: Metadata = {
  title: 'How it works | TeddyPups U.A.E.',
  description:
    'Our transparent, caring process from meeting your puppy in Dubai to vet-checks, passport preparation, and lifelong care support.',
};

export default function HowItWorksPage() {
  const filePath = path.join(process.cwd(), 'public', 'processed_how_it_works.html');
  const fullHtml = fs.readFileSync(filePath, 'utf8');
  const match = fullHtml.match(/^<main([^>]*)>([\s\S]*?)<\/main>$/i);
  const innerHtml = prefixHtmlWithBasePath(match ? match[2] : fullHtml);

  return (
    <main
      id="main"
      tabIndex={-1}
      className="relative pt-[var(--header-h)] outline-none"
      dangerouslySetInnerHTML={{ __html: innerHtml }}
    />
  );
}
