'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatSalary } from '../jobs/JobCard';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  FileText, 
  Clock, 
  Save, 
  CheckCircle,
  Briefcase
} from 'lucide-react';
import { cn } from '@/utils/cn';

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
  </svg>
);

export default function ApplicationReviewClient({ app }) {
  const router = useRouter();
  
  const applicant = app.applicant;
  const job = app.job;
  const prof = applicant?.seekerProfile || {};

  const [status, setStatus] = useState(app.status);
  const [note, setNote] = useState('');
  
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleStatusChange = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch(`/api/applications/${app._id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
        setNote('');
        router.refresh();
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(data.error || 'Failed to update candidate pipeline status.');
      }
    } catch (err) {
      console.error(err);
      setError('A network error occurred.');
    } finally {
      setUpdating(false);
    }
  };

  const appliedDate = app.createdAt
    ? formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })
    : 'Recently';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header breadcrumb back link */}
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <Link 
          href="/employer/applications" 
          className="p-1.5 hover:bg-grey-50 rounded text-ink-3 hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-lg font-extrabold text-ink leading-tight">
            Review Candidate
          </h1>
          <p className="text-xs text-ink-3 mt-0.5">
            Evaluating <span className="font-semibold text-ink-2">{applicant?.name}</span> for {job?.title}
          </p>
        </div>
      </div>

      {/* Main Two Columns */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Profile Details Column (65%) */}
        <section className="flex-1 w-full space-y-6">
          
          {/* Seeker Basic Info Card */}
          <div className="border border-border bg-canvas/20 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-light text-accent text-xl font-bold">
                {applicant?.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-ink truncate">{applicant?.name}</h2>
                <p className="text-sm font-semibold text-accent mt-0.5">{prof.headline || 'Job Seeker'}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-ink-3 mt-2 font-medium">
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{applicant?.email}</span>
                  {applicant?.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{applicant.phone}</span>}
                  {prof.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{prof.location}</span>}
                </div>
              </div>
            </div>

            {/* Social / Portfolio Links */}
            {(prof.linkedinUrl || prof.githubUrl || prof.portfolioUrl) && (
              <div className="border-t border-border pt-4 flex flex-wrap gap-4 text-xs font-semibold text-ink-2">
                {prof.linkedinUrl && (
                  <a href={prof.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent">
                    <LinkedinIcon className="h-4 w-4 text-ink-3" /> LinkedIn
                  </a>
                )}
                {prof.githubUrl && (
                  <a href={prof.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent">
                    <GithubIcon className="h-4 w-4 text-ink-3" /> GitHub
                  </a>
                )}
                {prof.portfolioUrl && (
                  <a href={prof.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent">
                    <Globe className="h-4 w-4 text-ink-3" /> Portfolio
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Experience, Education and Summary details */}
          <div className="border border-border rounded-lg p-6 space-y-6">
            
            {/* Summary */}
            {prof.summary && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Candidate Pitch</h3>
                <p className="text-sm text-ink-2 leading-relaxed whitespace-pre-line">{prof.summary}</p>
              </div>
            )}

            {/* Skills */}
            {prof.skills && prof.skills.length > 0 && (
              <div className="space-y-2 border-t border-border/60 pt-4">
                <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Skills & Tech Stack</h3>
                <div className="flex flex-wrap gap-1.5">
                  {prof.skills.map((skill, idx) => (
                    <span key={idx} className="inline-flex items-center rounded bg-grey-50 px-2.5 py-1 text-xs font-semibold text-ink-2 border border-border/40 capitalize">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education and Experience blocks */}
            {prof.experience_detail && prof.experience_detail.length > 0 && (
              <div className="space-y-4 border-t border-border/60 pt-4">
                <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Work History</h3>
                <div className="space-y-4 text-xs font-medium">
                  {prof.experience_detail.map((exp, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-grey-100 border border-border text-ink-3 shrink-0">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-ink">{exp.role}</h4>
                        <p className="text-ink-2 font-semibold mt-0.5">{exp.company}</p>
                        <p className="text-ink-3 text-[10px] mt-0.5">
                          {exp.startDate ? format(new Date(exp.startDate), 'MMM yyyy') : ''} – {exp.isCurrent ? 'Present' : exp.endDate ? format(new Date(exp.endDate), 'MMM yyyy') : ''}
                        </p>
                        {exp.description && (
                          <p className="mt-1.5 text-ink-2 leading-relaxed font-normal">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {prof.education && prof.education.length > 0 && (
              <div className="space-y-4 border-t border-border/60 pt-4">
                <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Education</h3>
                <div className="space-y-4 text-xs font-medium">
                  {prof.education.map((edu, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-grey-100 border border-border text-ink-3 shrink-0">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-ink">{edu.degree} in {edu.field}</h4>
                        <p className="text-ink-2 font-semibold mt-0.5">{edu.institution}</p>
                        <p className="text-ink-3 text-[10px] mt-0.5">{edu.startYear} – {edu.endYear}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </section>

        {/* Action Panel Column (35%) */}
        <aside className="w-full lg:w-96 shrink-0 space-y-6">
          
          {/* Status pipeline update card */}
          <div className="bg-surface border border-border rounded-lg p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider pb-2 border-b border-border">
              Pipeline Management
            </h3>

            {error && (
              <div className="rounded-lg bg-danger-bg border border-danger/10 p-3 flex items-start gap-2.5 text-xs font-semibold text-danger">
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-success-bg border border-success/10 p-3 flex items-center gap-2.5 text-xs font-semibold text-success">
                <span>Status updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleStatusChange} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-ink-3 uppercase tracking-wider">Candidate Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded border border-border bg-white px-3 py-2 text-sm font-semibold text-ink-2 outline-none cursor-pointer"
                >
                  <option value="applied">Applied</option>
                  <option value="viewed">Mark Viewed</option>
                  <option value="shortlisted">Shortlist Candidate</option>
                  <option value="interview_scheduled">Schedule Interview</option>
                  <option value="offer">Send Job Offer</option>
                  <option value="rejected">Reject Applicant</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-ink-3 uppercase tracking-wider">Status Note</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Schedule technical interview for next Monday..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded border border-border px-3 py-2 text-xs text-ink placeholder:text-ink-3 outline-none resize-none bg-white font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded bg-accent py-2.5 text-xs font-bold text-white hover:bg-accent-dark transition-all disabled:opacity-50"
              >
                {updating ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Update Pipeline
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Resume and specs card */}
          <div className="bg-surface border border-border rounded-lg p-6 shadow-xs space-y-4 text-xs font-semibold text-ink-2">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider pb-2 border-b border-border">
              Application Details
            </h3>

            {/* Resume button */}
            {app.resumeUrl ? (
              <a
                href={app.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded border border-border hover:bg-grey-50 py-3 text-xs font-bold text-ink"
              >
                <FileText className="h-4.5 w-4.5 text-success shrink-0" />
                Open Seeker Resume PDF
              </a>
            ) : (
              <div className="text-center py-2 text-ink-3 italic">
                No resume attached.
              </div>
            )}

            {/* Custom Answers */}
            {app.answers && app.answers.length > 0 && (
              <div className="pt-2 space-y-2 text-left font-medium border-t border-border/60">
                <span className="text-[10px] font-bold text-ink-3 uppercase tracking-wider block">Custom Answers:</span>
                {app.answers.map((ans, idx) => (
                  <div key={idx} className="bg-canvas p-2.5 rounded border border-border/40 space-y-1">
                    <p className="font-bold text-ink">{ans.question}</p>
                    <p className="text-ink-2 leading-relaxed">{ans.answer}</p>
                  </div>
                ))}
              </div>
            )}

            {/* General details */}
            <div className="border-t border-border/60 pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-ink-3 font-medium">Notice Period</span>
                <span className="capitalize text-ink">{prof.noticePeriod?.replace('days', ' Days') || 'Immediate'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-3 font-medium">Expectation</span>
                <span className="font-mono text-ink">{prof.expectedSalary ? `₹${prof.expectedSalary} LPA` : 'Not Specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-3 font-medium">Current Package</span>
                <span className="font-mono text-ink">{prof.currentSalary ? `₹${prof.currentSalary} LPA` : 'Not Specified'}</span>
              </div>
            </div>
          </div>

          {/* History logs card */}
          <div className="bg-surface border border-border rounded-lg p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider pb-2 border-b border-border">
              Timeline History
            </h3>
            <div className="relative border-l-2 border-border pl-4 space-y-4 text-xs font-semibold text-ink-2">
              {app.statusHistory && app.statusHistory.length > 0 ? (
                app.statusHistory.map((hist, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[23px] top-0.5 h-3.5 w-3.5 rounded-full bg-white border-2 border-accent" />
                    <p className="font-bold text-ink capitalize">
                      {hist.status === 'interview_scheduled' ? 'interview scheduled' : hist.status}
                    </p>
                    <p className="text-[10px] text-ink-3 mt-0.5">
                      {format(new Date(hist.changedAt), 'MMM dd, yyyy · hh:mm a')}
                    </p>
                    {hist.note && (
                      <p className="mt-1 bg-canvas p-2 rounded border border-border/30 font-normal text-ink-2">
                        {hist.note}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="relative">
                  <div className="absolute -left-[23px] top-0.5 h-3.5 w-3.5 rounded-full bg-white border-2 border-accent" />
                  <p className="font-bold text-ink">Applied</p>
                  <p className="text-[10px] text-ink-3 mt-0.5">
                    {app.createdAt ? format(new Date(app.createdAt), 'MMM dd, yyyy · hh:mm a') : 'Recently'}
                  </p>
                  <p className="mt-1 text-ink-3 italic font-normal">
                    Candidate submitted profile.
                  </p>
                </div>
              )}
            </div>
          </div>

        </aside>
      </div>

    </div>
  );
}
