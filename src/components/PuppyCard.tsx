import Image from 'next/image';
import { MessageCircle, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { Puppy } from '@/types';
import { COMPANY_INFO } from '@/data/puppies';

interface PuppyCardProps {
  puppy: Puppy;
}

export function PuppyCard({ puppy }: PuppyCardProps) {
  const isAvailable = puppy.status === 'available';
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const puppyHref = basePath
    ? `${basePath}/puppies/${puppy.slug}/`
    : `/puppies/${puppy.slug}/`;
  const rawImage = puppy.images[0] || '/media/Z0ToauDx7Eve/5fffe4d022/b942a5_4b8cfb8204d24eadaf524332aba1dc15-mv2.webp';
  const mainImage = basePath && rawImage.startsWith('/') && !rawImage.startsWith(basePath)
    ? `${basePath}${rawImage}`
    : rawImage;

  const whatsappMessage = encodeURIComponent(
    `Hi TeddyPups! I'm interested in ${puppy.name} (${puppy.breed}, ${puppy.gender}, age: ${puppy.age}). Could you share more details and photos?`
  );

  return (
    <div className="card-sketch group flex flex-col h-full overflow-hidden bg-white">
      {/* Image Container */}
      <a href={puppyHref} className="relative aspect-square w-full overflow-hidden bg-[#fbe3b4]/30 block">
        <Image
          src={mainImage}
          alt={`${puppy.name} - ${puppy.breed}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Origin Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#fffdf8]/90 text-[#2a170e] border border-[#2a170e]/20 shadow-sm backdrop-blur-xs">
            {puppy.originCategory}
          </span>
          {puppy.featured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#f2be6b] text-[#2a170e] border border-[#2a170e]/20 flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3 fill-current" />
              Featured
            </span>
          )}
        </div>

        {/* Status Badge & Video Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {puppy.videoUrl && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#2a170e]/85 text-white flex items-center gap-1 shadow-sm backdrop-blur-xs">
              <span className="text-[#f2be6b]">▶</span> video
            </span>
          )}
          {isAvailable ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#25d366] text-white flex items-center gap-1 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Available
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#5a3a28] text-white shadow-sm">
              Gone Home
            </span>
          )}
        </div>
      </a>

      {/* Details Container */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <a href={puppyHref} className="hover:text-[#c2622b] transition-colors">
                <h3 className="font-serif text-2xl font-bold text-[#2a170e]">
                  {puppy.name}
                </h3>
              </a>
              <p className="text-sm font-semibold text-[#c2622b]">
                {puppy.breed}
              </p>
            </div>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
              puppy.gender === 'Male'
                ? 'bg-[#bfddf5]/40 text-[#2f6e9e] border-[#2f6e9e]/30'
                : 'bg-[#f9cdbf]/40 text-[#c2622b] border-[#c2622b]/30'
            }`}>
              {puppy.gender === 'Male' ? 'Boy' : 'Girl'}
            </span>
          </div>

          <p className="text-xs text-[#5a3a28] line-clamp-2 mt-2 leading-relaxed">
            {puppy.description}
          </p>

          {/* Quick Specs */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#2a170e]/10 text-xs text-[#2a170e]/80">
            <div>
              <span className="text-[#5a3a28]/70 block">Age</span>
              <span className="font-bold">{puppy.age}</span>
            </div>
            <div>
              <span className="text-[#5a3a28]/70 block">Est. Weight</span>
              <span className="font-bold">{puppy.weightEstimate}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 pt-3 border-t border-[#2a170e]/10 flex gap-2">
          <a
            href={puppyHref}
            className="flex-1 btn-outline text-xs py-2 text-center"
          >
            View Details
          </a>
          {isAvailable ? (
            <a
              href={`https://wa.me/${COMPANY_INFO.whatsappRaw}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp text-xs py-2 px-3 shrink-0"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp</span>
            </a>
          ) : (
            <span className="text-xs text-[#5a3a28]/60 self-center font-medium px-2">
              With Happy Family
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

