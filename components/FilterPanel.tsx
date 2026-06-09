"use client";

import React, { useState, useEffect } from 'react';
import { Company } from '@/lib/mockData';

export interface FilterState {
  companies: string[];
  roles: string[];
  levelTier: string;
  locations: string[];
  yoe: number;
  totalComp: number;
}

interface FilterPanelProps {
  companiesList: Company[];
  locationsList: string[];
  initialFilters: FilterState;
  onApply: (filters: FilterState) => void;
}

export default function FilterPanel({
  companiesList,
  locationsList,
  initialFilters,
  onApply,
}: FilterPanelProps) {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(initialFilters.companies);
  const [companySearch, setCompanySearch] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(initialFilters.roles);
  const [selectedLevelTier, setSelectedLevelTier] = useState<string>(initialFilters.levelTier);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(initialFilters.locations);
  const [yoeRange, setYoeRange] = useState<number>(initialFilters.yoe);
  const [tcRange, setTcRange] = useState<number>(initialFilters.totalComp);

  // Sync state if initialFilters change
  useEffect(() => {
    setSelectedCompanies(initialFilters.companies);
    setSelectedRoles(initialFilters.roles);
    setSelectedLevelTier(initialFilters.levelTier);
    setSelectedLocations(initialFilters.locations);
    setYoeRange(initialFilters.yoe);
    setTcRange(initialFilters.totalComp);
  }, [initialFilters]);

  const rolesList = [
    { name: 'Software Engineer', slug: 'swe' },
    { name: 'Product Manager', slug: 'pm' },
    { name: 'Designer', slug: 'design' },
    { name: 'Data Scientist', slug: 'data' },
  ];

  const levelsList = ['All', 'Junior', 'Mid', 'Senior', 'Staff', 'Principal'];

  const toggleCompany = (companyName: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(companyName)
        ? prev.filter((c) => c !== companyName)
        : [...prev, companyName]
    );
  };

  const toggleRole = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName]
    );
  };

  const toggleLocation = (location: string) => {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location]
    );
  };

  const handleApply = () => {
    onApply({
      companies: selectedCompanies,
      roles: selectedRoles,
      levelTier: selectedLevelTier,
      locations: selectedLocations,
      yoe: yoeRange,
      totalComp: tcRange,
    });
  };

  const handleReset = () => {
    setSelectedCompanies([]);
    setSelectedRoles([]);
    setSelectedLevelTier('All');
    setSelectedLocations([]);
    setYoeRange(20);
    setTcRange(1000000);
    onApply({
      companies: [],
      roles: [],
      levelTier: 'All',
      locations: [],
      yoe: 20,
      totalComp: 1000000,
    });
  };

  const filteredCompanies = companiesList.filter((c) =>
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  return (
    <div suppressHydrationWarning className="glass p-6 rounded-xl flex flex-col gap-6 w-full lg:sticky lg:top-20 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border-dark pb-4">
        <h3 className="font-bold text-text-primary text-base">Filters</h3>
        <button
          onClick={handleReset}
          className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
        >
          Reset All
        </button>
      </div>

      {/* Company Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase text-text-muted tracking-wider">
          Company
        </label>
        <input
          type="text"
          placeholder="Search companies..."
          value={companySearch}
          onChange={(e) => setCompanySearch(e.target.value)}
          className="w-full bg-[#0A0A0F] border border-border-dark rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary/50 transition-colors placeholder:text-text-muted/50"
        />
        <div className="flex flex-col gap-1.5 mt-2 max-h-32 overflow-y-auto pr-1">
          {filteredCompanies.map((company) => (
            <label
              key={company.id}
              className="flex items-center gap-2 text-xs text-text-primary hover:text-primary cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedCompanies.includes(company.name)}
                onChange={() => toggleCompany(company.name)}
                className="rounded border-border-dark bg-[#0A0A0F] text-primary focus:ring-primary w-3.5 h-3.5 accent-primary"
              />
              <span>{company.name}</span>
            </label>
          ))}
          {filteredCompanies.length === 0 && (
            <p className="text-xs text-text-muted italic">No companies found</p>
          )}
        </div>
      </div>

      {/* Role Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase text-text-muted tracking-wider">
          Role
        </label>
        <div className="flex flex-col gap-1.5">
          {rolesList.map((role) => (
            <label
              key={role.slug}
              className="flex items-center gap-2 text-xs text-text-primary hover:text-primary cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedRoles.includes(role.name)}
                onChange={() => toggleRole(role.name)}
                className="rounded border-border-dark bg-[#0A0A0F] text-primary focus:ring-primary w-3.5 h-3.5 accent-primary"
              />
              <span>{role.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Level Tier Dropdown */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase text-text-muted tracking-wider">
          Target Level
        </label>
        <select
          value={selectedLevelTier}
          onChange={(e) => setSelectedLevelTier(e.target.value)}
          className="w-full bg-[#0A0A0F] border border-border-dark rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary/50 transition-colors"
        >
          {levelsList.map((lvl) => (
            <option key={lvl} value={lvl} className="bg-[#111118]">
              {lvl === 'All' ? 'All Experience Levels' : lvl}
            </option>
          ))}
        </select>
      </div>

      {/* Location Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase text-text-muted tracking-wider">
          Location
        </label>
        <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
          {locationsList.map((loc) => (
            <label
              key={loc}
              className="flex items-center gap-2 text-xs text-text-primary hover:text-primary cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedLocations.includes(loc)}
                onChange={() => toggleLocation(loc)}
                className="rounded border-border-dark bg-[#0A0A0F] text-primary focus:ring-primary w-3.5 h-3.5 accent-primary"
              />
              <span>{loc}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Slider */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <label className="font-semibold uppercase text-text-muted tracking-wider">
            Max Experience (YOE)
          </label>
          <span className="font-bold text-primary">{yoeRange} yrs</span>
        </div>
        <input
          type="range"
          min="0"
          max="20"
          value={yoeRange}
          onChange={(e) => setYoeRange(Number(e.target.value))}
          className="w-full h-1 bg-border-dark rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-text-muted">
          <span>0 YOE</span>
          <span>20+ YOE</span>
        </div>
      </div>

      {/* TC Slider */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <label className="font-semibold uppercase text-text-muted tracking-wider">
            Max Total Comp
          </label>
          <span suppressHydrationWarning className="font-bold text-primary">
            {tcRange >= 1000000
              ? '$1M+'
              : new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(tcRange)}
          </span>
        </div>
        <input
          type="range"
          min="100000"
          max="1000000"
          step="25000"
          value={tcRange}
          onChange={(e) => setTcRange(Number(e.target.value))}
          className="w-full h-1 bg-border-dark rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-text-muted">
          <span>$100k</span>
          <span>$1M+</span>
        </div>
      </div>

      <button
        onClick={handleApply}
        className="w-full mt-2 bg-primary hover:bg-primary/95 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors shadow-lg hover:shadow-primary/10"
      >
        Apply Filters
      </button>
    </div>
  );
}
