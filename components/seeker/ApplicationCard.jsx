'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Avatar from '../ui/Avatar';
import { formatSalary } from '../jobs/JobCard';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, MapPin, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function ApplicationCard({ app }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const job = app.job;
  const company = job?.company;
  if (!job) return null;

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }
    
    setWithdrawing(true);
    try {
      const res = await fetch(`/api/applications/${app._id}/withdraw`, {
        method: 'POST',
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error('Error withdrawing application:', err);
    } finally {
      setWithdrawing(false);
    }
  };

  // Define status steps
  const steps = [
    { label: 'Applied', key: 'applied' },
    { label: 'Viewed', key: 'viewed' },
    { label: 'Shortlisted', key: 'shortlisted' },
    { label: 'Decision', key: 'offer' } // covers Offer/Rejected/Withdrawn
  ];

  // Helper to determine step visual state
  // returns 'completed' | 'active' | 'pending'
  const getStepState = (stepKey, currentStatus) => {
    const statusOrder = ['applied', 'viewed', 'shortlisted', 'interview_scheduled', 'offer', 'rejected', 'withdrawn'];
    
    // Normalize status for steps
    let normalizedCurrent = currentStatus;
    if (currentStatus === 'interview_scheduled') normalizedCurrent = 'shortlisted';
    if (['rejected', 'withdrawn'].includes(currentStatus)) normalizedCurrent = 'offer';

    const stepIndex = steps.findIndex(s => s.key === stepKey);
    const currentIndex = steps.findIndex(s => s.key === normalizedCurrent);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const currentStatus = app.status;

  return (
    <div className="border border-border rounded-lg bg-surface shadow-xs p-5 space-y-5">
      
      {/* Top details block */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex gap-4">
          <Avatar name={company?.name} logo={company?.logo} className="h-12 w-12 shrink-0 border border-border" />
          <div>
            <span className="text-xs font-semibold text-ink-3 uppercase tracking-wider block">
              {company?.name}
            </span>
            <h3 className="text-base font-bold text-ink hover:text-accent mt-0.5 truncate">
              <Link href={`/jobs/${job.slug}`}>{job.title}</Link>
            </h3>
            <div className="flex items-center gap-3 text-xs text-ink-3 mt-2 flex-wrap font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {job.location?.city}
              </span>
              <span>·</span>
              <span className="font-mono text-ink font-semibold">
                {formatSalary(job.salary)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto select-none">
          <span className={cn(
            "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold capitalize border",
            currentStatus === 'applied' && "bg-accent-light text-accent border-accent/10",
            currentStatus === 'viewed' && "bg-warning-bg text-warning border-warning/10",
            currentStatus === 'shortlisted' && "bg-indigo-50 text-indigo-600 border-indigo-100",
            currentStatus === 'interview_scheduled' && "bg-premium-bg text-premium border-premium/10",
            currentStatus === 'offer' && "bg-success-bg text-success border-success/10",
            currentStatus === 'rejected' && "bg-danger-bg text-danger border-danger/10",
            currentStatus === 'withdrawn' && "bg-grey-50 text-grey-500 border-border"
          )}>
            {currentStatus === 'interview_scheduled' ? 'interview scheduled' : currentStatus}
          </span>
        </div>
      </div>

      {/* Progress Bar (Visual Pipeline) */}
      <div className="py-2">
        <div className="relative flex justify-between items-center w-full max-w-lg mx-auto">
          {/* Background Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-grey-200 -translate-y-1/2 -z-10 rounded" />
          
          {/* Active status fill line */}
          <div 
            style={{ 
              width: currentStatus === 'applied' ? '0%' 
                : currentStatus === 'viewed' ? '33.3%' 
                : ['shortlisted', 'interview_scheduled'].includes(currentStatus) ? '66.6%' 
                : '100%' 
            }}
            className={cn(
              "absolute top-1/2 left-0 h-1 -translate-y-1/2 -z-10 rounded transition-all duration-300",
              currentStatus === 'rejected' ? "bg-danger" 
                : currentStatus === 'withdrawn' ? "bg-grey-400" 
                : "bg-success"
            )}
          />

          {steps.map((step) => {
            const state = getStepState(step.key, currentStatus);
            return (
              <div key={step.key} className="flex flex-col items-center">
                <div className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ring-4 ring-white border transition-all duration-300",
                  state === 'completed' && "bg-success border-success text-white",
                  state === 'active' && (
                    currentStatus === 'rejected' ? "bg-danger border-danger text-white"
                      : currentStatus === 'withdrawn' ? "bg-grey-400 border-grey-400 text-white"
                      : "bg-success border-success text-white"
                  ),
                  state === 'pending' && "bg-white border-border text-ink-3"
                )}>
                  {state === 'completed' ? '✓' : ''}
                </div>
                <span className="mt-2 text-[10px] sm:text-xs font-bold text-ink-2 select-none capitalize">
                  {step.key === 'offer' && currentStatus === 'rejected' ? 'rejected' 
                    : step.key === 'offer' && currentStatus === 'withdrawn' ? 'withdrawn' 
                    : step.label
                  }
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Timeline Details toggle */}
      <div className="border-t border-border/50 pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-ink-2 hover:text-accent"
        >
          {expanded ? (
            <>
              Hide History logs
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              View application status logs
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="flex gap-3 justify-end">
          {/* Seeker withdrawal option */}
          {['applied', 'viewed', 'shortlisted', 'interview_scheduled'].includes(currentStatus) && (
            <button
              onClick={handleWithdraw}
              disabled={withdrawing}
              className="inline-flex items-center justify-center rounded border border-danger/20 bg-danger-bg/25 px-4 py-2 text-xs font-bold text-danger hover:bg-danger-bg transition-all disabled:opacity-50"
            >
              Withdraw application
            </button>
          )}
        </div>
      </div>

      {/* Expanded Logs Area */}
      {expanded && (
        <div className="border-t border-border/50 pt-4 mt-3 bg-canvas/30 rounded-lg p-4 space-y-3.5 animate-in fade-in duration-200">
          <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Status History logs</h4>
          <div className="relative border-l-2 border-border pl-4 space-y-4 text-xs font-medium">
            
            {/* Display status history array */}
            {app.statusHistory && app.statusHistory.length > 0 ? (
              app.statusHistory.map((hist, idx) => (
                <div key={idx} className="relative">
                  {/* Small circle indicator */}
                  <div className="absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full bg-white border-2 border-accent" />
                  <p className="font-bold text-ink capitalize">
                    {hist.status === 'interview_scheduled' ? 'interview scheduled' : hist.status}
                  </p>
                  <p className="text-[10px] text-ink-3 flex items-center gap-1 mt-0.5 font-medium">
                    <Clock className="h-3 w-3" />
                    {format(new Date(hist.changedAt), 'MMM dd, yyyy · hh:mm a')}
                  </p>
                  {hist.note && (
                    <p className="mt-1 bg-white border border-border/40 p-2 rounded text-ink-2 font-medium">
                      {hist.note}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="relative">
                <div className="absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full bg-white border-2 border-accent" />
                <p className="font-bold text-ink">Applied</p>
                <p className="text-[10px] text-ink-3 flex items-center gap-1 mt-0.5 font-medium">
                  <Clock className="h-3 w-3" />
                  {app.createdAt ? format(new Date(app.createdAt), 'MMM dd, yyyy · hh:mm a') : 'Recently'}
                </p>
                <p className="mt-1 text-ink-3 italic">
                  Your profile and resume were successfully sent to the employer.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
