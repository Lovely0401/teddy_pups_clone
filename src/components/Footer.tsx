import fs from 'fs';
import path from 'path';

export function Footer() {
  const filePath = path.join(process.cwd(), 'public', 'exact_footer.html');
  const fullHtml = fs.readFileSync(filePath, 'utf8');
  const match = fullHtml.match(/^<footer([^>]*)>([\s\S]*?)<\/footer>$/i);
  const innerHtml = match ? match[2] : fullHtml;

  return (
    <footer
      className="tp-footer relative pb-[calc(var(--bar-h)+2rem)] text-milk md:pb-10"
      dangerouslySetInnerHTML={{ __html: innerHtml }}
    />
  );
}
