// Legacy mock data - components now use real APIs

export interface SalaryEntry {
  id: string;
  company: string;
  companySlug: string;
  role: 'Software Engineer' | 'Product Manager' | 'Designer' | 'Data Scientist';
  roleSlug: 'swe' | 'pm' | 'design' | 'data';
  level: string;
  levelTier: 'Junior' | 'Mid' | 'Senior' | 'Staff' | 'Principal';
  location: string;
  base: number;
  bonus: number;
  equity: number;
  totalComp: number;
  currency?: string;
  yoe: number;
  date: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  industry: string;
  logoBg: string; // Tailwind hex color text e.g. '#4285F4'
  salariesReported: number;
  medianTC: number;
  medianBase: number;
  topLevelTC: number;
  dominantCurrency?: string;
  levels: {
    code: string;
    name: string;
    tier: 'Junior' | 'Mid' | 'Senior' | 'Staff' | 'Principal';
    typicalYoe: number;
    medianTC: number;
  }[];
}

export interface LevelEquivalency {
  tier: 'Junior' | 'Mid' | 'Senior' | 'Staff' | 'Principal';
  google: string;
  meta: string;
  amazon: string;
  microsoft: string;
  apple: string;
  typicalYoe: string;
  medianTC: number;
}

export const mockCompanies: Company[] = [
  {
    id: 'google',
    name: 'Google',
    slug: 'google',
    industry: 'Technology',
    logoBg: '#4285F4', // Google Blue
    salariesReported: 3420,
    medianTC: 268000,
    medianBase: 175000,
    topLevelTC: 820000,
    levels: [
      { code: 'L3', name: 'Associate Software Engineer', tier: 'Junior', typicalYoe: 0, medianTC: 191000 },
      { code: 'L4', name: 'Software Engineer', tier: 'Mid', typicalYoe: 2, medianTC: 268000 },
      { code: 'L5', name: 'Senior Software Engineer', tier: 'Senior', typicalYoe: 5, medianTC: 375000 },
      { code: 'L6', name: 'Staff Software Engineer', tier: 'Staff', typicalYoe: 8, medianTC: 540000 },
      { code: 'L7', name: 'Senior Staff Software Engineer', tier: 'Principal', typicalYoe: 12, medianTC: 820000 },
    ]
  },
  {
    id: 'meta',
    name: 'Meta',
    slug: 'meta',
    industry: 'Technology & Social Media',
    logoBg: '#0668E1', // Meta Blue
    salariesReported: 2840,
    medianTC: 295000,
    medianBase: 180000,
    topLevelTC: 940000,
    levels: [
      { code: 'E3', name: 'Software Engineer I', tier: 'Junior', typicalYoe: 0, medianTC: 205000 },
      { code: 'E4', name: 'Software Engineer II', tier: 'Mid', typicalYoe: 2, medianTC: 275000 },
      { code: 'E5', name: 'Software Engineer III / Senior', tier: 'Senior', typicalYoe: 5, medianTC: 395000 },
      { code: 'E6', name: 'Staff Software Engineer', tier: 'Staff', typicalYoe: 8, medianTC: 590000 },
      { code: 'E7', name: 'Senior Staff Software Engineer', tier: 'Principal', typicalYoe: 12, medianTC: 940000 },
    ]
  },
  {
    id: 'amazon',
    name: 'Amazon',
    slug: 'amazon',
    industry: 'E-commerce & Cloud Computing',
    logoBg: '#FF9900', // Amazon Orange
    salariesReported: 4120,
    medianTC: 232000,
    medianBase: 160000,
    topLevelTC: 710000,
    levels: [
      { code: 'L4', name: 'Software Development Engineer I', tier: 'Junior', typicalYoe: 0, medianTC: 172000 },
      { code: 'L5', name: 'Software Development Engineer II', tier: 'Mid', typicalYoe: 2, medianTC: 232000 },
      { code: 'L6', name: 'Software Development Engineer III / Senior', tier: 'Senior', typicalYoe: 5, medianTC: 348000 },
      { code: 'L7', name: 'Principal SDE', tier: 'Staff', typicalYoe: 8, medianTC: 512000 },
      { code: 'L8', name: 'Senior Principal SDE', tier: 'Principal', typicalYoe: 12, medianTC: 710000 },
    ]
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    slug: 'microsoft',
    industry: 'Technology & Enterprise Software',
    logoBg: '#F25022', // Microsoft Red-Orange
    salariesReported: 3100,
    medianTC: 215000,
    medianBase: 155000,
    topLevelTC: 650000,
    levels: [
      { code: '59/60', name: 'Software Engineer I', tier: 'Junior', typicalYoe: 0, medianTC: 160000 },
      { code: '61/62', name: 'Software Engineer II', tier: 'Mid', typicalYoe: 2, medianTC: 215000 },
      { code: '63/64', name: 'Senior Software Engineer', tier: 'Senior', typicalYoe: 5, medianTC: 298000 },
      { code: '65/66', name: 'Principal Software Engineer', tier: 'Staff', typicalYoe: 8, medianTC: 420000 },
      { code: '67/68', name: 'Partner Software Engineer', tier: 'Principal', typicalYoe: 12, medianTC: 650000 },
    ]
  },
  {
    id: 'apple',
    name: 'Apple',
    slug: 'apple',
    industry: 'Consumer Electronics & Tech',
    logoBg: '#555555', // Apple Gray
    salariesReported: 1890,
    medianTC: 254000,
    medianBase: 170000,
    topLevelTC: 780000,
    levels: [
      { code: 'ICT2', name: 'Software Engineer I', tier: 'Junior', typicalYoe: 0, medianTC: 182000 },
      { code: 'ICT3', name: 'Software Engineer II', tier: 'Mid', typicalYoe: 2, medianTC: 254000 },
      { code: 'ICT4', name: 'Software Engineer III / Senior', tier: 'Senior', typicalYoe: 5, medianTC: 360000 },
      { code: 'ICT5', name: 'Staff Software Engineer', tier: 'Staff', typicalYoe: 8, medianTC: 510000 },
      { code: 'ICT6', name: 'Principal Software Engineer', tier: 'Principal', typicalYoe: 12, medianTC: 780000 },
    ]
  }
];

