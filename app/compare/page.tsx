"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { compareSalaries, getCompanies } from '@/lib/api';
import type { Company } from '@/lib/mockData';
import type { ComparisonEntry } from '@/types';
import { convertCurrency, formatAnnualCurrency } from '@/lib/currency';

interface CompareSlot {
  companySlug: string;
  role: string;
  level: string; // level code like L5, E5
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center text-text-muted">Loading Compare Tool...</div>}>
      <CompareContent />
    </Suspense>
  );
}

function CompareContent() {
  const searchParams = useSearchParams();
  const initialCompany = searchParams.get('company') || searchParams.get('c1') || 'google';
  const [companies, setCompanies] = useState<Company[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonEntry[]>([]);
  const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'INR'>('USD');
  const [compareLoading, setCompareLoading] = useState(false);

  // State for 3 slots
  const [slots, setSlots] = useState<CompareSlot[]>([
    { companySlug: initialCompany, role: 'Software Engineer', level: initialCompany === 'google' ? 'L5' : 'E5' },
    { companySlug: 'meta', role: 'Software Engineer', level: 'E5' },
    { companySlug: 'amazon', role: 'Software Engineer', level: 'L6' },
  ]);

  const rolesList = ['Software Engineer', 'Product Manager', 'Designer', 'Data Scientist'];

  const getLevelsForCompany = (companySlug: string) => {
    const company = companies.find((c: any) => c.slug === companySlug);
    return company ? company.levels.map((l: any) => l.code) : [];
  };

  useEffect(() => {
    let ignore = false;
    async function loadCompanies() {
      const result = await getCompanies();
      if (!ignore && result) setCompanies(result as Company[]);
    }
    loadCompanies();
    return () => {
      ignore = true;
    };
  }, []);

  const handleCompare = async () => {
    setCompareLoading(true);
    const entries = slots.map((slot: any) => `${slot.companySlug}:${slot.role}:${slot.level}`);
    const result = await compareSalaries(entries);
    setComparisonData(result ?? []);
    setCompareLoading(false);
  };

  const handleUpdateSlot = (index: number, key: keyof CompareSlot, value: string) => {
    setSlots((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      
      // Auto-update level code if company changes to ensure it matches
      if (key === 'companySlug') {
        const company = companies.find((c: any) => c.slug === value);
        if (company && company.levels.length > 0) {
          updated[index].level = company.levels[2]?.code || company.levels[0].code; // pick middle level
        }
      }
      return updated;
    });
    setComparisonData([]);
  };

  const handleAddSlot = () => {
    if (slots.length < 3) {
      setSlots((prev) => [...prev, { companySlug: 'microsoft', role: 'Software Engineer', level: '62' }]);
      setComparisonData([]);
    }
  };

  const handleRemoveSlot = (index: number) => {
    setSlots((prev: any) => prev.filter((_: any, i: any) => i !== index));
    setComparisonData([]);
  };

  const convertAmount = (amount: number, sourceCurrency: string) => {
    return convertCurrency(amount, sourceCurrency, displayCurrency)
  };
  // Resolve slot data (base, bonus, equity, TC, YOE, equivalent, location)
  const resolvedSlotsData = useMemo(() => {
    return slots.map((slot: any, index: any) => {
      const company = companies.find((c: any) => c.slug === slot.companySlug);
      const levelInfo = company?.levels.find((l: any) => l.code === slot.level);
      const matchedSalary = comparisonData[index];
      const sourceCurrency = matchedSalary?.currency || company?.dominantCurrency || 'USD';

      const tc = matchedSalary?.medianTC || levelInfo?.medianTC || 200000;
      const base = matchedSalary?.medianBase || Math.round(tc * 0.55);
      const equity = matchedSalary?.medianEquity || Math.round(tc * 0.35);
      const bonus = matchedSalary?.medianBonus || Math.round(tc * 0.10);
      const yoe = matchedSalary?.medianYOE || levelInfo?.typicalYoe || 5;
      const location = matchedSalary?.count ? `${matchedSalary.count} records` : 'No data yet';

      // Ratings mock for Radar Chart
      const ratings = {
        baseScore: Math.round(55 + (base / 300000) * 45),
        bonusScore: Math.round(40 + (bonus / 100000) * 60),
        equityScore: Math.round(30 + (equity / 400000) * 70),
        growthScore: levelInfo?.tier === 'Principal' ? 95 : levelInfo?.tier === 'Staff' ? 88 : 75,
        wlbScore: slot.companySlug === 'amazon' ? 62 : slot.companySlug === 'google' ? 88 : 78,
      };

      return {
        ...slot,
        companyName: company?.name || slot.companySlug,
        companyBg: company?.logoBg || '#555555',
        levelTier: levelInfo?.tier || 'Senior',
        base,
        bonus,
        equity,
        totalComp: tc,
        displayBase: convertAmount(base, sourceCurrency),
        displayBonus: convertAmount(bonus, sourceCurrency),
        displayEquity: convertAmount(equity, sourceCurrency),
        displayTotalComp: convertAmount(tc, sourceCurrency),
        sourceCurrency,
        yoe,
        location,
        ratings,
      };
    });
  }, [companies, comparisonData, displayCurrency, slots]);

  // Color Coding Math: find min/max per row among active columns
  const rowComparison = useMemo(() => {
    if (resolvedSlotsData.length < 2) {
      const empty = { max: 0, min: 0 };
      return {
        base: empty,
        bonus: empty,
        equity: empty,
        totalComp: empty,
        yoe: empty,
      };
    }

    const getExtremes = (key: 'displayBase' | 'displayBonus' | 'displayEquity' | 'displayTotalComp' | 'yoe') => {
      const values = resolvedSlotsData.map((d: any) => d[key]);
      return {
        max: Math.max(...values),
        min: Math.min(...values),
      };
    };

    return {
      base: getExtremes('displayBase'),
      bonus: getExtremes('displayBonus'),
      equity: getExtremes('displayEquity'),
      totalComp: getExtremes('displayTotalComp'),
      yoe: getExtremes('yoe'),
    };
  }, [resolvedSlotsData]);

  const getCellHighlight = (key: 'base' | 'bonus' | 'equity' | 'totalComp' | 'yoe', val: number) => {
    if (resolvedSlotsData.length < 2) return '';
    const extremes = rowComparison[key];
    if (extremes.max === extremes.min) return ''; // All equal, no colors
    if (val === extremes.max) {
      return 'text-success bg-success/5 border border-success/20 font-bold';
    }
    if (val === extremes.min) {
      return 'text-red-400 bg-red-950/10 border border-red-900/20';
    }
    return '';
  };

  const formatCurrency = (amount: number) => {
    if (!amount || amount === 0) return 'N/A';
    return formatAnnualCurrency(amount, displayCurrency);
  };

  // Radar SVG Math Helper
  const radarPoints = useMemo(() => {
    // Center of 300x300 canvas is (150, 150), radius is 100
    const cx = 150;
    const cy = 150;
    const r = 90;
    
    // Angles for 5 axes: Base, Bonus, Equity, Growth, WLB
    // 0 deg is top, angles go clockwise: 0, 72, 144, 216, 288
    const angles = [0, 72, 144, 216, 288];

    return resolvedSlotsData.map((slot: any) => {
      const scores = [
        slot.ratings.baseScore,
        slot.ratings.bonusScore,
        slot.ratings.equityScore,
        slot.ratings.growthScore,
        slot.ratings.wlbScore,
      ];

      return scores
        .map((score: any, idx: any) => {
          const angleRad = (angles[idx] * Math.PI) / 180;
          const dist = (score / 100) * r;
          const x = cx + dist * Math.sin(angleRad);
          const y = cy - dist * Math.cos(angleRad); // subtract because Y axis points down in SVG
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');
    });
  }, [resolvedSlotsData]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8 md:mb-10 text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
          Platform Compare
        </h1>
        <p className="text-sm text-text-muted mt-2 max-w-2xl">
          Side-by-side annual compensation comparison of roles, levels, and companies. Find the strongest components in each offer.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Slot Selector controls */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass p-6 rounded-2xl flex flex-col gap-6">
            <h3 className="font-bold text-text-primary text-base flex justify-between items-center">
              <span>Compare Slots</span>
              <span className="text-xs text-text-muted font-normal">({slots.length} of 3)</span>
            </h3>

            <div className="flex flex-col gap-5">
              {slots.map((slot: any, index: any) => (
                <div
                  key={index}
                  className="bg-[#0A0A0F] border border-border-dark p-4 rounded-xl relative flex flex-col gap-3"
                >
                  {slots.length > 1 && (
                    <button
                      onClick={() => handleRemoveSlot(index)}
                      className="absolute top-2 right-2 text-text-muted hover:text-red-400 text-xs font-semibold p-1"
                      title="Remove comparison"
                    >
                      Ã¢Å“â€¢
                    </button>
                  )}
                  
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      style={{ backgroundColor: companies.find((c: any) => c.slug === slot.companySlug)?.logoBg }}
                      className="w-5 h-5 rounded flex items-center justify-center font-bold text-white text-[10px]"
                    >
                      {companies.find((c: any) => c.slug === slot.companySlug)?.name[0] || 'C'}
                    </span>
                    <span className="text-xs font-bold text-text-primary">Slot {index + 1}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {/* Company Dropdown */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-text-muted">Company</label>
                      <select
                        value={slot.companySlug}
                        onChange={(e) => handleUpdateSlot(index, 'companySlug', e.target.value)}
                        className="bg-card border border-border-dark rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
                      >
                        {companies.map((c: any) => (
                          <option key={c.id} value={c.slug} className="bg-[#111118]">
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Role Dropdown */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-text-muted">Role</label>
                      <select
                        value={slot.role}
                        onChange={(e) => handleUpdateSlot(index, 'role', e.target.value)}
                        className="bg-card border border-border-dark rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
                      >
                        {rolesList.map((r: any) => (
                          <option key={r} value={r} className="bg-[#111118]">
                            {r === 'Software Engineer' ? 'SWE' : r === 'Product Manager' ? 'PM' : r === 'Designer' ? 'Design' : 'Data'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Level Dropdown */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-text-muted">Level</label>
                      <select
                        value={slot.level}
                        onChange={(e) => handleUpdateSlot(index, 'level', e.target.value)}
                        className="bg-card border border-border-dark rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none font-mono"
                      >
                        {getLevelsForCompany(slot.companySlug).map((lvl: any) => (
                          <option key={lvl} value={lvl} className="bg-[#111118]">
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              {slots.length < 3 && (
                <button
                  onClick={handleAddSlot}
                  className="w-full border border-dashed border-border-dark hover:border-primary/50 text-text-muted hover:text-primary py-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 bg-[#0e0e15]/40 cursor-pointer"
                >
                  + Add to Compare
                </button>
              )}

              <div className="flex items-center gap-2 rounded-xl border border-border-dark bg-[#0e0e15]/70 p-1">
                {(['USD', 'INR'] as const).map((currency) => (
                  <button
                    key={currency}
                    type="button"
                    onClick={() => setDisplayCurrency(currency)}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                      displayCurrency === currency
                        ? 'bg-primary text-white'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {currency}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCompare}
                disabled={compareLoading || slots.length === 0}
                className="w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 0 20px rgba(99,102,241,0.25)',
                }}
              >
                {compareLoading ? 'Comparing...' : 'Compare Selected Slots'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Comparison Table + SVG Radar */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="flex flex-col gap-3 rounded-2xl border border-border-dark bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Display Currency</p>
              <p className="mt-1 text-xs text-text-muted">Switch annual compensation values between converted USD and INR.</p>
            </div>
            <div className="flex w-full items-center gap-2 rounded-xl border border-border-dark bg-[#0e0e15]/70 p-1 sm:w-56">
              {(['USD', 'INR'] as const).map((currency) => (
                <button
                  key={currency}
                  type="button"
                  onClick={() => setDisplayCurrency(currency)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                    displayCurrency === currency
                      ? 'bg-primary text-white'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {currency}
                </button>
              ))}
            </div>
          </div>

          {/* Comparison Matrix Table */}
          <div className="w-full overflow-x-auto rounded-2xl border border-border-dark bg-card">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-border-dark text-xs text-text-muted uppercase bg-[#14141d]/50">
                  <th className="py-5 px-6 font-semibold w-1/4">Metric</th>
                  {resolvedSlotsData.map((d: any, index: any) => (
                    <th key={index} className="py-5 px-4 font-bold border-l border-border-dark/50 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span
                          style={{ backgroundColor: d.companyBg }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-md"
                        >
                          {d.companyName[0]}
                        </span>
                        <span className="text-text-primary text-sm font-black tracking-tight">{d.companyName}</span>
                        <span className="text-[10px] text-text-muted normal-case font-medium">
                          {d.role} Ã¢â‚¬Â¢ <span className="font-mono bg-border-dark px-1 py-0.5 rounded text-text-primary font-bold">{d.level}</span>
                        </span>
                        <span className="text-[10px] text-text-muted normal-case">
                          Source: {d.sourceCurrency}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark/45 text-sm">
                {/* Annual Total Comp Row (Highlighted Larger Font) */}
                <tr className="bg-[#181825]/20 font-bold border-y border-border-dark/50">
                  <td className="py-5 px-6 font-extrabold text-text-primary uppercase tracking-wider text-xs">
                    Annual Total Comp
                  </td>
                  {resolvedSlotsData.map((d: any, index: any) => (
                    <td
                      key={index}
                      className={`py-5 px-4 text-center border-l border-border-dark/50 font-mono text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary ${getCellHighlight(
                        'totalComp',
                        d.displayTotalComp
                      )}`}
                    >
                      {formatCurrency(d.displayTotalComp)}
                    </td>
                  ))}
                </tr>

                {/* Annual Base Salary Row */}
                <tr>
                  <td className="py-4 px-6 text-text-muted font-semibold">Annual Base Salary</td>
                  {resolvedSlotsData.map((d: any, index: any) => (
                    <td
                      key={index}
                      className={`py-4 px-4 text-center border-l border-border-dark/50 font-mono font-medium text-text-primary ${getCellHighlight(
                        'base',
                        d.displayBase
                      )}`}
                    >
                      {formatCurrency(d.displayBase)}
                    </td>
                  ))}
                </tr>

                {/* Bonus Row */}
                <tr>
                  <td className="py-4 px-6 text-text-muted font-semibold">Annual Bonus</td>
                  {resolvedSlotsData.map((d: any, index: any) => (
                    <td
                      key={index}
                      className={`py-4 px-4 text-center border-l border-border-dark/50 font-mono font-medium text-text-primary ${getCellHighlight(
                        'bonus',
                        d.displayBonus
                      )}`}
                    >
                      {formatCurrency(d.displayBonus)}
                    </td>
                  ))}
                </tr>

                {/* Equity Row */}
                <tr>
                  <td className="py-4 px-6 text-text-muted font-semibold">Annual Equity (RSUs)</td>
                  {resolvedSlotsData.map((d: any, index: any) => (
                    <td
                      key={index}
                      className={`py-4 px-4 text-center border-l border-border-dark/50 font-mono font-medium text-text-primary ${getCellHighlight(
                        'equity',
                        d.displayEquity
                      )}`}
                    >
                      {formatCurrency(d.displayEquity)}
                    </td>
                  ))}
                </tr>

                {/* YOE Row */}
                <tr>
                  <td className="py-4 px-6 text-text-muted font-semibold">Average YOE</td>
                  {resolvedSlotsData.map((d: any, index: any) => (
                    <td
                      key={index}
                      className={`py-4 px-4 text-center border-l border-border-dark/50 font-mono font-medium text-text-primary ${getCellHighlight(
                        'yoe',
                        d.yoe
                      )}`}
                    >
                      {d.yoe} yrs
                    </td>
                  ))}
                </tr>

                {/* Level Equivalent Row */}
                <tr>
                  <td className="py-4 px-6 text-text-muted font-semibold">Equivalent Tier</td>
                  {resolvedSlotsData.map((d: any, index: any) => (
                    <td key={index} className="py-4 px-4 text-center border-l border-border-dark/50 font-medium">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border border-border-dark bg-[#0a0a0f] text-text-primary">
                        {d.levelTier}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Location Row */}
                <tr>
                  <td className="py-4 px-6 text-text-muted font-semibold">Location</td>
                  {resolvedSlotsData.map((d: any, index: any) => (
                    <td key={index} className="py-4 px-4 text-center border-l border-border-dark/50 text-xs text-text-muted font-medium">
                      {d.location}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Radar Chart Visual */}
          <div className="relative clear-both w-full overflow-hidden rounded-2xl border border-border-dark bg-card p-6">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_280px] md:items-center">
            <div className="max-w-sm flex flex-col gap-2">
              <h4 className="font-bold text-text-primary text-base">Platform Vectors</h4>
              <p className="text-xs text-text-muted">
                Visual matrix scoring each option across Base Comp, Bonus, Equity grants, Career Growth, and Work-Life Balance (WLB) indicators.
              </p>
              
              {/* Score legends */}
              <div className="flex flex-col gap-2.5 mt-4">
                {resolvedSlotsData.map((d: any, index: any) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <span style={{ backgroundColor: d.companyBg }} className="w-2.5 h-2.5 rounded-full" />
                    <span className="font-bold text-text-primary">{d.companyName}</span>
                    <span className="text-text-muted">({d.role})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SVG Radar representation */}
            <div className="relative mx-auto flex h-64 w-64 shrink-0 items-center justify-center overflow-hidden">
              <svg width="250" height="250" viewBox="0 0 300 300" className="h-full w-full overflow-hidden">
                {/* Background radar grid circles */}
                <circle cx="150" cy="150" r="90" fill="none" stroke="#1E1E2E" strokeWidth="1" />
                <circle cx="150" cy="150" r="60" fill="none" stroke="#1E1E2E" strokeWidth="1" strokeDasharray="3,3" />
                <circle cx="150" cy="150" r="30" fill="none" stroke="#1E1E2E" strokeWidth="1" />

                {/* Radar Grid Axes Lines */}
                {/* Angle offsets in rad from vertical: 0, 72, 144, 216, 288 */}
                {[[0, -90], [85, -28], [53, 73], [-53, 73], [-85, -28]].map(([x, y]: any, idx: any) => (
                  <line
                    key={idx}
                    x1="150"
                    y1="150"
                    x2={150 + x}
                    y2={150 + y}
                    stroke="#1E1E2E"
                    strokeWidth="1"
                  />
                ))}

                {/* Axis Labels */}
                <text x="150" y="45" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="bold">BASE</text>
                <text x="250" y="125" textAnchor="start" fill="#64748B" fontSize="10" fontWeight="bold">BONUS</text>
                <text x="210" y="245" textAnchor="start" fill="#64748B" fontSize="10" fontWeight="bold">EQUITY</text>
                <text x="90" y="245" textAnchor="end" fill="#64748B" fontSize="10" fontWeight="bold">GROWTH</text>
                <text x="50" y="125" textAnchor="end" fill="#64748B" fontSize="10" fontWeight="bold">WLB</text>

                {/* Polygons */}
                {radarPoints.map((pointsStr: any, idx: any) => {
                  const d = resolvedSlotsData[idx];
                  return (
                    <polygon
                      key={idx}
                      points={pointsStr}
                      fill={`${d.companyBg}22`}
                      stroke={d.companyBg}
                      strokeWidth="2.5"
                      className="transition-all duration-500 ease-in-out"
                    />
                  );
                })}
              </svg>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
