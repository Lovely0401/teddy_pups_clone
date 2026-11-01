export function prefixHtmlWithBasePath(html: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  if (!basePath) return html;

  return html
    .replace(/(src|href|xlink:href)=(["'])\/(media|brand|puppies|how-it-works|faq|contact|gone-home|happy-families|cursor)/g, `$1=$2${basePath}/$3`)
    .replace(/href=(["'])\/(["'])/g, `href=$1${basePath}/$2`)
    .replace(/url\((["'\s]|&quot;)?\/(media|brand|cursor)/g, `url($1${basePath}/$2`);
}
