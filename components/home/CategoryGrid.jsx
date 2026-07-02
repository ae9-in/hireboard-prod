'use client';

import React from 'react';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { CATEGORIES } from '@/utils/constants';
import { ArrowRight } from 'lucide-react';

/**
 * Dynamic Icon Loader Component
 */
function CategoryIcon({ name, className }) {
  const IconComponent = Icons[name];
  if (!IconComponent) return <Icons.Layers className={className} />;
  return <IconComponent className={className} />;
}

export default function CategoryGrid({ counts = {} }) {
  // Show top 8 categories as icon cards
  const displayCategories = CATEGORIES.slice(0, 8);

  return (
    <section className="py-16 bg-surface border-b border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
              Explore by Category
            </h2>
            <p className="mt-2 text-sm sm:text-base text-ink-2 font-normal">
              Find positions matched to your specialization. Verified hiring at every level.
            </p>
          </div>
          <Link 
            href="/jobs" 
            className="group inline-flex items-center gap-1 text-sm font-bold text-accent hover:text-accent-dark transition-all"
          >
            Browse all categories
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {displayCategories.map((cat) => {
            const count = counts[cat.slug] || 0;
            return (
              <Link
                key={cat.id}
                href={`/jobs?category=${cat.slug}`}
                className="group p-6 rounded-lg border border-border bg-canvas hover:bg-surface hover:border-accent hover:shadow-sm transition-all duration-200"
              >
                {/* Icon Wrapper */}
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white border border-border text-ink-2 group-hover:bg-accent-light group-hover:border-accent/10 group-hover:text-accent transition-all duration-200">
                  <CategoryIcon name={cat.icon} className="h-6 w-6 shrink-0" />
                </div>
                
                <h3 className="mt-5 text-base font-bold text-ink group-hover:text-accent transition-colors">
                  {cat.name}
                </h3>
                
                <p className="mt-1.5 text-xs sm:text-sm text-ink-3 font-medium font-mono">
                  {count > 0 ? `${count.toLocaleString()} Active Jobs` : 'View Listings'}
                </p>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