export const mockSalaries: SalaryEntry[] = [
  {
    id: 'sal-1',
    company: 'Google',
    companySlug: 'google',
    role: 'Software Engineer',
    roleSlug: 'swe',
    level: 'L5',
    levelTier: 'Senior',
    location: 'Mountain View, CA',
    base: 195000,
    bonus: 38000,
    equity: 145000,
    totalComp: 378000,
    yoe: 6,
    date: '2026-06-05'
  },
  {
    id: 'sal-2',
    company: 'Meta',
    companySlug: 'meta',
    role: 'Software Engineer',
    roleSlug: 'swe',
    level: 'E6',
    levelTier: 'Staff',
    location: 'Menlo Park, CA',
    base: 240000,
    bonus: 60000,
    equity: 290000,
    totalComp: 590000,
    yoe: 9,
    date: '2026-06-03'
  },
  {
    id: 'sal-3',
    company: 'Google',
    companySlug: 'google',
    role: 'Product Manager',
    roleSlug: 'pm',
    level: 'L4',
    levelTier: 'Mid',
    location: 'New York, NY',
    base: 168000,
    bonus: 25000,
    equity: 60000,
    totalComp: 253000,
    yoe: 3,
    date: '2026-06-01'
  },
  {
    id: 'sal-4',
    company: 'Amazon',
    companySlug: 'amazon',
    role: 'Software Engineer',
    roleSlug: 'swe',
    level: 'L6',
    levelTier: 'Senior',
    location: 'Seattle, WA',
    base: 178000,
    bonus: 30000,
    equity: 140000,
    totalComp: 348000,
    yoe: 7,
    date: '2026-05-30'
  },
  {
    id: 'sal-5',
    company: 'Microsoft',
    companySlug: 'microsoft',
    role: 'Software Engineer',
    roleSlug: 'swe',
    level: '62',
    levelTier: 'Mid',
    location: 'Redmond, WA',
    base: 152000,
    bonus: 18000,
    equity: 45000,
    totalComp: 215000,
    yoe: 3,
    date: '2026-05-28'
  },
  {
    id: 'sal-6',
    company: 'Apple',
    companySlug: 'apple',
    role: 'Software Engineer',
    roleSlug: 'swe',
    level: 'ICT4',
    levelTier: 'Senior',
    location: 'Cupertino, CA',
    base: 185000,
    bonus: 25000,
    equity: 150000,
    totalComp: 360000,
    yoe: 5,
    date: '2026-05-27'
  },
  {
    id: 'sal-7',
    company: 'Meta',
    companySlug: 'meta',
    role: 'Software Engineer',
    roleSlug: 'swe',
    level: 'E4',
    levelTier: 'Mid',
    location: 'Seattle, WA',
    base: 165000,
    bonus: 24000,
    equity: 86000,
    totalComp: 275000,
    yoe: 2,
    date: '2026-05-26'
  },
  {
    id: 'sal-8',
    company: 'Google',
    companySlug: 'google',
    role: 'Software Engineer',
    roleSlug: 'swe',
    level: 'L3',
    levelTier: 'Junior',
    location: 'San Francisco, CA',
    base: 135000,
    bonus: 20000,
    equity: 36000,
    totalComp: 191000,
    yoe: 1,
    date: '2026-05-25'
  },
  {
    id: 'sal-9',
    company: 'Amazon',
    companySlug: 'amazon',
    role: 'Software Engineer',
    roleSlug: 'swe',
    level: 'L4',
    levelTier: 'Junior',
    location: 'Boston, MA',
    base: 125000,
    bonus: 22000,
    equity: 25000,
    totalComp: 172000,
    yoe: 0,
    date: '2026-05-23'
  },
  {
    id: 'sal-10',
    company: 'Microsoft',
    companySlug: 'microsoft',
    role: 'Designer',
    roleSlug: 'design',
    level: '64',
    levelTier: 'Senior',
    location: 'Redmond, WA',
    base: 172000,
    bonus: 26000,
    equity: 82000,
    totalComp: 280000,
    yoe: 7,
    date: '2026-05-20'
  },
  {
    id: 'sal-11',
    company: 'Google',
    companySlug: 'google',
    role: 'Software Engineer',
    roleSlug: 'swe',
    level: 'L6',
    levelTier: 'Staff',
    location: 'Sunnyvale, CA',
    base: 220000,
    bonus: 45000,
    equity: 275000,
    totalComp: 540000,
    yoe: 10,
    date: '2026-05-18'
  },
  {
    id: 'sal-12',
    company: 'Meta',
    companySlug: 'meta',
    role: 'Product Manager',
    roleSlug: 'pm',
    level: 'E5',
    levelTier: 'Senior',
    location: 'Menlo Park, CA',
    base: 198000,
    bonus: 40000,
    equity: 155000,
    totalComp: 393000,
    yoe: 6,
    date: '2026-05-15'
  },
  {
    id: 'sal-13',
    company: 'Apple',
    companySlug: 'apple',
    role: 'Data Scientist',
    roleSlug: 'data',
    level: 'ICT3',
    levelTier: 'Mid',
    location: 'Cupertino, CA',
    base: 160000,
    bonus: 24000,
    equity: 70000,
    totalComp: 254000,
    yoe: 3,
    date: '2026-05-12'
  },
  {
    id: 'sal-14',
    company: 'Amazon',
    companySlug: 'amazon',
    role: 'Product Manager',
    roleSlug: 'pm',
    level: 'L5',
    levelTier: 'Mid',
    location: 'Seattle, WA',
    base: 145000,
    bonus: 20000,
    equity: 42000,
    totalComp: 207000,
    yoe: 4,
    date: '2026-05-10'
  },
  {
    id: 'sal-15',
    company: 'Microsoft',
    companySlug: 'microsoft',
    role: 'Software Engineer',
    roleSlug: 'swe',
    level: '59',
    levelTier: 'Junior',
    location: 'Redmond, WA',
    base: 118000,
    bonus: 12000,
    equity: 30000,
    totalComp: 160000,
    yoe: 1,
    date: '2026-05-08'
  },
  {
    id: 'sal-16',
    company: 'Google',
    companySlug: 'google',
    role: 'Software Engineer',
    roleSlug: 'swe',
    level: 'L7',
    levelTier: 'Principal',
    location: 'Mountain View, CA',
    base: 285000,
    bonus: 85000,
    equity: 450000,
    totalComp: 820000,
    yoe: 14,
    date: '2026-05-05'
  },
  {
    id: 'sal-17',
    company: 'Meta',
    companySlug: 'meta',
    role: 'Software Engineer',
    roleSlug: 'swe',
    level: 'E3',
    levelTier: 'Junior',
    location: 'Menlo Park, CA',
    base: 130000,
    bonus: 20000,
    equity: 55000,
    totalComp: 205000,
    yoe: 0,
    date: '2026-05-02'
  },
  {
    id: 'sal-18',
    company: 'Apple',
    companySlug: 'apple',
    role: 'Software Engineer',
    roleSlug: 'swe',
    level: 'ICT5',
    levelTier: 'Staff',
    location: 'Cupertino, CA',
    base: 225000,
    bonus: 45000,
    equity: 240000,
    totalComp: 510000,
    yoe: 11,
    date: '2026-04-30'
  },
  {
    id: 'sal-19',
    company: 'Amazon',
    companySlug: 'amazon',
    role: 'Software Engineer',
    roleSlug: 'swe',
    level: 'L7',
    levelTier: 'Staff',
    location: 'Austin, TX',
    base: 205000,
    bonus: 42000,
    equity: 265000,
    totalComp: 512000,
    yoe: 9,
    date: '2026-04-28'
  },
  {
    id: 'sal-20',
    company: 'Microsoft',
    companySlug: 'microsoft',
    role: 'Software Engineer',
    roleSlug: 'swe',
    level: '67',
    levelTier: 'Principal',
    location: 'Redmond, WA',
    base: 260000,
    bonus: 65000,
    equity: 325000,
    totalComp: 650000,
    yoe: 13,
    date: '2026-04-25'
  }
];

