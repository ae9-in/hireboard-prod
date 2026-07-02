'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, ShieldAlert, AlertCircle, FileText, Calendar } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { formatSalary } from '../jobs/JobCard';
import { format } from 'date-fns';
import { cn } from '@/utils/cn';

export default function JobsModerator({ initialJobs = [] }) {
  const router = useRouter();
  
  const [jobs, setJobs] = useState(initialJobs);
  const [updatingId, setUpdatingId] = useState(null);
  
  // Rejection Modal state
  const [rejectingJob, setRejectingJob] = useState(null);
  const [reason, setReason] = useState('');
  
  const [error, setError] = useState('');

  const handleApprove = async (jobId) => {
    setUpdatingId(jobId);
    setError('');
    
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/approve`, {
        method: 'POST',
      });
      if (res.ok) {
        setJobs(prev => prev.filter(j => j._id !== jobId));
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to approve listing.');
      }
    } catch (err) {
      console.error(err);
      setError('A network error occurred.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    const jobId = rejectingJob._id;
    setUpdatingId(jobId);
    setError('');
    setRejectingJob(null);

    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        setJobs(prev => prev.filter(j => j._id !== jobId));
        setReason('');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to reject listing.');
      }
    } catch (err) {
      console.error(err);
      setError('A network error occurred.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {error && (
        <div className="rounded-lg bg-danger-bg border border-danger/10 p-4 flex items-start gap-2.5 text-xs font-semibold text-danger">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="text-center py-16 border border-border rounded-lg bg-surface flex flex-col items-center justify-center p-6 text-ink-3">
          <ShieldAlert className="h-8 w-8 text-ink-3 mb-2" />
          <p className="text-sm font-semibold text-ink-2">Job queue is clean</p>
          <p className="text-xs mt-1">There are no openings pending admin moderation review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => {
            const postedDate = job.createdAt
              ? format(new Date(job.createdAt), 'MMM dd, yyyy')
              : 'Recently';
            
            const isUpdating = updatingId === job._id;

            return (
              <div 
                key={job._id}
                className="border border-border rounded-lg bg-surface p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:shadow-xs transition-shadow"
              >
                {/* Details */}
                <div className="flex gap-4">
                  <Avatar name={job.company?.name} logo={job.company?.logo} className="h-11 w-11 shrink-0 border border-border" />
                  <div>
                    <h3 className="text-sm font-bold text-ink hover:text-accent">
                      <a href={`/jobs/${job.slug}`} target="_blank" className="inline-flex items-center gap-1">
                        {job.title}
                        <FileText className="h-3.5 w-3.5 text-ink-3" />
                      </a>
                    </h3>
                    <p className="text-xs text-ink-2 mt-0.5 capitalize font-semibold">
                      {job.company?.name} · {job.location?.city} · {formatSalary(job.salary)}
                    </p>
                    <p className="text-[10px] text-ink-3 mt-1.5 flex items-center gap-1 font-mono font-medium">
                      <Calendar className="h-3 w-3" />
                      Submitted {postedDate}
                    </p>
                  </div>
                </div>

                {/* Approve/Reject Actions */}
                <div className="flex items-center gap-3 self-end md:self-auto shrink-0 select-none">
                  {isUpdating ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  ) : (
                    <>
                      <button
                        onClick={() => handleApprove(job._id)}
                        className="inline-flex items-center justify-center gap-1 rounded bg-success px-4 py-2 text-xs font-bold text-white hover:bg-success/90 shadow-sm transition-all"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectingJob(job)}
                        className="inline-flex items-center justify-center gap-1 rounded border border-danger/20 bg-danger-bg px-4 py-2 text-xs font-bold text-danger hover:bg-danger-bg/40 transition-all"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-base font-bold text-ink">Reject Job Listing</h3>
              <p className="text-xs text-ink-3 mt-1 font-medium">
                Rejecting: <span className="font-semibold text-ink-2">{rejectingJob.title}</span> at {rejectingJob.company?.name}
              </p>
            </div>
            
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-ink">Reason for Rejection*</label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. Salary details must be explicitly defined, please specify YOE limits..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded border border-border px-3 py-2 text-xs text-ink outline-none resize-none bg-white font-medium"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingJob(null);
                    setReason('');
                  }}
                  className="rounded border border-border px-4 py-2 text-xs font-semibold text-ink-2 hover:bg-grey-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-danger px-4 py-2 text-xs font-bold text-white hover:bg-danger/95 shadow-sm"
                >
                  Reject Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
