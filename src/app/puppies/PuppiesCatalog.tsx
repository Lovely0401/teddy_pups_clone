'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, RotateCcw, MessageCircle } from 'lucide-react';
import { Puppy } from '@/types';
import { PuppyCard } from '@/components/PuppyCard';
import { COMPANY_INFO } from '@/data/puppies';

interface PuppiesCatalogProps {
  initialPuppies: Puppy[];
}

export function PuppiesCatalog({ initialPuppies }: PuppiesCatalogProps) {
  const [selectedBreed, setSelectedBreed] = useState<string>('all');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('available');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const breeds = useMemo(() => {
    const set = new Set(initialPuppies.map((p) => p.breed));
    return ['all', ...Array.from(set)];
  }, [initialPuppies]);

  const origins = useMemo(() => {
    const set = new Set(initialPuppies.map((p) => p.originCategory));
    return ['all', ...Array.from(set)];
  }, [initialPuppies]);

  const filteredPuppies = useMemo(() => {
    return initialPuppies.filter((puppy) => {
      // Status filter
      if (selectedStatus !== 'all' && puppy.status !== selectedStatus) {
        return false;
      }
      // Breed filter
      if (selectedBreed !== 'all' && puppy.breed !== selectedBreed) {
        return false;
      }
      // Origin filter
      if (selectedOrigin !== 'all' && puppy.originCategory !== selectedOrigin) {
        return false;
      }
      // Gender filter
      if (selectedGender !== 'all' && puppy.gender !== selectedGender) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = puppy.name.toLowerCase().includes(query);
        const matchesBreed = puppy.breed.toLowerCase().includes(query);
        const matchesDesc = puppy.description.toLowerCase().includes(query);
        return matchesName || matchesBreed || matchesDesc;
      }
      return true;
    });
  }, [initialPuppies, selectedBreed, selectedOrigin, selectedGender, selectedStatus, searchQuery]);

  const resetFilters = () => {
    setSelectedBreed('all');
    setSelectedOrigin('all');
    setSelectedGender('all');
    setSelectedStatus('available');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedBreed !== 'all' ||
    selectedOrigin !== 'all' ||
    selectedGender !== 'all' ||
    selectedStatus !== 'available' ||
    searchQuery !== '';

  return (
    <div className="space-y-10">
      {/* Search & Filter Bar */}
      <div className="card-sketch p-6 bg-white space-y-5">
        {/* Top: Search and Status toggle */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a3a28]/60" />
            <input
              type="text"
              placeholder="Search by name, breed, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border-2 border-[#2a170e] text-sm focus:outline-hidden focus:bg-[#fbe3b4]/20 transition-colors"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 w-full md:w-auto p-1 rounded-full border-2 border-[#2a170e] bg-[#fffdf8]">
            <button
              onClick={() => setSelectedStatus('available')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedStatus === 'available'
                  ? 'bg-[#2a170e] text-[#fffdf8] shadow-xs'
                  : 'text-[#2a170e] hover:bg-[#fbe3b4]/50'
              }`}
            >
              Available Now
            </button>
            <button
              onClick={() => setSelectedStatus('gone_home')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedStatus === 'gone_home'
                  ? 'bg-[#2a170e] text-[#fffdf8] shadow-xs'
                  : 'text-[#2a170e] hover:bg-[#fbe3b4]/50'
              }`}
            >
              Already Gone Home
            </button>
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedStatus === 'all'
                  ? 'bg-[#2a170e] text-[#fffdf8] shadow-xs'
                  : 'text-[#2a170e] hover:bg-[#fbe3b4]/50'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Breed Filter Pills */}
        <div className="space-y-2 pt-2 border-t border-[#2a170e]/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5a3a28]">
              Breed
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-[#c2622b] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset all filters
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {breeds.map((breed) => (
              <button
                key={breed}
                onClick={() => setSelectedBreed(breed)}
                className={`px-3.5 py-1 rounded-full text-xs font-bold border-2 transition-all ${
                  selectedBreed === breed
                    ? 'bg-[#f2be6b] border-[#2a170e] text-[#2a170e] shadow-[2px_2px_0px_#2a170e]'
                    : 'bg-white border-[#2a170e]/30 text-[#2a170e] hover:border-[#2a170e]'
                }`}
              >
                {breed === 'all' ? 'All Breeds' : breed}
              </button>
            ))}
          </div>
        </div>

        {/* Origin & Gender Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#2a170e]/10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#5a3a28] block mb-2">
              Origin
            </span>
            <div className="flex flex-wrap gap-2">
              {origins.map((origin) => (
                <button
                  key={origin}
                  onClick={() => setSelectedOrigin(origin)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                    selectedOrigin === origin
                      ? 'bg-[#2a170e] text-white border-[#2a170e]'
                      : 'bg-white text-[#2a170e] border-[#2a170e]/20 hover:border-[#2a170e]'
                  }`}
                >
                  {origin === 'all' ? 'All Origins' : origin}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#5a3a28] block mb-2">
              Gender
            </span>
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'Male', label: 'Boy' },
                { id: 'Female', label: 'Girl' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGender(g.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                    selectedGender === g.id
                      ? 'bg-[#2a170e] text-white border-[#2a170e]'
                      : 'bg-white text-[#2a170e] border-[#2a170e]/20 hover:border-[#2a170e]'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#5a3a28]">
          Showing <strong className="text-[#2a170e]">{filteredPuppies.length}</strong> {filteredPuppies.length === 1 ? 'puppy' : 'puppies'}
        </span>
        <span className="text-xs text-[#5a3a28]/70">
          Instant 0ms filtering
        </span>
      </div>

      {/* Puppies Grid */}
      {filteredPuppies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPuppies.map((puppy) => (
            <PuppyCard key={puppy.id} puppy={puppy} />
          ))}
        </div>
      ) : (
        <div className="card-sketch p-12 text-center bg-white space-y-4">
          <h3 className="font-serif text-2xl font-bold text-[#2a170e]">
            No puppies match your criteria
          </h3>
          <p className="text-sm text-[#5a3a28] max-w-md mx-auto">
            Looking for a specific breed or teacup size not listed here? Our team can source and import your dream puppy via custom request.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button onClick={resetFilters} className="btn-outline text-xs">
              Reset Filters
            </button>
            <a
              href={`https://wa.me/${COMPANY_INFO.whatsappRaw}?text=${encodeURIComponent(
                "Hi TeddyPups! I have a specific puppy breed request in mind."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp text-xs"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Ask on WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

