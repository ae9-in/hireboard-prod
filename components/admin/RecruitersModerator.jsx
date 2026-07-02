'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Calendar, ChevronDown, ChevronUp, Loader2, Link2, Info, Building2, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/utils/cn';

export default function RecruitersModerator({ initialRecruiters = [] }) {
  const router = useRouter();
  const [recruiters, setRecruiters] = useState(initialRecruiters);
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  
  // Rejection modal/reason state
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleApprove = async (id) => {
    if (updatingId) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/recruiters/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setRecruiters(prev =>
          prev.map(r => (r._id === id ? { ...r, status: 'approved', isApproved: true } : r))
        );
        router.refresh();
      }
    } catch (err) {
      console.error('Error approving recruiter:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const startReject = (id) => {
    setRejectingId(id);
    setRejectionReason('');
  };

  const cancelReject = () => {
    setRejectingId(null);
    setRejectionReason('');
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectingId || updatingId) return;

    const id = rejectingId;
    setUpdatingId(id);
    setRejectingId(null);

    try {
      const res = await fetch(`/api/admin/recruiters/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason }),
      });
      if (res.ok) {
        setRecruiters(prev =>
          prev.map(r => (r._id === id ? { ...r, status: 'rejected', isApproved: false, rejectionReason } : r))
        );
        router.refresh();
      }
    } catch (err) {
      console.error('Error rejecting recruiter:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Table Container */}
      <div className="w-full overflow-x-auto border border-border rounded-lg bg-surface">
        <table className="w-full border-collapse text-left text-sm">
          
          <thead className="bg-canvas border-b border-border text-xs font-bold text-ink-3 uppercase tracking-wider select-none">
            <tr>
              <th className="px-6 py-4">Recruiter Name</th>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Industry</th>
              <th className="px-6 py-4">Registration Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/60 font-medium">
            {recruiters.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-ink-3">
                  No recruiter requests registered on the platform.
                </td>
              </tr>
            ) : (
              recruiters.map((recruiter) => {
                const regDate = recruiter.createdAt
                  ? format(new Date(recruiter.createdAt), 'MMM dd, yyyy')
                  : 'Recently';
                
                const isExpanded = expandedId === recruiter._id;
                const isUpdating = updatingId === recruiter._id;

                const companyName = recruiter.employerProfile?.companyName || 'N/A';
                const industry = recruiter.employerProfile?.industry || 'N/A';

                return (
                  <React.Fragment key={recruiter._id}>
                    <tr className={cn(
                      "hover:bg-canvas/10 transition-colors",
                      isExpanded && "bg-canvas/20"
                    )}>
                      {/* Name */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-ink">{recruiter.name}</span>
                      </td>

                      {/* Company */}
                      <td className="px-6 py-4 text-ink-2">
                        {companyName}
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-ink-3 font-mono text-xs">
                        {recruiter.email}
                      </td>

                      {/* Industry */}
                      <td className="px-6 py-4 text-ink-3">
                        {industry}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-ink-3 text-xs font-mono">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {regDate}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1 text-xs font-bold rounded px-2 py-0.5 capitalize select-none",
                          recruiter.status === 'approved' && "bg-success-bg text-success",
                          recruiter.status === 'pending' && "bg-warning-bg text-warning",
                          recruiter.status === 'rejected' && "bg-danger-bg text-danger"
                        )}>
                          {recruiter.status || 'pending'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* View Details */}
                          <button
                            onClick={() => toggleExpand(recruiter._id)}
                            className="inline-flex items-center gap-1 rounded border border-border bg-canvas/30 px-2 py-1.5 text-xs text-ink-2 hover:bg-grey-50 cursor-pointer"
                            title="View Details"
                          >
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            Details
                          </button>

                          {/* Approval Controls */}
                          {recruiter.status === 'pending' && (
                            <>
                              {isUpdating ? (
                                <Loader2 className="h-4.5 w-4.5 animate-spin text-accent" />
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleApprove(recruiter._id)}
                                    className="inline-flex items-center gap-0.5 rounded border border-success/20 bg-success-bg px-2.5 py-1.5 text-xs font-bold text-success hover:bg-success/10 cursor-pointer"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => startReject(recruiter._id)}
                                    className="inline-flex items-center gap-0.5 rounded border border-danger/20 bg-danger-bg px-2.5 py-1.5 text-xs font-bold text-danger hover:bg-danger/10 cursor-pointer"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    Reject
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Details Section */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="7" className="bg-canvas/10 border-t border-b border-border/40 px-8 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-ink-2 font-medium">
                            
                            {/* Company Block */}
                            <div className="space-y-2 bg-surface p-4 rounded-lg border border-border/60">
                              <span className="text-accent font-bold uppercase tracking-wider flex items-center gap-1">
                                <Building2 className="h-3.5 w-3.5" />
                                Company Profile
                              </span>
                              <div className="space-y-1 mt-2">
                                <p><span className="text-ink-3">Website:</span> {recruiter.employerProfile?.companyWebsite ? (
                                  <a href={recruiter.employerProfile.companyWebsite} target="_blank" rel="noreferrer" className="text-accent hover:underline inline-flex items-center gap-0.5">
                                    {recruiter.employerProfile.companyWebsite}
                                    <Link2 className="h-3 w-3" />
                                  </a>
                                ) : 'N/A'}</p>
                                <p><span className="text-ink-3">Size:</span> {recruiter.employerProfile?.companySize || 'N/A'} employees</p>
                                <p><span className="text-ink-3">GST:</span> {recruiter.employerProfile?.gst || 'N/A'}</p>
                              </div>
                            </div>

                            {/* Recruiter Details Block */}
                            <div className="space-y-2 bg-surface p-4 rounded-lg border border-border/60">
                              <span className="text-accent font-bold uppercase tracking-wider flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                Recruiter Details
                              </span>
                              <div className="space-y-1 mt-2">
                                <p><span className="text-ink-3">Designation:</span> {recruiter.employerProfile?.designation || 'N/A'}</p>
                                <p><span className="text-ink-3">Contact:</span> {recruiter.employerProfile?.contactNumber || 'N/A'}</p>
                                <p><span className="text-ink-3">Company Email:</span> {recruiter.employerProfile?.companyEmail || 'N/A'}</p>
                              </div>
                            </div>

                            {/* Platform Details Block */}
                            <div className="space-y-2 bg-surface p-4 rounded-lg border border-border/60">
                              <span className="text-accent font-bold uppercase tracking-wider flex items-center gap-1">
                                <Info className="h-3.5 w-3.5" />
                                Account Status
                              </span>
                              <div className="space-y-1 mt-2">
                                <p><span className="text-ink-3">LinkedIn:</span> {recruiter.employerProfile?.linkedin ? (
                                  <a href={recruiter.employerProfile.linkedin} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                                    Profile Link
                                  </a>
                                ) : 'N/A'}</p>
                                <p><span className="text-ink-3">Status:</span> <span className="capitalize">{recruiter.status}</span></p>
                                {recruiter.status === 'rejected' && (
                                  <p className="text-danger"><span className="text-ink-3">Reason:</span> {recruiter.rejectionReason}</p>
                                )}
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Rejection Reason Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md shadow-lg space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-ink tracking-tight">
              Specify Rejection Reason
            </h3>
            <p className="text-xs text-ink-3">
              Provide an optional reason why this recruiter's request is being rejected. This will be visible on the system and sent to their email.
            </p>
            <form onSubmit={handleReject} className="space-y-4">
              <textarea
                placeholder="e.g. Invalid website or business registry proof. GST number incorrect."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full rounded-md border border-border p-3 text-xs text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white h-24 resize-none"
              />
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={cancelReject}
                  className="rounded px-4 py-2 text-xs font-semibold text-ink-2 hover:bg-grey-50 border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-danger py-2 px-4 text-xs font-bold text-white hover:bg-danger-dark shadow-sm cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
