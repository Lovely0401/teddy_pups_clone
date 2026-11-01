import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Available puppies | TeddyPups U.A.E.',
  description:
    'Browse our curated collection of healthy, certified teacup and teddy bear puppies in Dubai. View photos, videos, weights, and health guarantees.',
};

export default function PuppiesPage() {
  const filePath = path.join(process.cwd(), 'public', 'processed_puppies.html');
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
