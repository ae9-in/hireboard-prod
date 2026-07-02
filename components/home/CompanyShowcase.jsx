'use client';

import React from 'react';
import Link from 'next/link';
import Avatar from '../ui/Avatar';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function CompanyShowcase({ companies = [] }) {
  // Static list for the infinite CSS scrolling ticker
  const tickerCompanies = [
    'Razorpay', 'Paytm', 'Meesho', 'Ola', 'Freshworks', 'Swiggy', 'Zomato', 
    'Flipkart', 'CRED', 'PhonePe', 'HDFC', 'Infosys', 'TCS', 'Wipro'
  ];

  // Double the array to make the infinite scroll smooth and uninterrupted
  const doubleTickerList = [...tickerCompanies, ...tickerCompanies];

  return (
    <section className="py-16 bg-canvas border-b border-border/40 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            Top Companies Hiring Now
          </h2>
          <p className="mt-2 text-sm sm:text-base text-ink-2">
            Get hired at India's fastest-growing startups and established tech enterprises.
          </p>
        </div>

        {/* CSS Ticker (Infinite Horizontal Scroll) */}
        <div className="relative w-full overflow-hidden py-4 border-y border-border/50 bg-white mb-16 select-none">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-canvas to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-canvas to-transparent z-10 pointer-events-none" />
          
          <div className="animate-ticker flex items-center gap-12 whitespace-nowrap">
            {doubleTickerList.map((comp, idx) => (
              <span 
                key={idx} 
                className="text-lg md:text-xl font-display font-extrabold text-grey-400 hover:text-accent transition-colors cursor-default"
              >
                {comp}
              </span>
            ))}
          </div>
        </div>

        {/* Company Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {companies.slice(0, 6).map((company) => {
            const activeCount = company.activeJobCount || 0;
            return (
              <div 
                key={company._id.toString()}
                className="group p-6 rounded-lg border border-border bg-surface hover:border-accent hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <Avatar name={company.name} logo={company.logo} className="h-12 w-12 shrink-0" />
                  <div>
                    <div className="flex items-center gap-1">
                      <h3 className="text-base font-bold text-ink group-hover:text-accent transition-colors">
                        {company.name}
                      </h3>
                      {company.isVerified && (
                        <ShieldCheck className="h-4.5 w-4.5 text-accent shrink-0" title="Verified Employer" />
                      )}
                    </div>
                    <p className="text-xs text-ink-3 mt-0.5 capitalize">{company.industry} · {company.size} emp.</p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-ink-2 line-clamp-2 min-h-10">
                  {company.description || `Hiring for software engineering, product design, marketing, and operations roles at ${company.name}.`}
                </p>

                <div className="mt-6 border-t border-border/60 pt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-accent bg-accent-light px-2.5 py-1 rounded">
                    {activeCount > 0 ? `${activeCount} Active Jobs` : '0 Jobs'}
                  </span>
                  
                  <Link 
                    href={`/companies/${company.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-ink-2 group-hover:text-accent transition-all"
                  >
                    View jobs
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
