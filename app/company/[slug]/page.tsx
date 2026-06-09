"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCompany } from '@/lib/api';
import type { Company, SalaryEntry } from '@/lib/mockData';
import StatCard from '@/components/StatCard';
import SalaryTable from '@/components/SalaryTable';
import LevelBadge from '@/components/LevelBadge';
import TCBreakdown from '@/components/TCBreakdown';

export default function CompanyProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState<'overview' | 'salaries' | 'levels'>('overview');
  const [company, setCompany] = useState<Company | null>(null);
  const [companySalaries, setCompanySalaries] = useState<SalaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function loadCompany() {
      setLoading(true);
      const result = await getCompany(slug);
      if (ignore) return;
      setCompany(result as Company | null);
      setCompanySalaries((result?.salaries ?? []) as SalaryEntry[]);
      setLoading(false);
    }
    loadCompany();
    return () => {
      ignore = true;
    };
  }, [slug]);

  // Calculate dynamic average compensation components
  const compBreakdown = useMemo(() => {
    if (companySalaries.length === 0) {
      return { base: 0, bonus: 0, equity: 0 };
    }
    let totalBase = 0;
    let totalBonus = 0;
    let totalEquity = 0;
    companySalaries.forEach((s: any) => {
      totalBase += s.base;
      totalBonus += s.bonus;
      totalEquity += s.equity;
    });
    const count = companySalaries.length;
    return {
      base: Math.round(totalBase / count),
      bonus: Math.round(totalBonus / count),
      equity: Math.round(totalEquity / count),
    };
  }, [companySalaries]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-text-muted">
        Loading company profile...
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-text-primary">Company Not Found</h2>
        <p className="text-text-muted mt-2">The company profile you are looking for does not exist in our registry.</p>
        <Link href="/companies" className="inline-block mt-6 text-primary hover:underline font-semibold">
          ← Back to Company Directory
        </Link>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Back Button */}
      <Link
        href="/companies"
        className="text-xs text-text-muted hover:text-text-primary transition-colors flex items-center gap-1.5 mb-6"
      >
        <span>←</span> Back to Directory
      </Link>

      {/* Company Header */}
      <div className="glass p-6 md:p-8 rounded-2xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow effect matching company brand */}
        <div 
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full filter blur-3xl opacity-10"
          style={{ backgroundColor: company.logoBg }}
        />

        <div className="flex items-center gap-5 relative z-10">
          <div
            style={{ backgroundColor: company.logoBg }}
            className="w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center font-bold text-white text-2xl md:text-3xl shadow-lg shrink-0"
          >
            {company.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
                {company.name}
              </h1>
              <span className="bg-[#1c1c27] text-text-muted border border-border-dark px-2.5 py-0.5 rounded text-xs font-semibold">
                {company.industry}
              </span>
            </div>
            <p suppressHydrationWarning className="text-sm text-text-muted mt-1.5 font-medium">
              {company.salariesReported.toLocaleString()} reported salaries
            </p>
          </div>
        </div>

        {/* Call to action */}
        <div className="flex gap-3 relative z-10">
          <Link
            href={`/compare?company=${company.slug}`}
            className="bg-card hover:bg-border-dark/65 border border-border-dark text-text-primary text-sm font-semibold py-2.5 px-5 rounded-xl transition-all"
          >
            Compare Company
          </Link>
          <Link
            href="/submit"
            className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-all shadow-md"
          >
            Submit Salary
          </Link>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border-dark mb-8 gap-6 text-sm">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === 'overview'
              ? 'text-primary'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Overview
          {activeTab === 'overview' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('salaries')}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === 'salaries'
              ? 'text-primary'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Salaries ({companySalaries.length})
          {activeTab === 'salaries' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('levels')}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === 'levels'
              ? 'text-primary'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Levels & Career Ladder
          {activeTab === 'levels' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-8">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Median Total Comp"
              value={formatCurrency(company.medianTC)}
              subtext="Average SWE earnings"
              accentColor="indigo"
            />
            <StatCard
              title="Median Base Salary"
              value={formatCurrency(company.medianBase)}
              subtext="Guaranteed base pay"
              accentColor="cyan"
            />
            <StatCard
              title="Top Level TC"
              value={formatCurrency(company.topLevelTC)}
              subtext="Principal / Partner engineers"
              accentColor="green"
            />
          </div>

          {/* Chart Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Compensation Components Card */}
            <div className="lg:col-span-7 bg-card border border-border-dark p-6 rounded-xl">
              <h3 className="font-bold text-text-primary text-base mb-2">Compensation Mix</h3>
              <p className="text-xs text-text-muted mb-6">
                Average proportion of base pay, cash bonus, and equity stock grants.
              </p>
              
              <TCBreakdown
                base={compBreakdown.base}
                bonus={compBreakdown.bonus}
                equity={compBreakdown.equity}
                showDetails={true}
              />
            </div>

            {/* Level Ladder Shortlist */}
            <div className="lg:col-span-5 bg-card border border-border-dark p-6 rounded-xl">
              <h3 className="font-bold text-text-primary text-base mb-2">Level Progression Ladder</h3>
              <p className="text-xs text-text-muted mb-6">
                Median Total Compensation per level code at {company.name}.
              </p>

              <div className="flex flex-col gap-3">
                {company.levels.map((lvl: any) => (
                  <div
                    key={lvl.code}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#0e0e15] hover:bg-[#151522] border border-border-dark/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-black text-text-primary bg-card px-2 py-0.5 rounded">
                        {lvl.code}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-text-primary">{lvl.name}</p>
                        <p className="text-[10px] text-text-muted">{lvl.typicalYoe} typical YOE</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <LevelBadge tier={lvl.tier} />
                      <span className="font-mono font-bold text-sm text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                        {formatCurrency(lvl.medianTC)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'salaries' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-text-muted">
              Displaying all verified entries reported for <span className="text-text-primary font-bold">{company.name}</span>
            </span>
          </div>
          <SalaryTable data={companySalaries} />
        </div>
      )}

      {activeTab === 'levels' && (
        <div className="bg-card border border-border-dark p-6 md:p-8 rounded-xl">
          <div className="mb-6">
            <h3 className="font-bold text-text-primary text-lg">Ladder Architecture</h3>
            <p className="text-xs text-text-muted mt-1">
              Detailed mapping of typical career progression milestones, years of experience, and median pay brackets at {company.name}.
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border-dark bg-[#0a0a0f]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-dark text-xs font-bold text-text-muted uppercase bg-card/40">
                  <th className="py-4 px-6">Level Code</th>
                  <th className="py-4 px-4">Milestone Title</th>
                  <th className="py-4 px-4">Level Tier</th>
                  <th className="py-4 px-4 text-center">Typical YOE</th>
                  <th className="py-4 px-6 text-right">Median TC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark/30 text-sm">
                {company.levels.map((lvl: any) => (
                  <tr key={lvl.code} className="hover:bg-[#111118]/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-text-primary">{lvl.code}</td>
                    <td className="py-4 px-4 text-text-primary font-medium">{lvl.name}</td>
                    <td className="py-4 px-4">
                      <LevelBadge tier={lvl.tier} />
                    </td>
                    <td className="py-4 px-4 text-center text-text-primary">{lvl.typicalYoe}+ yrs</td>
                    <td className="py-4 px-6 text-right font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                      {formatCurrency(lvl.medianTC)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
