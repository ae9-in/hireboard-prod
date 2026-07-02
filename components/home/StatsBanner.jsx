import React from 'react';

export default function StatsBanner({ activeJobsCount = 0, companiesCount = 0 }) {
  const stats = [
    { value: activeJobsCount > 0 ? `${activeJobsCount.toLocaleString()}+` : '0', label: 'Active Jobs' },
    { value: companiesCount > 0 ? `${companiesCount.toLocaleString()}+` : '0', label: 'Verified Companies' },
    { value: '100%', label: 'Salary Transparency' },
    { value: 'Direct', label: 'Apply Channel' }
  ];

  return (
    <section className="py-12 bg-surface border-b border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <span className="block font-mono text-3xl sm:text-4xl font-bold tracking-tight text-accent">
                {stat.value}
              </span>
              <span className="mt-2 block text-xs sm:text-sm font-semibold text-ink-2 uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
