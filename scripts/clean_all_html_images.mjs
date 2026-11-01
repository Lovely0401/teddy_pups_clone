import fs from 'fs';
import path from 'path';

function cleanHtml(html) {
  // 1. Remove srcset/srcSet that points to /_next/image
  html = html.replace(/\s+(?:srcset|srcSet)=["\x27](?:https:\/\/puppy\.instabizweb\.com)?\/_next\/image\?[^"\x27]*["\x27]/gi, '');

  // 2. Fix src, href, xlink:href with /_next/image?url=...
  html = html.replace(/(src|href|xlink:href)=["\x27](?:https:\/\/puppy\.instabizweb\.com)?\/_next\/image\?url=([^"&\x27]+)(?:&amp;|&)[^"\x27]*["\x27]/gi, (match, attr, encoded) => {
    return `${attr}="${decodeURIComponent(encoded)}"`;
  });

  html = html.replace(/(src|href|xlink:href)=["\x27](?:https:\/\/puppy\.instabizweb\.com)?\/_next\/image\?url=([^"&\x27]+)["\x27]/gi, (match, attr, encoded) => {
    return `${attr}="${decodeURIComponent(encoded)}"`;
  });

  // 3. Any remaining /_next/image?url=
  html = html.replace(/(?:https:\/\/puppy\.instabizweb\.com)?\/_next\/image\?url=([^"&\s\)\x27]+)(?:&amp;|&)[^"'\s\)]*/gi, (match, encoded) => {
    return decodeURIComponent(encoded);
  });
  html = html.replace(/(?:https:\/\/puppy\.instabizweb\.com)?\/_next\/image\?url=([^"&\s\)\x27]+)/gi, (match, encoded) => {
    return decodeURIComponent(encoded);
  });

  // 4. Change loading="lazy" to loading="eager" so off-screen and tabbed images load instantly
  html = html.replace(/\bloading=["\x27]lazy["\x27]/gi, 'loading="eager"');

  return html;
}

function processDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'media') {
      processDir(full);
    } else if (entry.name.endsWith('.html')) {
      const original = fs.readFileSync(full, 'utf8');
      const cleaned = cleanHtml(original);
      if (cleaned !== original) {
        fs.writeFileSync(full, cleaned, 'utf8');
        console.log(`Cleaned and updated ${full}`);
      }
    }
  }
}

processDir('public');
console.log('All HTML files processed!');
