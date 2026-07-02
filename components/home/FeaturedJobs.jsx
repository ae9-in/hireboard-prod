import React from 'react';
import Link from 'next/link';
import JobCard from '../jobs/JobCard';
import { ArrowRight } from 'lucide-react';

export default function FeaturedJobs({ jobs = [] }) {
  return (
    <section className="py-16 bg-canvas border-b border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
              Featured Openings
            </h2>
            <p className="mt-2 text-sm sm:text-base text-ink-2">
              Premium roles from highly rated verified companies. Standout positions updated daily.
            </p>
          </div>
          <Link 
            href="/jobs" 
            className="group inline-flex items-center gap-1 text-sm font-bold text-accent hover:text-accent-dark transition-all"
          >
            Explore all listings
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Jobs Grid */}
        {jobs.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-lg border border-border/60 p-6 text-ink-3">
            No featured jobs currently active. Explore all jobs to view available positions.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.slice(0, 6).map((job) => (
              <JobCard key={job._id.toString()} job={job} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
