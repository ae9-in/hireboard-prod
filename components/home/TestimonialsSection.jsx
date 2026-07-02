import React from 'react';

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-canvas border-b border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            Loved by Seekers & Employers
          </h2>
          <p className="mt-2 text-sm sm:text-base text-ink-2">
            See what professionals are saying about their transparent hiring journey.
          </p>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-xl bg-surface">
          <p className="text-sm font-semibold text-ink-3 text-center">No reviews or testimonials available yet.</p>
        </div>

      </div>
    </section>
  );
}
