export function prefixHtmlWithBasePath(html: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  if (!basePath) return html;

  let res = html
    .replace(/(src|href|xlink:href)=(["'])\/(media|brand|puppies|how-it-works|faq|contact|gone-home|happy-families|cursor)/g, `$1=$2${basePath}/$3`)
    .replace(/href=(["'])\/(["'])/g, `href=$1${basePath}/$2`)
    .replace(/url\((["'\s]|&quot;)?\/(media|brand|cursor)/g, `url($1${basePath}/$2`);

  // Ensure trailing slash on all internal route links for static export
  res = res.replace(new RegExp(`href=(["'])${basePath}\\/([a-zA-Z0-9_\\-\\/]+?)(["'])`, 'g'), (match, q1, path, q2) => {
    if (path.endsWith('/') || path.includes('#') || path.includes('.')) return match;
    return `href=${q1}${basePath}/${path}/${q2}`;
  });

  return res;
}

