"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { SalaryEntry, mockCompanies } from '@/lib/mockData';
import LevelBadge from './LevelBadge';
import { formatConvertedAnnualCurrency } from '@/lib/currency';

interface SalaryTableProps {
  data: SalaryEntry[];
  displayCurrency?: 'USD' | 'INR';
}

type SortField = 'company' | 'role' | 'level' | 'location' | 'base' | 'bonus' | 'equity' | 'totalComp' | 'yoe' | 'date';
type SortDirection = 'asc' | 'desc';

export default function SalaryTable({ data, displayCurrency }: SalaryTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending for new sort
    }
    setCurrentPage(1); // Reset page on sort
  };

  const getCompanyLogoBg = (companyName: string) => {
    const matched = mockCompanies.find(
      (c) => c.name.toLowerCase() === companyName.toLowerCase()
    );
    return matched ? matched.logoBg : '#555555';
  };

  // Sort Logic
  const sortedData = useMemo(() => {
    const sorted = [...data];
    sorted.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle strings case-insensitively
      if (typeof valA === 'string' && typeof valB === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [data, sortField, sortDirection]);

  // Pagination Logic
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIdx, startIdx + itemsPerPage);
  }, [sortedData, currentPage]);

  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    if (!amount || amount === 0) return 'N/A'
    return formatConvertedAnnualCurrency(amount, currency, displayCurrency ?? 'USD')
  };
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <span className="text-text-muted/30 ml-1 transition-opacity opacity-0 group-hover:opacity-100">
          -
        </span>
      );
    }
    return (
      <span className="text-primary ml-1 font-bold">
        {sortDirection === 'asc' ? '^' : 'v'}
      </span>
    );
  };

  return (
    <div suppressHydrationWarning className="flex flex-col gap-4 w-full">
      <p className="text-xs text-text-muted">
        All salary amounts are annual. INR rows show Indian annual compensation; switching currency converts annual values for display.
      </p>
      {/* Table Wrapper */}
      <div className="w-full overflow-x-auto rounded-xl border border-border-dark bg-card">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-border-dark text-xs font-semibold text-text-muted uppercase bg-card/65 select-none">
              <th
                onClick={() => handleSort('company')}
                className="py-4 px-6 cursor-pointer group hover:text-text-primary transition-colors"
              >
                Company {renderSortIcon('company')}
              </th>
              <th
                onClick={() => handleSort('role')}
                className="py-4 px-4 cursor-pointer group hover:text-text-primary transition-colors"
              >
                Role {renderSortIcon('role')}
              </th>
              <th
                onClick={() => handleSort('level')}
                className="py-4 px-4 cursor-pointer group hover:text-text-primary transition-colors"
              >
                Level {renderSortIcon('level')}
              </th>
              <th
                onClick={() => handleSort('yoe')}
                className="py-4 px-4 cursor-pointer group hover:text-text-primary transition-colors text-center"
              >
                YOE {renderSortIcon('yoe')}
              </th>
              <th
                onClick={() => handleSort('location')}
                className="py-4 px-4 cursor-pointer group hover:text-text-primary transition-colors"
              >
                Location {renderSortIcon('location')}
              </th>
              <th
                onClick={() => handleSort('base')}
                className="py-4 px-4 cursor-pointer group hover:text-text-primary transition-colors text-right"
              >
                Annual Base {renderSortIcon('base')}
              </th>
              <th
                onClick={() => handleSort('bonus')}
                className="py-4 px-4 cursor-pointer group hover:text-text-primary transition-colors text-right"
              >
                Annual Bonus {renderSortIcon('bonus')}
              </th>
              <th
                onClick={() => handleSort('equity')}
                className="py-4 px-4 cursor-pointer group hover:text-text-primary transition-colors text-right"
              >
                Annual Equity {renderSortIcon('equity')}
              </th>
              <th
                onClick={() => handleSort('totalComp')}
                className="py-4 px-6 cursor-pointer group hover:text-text-primary transition-colors text-right text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary font-bold"
              >
                Annual Total Comp {renderSortIcon('totalComp')}
              </th>
              <th
                onClick={() => handleSort('date')}
                className="py-4 px-4 cursor-pointer group hover:text-text-primary transition-colors text-right"
              >
                Date {renderSortIcon('date')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark/40 text-sm">
            {paginatedData.map((row) => {
              const brandColor = getCompanyLogoBg(row.company);
              return (
                <tr
                  key={row.id}
                  className="hover:bg-[#151522]/40 transition-colors group relative"
                  style={{ borderLeft: `3px solid transparent` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderLeftColor = brandColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderLeftColor = 'transparent';
                  }}
                >
                  <td className="py-4 px-6 flex items-center gap-3 font-semibold text-text-primary">
                    <div
                      style={{ backgroundColor: brandColor }}
                      className="w-7 h-7 rounded flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm"
                    >
                      {row.company[0]}
                    </div>
                    <Link
                      href={`/company/${row.companySlug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {row.company}
                    </Link>
                  </td>
                  <td className="py-4 px-4 text-text-primary font-medium">{row.role}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-text-primary bg-border-dark px-1.5 py-0.5 rounded">
                        {row.level}
                      </span>
                      <LevelBadge tier={row.levelTier} />
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center text-text-primary font-medium">{row.yoe}</td>
                  <td className="py-4 px-4 text-text-muted">{row.location}</td>
                  <td className="py-4 px-4 text-right text-text-muted font-mono">
                    {formatCurrency(row.base, row.currency || 'USD')}
                  </td>
                  <td className="py-4 px-4 text-right text-text-muted font-mono">
                    {row.bonus > 0 ? formatCurrency(row.bonus, row.currency || 'USD') : '-'}
                  </td>
                  <td className="py-4 px-4 text-right text-text-muted font-mono">
                    {row.equity > 0 ? formatCurrency(row.equity, row.currency || 'USD') : '-'}
                  </td>
                  <td className="py-4 px-6 text-right font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary font-mono text-base">
                    {formatCurrency(row.totalComp, row.currency || 'USD')}
                  </td>
                  <td suppressHydrationWarning className="py-4 px-4 text-right text-text-muted text-xs">
                    {formatDate(row.date)}
                  </td>
                </tr>
              );
            })}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={10} className="py-12 text-center text-text-muted italic">
                  No matching salaries reported yet. Be the first to submit!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 px-1">
          <p className="text-xs text-text-muted">
            Showing{' '}
            <span className="font-semibold text-text-primary">
              {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-text-primary">
              {Math.min(totalItems, currentPage * itemsPerPage)}
            </span>{' '}
            of <span className="font-semibold text-text-primary">{totalItems}</span> results
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-border-dark bg-card hover:bg-border-dark/60 text-xs font-semibold disabled:opacity-40 disabled:hover:bg-card cursor-pointer transition-colors"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pg = idx + 1;
              return (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === pg
                      ? 'bg-primary text-white'
                      : 'border border-border-dark bg-card hover:bg-border-dark/60 text-text-muted hover:text-text-primary'
                  }`}
                >
                  {pg}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-border-dark bg-card hover:bg-border-dark/60 text-xs font-semibold disabled:opacity-40 disabled:hover:bg-card cursor-pointer transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
