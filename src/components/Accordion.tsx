'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQItem } from '@/types';

interface AccordionProps {
  items: FAQItem[];
}

export function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={item.id}
            className={`border-2 border-[#2a170e] rounded-2xl transition-all duration-200 overflow-hidden ${
              isOpen ? 'bg-[#fbe3b4]/30 shadow-[4px_4px_0px_#2a170e]' : 'bg-white shadow-[2px_2px_0px_#2a170e]'
            }`}
          >
            <button
              onClick={() => toggle(index)}
              className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-serif text-lg font-bold text-[#2a170e] hover:text-[#c2622b] transition-colors"
              aria-expanded={isOpen}
            >
              <span>{item.question}</span>
              <div
                className={`w-8 h-8 rounded-full border-2 border-[#2a170e] flex items-center justify-center shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 bg-[#f2be6b]' : 'bg-white'
                }`}
              >
                <ChevronDown className="w-4 h-4 text-[#2a170e]" />
              </div>
            </button>
            {isOpen && (
              <div className="px-6 pb-5 pt-1 text-sm text-[#5a3a28] leading-relaxed border-t border-[#2a170e]/10">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

