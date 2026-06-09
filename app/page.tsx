"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/StatCard';
import { getSalaries, getStats } from '@/lib/api';
import type { SalaryEntry } from '@/lib/mockData';
import type { StatsData } from '@/types';
import LevelBadge from '@/components/LevelBadge';

interface SearchResult {
  type: 'company' | 'salary';
  label: string;
  sub: string;
  href: string;
  icon: string;
  color: string;
}

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [salaries, setSalaries] = useState<SalaryEntry[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Chip states
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedLoc, setSelectedLoc] = useState<string | null>(null);
  const [selectedCompanyType, setSelectedCompanyType] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filter chips lists
  const roles = ['Software Engineer', 'Product Manager', 'Designer', 'Data Scientist'];
  const levels = ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'];
  const locations = ['US', 'India', 'Europe', 'Remote'];
  const companyTypes = ['FAANG', 'Startup', 'MNC'];

  useEffect(() => {
    let ignore = false;
    async function loadLandingData() {
      const [salaryResult, statsResult] = await Promise.all([
        getSalaries({ page: 1, limit: 50 }),
        getStats(),
      ]);
      if (ignore) return;
      setSalaries((salaryResult?.data ?? []) as SalaryEntry[]);
      setStats(statsResult);
    }
    loadLandingData();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    setSearchLoading(true);
    setSearchOpen(true);
    try {
      const [salRes, compRes] = await Promise.all([
        fetch(`/api/salaries?search=${encodeURIComponent(query)}&limit=4`),
        fetch(`/api/companies?search=${encodeURIComponent(query)}`),
      ]);
      const salData = await salRes.json();
      const compData = await compRes.json();
      const results: SearchResult[] = [];

      const companies = (compData.data || []).slice(0, 3);
      companies.forEach((company: { name: string; slug: string; _count?: { salaries?: number } }) => {
        results.push({
          type: 'company',
          label: company.name,
          sub: `${company._count?.salaries || 0} salary reports`,
          href: `/company/${company.slug}`,
          icon: company.name[0].toUpperCase(),
          color: '#6366f1',
        });
      });

      const salaryResults = (salData.data?.salaries || salData.data || []).slice(0, 4);
      salaryResults.forEach((salary: { company?: { name?: string }; role: string; level: string; location: string; totalComp: number }) => {
        results.push({
          type: 'salary',
          label: `${salary.company?.name || ''} ${salary.role}`,
          sub: `${salary.level} - ${salary.location} - $${Math.round(salary.totalComp / 1000)}k TC`,
          href: `/salaries?search=${encodeURIComponent(`${salary.company?.name || ''} ${salary.role}`.trim())}`,
          icon: '$',
          color: '#22d3ee',
        });
      });

      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Map chip values to mock filter logic
  const filteredSalaries = useMemo(() => {
    return salaries.filter((s) => {
      // Search text filter
      const textMatch =
        searchQuery === '' ||
        s.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.level.toLowerCase().includes(searchQuery.toLowerCase());

      // Role filter
      const roleMatch = !selectedRole || s.role === selectedRole;

      // Level filter
      const levelMatch = !selectedLevel || s.levelTier === selectedLevel;

      // Location filter (mock mapping)
      let locMatch = true;
      if (selectedLoc) {
        if (selectedLoc === 'US') locMatch = s.location.includes('CA') || s.location.includes('WA') || s.location.includes('TX') || s.location.includes('NY') || s.location.includes('MA');
        else if (selectedLoc === 'India') locMatch = s.location.includes('India') || s.location.includes('Bangalore');
        else if (selectedLoc === 'Europe') locMatch = s.location.includes('London') || s.location.includes('Berlin') || s.location.includes('Dublin');
        else if (selectedLoc === 'Remote') locMatch = s.location.includes('Remote');
      }

      // Company Type filter (mock mapping)
      let typeMatch = true;
      if (selectedCompanyType) {
        const bigTech = ['Google', 'Meta', 'Amazon', 'Apple', 'Microsoft'];
        if (selectedCompanyType === 'FAANG') typeMatch = bigTech.includes(s.company);
        else if (selectedCompanyType === 'Startup') typeMatch = !bigTech.includes(s.company) && s.yoe < 5;
        else if (selectedCompanyType === 'MNC') typeMatch = bigTech.includes(s.company) || s.company === 'Microsoft';
      }

      return textMatch && roleMatch && levelMatch && locMatch && typeMatch;
    });
  }, [salaries, searchQuery, selectedRole, selectedLevel, selectedLoc, selectedCompanyType]);

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Decorative gradients */}
      <div className="absolute top-[-10%] left-[-20%] w-[600px] h-[600px] bg-primary/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-15%] w-[500px] h-[500px] bg-secondary/10 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0A0A0F]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0F] via-[#0D0B1A] to-[#0A0A0F]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
            }}
          />
          <div
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full animate-glow-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.05) 40%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full animate-glow-pulse-cyan"
            style={{
              background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, rgba(34,211,238,0.04) 40%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />
          <div
            className="absolute -top-20 right-1/3 w-[400px] h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)',
              filter: 'blur(60px)',
              animation: 'glow-pulse 7s ease-in-out infinite',
            }}
          />
          <div
            className="absolute inset-x-0 h-[2px] opacity-20"
            style={{
              background: 'linear-gradient(90deg, transparent, #6366f1, #22d3ee, #6366f1, transparent)',
              animation: 'scan-line 8s linear infinite',
            }}
          />
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${10 + i * 8}%`,
                background: i % 2 === 0 ? 'rgba(99,102,241,0.8)' : 'rgba(34,211,238,0.8)',
                animation: `particle-float ${6 + i * 0.8}s linear infinite`,
                animationDelay: `${i * 0.5}s`,
                boxShadow: i % 2 === 0 ? '0 0 6px rgba(99,102,241,1)' : '0 0 6px rgba(34,211,238,1)',
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          <div className="space-y-8">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border animate-border-glow"
              style={{
                background: 'rgba(99,102,241,0.08)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-indigo-300 text-sm font-medium tracking-wide">
                Intelligence Platforms 2.0
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-6xl lg:text-7xl font-black text-white leading-none tracking-tight">
                Know Your
              </h1>
              <h1 className="text-6xl lg:text-7xl font-black leading-none tracking-tight shimmer-text">
                Worth.
              </h1>
              <div className="flex items-center gap-3 pt-2">
                <div
                  className="h-[3px] w-16 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #6366f1, #22d3ee)' }}
                />
                <h2
                  className="text-3xl lg:text-4xl font-bold animate-text-glow"
                  style={{ color: '#a78bfa' }}
                >
                  Down to the Level.
                </h2>
              </div>
            </div>

            <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
              Real compensation data across levels, roles, and companies.
              Not just generic job titles. Verify your target salary with
              precision metrics.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="/salaries"
                className="group relative px-8 py-4 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 0 20px rgba(99,102,241,0.4)',
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)' }}
                />
                <span className="relative flex items-center gap-2">
                  Explore Salaries
                </span>
              </a>

              <a
                href="/submit"
                className="group px-8 py-4 rounded-xl font-semibold text-white border transition-all duration-300 hover:scale-105"
                style={{
                  border: '1px solid rgba(99,102,241,0.4)',
                  background: 'rgba(99,102,241,0.08)',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.8)'
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Submit Your Salary
              </a>
            </div>

            <div className="flex flex-wrap gap-6 pt-4">
              {[
                {
                  value: stats?.totalSalaries ? `${stats.totalSalaries.toLocaleString()}+` : '200+',
                  label: 'Salaries',
                },
                {
                  value: stats?.totalCompanies ? `${stats.totalCompanies}+` : '15+',
                  label: 'Companies',
                },
                { label: 'Countries', value: '2+' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="text-2xl font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-slate-500 text-sm">{stat.label}</div>
                  {i < 2 && <div className="w-px h-6 bg-slate-700 ml-3" />}
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[500px] hidden lg:block">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full"
              style={{
                border: '1px solid rgba(99,102,241,0.15)',
                boxShadow: '0 0 40px rgba(99,102,241,0.05) inset',
              }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] rounded-full"
              style={{ border: '1px dashed rgba(34,211,238,0.08)' }}
            />

            <div
              className="absolute top-4 right-8 w-64 animate-float"
              style={{
                background: 'linear-gradient(135deg, rgba(17,17,24,0.95), rgba(30,30,46,0.95))',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '16px',
                padding: '20px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 0 30px rgba(99,102,241,0.2), 0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">G</div>
                  <span className="text-white font-semibold">Google</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Senior</span>
              </div>
              <div className="text-xs text-slate-500 mb-1 tracking-wider">L5 - SOFTWARE ENGINEER</div>
              <div className="text-2xl font-bold text-white mb-3">
                $378,000 <span className="text-sm text-slate-400 font-normal"> TC</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>$195k Base</span>
                  <span>$145k Eq</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: '65%',
                      background: 'linear-gradient(90deg, #6366f1, #22d3ee)',
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              className="absolute bottom-16 right-4 w-60 animate-float-delayed"
              style={{
                background: 'linear-gradient(135deg, rgba(17,17,24,0.95), rgba(30,30,46,0.95))',
                border: '1px solid rgba(167,139,250,0.3)',
                borderRadius: '16px',
                padding: '20px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 0 30px rgba(167,139,250,0.2), 0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold">M</div>
                  <span className="text-white font-semibold">Meta</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">Staff</span>
              </div>
              <div className="text-xs text-slate-500 mb-1 tracking-wider">E6 - PRODUCTION ENGINEER</div>
              <div className="text-2xl font-bold text-white mb-3">
                $590,000<span className="text-sm text-slate-400 font-normal"> TC</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: '80%',
                    background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                  }}
                />
              </div>
            </div>

            <div
              className="absolute top-1/2 left-0 w-52 animate-float-slow"
              style={{
                background: 'linear-gradient(135deg, rgba(17,17,24,0.95), rgba(30,30,46,0.95))',
                border: '1px solid rgba(34,211,238,0.25)',
                borderRadius: '16px',
                padding: '16px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 0 30px rgba(34,211,238,0.15), 0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs font-bold">A</div>
                <span className="text-white font-semibold text-sm">Amazon</span>
              </div>
              <div className="text-xs text-slate-500 mb-1">L4 ENTRY</div>
              <div className="text-xl font-bold text-white">$172,000</div>
              <div className="text-xs text-cyan-400 mt-1">+12% YoY up</div>
            </div>

            <div
              className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full bg-indigo-500 animate-pulse"
              style={{ boxShadow: '0 0 15px rgba(99,102,241,1)' }}
            />
            <div
              className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-cyan-400 animate-pulse"
              style={{
                boxShadow: '0 0 10px rgba(34,211,238,1)',
                animationDelay: '1s',
              }}
            />
            <div
              className="absolute top-2/3 right-1/2 w-2 h-2 rounded-full bg-purple-400 animate-pulse"
              style={{
                boxShadow: '0 0 10px rgba(167,139,250,1)',
                animationDelay: '2s',
              }}
            />
          </div>
        </div>

        <div
          className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #0A0A0F)' }}
        />
      </section>

      {/* Legacy Hero Section */}
      <section className="hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left relative z-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 text-xs text-primary font-semibold w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Intelligence Platforms 2.0
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.1]">
              Know Your Worth. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-secondary">
                Down to the Level.
              </span>
            </h1>
            
            <p className="text-base md:text-lg text-text-muted max-w-xl leading-relaxed">
              Real compensation data across levels, roles, and companies. Not just generic job titles. Verify your target salary with precision metrics.
            </p>

            <div className="flex flex-wrap gap-4 mt-2">
              <Link
                href="/salaries"
                className="bg-primary hover:bg-primary/95 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200"
              >
                Explore Salaries
              </Link>
              <Link
                href="/submit"
                className="bg-card hover:bg-border-dark/45 border border-border-dark text-text-primary font-semibold py-3 px-6 rounded-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Submit Your Salary
              </Link>
            </div>

            {/* Core Stats Below Headline */}
            <div className="grid grid-cols-3 gap-4 mt-8 border-t border-border-dark pt-8 max-w-xl">
              <div>
                <p suppressHydrationWarning className="text-2xl md:text-3xl font-extrabold text-text-primary">{(stats?.totalSalaries ?? 0).toLocaleString()}+</p>
                <p className="text-xs text-text-muted">Salaries Shared</p>
              </div>
              <div>
                <p suppressHydrationWarning className="text-2xl md:text-3xl font-extrabold text-text-primary">{(stats?.totalCompanies ?? 0).toLocaleString()}+</p>
                <p className="text-xs text-text-muted">Tech Companies</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-extrabold text-text-primary">2</p>
                <p className="text-xs text-text-muted">Countries Logged</p>
              </div>
            </div>
          </div>

          {/* Hero Right Floating Glassmorphism Cards */}
          <div className="lg:col-span-5 relative h-[380px] md:h-[420px] w-full flex items-center justify-center pointer-events-none select-none">
            {/* Background glowing circle */}
            <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-primary/10 to-secondary/15 filter blur-2xl animate-pulse" />

            {/* Floating Card 1: Google L5 */}
            <div className="absolute top-4 left-6 md:left-12 glass p-5 rounded-2xl w-[260px] md:w-[280px] shadow-2xl animate-float">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-[#4285F4] flex items-center justify-center font-bold text-white text-[10px]">G</span>
                  <span className="text-xs font-bold text-text-primary">Google</span>
                </div>
                <LevelBadge tier="Senior" />
              </div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">L5 • Software Engineer</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-black text-text-primary">$378,000</span>
                <span className="text-[10px] text-text-muted">TC</span>
              </div>
              <div className="w-full bg-border-dark h-1.5 rounded-full mt-3 overflow-hidden flex">
                <div className="h-full bg-primary" style={{ width: '51%' }} />
                <div className="h-full bg-secondary" style={{ width: '10%' }} />
                <div className="h-full bg-success" style={{ width: '39%' }} />
              </div>
              <div className="flex justify-between text-[8px] text-text-muted mt-1.5">
                <span>$195k Base</span>
                <span>$145k Eq</span>
              </div>
            </div>

            {/* Floating Card 2: Meta E6 */}
            <div className="absolute bottom-8 right-6 md:right-12 glass p-5 rounded-2xl w-[260px] md:w-[280px] shadow-2xl animate-float-delayed">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-[#0668E1] flex items-center justify-center font-bold text-white text-[10px]">M</span>
                  <span className="text-xs font-bold text-text-primary">Meta</span>
                </div>
                <LevelBadge tier="Staff" />
              </div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">E6 • Production Engineer</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-black text-text-primary">$590,000</span>
                <span className="text-[10px] text-text-muted">TC</span>
              </div>
              <div className="w-full bg-border-dark h-1.5 rounded-full mt-3 overflow-hidden flex">
                <div className="h-full bg-primary" style={{ width: '41%' }} />
                <div className="h-full bg-secondary" style={{ width: '10%' }} />
                <div className="h-full bg-success" style={{ width: '49%' }} />
              </div>
              <div className="flex justify-between text-[8px] text-text-muted mt-1.5">
                <span>$240k Base</span>
                <span>$290k Eq</span>
              </div>
            </div>

            {/* Floating Card 3: Amazon L4 */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 glass p-4 rounded-xl w-[210px] shadow-xl opacity-90 hidden sm:block">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded bg-[#FF9900] flex items-center justify-center font-bold text-white text-[9px]">A</span>
                <span className="text-[10px] font-bold text-text-primary">Amazon</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-primary">$172,000</span>
                <span className="text-[8px] text-success bg-success/15 px-1 rounded font-bold">L4 Entry</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar & Filters Section */}
      <section className="border-t border-border-dark bg-[#0e0e15]/40 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8 flex flex-col items-center gap-2">
            <h2 className="text-2xl font-bold text-text-primary">Search Compensation</h2>
            <p className="text-sm text-text-muted">Enter a company, title, or level to instantly filter reported datasets.</p>
          </div>

          {/* Search Bar Input */}
          <div className="relative w-full max-w-2xl mx-auto mb-6" ref={searchRef}>
            <div
              className="flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300"
              style={{
                background: 'rgba(17,17,24,0.9)',
                border: searchOpen ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: searchOpen ? '0 0 30px rgba(99,102,241,0.2)' : 'none',
                backdropFilter: 'blur(20px)',
              }}
            >
              {searchLoading ? (
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              ) : (
                <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setSearchOpen(true)}
                placeholder="Search company, role, or level... (e.g. Google L5, Meta SWE)"
                className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm min-w-0"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setSearchOpen(false);
                  }}
                  className="text-slate-500 hover:text-slate-300 transition-colors text-lg leading-none"
                >
                  x
                </button>
              )}
              <button
                onClick={() => router.push(`/salaries?search=${encodeURIComponent(searchQuery)}`)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                }}
              >
                Search
              </button>
            </div>

            {searchOpen && searchResults.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50"
                style={{
                  background: 'rgba(13,11,26,0.98)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {searchResults.filter((result) => result.type === 'company').length > 0 && (
                  <div>
                    <div className="px-4 pt-3 pb-1 text-xs text-slate-500 font-semibold tracking-wider uppercase">
                      Companies
                    </div>
                    {searchResults
                      .filter((result) => result.type === 'company')
                      .map((result, i) => (
                        <button
                          key={`company-${i}`}
                          onClick={() => {
                            router.push(result.href);
                            setSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(99,102,241,0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                            style={{
                              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            }}
                          >
                            {result.icon}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{result.label}</p>
                            <p className="text-slate-500 text-xs">{result.sub}</p>
                          </div>
                          <div className="ml-auto text-slate-600 text-xs">→</div>
                        </button>
                      ))}
                  </div>
                )}

                {searchResults.filter((result) => result.type === 'salary').length > 0 && (
                  <div>
                    <div
                      className="px-4 pt-3 pb-1 text-xs text-slate-500 font-semibold tracking-wider uppercase"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      Salary Data
                    </div>
                    {searchResults
                      .filter((result) => result.type === 'salary')
                      .map((result, i) => (
                        <button
                          key={`salary-${i}`}
                          onClick={() => {
                            router.push(result.href);
                            setSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(34,211,238,0.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-cyan-300 bg-cyan-500/10 font-bold flex-shrink-0">
                            {result.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">{result.label}</p>
                            <p className="text-slate-500 text-xs truncate">{result.sub}</p>
                          </div>
                          <div className="ml-auto text-cyan-500 text-xs flex-shrink-0">→</div>
                        </button>
                      ))}
                  </div>
                )}

                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    background: 'rgba(99,102,241,0.04)',
                  }}
                >
                  <span className="text-slate-600 text-xs">{searchResults.length} results found</span>
                  <button
                    onClick={() => {
                      router.push(`/salaries?search=${encodeURIComponent(searchQuery)}`);
                      setSearchOpen(false);
                    }}
                    className="text-indigo-400 text-xs hover:text-indigo-300 transition-colors"
                  >
                    View all results →
                  </button>
                </div>
              </div>
            )}

            {searchOpen && searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-2 rounded-2xl p-6 text-center z-50"
                style={{
                  background: 'rgba(13,11,26,0.98)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <p className="text-slate-400 text-sm">No results for "{searchQuery}"</p>
                <p className="text-slate-600 text-xs mt-1">Try a company name like "Google" or role like "SWE"</p>
              </div>
            )}
          </div>

          {/* Filter Chips Rows */}
          <div className="flex flex-col gap-3 max-w-3xl mx-auto text-sm">
            {/* Roles */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-text-muted w-16 shrink-0 uppercase tracking-wider">Role:</span>
              <div className="flex gap-1.5 flex-wrap">
                {roles.map((role) => {
                  const isActive = selectedRole === role;
                  return (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(isActive ? null : role)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all ${
                        isActive
                          ? 'bg-primary border-primary text-white font-medium shadow-md shadow-primary/10'
                          : 'border-border-dark bg-card text-text-muted hover:text-text-primary hover:border-text-muted/30'
                      }`}
                    >
                      {role === 'Software Engineer' ? 'SWE' : role === 'Product Manager' ? 'PM' : role === 'Designer' ? 'Design' : 'Data'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Levels */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-text-muted w-16 shrink-0 uppercase tracking-wider">Level:</span>
              <div className="flex gap-1.5 flex-wrap">
                {levels.map((lvl) => {
                  const isActive = selectedLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={() => setSelectedLevel(isActive ? null : lvl)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all ${
                        isActive
                          ? 'bg-primary border-primary text-white font-medium shadow-md shadow-primary/10'
                          : 'border-border-dark bg-card text-text-muted hover:text-text-primary hover:border-text-muted/30'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Locations */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-text-muted w-16 shrink-0 uppercase tracking-wider">Location:</span>
              <div className="flex gap-1.5 flex-wrap">
                {locations.map((loc) => {
                  const isActive = selectedLoc === loc;
                  return (
                    <button
                      key={loc}
                      onClick={() => setSelectedLoc(isActive ? null : loc)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all ${
                        isActive
                          ? 'bg-primary border-primary text-white font-medium shadow-md shadow-primary/10'
                          : 'border-border-dark bg-card text-text-muted hover:text-text-primary hover:border-text-muted/30'
                      }`}
                    >
                      {loc}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Companies */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-text-muted w-16 shrink-0 uppercase tracking-wider">Company:</span>
              <div className="flex gap-1.5 flex-wrap">
                {companyTypes.map((type) => {
                  const isActive = selectedCompanyType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedCompanyType(isActive ? null : type)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all ${
                        isActive
                          ? 'bg-primary border-primary text-white font-medium shadow-md shadow-primary/10'
                          : 'border-border-dark bg-card text-text-muted hover:text-text-primary hover:border-text-muted/30'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Search Results preview */}
          {(searchQuery || selectedRole || selectedLevel || selectedLoc || selectedCompanyType) && (
            <div className="mt-8 border border-border-dark bg-card rounded-xl p-4 transition-all">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-text-muted">
                  Found <span className="font-semibold text-text-primary">{filteredSalaries.length}</span> matching entries
                </span>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedRole(null);
                    setSelectedLevel(null);
                    setSelectedLoc(null);
                    setSelectedCompanyType(null);
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Clear all filters
                </button>
              </div>

              <div className="divide-y divide-border-dark/50">
                {filteredSalaries.slice(0, 5).map((s) => (
                  <div key={s.id} className="py-3 flex items-center justify-between hover:bg-border-dark/20 px-2 rounded-lg transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary text-sm">{s.company}</span>
                        <span className="text-[10px] text-text-muted font-mono bg-border-dark px-1.5 py-0.5 rounded">{s.level}</span>
                      </div>
                      <p className="text-xs text-text-muted">{s.role} • {s.location}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary text-sm">
                        {formatCurrency(s.totalComp)}
                      </span>
                      <p className="text-[10px] text-text-muted">{s.yoe} YOE</p>
                    </div>
                  </div>
                ))}
                {filteredSalaries.length === 0 && (
                  <p className="py-6 text-center text-xs text-text-muted italic">No matching results found. Try expanding your search queries.</p>
                )}
              </div>
              {filteredSalaries.length > 5 && (
                <div className="mt-3 text-center border-t border-border-dark/40 pt-3">
                  <Link href="/salaries" className="text-xs text-primary font-semibold hover:underline">
                    View all {filteredSalaries.length} entries on the Salary Explorer →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Stats Banner Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Median SWE TC"
            value={formatCurrency(stats?.medianSWETC ?? 0)}
            subtext="Across all locations & companies"
            accentColor="indigo"
          />
          <StatCard
            title="Top 10% TC"
            value={`${formatCurrency(stats?.topTenPercentTC ?? 0)}+`}
            subtext="Staff & Principal grades"
            accentColor="cyan"
          />
          <StatCard
            title="Most Searched"
            value={stats?.mostSearchedCompany ?? 'Loading'}
            subtext="Most reported company"
            accentColor="indigo"
          />
          <StatCard
            title="Trending Role"
            value={stats?.trendingRole ?? 'Loading'}
            subtext="Most common in last 30 days"
            accentColor="green"
          />
        </div>
      </section>
    </div>
  );
}
