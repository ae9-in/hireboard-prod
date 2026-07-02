'use client';

import React from 'react';
import Link from 'next/link';
import SearchBar from './SearchBar';

export default function HeroSection() {
  const trendingTags = [
    { label: 'React Developer', q: 'React' },
    { label: 'Data Analyst', q: 'Data Analyst' },
    { label: 'Product Manager', q: 'Product Manager' },
    { label: 'DevOps', q: 'DevOps' },
    { label: 'UI/UX Designer', q: 'Designer' }
  ];

  return (
    <section
      className="relative w-full pt-20 pb-32 md:pt-28 md:pb-44 overflow-hidden border-b border-blue-100"
      style={{
        backgroundImage: "url('/hero-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#dbeafe',
      }}
    >
      {/* Main content */}
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">

        {/* H1 Headline */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-ink max-w-4xl leading-tight">
          Your next role is <br className="hidden sm:inline" />
          one <span className="text-accent relative">
            search
            <span className="absolute bottom-1 left-0 w-full h-1.5 bg-accent-light -z-10 rounded"></span>
          </span> away.
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-ink-2 max-w-2xl font-normal leading-relaxed">
          Browse verified jobs from India's top companies. Salary always visible.<br className="hidden sm:inline" />
          No spam, no false listings, and absolutely no gatekeeping.
        </p>

        {/* Search Bar */}
        <div className="mt-10 w-full">
          <SearchBar />
        </div>

        {/* Trending Searches */}
        <div className="mt-6 flex flex-wrap justify-center items-center gap-2.5 max-w-3xl">
          <span className="text-xs font-bold text-ink-3 uppercase tracking-wider">Trending:</span>
          {trendingTags.map((tag) => (
            <Link
              key={tag.label}
              href={`/jobs?q=${encodeURIComponent(tag.q)}`}
              className="inline-flex items-center rounded-full bg-white/80 backdrop-blur-sm border border-white/60 px-3.5 py-1.5 text-xs font-semibold text-ink-2 hover:border-accent hover:text-accent transition-all duration-150 shadow-sm hover:shadow-md"
            >
              {tag.label}
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