export const mockLevelsEquivalency: LevelEquivalency[] = [
  {
    tier: 'Junior',
    google: 'L3',
    meta: 'E3',
    amazon: 'L4',
    microsoft: '59/60',
    apple: 'ICT2',
    typicalYoe: '0-2 YOE',
    medianTC: 182000
  },
  {
    tier: 'Mid',
    google: 'L4',
    meta: 'E4',
    amazon: 'L5',
    microsoft: '61/62',
    apple: 'ICT3',
    typicalYoe: '2-5 YOE',
    medianTC: 249000
  },
  {
    tier: 'Senior',
    google: 'L5',
    meta: 'E5',
    amazon: 'L6',
    microsoft: '63/64',
    apple: 'ICT4',
    typicalYoe: '5-8 YOE',
    medianTC: 352000
  },
  {
    tier: 'Staff',
    google: 'L6',
    meta: 'E6',
    amazon: 'L7',
    microsoft: '65/66',
    apple: 'ICT5',
    typicalYoe: '8-12 YOE',
    medianTC: 532000
  },
  {
    tier: 'Principal',
    google: 'L7',
    meta: 'E7',
    amazon: 'L8',
    microsoft: '67/68',
    apple: 'ICT6',
    typicalYoe: '12+ YOE',
    medianTC: 780000
  }
];
