'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MessageCircle, ShieldCheck, Phone, CheckCircle2, Video, Calendar } from 'lucide-react';
import { Puppy } from '@/types';
import { COMPANY_INFO } from '@/data/puppies';

interface PuppyDetailViewProps {
  puppy: Puppy;
}

export function PuppyDetailView({ puppy }: PuppyDetailViewProps) {
  const [selectedImage, setSelectedImage] = useState<string>(puppy.images[0] || '');
  const isAvailable = puppy.status === 'available';
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const resolveImg = (imgUrl: string) =>
    basePath && imgUrl.startsWith('/') && !imgUrl.startsWith(basePath)
      ? `${basePath}${imgUrl}`
      : imgUrl;

  const whatsappMessage = encodeURIComponent(
    `Hi TeddyPups! I'm interested in ${puppy.name}, the ${puppy.breed}: https://puppy.instabizweb.com/puppies/${puppy.slug}`
  );

  return (
    <div className="space-y-16">
      {/* Top Grid: Gallery & Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* LEFT: Media Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Preview */}
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden border-2 border-[#2a170e] bg-[#fbe3b4]/30 shadow-[6px_6px_0px_#2a170e]">
            <Image
              src={resolveImg(selectedImage || puppy.images[0])}
              alt={`${puppy.name} - ${puppy.breed}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#fffdf8]/95 text-[#2a170e] border border-[#2a170e]/20 shadow-sm backdrop-blur-xs">
                {puppy.originCategory}
              </span>
              {puppy.videoUrl && (
                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#2a170e]/90 text-white flex items-center gap-1.5 shadow-sm">
                  <span className="text-[#f2be6b]">▶</span> video
                </span>
              )}
            </div>

            <div className="absolute top-4 right-4">
              {isAvailable ? (
                <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#25d366] text-white flex items-center gap-1.5 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  Available
                </span>
              ) : (
                <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#5a3a28] text-white shadow-sm">
                  Gone Home
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails Row */}
          {puppy.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 pt-1">
              {puppy.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-[#c2622b] scale-105 shadow-[2px_2px_0px_#2a170e]'
                      : 'border-[#2a170e]/30 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={resolveImg(img)}
                    alt={`${puppy.name} thumbnail ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Video Player */}
          {puppy.videoUrl && (
            <div className="card-sketch p-4 bg-white space-y-2 mt-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#2a170e]">
                <Video className="w-4 h-4 text-[#c2622b]" />
                <span>Watch {puppy.name}&apos;s video clip</span>
              </div>
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-[#2a170e]/20">
                <video
                  src={puppy.videoUrl}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Specs & Inquiries (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#2a170e]">
              {puppy.name}
            </h1>
            <p className="text-base text-[#5a3a28] mt-3 leading-relaxed">
              {puppy.description}
            </p>
          </div>

          {/* Specs Box */}
          <div className="card-sketch p-6 bg-white space-y-4">
            <h3 className="font-serif text-base font-bold text-[#2a170e] border-b border-[#2a170e]/10 pb-2">
              Puppy details
            </h3>
            <dl className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <dt className="text-[#5a3a28]/70 font-medium">Breed</dt>
                <dd className="font-bold text-sm text-[#2a170e] mt-0.5">{puppy.breed}</dd>
              </div>
              <div>
                <dt className="text-[#5a3a28]/70 font-medium">Boy or girl</dt>
                <dd className="font-bold text-sm text-[#2a170e] mt-0.5">{puppy.gender === 'Male' ? 'Boy' : 'Girl'}</dd>
              </div>
              <div>
                <dt className="text-[#5a3a28]/70 font-medium">Age</dt>
                <dd className="font-bold text-sm text-[#2a170e] mt-0.5">{puppy.age}</dd>
              </div>
              <div>
                <dt className="text-[#5a3a28]/70 font-medium">Where</dt>
                <dd className="font-bold text-sm text-[#2a170e] mt-0.5">
                  {puppy.originCategory === 'In Dubai' ? 'In our showroom' : 'Imported for you'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Primary CTA */}
          <div className="space-y-3 pt-2">
            {isAvailable ? (
              <>
                <a
                  href={`https://wa.me/${COMPANY_INFO.whatsappRaw}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp w-full py-4 text-base"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Ask about {puppy.name} on WhatsApp</span>
                </a>
                <a
                  href={`tel:${COMPANY_INFO.phone}`}
                  className="btn-outline w-full py-3 text-sm text-center"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call: {COMPANY_INFO.phone}</span>
                </a>
              </>
            ) : (
              <div className="p-5 rounded-2xl bg-[#fbe3b4]/50 border-2 border-[#2a170e] text-center space-y-2">
                <span className="font-serif font-bold text-base text-[#2a170e] block">
                  {puppy.name} has found their forever family!
                </span>
                <p className="text-xs text-[#5a3a28]">
                  We can source a puppy with identical breed, color, and size characteristics through our Order Upon Request service.
                </p>
                <a
                  href={`https://wa.me/${COMPANY_INFO.whatsappRaw}?text=${encodeURIComponent(
                    `Hi TeddyPups! I love ${puppy.name} (${puppy.breed}). Could you help me find a similar puppy?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp w-full py-2.5 text-xs inline-flex mt-2"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Request similar puppy on WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Every Teddy Pup Comes Section */}
      <section className="card-sketch p-8 sm:p-12 bg-white space-y-8">
        <div>
          <span className="font-scrawl text-lg text-[#c2622b] font-semibold block">
            Health & peace of mind
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#2a170e]">
            Every Teddy Pup comes
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-2xl bg-[#fffdf8] border border-[#2a170e]/15 space-y-2">
            <CheckCircle2 className="w-6 h-6 text-[#25d366]" />
            <h4 className="font-serif font-bold text-sm text-[#2a170e]">Vet-Checked</h4>
            <p className="text-xs text-[#5a3a28]">Thorough physical check-up by certified licensed veterinarians.</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#fffdf8] border border-[#2a170e]/15 space-y-2">
            <CheckCircle2 className="w-6 h-6 text-[#25d366]" />
            <h4 className="font-serif font-bold text-sm text-[#2a170e]">Vaccinated & Dewormed</h4>
            <p className="text-xs text-[#5a3a28]">Age-appropriate vaccination schedule and parasite protection.</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#fffdf8] border border-[#2a170e]/15 space-y-2">
            <CheckCircle2 className="w-6 h-6 text-[#25d366]" />
            <h4 className="font-serif font-bold text-sm text-[#2a170e]">Microchipped & Passport</h4>
            <p className="text-xs text-[#5a3a28]">Official pet passport with ISO standard microchip documentation.</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#fffdf8] border border-[#2a170e]/15 space-y-2">
            <CheckCircle2 className="w-6 h-6 text-[#25d366]" />
            <h4 className="font-serif font-bold text-sm text-[#2a170e]">24/7 Lifetime Support</h4>
            <p className="text-xs text-[#5a3a28]">Direct consultation on WhatsApp for feeding, grooming, and training.</p>
          </div>
        </div>
      </section>

      {/* Coming home from abroad */}
      <section className="card-sketch p-8 sm:p-12 bg-[#fbe3b4]/30 space-y-8">
        <div>
          <span className="font-scrawl text-lg text-[#c2622b] font-semibold block">
            Adoption journey
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#2a170e]">
            Coming home from abroad
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-white border border-[#2a170e]/15 space-y-2">
            <span className="w-8 h-8 rounded-full bg-[#f2be6b] font-serif font-bold text-sm flex items-center justify-center border border-[#2a170e]">1</span>
            <h3 className="font-serif font-bold text-base text-[#2a170e]">Reserve your puppy</h3>
            <p className="text-xs text-[#5a3a28] mt-1">Reach out to our team on WhatsApp to confirm availability and reserve {puppy.name}.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-[#2a170e]/15 space-y-2">
            <span className="w-8 h-8 rounded-full bg-[#f2be6b] font-serif font-bold text-sm flex items-center justify-center border border-[#2a170e]">2</span>
            <h3 className="font-serif font-bold text-base text-[#2a170e]">Personalized consultation</h3>
            <p className="text-xs text-[#5a3a28] mt-1">Receive live video calls, health updates, and parents&apos; pedigree documents.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-[#2a170e]/15 space-y-2">
            <span className="w-8 h-8 rounded-full bg-[#f2be6b] font-serif font-bold text-sm flex items-center justify-center border border-[#2a170e]">3</span>
            <h3 className="font-serif font-bold text-base text-[#2a170e]">Import and arrival</h3>
            <p className="text-xs text-[#5a3a28] mt-1">We manage customs, airline pet lounge handling, and safe arrival into Dubai.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-[#2a170e]/15 space-y-2">
            <span className="w-8 h-8 rounded-full bg-[#f2be6b] font-serif font-bold text-sm flex items-center justify-center border border-[#2a170e]">4</span>
            <h3 className="font-serif font-bold text-base text-[#2a170e]">Welcome home</h3>
            <p className="text-xs text-[#5a3a28] mt-1">Pick up {puppy.name} in our showroom or receive doorstep delivery anywhere in the UAE.</p>
          </div>
        </div>
      </section>

      {/* Ask about [Name] Box */}
      <section className="rounded-3xl bg-[#2a170e] text-[#fffdf8] p-8 sm:p-12 text-center space-y-6">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#fffdf8]">
          Ask about {puppy.name}
        </h2>
        <p className="text-sm sm:text-base text-[#fffdf8]/80 max-w-lg mx-auto">
          Our team is available 24/7 on WhatsApp to share video updates, schedule a showroom visit, or answer any questions about {puppy.name}.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <a
            href={`https://wa.me/${COMPANY_INFO.whatsappRaw}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp text-sm py-3 px-8 w-full sm:w-auto"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Ask on WhatsApp</span>
          </a>
          <a
            href={`tel:${COMPANY_INFO.phone}`}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full border border-[#fffdf8]/30 text-sm font-bold text-white hover:border-[#f2be6b] hover:text-[#f2be6b] transition-colors w-full sm:w-auto"
          >
            <Phone className="w-4 h-4" />
            <span>Call us directly</span>
          </a>
        </div>
      </section>
    </div>
  );
}
