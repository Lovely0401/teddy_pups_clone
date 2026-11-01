export type Breed = 
  | 'Maltipoo' 
  | 'Pomeranian' 
  | 'Toy Poodle' 
  | 'Cavapoo' 
  | 'Shih Tzu'
  | 'Bichon'
  | 'Maltese'
  | 'Pomsky';

export type OriginCategory = 'Everywhere' | 'In Dubai' | 'Imported' | 'Korean Teacup';
export type Gender = 'Male' | 'Female';
export type PuppyStatus = 'available' | 'gone_home';

export interface Puppy {
  id: string;
  slug: string;
  name: string;
  breed: string;
  originCategory: string;
  gender: Gender;
  age: string;
  weightEstimate: string;
  status: PuppyStatus;
  featured?: boolean;
  color?: string;
  description: string;
  highlights?: string[];
  images: string[];
  videoUrl?: string | null;
}

export interface Testimonial {
  id: string;
  family: string;
  location: string;
  breed: string;
  image: string;
  quote: string;
  puppyName?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}
