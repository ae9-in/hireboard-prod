'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, Calendar, Eye, ShieldCheck, ArrowRight } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/utils/cn';

/**
 * Helper to format salary display string
 */
export function formatSalary(salary) {
  if (!salary) return '';
  const { min, max, period, currency } = salary;
  const symbol = currency === 'INR' ? '₹' : '$';
  if (period === 'annual') {
    return `${symbol}${min}–${max} LPA`;
  }
  return `${symbol}${(min/1000).toFixed(0)}k–${(max/1000).toFixed(0)}k/mo`;
}

export default function JobCard({ job, initialSaved = false, onSaveToggle }) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);

  // Sync saved status if changed from parent
  useEffect(() => {
    setIsSaved(initialSaved);
  }, [initialSaved]);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    
    try {
      const res = await fetch(`/api/jobs/${job._id}/save`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.saved);
        if (onSaveToggle) onSaveToggle(job._id, data.saved);
      } else {
        if (res.status === 401) {
          router.push(`/login?callbackUrl=/jobs`);
        }
      }
    } catch (err) {
      console.error('Error saving job:', err);
    } finally {
      setSaving(false);
    }
  };

  const timePosted = job.createdAt 
    ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })
    : 'Recently';

  const companyName = job.company?.name || 'Company';
  const isFeatured = job.isFeatured;

  return (
    <div className={cn(
      "group relative flex flex-col justify-between rounded-lg border bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
      isFeatured 
        ? "border-premium/30 bg-gradient-to-br from-premium-bg/10 via-surface to-surface shadow-xs" 
        : "border-border shadow-xs hover:border-accent"
    )}>
      {/* Premium indicator */}
      {isFeatured && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded bg-premium/10 px-2 py-0.5 text-[10px] font-bold text-premium tracking-wider uppercase">
          ★ Featured
        </span>
      )}

      <div>
        {/* Header Block */}
        <div className="flex items-start gap-4">
          <Avatar name={companyName} logo={job.company?.logo} className="h-12 w-12 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link 
                href={`/companies/${job.company?.slug || '#'}`}
                className="text-sm font-semibold text-ink-2 hover:text-accent truncate transition-colors"
              >
                {companyName}
              </Link>
              {job.company?.isVerified && (
                <ShieldCheck className="h-4.5 w-4.5 text-accent shrink-0" title="Verified Company" />
              )}
              <span className="text-xs text-ink-3">· {job.location?.city || 'India'}</span>
            </div>
            
            <h3 className="mt-1 text-base font-bold text-ink group-hover:text-accent transition-colors line-clamp-1">
              <Link href={`/jobs/${job.slug}`}>
                {job.title}
              </Link>
            </h3>
          </div>
          
          {/* Save Button */}
          {!isFeatured && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="ml-2 rounded-full p-2 text-ink-3 hover:bg-grey-50 hover:text-danger transition-all active:scale-90"
              title={isSaved ? "Saved" : "Save Job"}
            >
              <Heart className={cn("h-5 w-5 transition-all", isSaved ? "fill-danger text-danger scale-110" : "")} />
            </button>
          )}
        </div>

        {/* Info Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center rounded-sm bg-grey-50 px-2.5 py-1 text-xs font-semibold text-ink-2 capitalize">
            {job.workType}
          </span>
          <span className="inline-flex items-center rounded-sm bg-grey-50 px-2.5 py-1 text-xs font-semibold text-ink-2 capitalize">
            {job.jobType.replace('-', ' ')}
          </span>
          <span className="inline-flex items-center rounded-sm bg-accent-light px-2.5 py-1 text-xs font-bold text-accent font-mono">
            {formatSalary(job.salary)}
          </span>
          <span className="inline-flex items-center rounded-sm bg-grey-50 px-2.5 py-1 text-xs font-semibold text-ink-2 font-mono">
            {job.experience?.min}–{job.experience?.max} YOE
          </span>
        </div>

        {/* Skills List */}
        <div className="mt-4">
          <div className="flex flex-wrap gap-1">
            {job.skills?.slice(0, 4).map((skill, idx) => (
              <span 
                key={skill + idx}
                className="inline-flex items-center rounded px-2 py-0.5 text-xs text-ink-2 bg-grey-100/60 font-medium capitalize"
              >
                {skill}
              </span>
            ))}
            {job.skills?.length > 4 && (
              <span className="inline-flex items-center rounded px-2 py-0.5 text-xs text-ink-3 bg-grey-50 font-medium">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info Row */}
      <div className="mt-6 border-t border-border/60 pt-4 flex items-center justify-between text-xs text-ink-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {timePosted}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {job.viewCount || 0} views
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Link 
            href={`/jobs/${job.slug}`}
            className="inline-flex items-center gap-1 font-semibold text-accent hover:text-accent-dark transition-colors"
          >
            Details
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
