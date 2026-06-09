"use client";

import React, { useState, useMemo } from 'react';
import { mockCompanies, mockLevelsEquivalency, LevelEquivalency, Company } from '@/lib/mockData';
import LevelBadge from '@/components/LevelBadge';

export default function LevelsPage() {
  const [selectedCompanySlug, setSelectedCompanySlug] = useState('google');

  // Selected Company
  const company = useMemo(() => {
    return mockCompanies.find((c) => c.slug === selectedCompanySlug) || mockCompanies[0];
  }, [selectedCompanySlug]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Hero Section */}
      <div className="text-center mb-10 md:mb-14 flex flex-col items-center gap-2">
        <div className="inline-flex items-center gap-1.5 bg-[#22d3ee]/10 border border-[#22d3ee]/20 text-secondary rounded-full px-3 py-1 text-xs font-semibold">
          Career Calibration Grid
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary tracking-tight mt-1">
          Decode the Level Ladder
        </h1>
        <p className="text-sm text-text-muted max-w-xl">
          Understand titles across big tech. Map leveling hierarchies and standard compensation marks from Junior to Principal grades.
        </p>
      </div>

      {/* Cross-Company Equivalency Visual Bands */}
      <div className="mb-14">
        <h3 className="font-bold text-text-primary text-base mb-5">
          Equivalency Calibration bands
        </h3>
        
        <div className="flex flex-col gap-4">
          {mockLevelsEquivalency.map((eq: any) => {
            // Check if active company level is in this band to highlight it
            const activeCompanyLevelCode = 
              selectedCompanySlug === 'google' ? eq.google :
              selectedCompanySlug === 'meta' ? eq.meta :
              selectedCompanySlug === 'amazon' ? eq.amazon :
              selectedCompanySlug === 'microsoft' ? eq.microsoft :
              eq.apple;

            return (
              <div
                key={eq.tier}
                className={`glass p-4 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 border transition-all duration-300 ${
                  activeCompanyLevelCode 
                    ? 'border-primary/30 bg-primary/[0.02] shadow-md shadow-primary/5' 
                    : 'border-border-dark/60'
                }`}
              >
                {/* Tier Label */}
                <div className="flex items-center gap-3 w-40 shrink-0">
                  <LevelBadge tier={eq.tier} />
                  <span className="text-xs text-text-muted font-bold font-mono">{eq.typicalYoe}</span>
                </div>

                {/* Horizontal Level Alignment Band */}
                <div className="flex-1 grid grid-cols-5 gap-3 text-center text-xs font-semibold">
                  <div className={`p-2.5 rounded-lg border flex flex-col items-center gap-1 ${
                    selectedCompanySlug === 'google' ? 'bg-[#4285F4]/10 border-[#4285F4]/30' : 'bg-[#0E0E15] border-border-dark'
                  }`}>
                    <span className="text-[10px] text-text-muted">Google</span>
                    <span className="font-mono text-text-primary font-bold">{eq.google}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border flex flex-col items-center gap-1 ${
                    selectedCompanySlug === 'meta' ? 'bg-[#0668E1]/10 border-[#0668E1]/30' : 'bg-[#0E0E15] border-border-dark'
                  }`}>
                    <span className="text-[10px] text-text-muted">Meta</span>
                    <span className="font-mono text-text-primary font-bold">{eq.meta}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border flex flex-col items-center gap-1 ${
                    selectedCompanySlug === 'amazon' ? 'bg-[#FF9900]/10 border-[#FF9900]/30' : 'bg-[#0E0E15] border-border-dark'
                  }`}>
                    <span className="text-[10px] text-text-muted">Amazon</span>
                    <span className="font-mono text-text-primary font-bold">{eq.amazon}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border flex flex-col items-center gap-1 ${
                    selectedCompanySlug === 'microsoft' ? 'bg-[#F25022]/10 border-[#F25022]/30' : 'bg-[#0E0E15] border-border-dark'
                  }`}>
                    <span className="text-[10px] text-text-muted">Microsoft</span>
                    <span className="font-mono text-text-primary font-bold">{eq.microsoft}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border flex flex-col items-center gap-1 ${
                    selectedCompanySlug === 'apple' ? 'bg-[#555555]/10 border-[#555555]/30' : 'bg-[#0E0E15] border-border-dark'
                  }`}>
                    <span className="text-[10px] text-text-muted">Apple</span>
                    <span className="font-mono text-text-primary font-bold">{eq.apple}</span>
                  </div>
                </div>

                {/* Median TC block */}
                <div className="lg:text-right shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-border-dark lg:w-32">
                  <span className="text-[10px] text-text-muted block font-semibold uppercase tracking-wider">Median TC</span>
                  <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    {formatCurrency(eq.medianTC)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Level progression matrix section */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="font-bold text-text-primary text-base">
            Detailed Level Mapping
          </h3>
          
          {/* Company Selector Tab Buttons */}
          <div className="flex gap-1.5 flex-wrap bg-[#111118] border border-border-dark p-1 rounded-xl">
            {mockCompanies.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setSelectedCompanySlug(c.slug)}
                className={`text-xs font-semibold py-2 px-4 rounded-lg transition-all cursor-pointer ${
                  selectedCompanySlug === c.slug
                    ? 'bg-primary text-white shadow'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Company Level Table */}
        <div className="bg-card border border-border-dark p-6 rounded-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div
              style={{ backgroundColor: company.logoBg }}
              className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white text-lg shadow shrink-0"
            >
              {company.name[0]}
            </div>
            <div>
              <h4 className="font-bold text-text-primary text-lg">{company.name} Levels Matrix</h4>
              <p className="text-xs text-text-muted">
                Typical timeline metrics and mapping equivalents for {company.name} candidates.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border-dark bg-[#0A0A0F]">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-border-dark text-xs font-bold text-text-muted uppercase bg-[#14141d]/50">
                  <th className="py-4 px-6 w-1/5">Level Code</th>
                  <th className="py-4 px-4 w-1/4">Normal Title</th>
                  <th className="py-4 px-4">Level Tier</th>
                  <th className="py-4 px-4 text-center">Typical YOE</th>
                  <th className="py-4 px-4 text-right">Median TC</th>
                  <th className="py-4 px-6 text-center">Big Tech Equivalents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark/30 text-sm">
                {company.levels.map((lvl: any) => {
                  // Find equivalents
                  const eqBand = mockLevelsEquivalency.find((eq: any) => eq.tier === lvl.tier);
                  const equivs = eqBand
                    ? [
                        selectedCompanySlug !== 'google' ? `Google ${eqBand.google}` : null,
                        selectedCompanySlug !== 'meta' ? `Meta ${eqBand.meta}` : null,
                        selectedCompanySlug !== 'amazon' ? `Amazon ${eqBand.amazon}` : null,
                        selectedCompanySlug !== 'microsoft' ? `MSFT ${eqBand.microsoft}` : null,
                        selectedCompanySlug !== 'apple' ? `Apple ${eqBand.apple}` : null,
                      ]
                        .filter(Boolean)
                        .join(' • ')
                    : '';

                  return (
                    <tr key={lvl.code} className="hover:bg-[#111118]/80 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-text-primary">{lvl.code}</td>
                      <td className="py-4 px-4 text-text-primary font-medium">{lvl.name}</td>
                      <td className="py-4 px-4">
                        <LevelBadge tier={lvl.tier} />
                      </td>
                      <td className="py-4 px-4 text-center text-text-primary">{lvl.typicalYoe}+ yrs</td>
                      <td className="py-4 px-4 text-right font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                        {formatCurrency(lvl.medianTC)}
                      </td>
                      <td className="py-4 px-6 text-center text-xs text-text-muted font-medium">
                        {equivs}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
