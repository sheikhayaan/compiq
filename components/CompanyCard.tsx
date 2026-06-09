import React from 'react';
import Link from 'next/link';
import { Company } from '@/lib/mockData';
import { formatConvertedAnnualCurrency } from '@/lib/currency';

interface CompanyCardProps {
  company: Company;
  className?: string;
  displayCurrency?: 'USD' | 'INR';
}

export default function CompanyCard({ company, className = '', displayCurrency = 'USD' }: CompanyCardProps) {
  const formatCurrency = (val: number) => {
    if (!val) return 'N/A'
    return formatConvertedAnnualCurrency(val, company.dominantCurrency || 'USD', displayCurrency)
  };

  return (
    <div
      className={`glass glass-hover p-6 rounded-xl flex flex-col justify-between h-full relative overflow-hidden group ${className}`}
    >
      {/* Visual background gradient blur */}
      <div 
        className="absolute top-0 right-0 w-24 h-24 rounded-full filter blur-3xl opacity-10 transition-opacity duration-300 group-hover:opacity-20"
        style={{ backgroundColor: company.logoBg }}
      />
      
      <div>
        <div className="flex items-center gap-4 mb-4">
          {/* Logo Placeholder */}
          <div
            style={{ backgroundColor: company.logoBg }}
            className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-md shrink-0"
          >
            {company.name[0]}
          </div>
          <div>
            <h4 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">
              {company.name}
            </h4>
            <p className="text-xs text-text-muted">{company.industry}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 border-t border-border-dark pt-4">
          <div>
            <p className="text-[10px] uppercase font-semibold text-text-muted tracking-wider">
              Annual Median TC
            </p>
            <p className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              {formatCurrency(company.medianTC)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-semibold text-text-muted tracking-wider">
              Salaries
            </p>
            <p suppressHydrationWarning className="text-base font-extrabold text-text-primary">
              {company.salariesReported.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href={`/company/${company.slug}`}
          className="block w-full text-center text-xs font-semibold bg-border-dark hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 py-2.5 rounded-lg transition-all duration-200"
        >
          View Salaries & Levels
        </Link>
      </div>
    </div>
  );
}
