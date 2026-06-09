"use client";

import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import FilterPanel, { FilterState } from '@/components/FilterPanel';
import SalaryTable from '@/components/SalaryTable';
import CompanyCard from '@/components/CompanyCard';
import { getCompanies, getSalaries } from '@/lib/api';
import type { Company, SalaryEntry } from '@/lib/mockData';

export default function SalariesPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center text-text-muted">Loading Salary Explorer...</div>}>
      <SalariesContent />
    </Suspense>
  );
}

function SalariesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'salaries';
  const search = searchParams.get('search') || '';
  const [salaries, setSalaries] = useState<SalaryEntry[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'INR'>('USD');

  const locationsList = useMemo(() => {
    return Array.from(new Set(salaries.flatMap((s: any) => [s.country, s.location]))).filter(Boolean).sort();
  }, [salaries]);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    companies: [],
    roles: [],
    levelTier: 'All',
    locations: [],
    yoe: 20,
    totalComp: 1000000,
  });

  const handleApplyFilters = (newFilters: FilterState) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newFilters.companies[0]) params.set('company', newFilters.companies[0]);
    else params.delete('company');

    if (newFilters.roles[0]) params.set('role', newFilters.roles[0]);
    else params.delete('role');

    if (newFilters.levelTier !== 'All') params.set('level', newFilters.levelTier);
    else params.delete('level');

    params.set('maxYOE', String(newFilters.yoe));
    params.set('maxTC', String(newFilters.totalComp));
    router.push(`/salaries?${params.toString()}`);
    setFilters(newFilters);
  };

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      setLoading(true);
      setError(null);
      const [salaryResult, companyResult] = await Promise.all([
        getSalaries({
          company: filters.companies[0],
          role: filters.roles[0],
          level: filters.levelTier === 'All' ? undefined : filters.levelTier,
          maxYOE: filters.yoe,
          search: search || undefined,
          page: 1,
          limit: 500,
        }),
        getCompanies(),
      ]);
      if (ignore) return;
      if (!salaryResult || !companyResult) {
        setError('Unable to load salary data right now.');
        setSalaries([]);
        setCompanies([]);
        setTotalRecords(0);
      } else {
        setSalaries(salaryResult.data as SalaryEntry[]);
        setCompanies(companyResult as Company[]);
        setTotalRecords(salaryResult.total);
      }
      setLoading(false);
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, [filters, search]);

  const filteredSalaries = useMemo(() => {
    return salaries.filter((s: any) => {
      if (filters.companies.length > 1 && !filters.companies.includes(s.company)) return false;
      if (filters.roles.length > 1 && !filters.roles.includes(s.role)) return false;
      if (
        filters.locations.length > 0 &&
        !filters.locations.includes(s.location) &&
        !filters.locations.includes(s.country)
      ) return false;
      return true;
    });
  }, [filters, salaries]);

  // Filter companies based on search inside tab if applicable
  const filteredCompanies = useMemo(() => {
    if (filters.companies.length === 0) return companies;
    return companies.filter((c: any) => filters.companies.includes(c.name));
  }, [companies, filters.companies]);

  const switchTab = (tabName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabName);
    router.push(`/salaries?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8 md:mb-10 text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
          Salary Intelligence
        </h1>
        <p className="text-sm text-text-muted mt-2 max-w-2xl">
          Browse verified, anonymized compensation data from top technology firms. Filter by level, experience, company, and location.
        </p>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-border-dark mb-8 gap-6 text-sm">
        <button
          onClick={() => switchTab('salaries')}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === 'salaries'
              ? 'text-primary'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Salaries Explorer
          {activeTab === 'salaries' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
        <button
          onClick={() => switchTab('companies')}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === 'companies'
              ? 'text-primary'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Company Directory
          {activeTab === 'companies' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <FilterPanel
            companiesList={companies}
            locationsList={locationsList}
            initialFilters={filters}
            onApply={handleApplyFilters}
          />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {activeTab === 'salaries' ? (
            <div>
              <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-text-muted font-medium">
                  Showing <span className="text-text-primary font-bold">{filteredSalaries.length}</span> of <span className="text-text-primary font-bold">{totalRecords}</span> individual records
                </span>
                <div className="flex w-full items-center gap-2 rounded-xl border border-border-dark bg-[#0e0e15]/70 p-1 sm:w-48">
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
              {loading && <p className="py-10 text-center text-text-muted text-sm">Loading salaries...</p>}
              {error && <p className="py-10 text-center text-red-400 text-sm">{error}</p>}
              {!loading && !error && <SalaryTable data={filteredSalaries} displayCurrency={displayCurrency} />}
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-text-muted font-medium">
                  Showing <span className="text-text-primary font-bold">{filteredCompanies.length}</span> tech profiles
                </span>
                <div className="flex w-full items-center gap-2 rounded-xl border border-border-dark bg-[#0e0e15]/70 p-1 sm:w-48">
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCompanies.map((company: any) => (
                  <CompanyCard key={company.id} company={company} displayCurrency={displayCurrency} />
                ))}
                {filteredCompanies.length === 0 && (
                  <p className="col-span-full py-12 text-center text-text-muted italic">
                    No matching companies found.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
