import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { PUPPIES } from '@/data/puppies';
import { PuppyDetailView } from './PuppyDetailView';

export async function generateStaticParams() {
  return PUPPIES.map((puppy) => ({
    slug: puppy.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const puppy = PUPPIES.find((p) => p.slug === slug);

  if (!puppy) {
    return {
      title: 'Puppy not found | TeddyPups U.A.E.',
    };
  }

  return {
    title: `${puppy.name}, ${puppy.breed} puppy | TeddyPups U.A.E.`,
    description: `Meet ${puppy.name}: ${puppy.breed}, ${puppy.gender.toLowerCase()}, ${puppy.age} old, ${puppy.originCategory.toLowerCase()}. Real photos and health verification from TeddyPups U.A.E.`,
    openGraph: {
      title: `${puppy.name} — ${puppy.breed} | TeddyPups U.A.E.`,
      description: puppy.description,
      images: puppy.images[0] ? [puppy.images[0]] : ['/brand/logo.png'],
    },
  };
}

export default async function PuppyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const puppy = PUPPIES.find((p) => p.slug === slug);

  if (!puppy) {
    notFound();
  }

  const htmlPath = path.join(process.cwd(), 'public', 'puppies_html', `${slug}.html`);
  if (fs.existsSync(htmlPath)) {
    const fullHtml = fs.readFileSync(htmlPath, 'utf8');
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

  return (
    <main id="main" tabIndex={-1} className="relative pt-[var(--header-h)] outline-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <PuppyDetailView puppy={puppy} />
      </div>
    </main>
  );
}
