'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import JobCard from './JobCard';
import SearchBar from '../home/SearchBar';
import { CATEGORIES, CITIES } from '@/utils/constants';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function JobDirectoryClient({ 
  jobs = [], 
  totalCount = 0, 
  activeParams = {} 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state for sidebar (needed for sliders to prevent page-reload lag on drag)
  const [localSalary, setLocalSalary] = useState(activeParams.salaryMin || 0);
  const [localExp, setLocalExp] = useState(activeParams.experienceMax || 15);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync sliders if URL params change externally
  useEffect(() => {
    setLocalSalary(activeParams.salaryMin || 0);
  }, [activeParams.salaryMin]);

  useEffect(() => {
    setLocalExp(activeParams.experienceMax || 15);
  }, [activeParams.experienceMax]);

  // Helper to build URL with updated search params
  const updateUrl = (newParams) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    
    // Reset page to 1 on filter changes
    nextParams.set('page', '1');

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '') {
        nextParams.delete(key);
      } else if (Array.isArray(val)) {
        if (val.length === 0) {
          nextParams.delete(key);
        } else {
          nextParams.set(key, val.join(','));
        }
      } else {
        nextParams.set(key, val.toString());
      }
    });

    router.push(`/jobs?${nextParams.toString()}`);
  };

  const handleCheckboxChange = (key, value) => {
    const current = activeParams[key] ? activeParams[key].split(',') : [];
    let updated;
    if (current.includes(value)) {
      updated = current.filter(v => v !== value);
    } else {
      updated = [...current, value];
    }
    updateUrl({ [key]: updated });
  };

  const handleClearAll = () => {
    setLocalSalary(0);
    setLocalExp(15);
    router.push('/jobs');
    setMobileFiltersOpen(false);
  };

  // Pagination items
  const currentPage = Number(activeParams.page) || 1;
  const totalPages = Math.ceil(totalCount / 20) || 1;
  const skip = (currentPage - 1) * 20;

  // Active filter chips
  const activeChips = [];
  if (activeParams.q) activeChips.push({ key: 'q', label: `Search: "${activeParams.q}"` });
  if (activeParams.city) activeChips.push({ key: 'city', label: `City: ${activeParams.city}` });
  if (activeParams.category) {
    activeParams.category.split(',').forEach(c => {
      const match = CATEGORIES.find(cat => cat.slug === c);
      activeChips.push({ key: 'category', value: c, label: match ? match.name : c });
    });
  }
  if (activeParams.jobType) {
    activeParams.jobType.split(',').forEach(t => {
      activeChips.push({ key: 'jobType', value: t, label: t.replace('-', ' ') });
    });
  }
  if (activeParams.workType) {
    activeParams.workType.split(',').forEach(w => {
      activeChips.push({ key: 'workType', value: w, label: w });
    });
  }
  if (activeParams.salaryMin > 0) activeChips.push({ key: 'salaryMin', label: `Salary: ₹${activeParams.salaryMin}L+` });
  if (activeParams.experienceMax < 15) activeChips.push({ key: 'experienceMax', label: `Exp: ≤ ${activeParams.experienceMax} yrs` });

  const removeChip = (chip) => {
    if (chip.key === 'q' || chip.key === 'city' || chip.key === 'salaryMin' || chip.key === 'experienceMax') {
      updateUrl({ [chip.key]: '' });
      if (chip.key === 'salaryMin') setLocalSalary(0);
      if (chip.key === 'experienceMax') setLocalExp(15);
    } else {
      const current = activeParams[chip.key].split(',');
      const updated = current.filter(v => v !== chip.value);
      updateUrl({ [chip.key]: updated });
    }
  };

  // Render sidebar filter widgets
  const renderFilterWidgets = () => (
    <div className="space-y-6">
      {/* Clear All header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Filters</h3>
        <button 
          onClick={handleClearAll}
          className="inline-flex items-center gap-1 text-xs font-semibold text-ink-3 hover:text-accent transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Clear All
        </button>
      </div>

      {/* Work Mode */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-ink">Work Mode</h4>
        <div className="space-y-2">
          {['remote', 'hybrid', 'onsite'].map((mode) => {
            const checked = (activeParams.workType || '').split(',').includes(mode);
            return (
              <label key={mode} className="flex items-center gap-2.5 text-sm font-medium text-ink-2 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleCheckboxChange('workType', mode)}
                  className="h-4.5 w-4.5 rounded border-border text-accent focus:ring-accent"
                />
                <span className="capitalize">{mode}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Job Type */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-ink">Job Type</h4>
        <div className="space-y-2">
          {['full-time', 'part-time', 'contract', 'internship', 'freelance'].map((type) => {
            const checked = (activeParams.jobType || '').split(',').includes(type);
            return (
              <label key={type} className="flex items-center gap-2.5 text-sm font-medium text-ink-2 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleCheckboxChange('jobType', type)}
                  className="h-4.5 w-4.5 rounded border-border text-accent focus:ring-accent"
                />
                <span className="capitalize">{type.replace('-', ' ')}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Salary LPA Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-bold text-ink">Min Salary (LPA)</h4>
          <span className="text-xs font-mono font-bold text-accent bg-accent-light px-2 py-0.5 rounded">
            {localSalary > 0 ? `₹${localSalary}L+` : 'Any'}
          </span>
        </div>
        <input 
          type="range"
          min="0"
          max="50"
          step="2"
          value={localSalary}
          onChange={(e) => setLocalSalary(Number(e.target.value))}
          onMouseUp={() => updateUrl({ salaryMin: localSalary })}
          onTouchEnd={() => updateUrl({ salaryMin: localSalary })}
          className="w-full h-1.5 bg-grey-200 rounded-lg appearance-none cursor-pointer accent-accent"
        />
        <div className="flex justify-between text-[10px] text-ink-3 font-semibold font-mono">
          <span>0L</span>
          <span>25L</span>
          <span>50L</span>
        </div>
      </div>

      {/* Experience Years Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-bold text-ink">Max Experience (Yrs)</h4>
          <span className="text-xs font-mono font-bold text-accent bg-accent-light px-2 py-0.5 rounded">
            {localExp < 15 ? `≤ ${localExp} Yrs` : 'Any Yrs'}
          </span>
        </div>
        <input 
          type="range"
          min="0"
          max="15"
          step="1"
          value={localExp}
          onChange={(e) => setLocalExp(Number(e.target.value))}
          onMouseUp={() => updateUrl({ experienceMax: localExp })}
          onTouchEnd={() => updateUrl({ experienceMax: localExp })}
          className="w-full h-1.5 bg-grey-200 rounded-lg appearance-none cursor-pointer accent-accent"
        />
        <div className="flex justify-between text-[10px] text-ink-3 font-semibold font-mono">
          <span>0yr (Fresher)</span>
          <span>8yr</span>
          <span>15yr+</span>
        </div>
      </div>

      {/* Category Checkboxes */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-ink">Job Category</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {CATEGORIES.map((cat) => {
            const checked = (activeParams.category || '').split(',').includes(cat.slug);
            return (
              <label key={cat.id} className="flex items-center gap-2.5 text-sm font-medium text-ink-2 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleCheckboxChange('category', cat.slug)}
                  className="h-4.5 w-4.5 rounded border-border text-accent focus:ring-accent"
                />
                <span>{cat.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Location Selection */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-ink">Top Cities</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {CITIES.map((city) => {
            const value = city.toLowerCase();
            const checked = (activeParams.city || '').toLowerCase().split(',').includes(value);
            return (
              <label key={city} className="flex items-center gap-2.5 text-sm font-medium text-ink-2 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const current = activeParams.city ? activeParams.city.split(',') : [];
                    let updated;
                    if (current.map(c => c.toLowerCase()).includes(value)) {
                      updated = current.filter(v => v.toLowerCase() !== value);
                    } else {
                      updated = [...current, city]; // Keep proper casing
                    }
                    updateUrl({ city: updated });
                  }}
                  className="h-4.5 w-4.5 rounded border-border text-accent focus:ring-accent"
                />
                <span>{city}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Search Bar Wrapper */}
      <div className="mb-8 w-full bg-canvas">
        <SearchBar compact />
      </div>

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-72 shrink-0 bg-surface border border-border rounded-lg p-5">
          {renderFilterWidgets()}
        </aside>

        {/* Listings Content */}
        <section className="flex-1 min-w-0 w-full">
          {/* Top Info Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-extrabold text-ink tracking-tight capitalize">
                {activeParams.q || activeParams.city || activeParams.category
                  ? `${totalCount.toLocaleString()} job openings matching search`
                  : `${totalCount.toLocaleString()} verified job listings in India`
                }
              </h1>
              <p className="text-xs sm:text-sm text-ink-3 mt-1 font-medium">
                Showing {totalCount > 0 ? skip + 1 : 0}–{Math.min(skip + 20, totalCount)} of {totalCount} jobs
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden inline-flex items-center gap-1.5 rounded border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-ink-2 hover:bg-grey-50"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>

              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-ink-3 uppercase tracking-wider">Sort:</span>
                <select
                  value={activeParams.sort || 'date'}
                  onChange={(e) => updateUrl({ sort: e.target.value })}
                  className="rounded border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink-2 focus:border-accent focus:ring-accent outline-none cursor-pointer"
                >
                  <option value="date">Date Posted</option>
                  <option value="relevance">Relevance</option>
                  <option value="salary">Salary (High to Low)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Chips Row */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center mb-6">
              <span className="text-xs font-bold text-ink-3 uppercase tracking-wider mr-1">Active filters:</span>
              {activeChips.map((chip, idx) => (
                <span 
                  key={idx}
                  className="inline-flex items-center gap-1 rounded bg-accent-light px-2.5 py-1 text-xs font-semibold text-accent"
                >
                  {chip.label}
                  <button 
                    onClick={() => removeChip(chip)}
                    className="hover:text-accent-dark hover:bg-accent/10 rounded-full p-0.5 transition-all"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button 
                onClick={handleClearAll}
                className="text-xs font-semibold text-accent hover:text-accent-dark hover:underline ml-1"
              >
                Reset
              </button>
            </div>
          )}

          {/* Job List */}
          {jobs.length === 0 ? (
            <div className="text-center py-16 bg-surface border border-border rounded-lg p-6 flex flex-col items-center justify-center">
              <p className="text-lg font-bold text-ink">No jobs match your filters</p>
              <p className="text-sm text-ink-3 mt-1.5 max-w-sm">
                Try loosening your filters, expanding your search query, or resetting the filter parameters.
              </p>
              <button
                onClick={handleClearAll}
                className="mt-5 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-dark"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCard 
                  key={job._id} 
                  job={job}
                  initialSaved={activeParams.savedJobsList?.includes(job._id)}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2 border-t border-border pt-6">
              <button
                onClick={() => updateUrl({ page: currentPage - 1 })}
                disabled={currentPage === 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded border border-border bg-surface text-ink-2 hover:bg-grey-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Show pages near current page
                if (pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 1) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => updateUrl({ page: pageNum })}
                      className={cn(
                        "inline-flex h-9 w-9 items-center justify-center rounded text-sm font-semibold border transition-all",
                        currentPage === pageNum
                          ? "bg-accent border-accent text-white shadow-sm"
                          : "border-border bg-surface text-ink-2 hover:bg-grey-50"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === 2 || pageNum === totalPages - 1) {
                  return <span key={pageNum} className="text-ink-3 px-1">...</span>;
                }
                return null;
              })}

              <button
                onClick={() => updateUrl({ page: currentPage + 1 })}
                disabled={currentPage === totalPages}
                className="inline-flex h-9 w-9 items-center justify-center rounded border border-border bg-surface text-ink-2 hover:bg-grey-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Mobile Drawer Slide-Up Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs lg:hidden animate-in fade-in duration-200">
          <div className="relative w-full max-h-[85vh] bg-surface rounded-t-2xl border-t border-border p-6 shadow-xl overflow-y-auto animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-border mb-4">
              <h3 className="text-base font-bold text-ink">Filters</h3>
              <button 
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 rounded-full text-ink-3 hover:bg-grey-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Widgets */}
            {renderFilterWidgets()}

            {/* Bottom Actions */}
            <div className="sticky bottom-0 pt-4 mt-6 border-t border-border bg-surface flex gap-3">
              <button
                onClick={handleClearAll}
                className="flex-1 rounded-md border border-border py-2.5 text-sm font-semibold text-ink-2 hover:bg-grey-50"
              >
                Reset All
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 rounded-md bg-accent py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-dark"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
