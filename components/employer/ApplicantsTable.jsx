'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Calendar, Clock, Eye, Download, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/utils/cn';

export default function ApplicantsTable({ initialApps = [], jobsList = [] }) {
  const [selectedJobId, setSelectedJobId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Filter local listings
  const filteredApps = initialApps.filter(app => {
    const matchesJob = selectedJobId === 'all' || app.job?._id === selectedJobId;
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
    return matchesJob && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-canvas/30 border border-border p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1">
          {/* Job Filter */}
          <div className="flex-1 max-w-xs space-y-1">
            <span className="text-[10px] font-bold text-ink-3 uppercase tracking-wider">Job Opening:</span>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full rounded border border-border bg-white px-2.5 py-2 text-xs font-semibold text-ink-2 outline-none cursor-pointer"
            >
              <option value="all">All Openings</option>
              {jobsList.map((job) => (
                <option key={job._id} value={job._id}>{job.title}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex-1 max-w-xs space-y-1">
            <span className="text-[10px] font-bold text-ink-3 uppercase tracking-wider">Pipeline Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded border border-border bg-white px-2.5 py-2 text-xs font-semibold text-ink-2 outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="applied">Applied</option>
              <option value="viewed">Viewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview_scheduled">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
        </div>

        <div className="text-right text-xs font-semibold text-ink-3 self-end sm:self-auto select-none">
          Showing {filteredApps.length} candidates
        </div>
      </div>

      {/* Table grid */}
      <div className="w-full overflow-x-auto border border-border rounded-lg bg-surface">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-canvas border-b border-border text-xs font-bold text-ink-3 uppercase tracking-wider select-none">
            <tr>
              <th className="px-6 py-4">Candidate Details</th>
              <th className="px-6 py-4">Target Job</th>
              <th className="px-6 py-4 text-center">Experience</th>
              <th className="px-6 py-4">Notice Period</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-medium">
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-ink-3">
                  No applicants match selected filters.
                </td>
              </tr>
            ) : (
              filteredApps.map((app) => {
                const applicant = app.applicant;
                const job = app.job;
                if (!applicant || !job) return null;
                
                const appliedDate = app.createdAt
                  ? formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })
                  : 'Recently';

                return (
                  <tr key={app._id} className="hover:bg-canvas/20 transition-colors">
                    {/* Candidate */}
                    <td className="px-6 py-4">
                      <div>
                        <h4 className="font-bold text-ink hover:text-accent truncate">
                          <Link href={`/employer/applications/${app._id}`}>{applicant.name}</Link>
                        </h4>
                        <p className="text-xs text-ink-3 mt-1 flex items-center gap-1 font-medium">
                          <Mail className="h-3.5 w-3.5 text-ink-3" />
                          {applicant.email}
                        </p>
                      </div>
                    </td>

                    {/* Job */}
                    <td className="px-6 py-4">
                      <div className="max-w-[200px]">
                        <h4 className="font-bold text-ink-2 truncate">
                          {job.title}
                        </h4>
                        <p className="text-[10px] text-ink-3 mt-0.5 flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3" />
                          {appliedDate}
                        </p>
                      </div>
                    </td>

                    {/* Exp */}
                    <td className="px-6 py-4 text-center font-mono text-ink-2">
                      {applicant.seekerProfile?.experience || 0} yrs
                    </td>

                    {/* Notice Period */}
                    <td className="px-6 py-4 capitalize text-ink-2 text-xs">
                      {applicant.seekerProfile?.noticePeriod?.replace('days', ' Days') || 'Immediate'}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center rounded px-2.5 py-0.5 text-xs font-bold capitalize border",
                        app.status === 'applied' && "bg-accent-light text-accent border-accent/15",
                        app.status === 'viewed' && "bg-warning-bg text-warning border-warning/15",
                        app.status === 'shortlisted' && "bg-indigo-50 text-indigo-600 border-indigo-100",
                        app.status === 'interview_scheduled' && "bg-premium-bg text-premium border-premium/15",
                        app.status === 'offer' && "bg-success-bg text-success border-success/15",
                        app.status === 'rejected' && "bg-danger-bg text-danger border-danger/15",
                        app.status === 'withdrawn' && "bg-grey-50 text-grey-500 border-border"
                      )}>
                        {app.status === 'interview_scheduled' ? 'interview' : app.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {app.resumeUrl && (
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded text-ink-3 hover:text-ink hover:bg-grey-50"
                            title="Download Resume PDF"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                        <Link
                          href={`/employer/applications/${app._id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:text-accent-dark pl-2"
                        >
                          Review
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
