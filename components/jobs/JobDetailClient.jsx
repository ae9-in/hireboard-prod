'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  Share2, 
  MapPin, 
  Calendar, 
  Eye, 
  ShieldCheck, 
  Briefcase, 
  Building, 
  DollarSign, 
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Check
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import ApplyModal from './ApplyModal';
import { formatSalary } from './JobCard';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/utils/cn';

export default function JobDetailClient({ 
  job, 
  user = null, 
  initialSaved = false, 
  alreadyApplied = false 
}) {
  const router = useRouter();
  
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(alreadyApplied);
  const [saving, setSaving] = useState(false);
  const [shared, setShared] = useState(false);

  const handleSave = async () => {
    if (!user) {
      router.push(`/login?callbackUrl=/jobs/${job.slug}`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${job._id}/save`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.saved);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/jobs/${job.slug}`;
    navigator.clipboard.writeText(url);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handleApplyClick = () => {
    if (!user) {
      router.push(`/login?callbackUrl=/jobs/${job.slug}`);
      return;
    }
    if (user.role !== 'seeker') {
      alert('Only Job Seekers can apply to jobs.');
      return;
    }
    setIsApplying(true);
  };

  const formattedPostedDate = job.createdAt 
    ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })
    : 'Recently';

  const formattedDeadline = job.applicationDeadline
    ? format(new Date(job.applicationDeadline), 'MMM dd, yyyy')
    : 'Not Specified';

  const companyName = job.company?.name || 'Company';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs font-semibold text-ink-3 mb-6 select-none flex-wrap">
        <Link href="/" className="hover:text-accent">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/jobs" className="hover:text-accent">Jobs</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/jobs?category=${job.category}`} className="hover:text-accent capitalize">
          {job.category?.replace('-', ' ')}
        </Link>
        <ChevronRight className="h-3 w-3 animate-pulse" />
        <span className="text-ink-2 truncate max-w-[200px]">{job.title}</span>
      </nav>

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Main Content Columns (65%) */}
        <section className="flex-1 w-full bg-surface border border-border rounded-xl p-6 md:p-8">
          
          {/* Header detail */}
          <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap border-b border-border/60 pb-6 mb-6">
            <div className="flex gap-4">
              <Avatar name={companyName} logo={job.company?.logo} className="h-16 w-16 shrink-0" />
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Link 
                    href={`/companies/${job.company?.slug}`} 
                    className="text-base font-bold text-ink-2 hover:text-accent"
                  >
                    {companyName}
                  </Link>
                  {job.company?.isVerified && (
                    <ShieldCheck className="h-4.5 w-4.5 text-accent" title="Verified Employer" />
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight mt-1">
                  {job.title}
                </h1>
                <div className="flex items-center gap-3 text-xs text-ink-3 mt-3 flex-wrap font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location?.city}, {job.location?.state || 'India'}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Posted {formattedPostedDate}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {job.viewCount || 0} views
                  </span>
                </div>
              </div>
            </div>

            {/* Quick tags */}
            <div className="flex flex-wrap gap-1.5 self-end sm:self-auto">
              <span className="inline-flex items-center rounded-sm bg-grey-50 px-2.5 py-1 text-xs font-bold text-ink-2 capitalize">
                {job.workType}
              </span>
              <span className="inline-flex items-center rounded-sm bg-grey-50 px-2.5 py-1 text-xs font-bold text-ink-2 capitalize">
                {job.jobType?.replace('-', ' ')}
              </span>
            </div>
          </div>

          {/* About the role */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-ink mb-3">About the Role</h2>
              <div 
                className="text-sm text-ink-2 leading-relaxed whitespace-pre-line space-y-4"
                dangerouslySetInnerHTML={{ 
                  // Simply render description, replacing markdown bullet notations with list structures if necessary.
                  __html: job.description 
                }}
              />
            </div>

            {/* Requirements list */}
            {job.requirements?.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-ink mb-3">Requirements & Qualifications</h2>
                <ul className="list-disc list-inside space-y-2 text-sm text-ink-2">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="leading-relaxed pl-1">{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities list */}
            {job.responsibilities?.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-ink mb-3">Key Responsibilities</h2>
                <ul className="list-disc list-inside space-y-2 text-sm text-ink-2">
                  {job.responsibilities.map((resp, idx) => (
                    <li key={idx} className="leading-relaxed pl-1">{resp}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills tag chips */}
            {job.skills?.length > 0 && (
              <div className="border-t border-border/60 pt-6">
                <h3 className="text-sm font-bold text-ink mb-3">Skills Required</h3>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((skill, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center rounded bg-grey-50 px-3 py-1 text-xs font-semibold text-ink-2 capitalize border border-border/40"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Sticky Sidebar (35%) */}
        <aside className="w-full lg:w-96 shrink-0 space-y-6 lg:sticky lg:top-24">
          
          {/* Action card */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-xs">
            <div className="border-b border-border/60 pb-4 mb-4">
              <span className="text-xs font-bold text-ink-3 uppercase tracking-wider block">Compensation</span>
              <span className="text-2xl font-extrabold text-accent font-mono block mt-1.5">
                {formatSalary(job.salary)}
              </span>
              <span className="text-xs text-ink-3 font-semibold mt-1 block">
                {job.salary?.isNegotiable ? 'Negotiable' : 'Fixed salary'} · {job.salary?.period === 'annual' ? 'Annual CTC' : 'Monthly Stipend'}
              </span>
            </div>

            <div className="space-y-3">
              {/* Primary action buttons */}
              {isApplied ? (
                <button
                  disabled
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-success-bg py-3 text-sm font-bold text-success border border-success/30 cursor-default"
                >
                  <Check className="h-4.5 w-4.5" />
                  Application Submitted
                </button>
              ) : (
                <button
                  onClick={handleApplyClick}
                  className="w-full inline-flex items-center justify-center rounded-lg bg-accent py-3 text-sm font-bold text-white hover:bg-accent-dark shadow-sm transition-all focus:outline-none"
                >
                  Apply Now
                </button>
              )}

              {/* Utility buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={cn(
                    "inline-flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-bold transition-all",
                    isSaved 
                      ? "border-danger/30 bg-danger-bg/20 text-danger hover:bg-danger-bg/30"
                      : "border-border text-ink-2 hover:bg-grey-50"
                  )}
                >
                  <Heart className={cn("h-4 w-4", isSaved ? "fill-danger text-danger" : "")} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>

                <button
                  onClick={handleShare}
                  className={cn(
                    "inline-flex items-center justify-center gap-1.5 rounded-lg border border-border text-ink-2 hover:bg-grey-50 py-2.5 text-xs font-bold transition-all",
                    shared ? "border-success/30 bg-success-bg/20 text-success" : ""
                  )}
                >
                  {shared ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      Share
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick stats details list */}
            <div className="border-t border-border/60 pt-4 mt-6 space-y-3.5 text-xs font-semibold text-ink-2">
              <div className="flex justify-between">
                <span className="text-ink-3 font-medium">Application Deadline</span>
                <span className="font-mono text-ink">{formattedDeadline}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-3 font-medium">Experience Required</span>
                <span className="font-mono text-ink">{job.experience?.min}–{job.experience?.max} Years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-3 font-medium">Total Applicants</span>
                <span className="font-mono text-accent bg-accent-light px-2 py-0.5 rounded">{job.applicationCount || 0} applied</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-3 font-medium">City Location</span>
                <span className="text-ink">{job.location?.city} ({job.workType})</span>
              </div>
            </div>
          </div>

          {/* Company Mini Card */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex gap-3">
              <Avatar name={companyName} logo={job.company?.logo} className="h-12 w-12 shrink-0 border border-border" />
              <div>
                <h4 className="font-bold text-ink leading-tight line-clamp-1">{companyName}</h4>
                <p className="text-xs text-ink-3 mt-1.5 font-medium">{job.company?.industry} · {job.company?.size} emp.</p>
              </div>
            </div>
            
            {job.company?.description && (
              <p className="text-xs text-ink-2 leading-relaxed line-clamp-3">
                {job.company.description}
              </p>
            )}

            <div className="border-t border-border/60 pt-4 space-y-2">
              {job.company?.website && (
                <a 
                  href={job.company.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between text-xs font-bold text-ink-2 hover:text-accent"
                >
                  <span className="flex items-center gap-1">
                    <Building className="h-3.5 w-3.5 text-ink-3" />
                    Visit Website
                  </span>
                  <ExternalLink className="h-3 w-3 text-ink-3" />
                </a>
              )}
              <Link 
                href={`/companies/${job.company?.slug}`} 
                className="flex items-center justify-between text-xs font-bold text-ink-2 hover:text-accent"
              >
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-ink-3" />
                  View All Openings
                </span>
                <ArrowRight className="h-3 w-3 text-ink-3" />
              </Link>
            </div>
          </div>

        </aside>
      </div>

      {/* Apply Modal Trigger */}
      {isApplying && (
        <ApplyModal 
          job={job} 
          onClose={() => setIsApplying(false)} 
          onApplied={() => {
            setIsApplied(true);
            setIsApplying(false);
          }}
        />
      )}

    </div>
  );
}
