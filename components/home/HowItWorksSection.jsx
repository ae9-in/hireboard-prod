import React from 'react';
import { UserPlus, Search, CheckCircle } from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      icon: UserPlus,
      title: 'Create Your Profile',
      description: 'Upload your resume, list your skills, experience, and set your salary expectations. It takes under 2 minutes.'
    },
    {
      icon: Search,
      title: 'Find Openings',
      description: 'Search through thousands of fully moderated, spam-free positions. Filter by salary, city, experience, and work mode.'
    },
    {
      icon: CheckCircle,
      title: 'Apply in One Click',
      description: 'Submit your profile directly to employers. Track your application status from applied to viewed to shortlisted.'
    }
  ];

  return (
    <section className="py-16 bg-surface border-b border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            How HireBoard Works
          </h2>
          <p className="mt-2 text-sm sm:text-base text-ink-2">
            A simplified, candidate-first hiring experience built for transparency and speed.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          
          {/* Horizontal connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 border-t-2 border-dashed border-border -z-10" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="flex flex-col items-center text-center px-4 relative">
                {/* Icon Circle */}
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-canvas border border-border text-accent shadow-xs group-hover:border-accent transition-all duration-200">
                  <Icon className="h-8 w-8" />
                </div>
                
                <h3 className="mt-6 text-lg font-bold text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm text-ink-2 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
