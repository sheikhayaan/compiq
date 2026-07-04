"use client";

import React, { FormEvent, useMemo, useState } from 'react';
import { convertCurrency, formatAnnualCurrency, type DisplayCurrency } from '@/lib/currency';

type Prediction = {
  predicted_base: number;
  predicted_bonus: number;
  predicted_equity: number;
  predicted_total_comp: number;
  confidence_score: number;
  percentile: number;
};

const roles = ['Software Engineer', 'Senior SWE', 'Staff SWE', 'Data Scientist', 'PM', 'DevOps', 'Product Manager'];
const levels = ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'];
const companies = ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Stripe', 'Netflix', 'Uber', 'Infosys', 'TCS', 'Wipro'];
const indianCompanies = ['Infosys', 'TCS', 'Wipro'];
const indianLocationTerms = ['india', 'bangalore', 'bengaluru', 'delhi', 'mumbai', 'pune', 'hyderabad', 'chennai', 'gurgaon', 'noida'];

export default function PredictPage() {
  const [role, setRole] = useState('Software Engineer');
  const [level, setLevel] = useState('Senior');
  const [company, setCompany] = useState('Google');
  const [location, setLocation] = useState('San Francisco');
  const [yearsOfExperience, setYearsOfExperience] = useState(6);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>('USD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isIndianMarket = useMemo(() => {
    const normalizedLocation = location.trim().toLowerCase();
    return indianCompanies.includes(company) || indianLocationTerms.some((term) => normalizedLocation.includes(term));
  }, [company, location]);

  const marketCurrency: DisplayCurrency = isIndianMarket ? 'INR' : 'USD';
  const marketLabel = isIndianMarket ? 'India local market' : 'Global / overseas market';
  const formatPredictionCurrency = (amount: number) => {
    return formatAnnualCurrency(convertCurrency(amount, 'USD', displayCurrency), displayCurrency);
  };

  const chartData = useMemo(() => {
    if (!prediction) return [];
    const marketAverage = Math.round(prediction.predicted_total_comp * 0.86);
    const topTen = Math.round(prediction.predicted_total_comp * 1.22);
    const values = [
      { label: 'Your Predicted TC', value: prediction.predicted_total_comp, color: '#10B981' },
      { label: 'Market Average', value: marketAverage, color: '#7c3aed' },
      { label: 'Top 10%', value: topTen, color: '#22D3EE' },
    ];
    const maxValue = Math.max(...values.map((item) => item.value));
    return values.map((item) => ({ ...item, width: `${Math.max((item.value / maxValue) * 100, 8)}%` }));
  }, [prediction]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          level,
          company,
          location,
          years_of_experience: yearsOfExperience,
        }),
      });
      const body = await response.json();

      if (!response.ok || body.error) {
        throw new Error(body.error || 'Prediction failed');
      }

      setDisplayCurrency(marketCurrency);
      setPrediction(body.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to predict compensation right now');
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-text-primary outline-none transition focus:border-[#7c3aed]/70 focus:ring-2 focus:ring-[#7c3aed]/20";

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#7c3aed]/25 bg-[#7c3aed]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#a78bfa]">
            ML Salary Predictor
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary md:text-5xl">
            Forecast your next offer
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-text-muted">
            Estimate base, bonus, equity, and total compensation per annum from company, role, level, location, and experience signals.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <form onSubmit={handleSubmit} className="lg:col-span-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 md:p-6">
              <div className="mb-5">
                <h2 className="text-base font-bold text-text-primary">Prediction Inputs</h2>
                <p className="mt-1 text-xs text-text-muted">Model features aligned with CompIQ salary records.</p>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Role</span>
                  <select value={role} onChange={(event) => setRole(event.target.value)} className={fieldClass}>
                    {roles.map((item) => <option key={item} className="bg-[#111118]">{item}</option>)}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Level</span>
                  <select value={level} onChange={(event) => setLevel(event.target.value)} className={fieldClass}>
                    {levels.map((item) => <option key={item} className="bg-[#111118]">{item}</option>)}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Company</span>
                  <select value={company} onChange={(event) => setCompany(event.target.value)} className={fieldClass}>
                    {companies.map((item) => <option key={item} className="bg-[#111118]">{item}</option>)}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Location</span>
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className={fieldClass}
                    placeholder="San Francisco"
                  />
                  <span className="mt-1.5 block text-[10px] font-semibold text-text-muted">
                    {marketLabel}. Indian locations default to INR per annum.
                  </span>
                </label>

                <div className="rounded-xl border border-white/10 bg-[#0a0a0f]/50 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Display Currency</span>
                    <span className="text-[10px] font-semibold text-text-muted">{marketLabel}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-border-dark bg-[#0e0e15]/70 p-1">
                    {(['USD', 'INR'] as const).map((currency) => (
                      <button
                        key={currency}
                        type="button"
                        onClick={() => setDisplayCurrency(currency)}
                        className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                          displayCurrency === currency
                            ? 'bg-[#7c3aed] text-white'
                            : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        {currency}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Years of Experience</span>
                    <span className="rounded-full border border-[#7c3aed]/30 bg-[#7c3aed]/10 px-2 py-0.5 text-xs font-bold text-[#c4b5fd]">
                      {yearsOfExperience} yrs
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={yearsOfExperience}
                    onChange={(event) => setYearsOfExperience(Number(event.target.value))}
                    className="w-full"
                  />
                </label>
              </div>

              {error && (
                <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7c3aed] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#8b5cf6] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                {loading ? 'Predicting...' : 'Predict Compensation'}
              </button>
            </div>
          </form>

          <section className="lg:col-span-8">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 md:p-6">
              {prediction ? (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Predicted Total Comp</p>
                      <p className="mt-2 text-4xl font-black tracking-tight text-success md:text-6xl">
                        {formatPredictionCurrency(prediction.predicted_total_comp)}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-text-muted">
                        {displayCurrency} per annum · {marketLabel}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-[#7c3aed]/30 bg-[#7c3aed]/10 px-3 py-1 text-sm font-bold text-[#c4b5fd]">
                        {Math.round(prediction.confidence_score * 100)}% confidence
                      </span>
                      <span className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-sm font-bold text-success">
                        Top {100 - prediction.percentile}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[
                      ['Base', prediction.predicted_base],
                      ['Bonus', prediction.predicted_bonus],
                      ['Equity', prediction.predicted_equity],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{label}</p>
                        <p className="mt-2 text-2xl font-black text-text-primary">{formatPredictionCurrency(Number(value))}</p>
                        <p className="mt-1 text-[10px] font-semibold text-text-muted">per annum</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#0a0a0f]/70 p-5">
                    <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-base font-bold text-text-primary">Market Position</h3>
                      <p className="text-xs text-text-muted">You'd be in the top {100 - prediction.percentile}% for this role.</p>
                    </div>
                    <div className="space-y-4">
                      {chartData.map((item) => (
                        <div key={item.label}>
                          <div className="mb-1.5 flex items-center justify-between text-xs">
                            <span className="font-semibold text-text-primary">{item.label}</span>
                            <span className="font-mono text-text-muted">{formatPredictionCurrency(item.value)} pa</span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-white/5">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: item.width, backgroundColor: item.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[520px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#0a0a0f]/45 px-6 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7c3aed]/10 text-2xl font-black text-[#a78bfa]">
                    CI
                  </div>
                  <h2 className="text-xl font-bold text-text-primary">Your prediction will appear here</h2>
                  <p className="mt-2 max-w-md text-sm text-text-muted">
                    Submit the role profile to generate a component-level compensation forecast and market comparison.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
