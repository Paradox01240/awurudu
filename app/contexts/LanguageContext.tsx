'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'si';

interface Translations {
  [key: string]: {
    en: string;
    si: string;
  };
}

const translations: Translations = {
  // Header and Navigation
  'smart.youth': {
    en: 'SMART YOUTH',
    si: 'SMART YOUTH'
  },
  'vasanth.udanaya': {
    en: 'Spring Festival 2026',
    si: 'Vasanth Udanaya 2026'
  },
  
  // Hero Section
  'vote.for.kumara': {
    en: 'Vote for Kumara/Kumari',
    si: 'Vote for Kumara/Kumari'
  },
  'april.18.2026': {
    en: 'April 18, 2026',
    si: 'April 18, 2026'
  },
  'panadura.beach': {
    en: 'Panadura Beach, Sri Lanka',
    si: 'Panadura Beach, Sri Lanka'
  },
  
  // Organizers Section
  'organized.by': {
    en: 'Organized by Leading Youth Clubs',
    si: 'Organized by Leading Youth Clubs'
  },
  
  // Events Section
  'festival.events': {
    en: 'Festival Events & Activities',
    si: 'Festival Events & Activities'
  },

  // FestiveScroll Section
  'time.venue': {
    en: 'Time & Venue',
    si: 'Time & Venue'
  },
  'aluth.avurudu.festival': {
    en: 'Aluth Avurudu Festival 2026',
    si: 'Aluth Avurudu Festival 2026'
  },
  'event.schedule': {
    en: 'Event Schedule',
    si: 'Event Schedule'
  },
  'contestant.registration': {
    en: 'Contestant Registration & Welcome',
    si: 'Contestant Registration & Welcome'
  },
  'national.anthem': {
    en: 'National Anthem, Oil Lamp Lighting & Opening Ceremony',
    si: 'National Anthem, Oil Lamp Lighting & Opening Ceremony'
  },
  'traditional.games': {
    en: 'Traditional New Year Games (Tug of War, Pillow Fight, Pot Breaking, Climbing Greasy Pole)',
    si: 'Traditional New Year Games (Tug of War, Pillow Fight, Pot Breaking, Climbing Greasy Pole)'
  },
  'lunch.break': {
    en: 'Lunch Break',
    si: 'Lunch Break'
  },
  'open.competitions': {
    en: 'Open Competitions & New Year Prince/Princess Selection',
    si: 'Open Competitions & New Year Prince/Princess Selection'
  },
  'awards.ceremony': {
    en: 'Awards Ceremony & Certificate Distribution',
    si: 'Awards Ceremony & Certificate Distribution'
  },
  'musical.show': {
    en: 'Musical Show with DJ & Entertainment on Main Stage with LED Wall & Sound System',
    si: 'Musical Show with DJ & Entertainment on Main Stage with LED Wall & Sound System'
  },
  'join.celebration': {
    en: 'Join us for a memorable celebration of tradition and culture!',
    si: 'Join us for a memorable celebration of tradition and culture!'
  },

  // Time Details for Schedule
  'time.8.00.8.05': {
    en: '8.00 AM - 8.05 AM',
    si: '8.00 AM - 8.05 AM'
  },
  'time.8.05.8.15': {
    en: '8.05 AM - 8.15 AM',
    si: '8.05 AM - 8.15 AM'
  },
  'time.8.15.8.30': {
    en: '8.15 AM - 8.30 AM',
    si: '8.15 AM - 8.30 AM'
  },
  'time.8.30.8.40': {
    en: '8.30 AM - 8.40 AM',
    si: '8.30 AM - 8.40 AM'
  },
  'time.8.40.8.50': {
    en: '8.40 AM - 8.50 AM',
    si: '8.40 AM - 8.50 AM'
  },
  'time.8.50.9.00': {
    en: '8.50 AM - 9.00 AM',
    si: '8.50 AM - 9.00 AM'
  },
  'time.9.00.9.05': {
    en: '9.00 AM - 9.05 AM',
    si: '9.00 AM - 9.05 AM'
  },
  'time.9.05.9.40': {
    en: '9.05 AM - 9.40 AM',
    si: '9.05 AM - 9.40 AM'
  },
  'time.9.40.10.00': {
    en: '9.40 AM - 10.00 AM',
    si: '9.40 AM - 10.00 AM'
  },
  'time.10.00.10.15': {
    en: '10.00 AM - 10.15 AM',
    si: '10.00 AM - 10.15 AM'
  },
  'time.10.15.10.20': {
    en: '10.15 AM - 10.20 AM',
    si: '10.15 AM - 10.20 AM'
  },
  'time.10.20.10.35': {
    en: '10.20 AM - 10.35 AM',
    si: '10.20 AM - 10.35 AM'
  },
  'time.10.35.10.50': {
    en: '10.35 AM - 10.50 AM',
    si: '10.35 AM - 10.50 AM'
  },
  'time.10.50.11.10': {
    en: '10.50 AM - 11.10 AM',
    si: '10.50 AM - 11.10 AM'
  },
  'time.11.10.11.15': {
    en: '11.10 AM - 11.15 AM',
    si: '11.10 AM - 11.15 AM'
  },
  'time.11.15.11.30': {
    en: '11.15 AM - 11.30 AM',
    si: '11.15 AM - 11.30 AM'
  },
  'time.11.30.2.30': {
    en: '11.30 AM - 2.30 PM',
    si: '11.30 AM - 2.30 PM'
  },
  'time.2.30.2.45': {
    en: '2.30 PM - 2.45 PM',
    si: '2.30 PM - 2.45 PM'
  },
  'time.2.45.3.00': {
    en: '2.45 PM - 3.00 PM',
    si: '2.45 PM - 3.00 PM'
  },
  'time.3.00.3.20': {
    en: '3.00 PM - 3.20 PM',
    si: '3.00 PM - 3.20 PM'
  },
  'time.3.20.3.40': {
    en: '3.20 PM - 3.40 PM',
    si: '3.20 PM - 3.40 PM'
  },
  'time.3.40.4.00': {
    en: '3.40 PM - 4.00 PM',
    si: '3.40 PM - 4.00 PM'
  },
  'time.4.00.4.20': {
    en: '4.00 PM - 4.20 PM',
    si: '4.00 PM - 4.20 PM'
  },
  'time.4.20.5.00': {
    en: '4.20 PM - 5.00 PM',
    si: '4.20 PM - 5.00 PM'
  },
  'time.5.00.5.30': {
    en: '5.00 PM - 5.30 PM',
    si: '5.00 PM - 5.30 PM'
  },
  'time.5.30.5.50': {
    en: '5.30 PM - 5.50 PM',
    si: '5.30 PM - 5.50 PM'
  },
  'time.5.50.6.10': {
    en: '5.50 PM - 6.10 PM',
    si: '5.50 PM - 6.10 PM'
  },
  'time.6.10.6.30': {
    en: '6.10 PM - 6.30 PM',
    si: '6.10 PM - 6.30 PM'
  },
  'time.6.30.7.30': {
    en: '6.30 PM - 7.30 PM',
    si: '6.30 PM - 7.30 PM'
  },
  'time.7.30.onwards': {
    en: '7.30 PM Onwards',
    si: '7.30 PM Onwards'
  },

  // Event Descriptions with English Alternatives
  'desc.8.00.8.05': {
    en: 'Festival Opening',
    si: 'Festival Opening'
  },
  'desc.8.05.8.15': {
    en: 'Oil Lamp Lighting & National Anthem',
    si: 'Oil Lamp Lighting & National Anthem'
  },
  'desc.8.15.8.30': {
    en: 'Oil Lamp Lighting',
    si: 'Oil Lamp Lighting'
  },
  'desc.8.30.8.40': {
    en: 'Remembrance of Heroes & Welcome Speech',
    si: 'Remembrance of Heroes & Welcome Speech'
  },
  'desc.8.40.8.50': {
    en: 'Welcome Speech',
    si: 'Welcome Speech'
  },
  'desc.8.50.9.00': {
    en: 'Religious Dance',
    si: 'Religious Dance'
  },
  'desc.9.00.9.05': {
    en: 'Hidden Guest Search / Sweet Box Naming / Doll Naming / Gaslabu Gadiyas Counting',
    si: 'Hidden Guest Search / Sweet Box Naming / Doll Naming / Gaslabu Gadiyas Counting'
  },
  'desc.9.05.9.40': {
    en: 'Blindfold Game / Pot Breaking',
    si: 'Blindfold Game / Pot Breaking'
  },
  'desc.9.40.10.00': {
    en: 'Lunch (Non-veg)',
    si: 'Lunch (Non-veg)'
  },
  'desc.10.00.10.15': {
    en: 'Lunch (Veg)',
    si: 'Lunch (Veg)'
  },
  'desc.10.15.10.20': {
    en: 'New Year Dance',
    si: 'New Year Dance'
  },
  'desc.10.20.10.35': {
    en: 'Balloon Pulling (Pairs)',
    si: 'Balloon Pulling (Pairs)'
  },
  'desc.10.35.10.50': {
    en: 'Sugar Bee Game',
    si: 'Sugar Bee Game'
  },
  'desc.10.50.11.10': {
    en: 'Kotta Pora',
    si: 'Kotta Pora'
  },
  'desc.11.10.11.15': {
    en: 'Curd Eating Competition',
    si: 'Curd Eating Competition'
  },
  'desc.11.15.11.30': {
    en: 'Running on the Fence',
    si: 'Running on the Fence'
  },
  'desc.11.30.2.30': {
    en: 'Break',
    si: 'Break'
  },
  'desc.2.30.2.45': {
    en: 'Best Laughter',
    si: 'Best Laughter'
  },
  'desc.2.45.3.00': {
    en: 'Best Eater',
    si: 'Best Eater'
  },
  'desc.3.00.3.20': {
    en: 'Tug of War (Men)',
    si: 'Tug of War (Men)'
  },
  'desc.3.20.3.40': {
    en: 'Tug of War (Women)',
    si: 'Tug of War (Women)'
  },
  'desc.3.40.4.00': {
    en: 'Cap Pass',
    si: 'Cap Pass'
  },
  'desc.4.00.4.20': {
    en: 'Balloon Dance',
    si: 'Balloon Dance'
  },
  'desc.4.20.5.00': {
    en: 'Dress Competition',
    si: 'Dress Competition'
  },
  'desc.5.00.5.30': {
    en: 'Little New Year Prince & Princess',
    si: 'Little New Year Prince & Princess'
  },
  'desc.5.30.5.50': {
    en: 'Young New Year Prince',
    si: 'Young New Year Prince'
  },
  'desc.5.50.6.10': {
    en: 'Young New Year Princess',
    si: 'Young New Year Princess'
  },
  'desc.6.10.6.30': {
    en: 'Results & Prize Distribution',
    si: 'Results & Prize Distribution'
  },
  'desc.6.30.7.30': {
    en: 'DJ Music',
    si: 'DJ Music'
  },
  'desc.7.30.onwards': {
    en: 'Thanksgiving Speech & Festival Closing',
    si: 'Thanksgiving Speech & Festival Closing'
  },
  'tug.of.war': {
    en: 'Tug of War',
    si: 'Tug of War'
  },
  'kotta.pora': {
    en: 'Kotta Pora',
    si: 'Kotta Pora'
  },
  'beach.volleyball': {
    en: 'Beach Volleyball',
    si: 'Beach Volleyball'
  },
  'blind.pot.breaking': {
    en: 'Blind Pot Breaking',
    si: 'Blind Pot Breaking'
  },
  'cultural.performances': {
    en: 'Cultural Performances',
    si: 'Cultural Performances'
  },
  'musical.evening': {
    en: 'Musical Evening',
    si: 'Musical Evening'
  },
  
  // Sponsors Section
  'powered.by': {
    en: 'Powered By Our Visionary Partners',
    si: 'Powered By Our Visionary Partners'
  },
  'diamond.sponsor': {
    en: 'Diamond Sponsor',
    si: 'Diamond Sponsor'
  },
  'ruby.sponsors': {
    en: 'Ruby Sponsors',
    si: 'Ruby Sponsors'
  },
  'golden.sponsor': {
    en: 'Golden Sponsor',
    si: 'Golden Sponsor'
  },
  'silver.sponsors': {
    en: 'Silver Sponsors',
    si: 'Silver Sponsors'
  },
  'new.year.prince.sponsor': {
    en: 'New Year Prince Sponsor',
    si: 'New Year Prince Sponsor'
  },
  'new.year.princess.sponsor': {
    en: 'New Year Princess Sponsor',
    si: 'New Year Princess Sponsor'
  },
  'supporting.partners': {
    en: 'Supporting Partners',
    si: 'Supporting Partners'
  },
  
  // Kumara/Kumari Section
  'kumara.kumari.pageant': {
    en: 'Kumara & Kumari Pageant 2026',
    si: 'Kumara & Kumari Pageant 2026'
  },
  'kumara.2026': {
    en: 'Kumara 2026',
    si: 'Kumara 2026'
  },
  'rising.star': {
    en: 'The Rising Star of the Festival',
    si: 'The Rising Star of the Festival'
  },
  'kumari.2026': {
    en: 'Kumari 2026',
    si: 'Kumari 2026'
  },
  'beauty.tradition': {
    en: 'The Beauty of Tradition',
    si: 'The Beauty of Tradition'
  },
  'live.voting.soon': {
    en: 'Live Voting Starts Soon',
    si: 'Live Voting Starts Soon'
  },
  
  // Sigithi Awurudu Section
  'sigithi.awurudu': {
    en: 'Sigithi Awurudu',
    si: 'Sigithi Awurudu'
  },
  'sigithi.kumara': {
    en: 'Sigithi Awurudu Kumara',
    si: 'Sigithi Awurudu Kumara'
  },
  'sigithi.kumariya': {
    en: 'Sigithi Awurudu Kumariya',
    si: 'Sigithi Awurudu Kumariya'
  },
  'little.prince': {
    en: 'Little Prince',
    si: 'Little Prince'
  },
  'little.princess': {
    en: 'Little Princess',
    si: 'Little Princess'
  },
  'vote': {
    en: 'Vote',
    si: 'Vote'
  },
  'register.to.contest': {
    en: 'Register to Contest',
    si: 'Register to Contest'
  },
  'sigithi.pictures.coming.soon': {
    en: 'Sigithi Kumara Pictures Coming Soon',
    si: 'Sigithi Kumara Pictures Coming Soon'
  },
  'sigithi.kumariya.pictures.coming.soon': {
    en: 'Sigithi Kumariya Pictures Coming Soon',
    si: 'Sigithi Kumariya Pictures Coming Soon'
  },
  'pictures.will.be.added.soon': {
    en: 'Pictures will be added soon for our Sigithi Awurudu participants!',
    si: 'Pictures will be added soon for our Sigithi Awurudu participants!'
  },
  'check.back.later': {
    en: 'Check back later to see our talented young stars!',
    si: 'Check back later to see our talented young stars!'
  },
  'our.little.stars': {
    en: 'Our little stars shine bright! Sigithi Awurudu Kumara and Kumariya competitions showcase the amazing talents of our young participants.',
    si: 'Our little stars shine bright! Sigithi Awurudu Kumara and Kumariya competitions showcase the amazing talents of our young participants.'
  },
  
  // Footer
  'celebrating.tradition': {
    en: 'Celebrating Tradition with Smart Technology',
    si: 'Celebrating Tradition with Smart Technology'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
