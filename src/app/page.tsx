import fs from 'fs';
import path from 'path';
import { prefixHtmlWithBasePath } from '@/utils/htmlUtils';

export default function HomePage() {
  const filePath = path.join(process.cwd(), 'public', 'processed_home_main.html');
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
