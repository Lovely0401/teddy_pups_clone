import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Already gone home | TeddyPups U.A.E.',
  description:
    'Our past puppies that have already been adopted by loving families in Dubai and worldwide.',
};

export default function GoneHomePage() {
  const filePath = path.join(process.cwd(), 'public', 'processed_gone_home.html');
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
