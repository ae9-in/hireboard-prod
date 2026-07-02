'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, Pause, XOctagon, Eye, Users, Calendar, ExternalLink, ArrowRight } from 'lucide-react';
import { formatSalary } from '../jobs/JobCard';
import { format } from 'date-fns';
import { cn } from '@/utils/cn';

export default function JobsTable({ initialJobs = [] }) {
  const router = useRouter();
  const [jobs, setJobs] = useState(initialJobs);
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatusChange = async (jobId, newStatus) => {
    setUpdatingId(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        // Update local state
        setJobs(prev => prev.map(j => j._id === jobId ? { ...j, status: updated.job.status } : j));
        router.refresh();
      }
    } catch (err) {
      console.error('Error updating job status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="w-full overflow-x-auto border border-border rounded-lg bg-surface">
      <table className="w-full border-collapse text-left text-sm">
        
        {/* Table Head */}
        <thead className="bg-canvas border-b border-border text-xs font-bold text-ink-3 uppercase tracking-wider select-none">
          <tr>
            <th className="px-6 py-4">Job Details</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-center">Views</th>
            <th className="px-6 py-4 text-center">Applicants</th>
            <th className="px-6 py-4">Posted Date</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-border/60 font-medium">
          {jobs.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center text-ink-3">
                No job openings posted yet. Click "Create New Opening" to get started.
              </td>
            </tr>
          ) : (
            jobs.map((job) => {
              const postedDate = job.createdAt
                ? format(new Date(job.createdAt), 'MMM dd, yyyy')
                : 'Recently';
              
              const isUpdating = updatingId === job._id;

              return (
                <tr key={job._id} className="hover:bg-canvas/20 transition-colors">
                  {/* Job details */}
                  <td className="px-6 py-4">
                    <div className="max-w-[280px]">
                      <h3 className="font-bold text-ink hover:text-accent truncate">
                        <Link href={`/jobs/${job.slug}`} target="_blank" className="inline-flex items-center gap-1.5">
                          {job.title}
                          <ExternalLink className="h-3 w-3 text-ink-3" />
                        </Link>
                      </h3>
                      <p className="text-xs text-ink-3 mt-1 capitalize font-medium">
                        {job.workType} · {job.jobType?.replace('-', ' ')} · {formatSalary(job.salary)}
                      </p>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center rounded px-2 py-0.5 text-xs font-bold capitalize border",
                      job.status === 'active' && "bg-success-bg text-success border-success/15",
                      job.status === 'paused' && "bg-warning-bg text-warning border-warning/15",
                      job.status === 'closed' && "bg-grey-50 text-grey-500 border-border",
                      job.status === 'pending_review' && "bg-accent-light text-accent border-accent/15",
                      job.status === 'rejected' && "bg-danger-bg text-danger border-danger/15"
                    )}>
                      {job.status === 'pending_review' ? 'pending review' : job.status}
                    </span>
                  </td>

                  {/* Views */}
                  <td className="px-6 py-4 text-center font-mono text-ink-2">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-ink-3" />
                      {job.viewCount || 0}
                    </span>
                  </td>

                  {/* Applicants */}
                  <td className="px-6 py-4 text-center font-mono text-ink-2">
                    <Link 
                      href={`/employer/applications?jobId=${job._id}`}
                      className="inline-flex items-center gap-1 text-accent hover:underline font-bold"
                    >
                      <Users className="h-3.5 w-3.5 text-ink-3" />
                      {job.applicationCount || 0}
                    </Link>
                  </td>

                  {/* Posted Date */}
                  <td className="px-6 py-4 text-ink-3 text-xs font-mono">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {postedDate}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isUpdating ? (
                        <span className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                      ) : (
                        <>
                          {/* Toggle Active/Pause */}
                          {job.status === 'active' && (
                            <button
                              onClick={() => handleStatusChange(job._id, 'paused')}
                              className="p-1 rounded text-ink-3 hover:text-warning hover:bg-grey-50"
                              title="Pause Listing"
                            >
                              <Pause className="h-4 w-4" />
                            </button>
                          )}
                          {job.status === 'paused' && (
                            <button
                              onClick={() => handleStatusChange(job._id, 'active')}
                              className="p-1 rounded text-ink-3 hover:text-success hover:bg-grey-50"
                              title="Resume Listing"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                          {/* Close Listing */}
                          {['active', 'paused', 'pending_review'].includes(job.status) && (
                            <button
                              onClick={() => handleStatusChange(job._id, 'closed')}
                              className="p-1 rounded text-ink-3 hover:text-danger hover:bg-grey-50"
                              title="Close Listing"
                            >
                              <XOctagon className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>

      </table>
    </div>
  );
}
