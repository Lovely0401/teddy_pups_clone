import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Happy families | TeddyPups U.A.E.',
  description:
    'Real stories and photos from families across Dubai and the UAE who welcomed their beloved puppy into their homes.',
};

export default function HappyFamiliesPage() {
  const filePath = path.join(process.cwd(), 'public', 'processed_happy_families.html');
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
