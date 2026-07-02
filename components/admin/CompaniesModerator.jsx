'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from '../ui/Avatar';
import { CheckCircle2, ShieldAlert, BadgeCheck, X, Globe, Calendar, Building } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/utils/cn';

export default function CompaniesModerator({ initialCompanies = [] }) {
  const router = useRouter();
  const [companies, setCompanies] = useState(initialCompanies);
  const [updatingId, setUpdatingId] = useState(null);

  const handleToggleVerify = async (companyId, currentVerify) => {
    setUpdatingId(companyId);
    try {
      const res = await fetch(`/api/admin/companies/${companyId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: !currentVerify }),
      });
      if (res.ok) {
        setCompanies(prev => prev.map(c => c._id === companyId ? { ...c, isVerified: !currentVerify } : c));
        router.refresh();
      }
    } catch (err) {
      console.error('Error toggling company verify state:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="w-full overflow-x-auto border border-border rounded-lg bg-surface">
      <table className="w-full border-collapse text-left text-sm">
        
        {/* Head */}
        <thead className="bg-canvas border-b border-border text-xs font-bold text-ink-3 uppercase tracking-wider select-none">
          <tr>
            <th className="px-6 py-4">Brand Logo & Name</th>
            <th className="px-6 py-4">Industry / Website</th>
            <th className="px-6 py-4 text-center">Company Size</th>
            <th className="px-6 py-4">Founded</th>
            <th className="px-6 py-4">Verification</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-border/60 font-medium">
          {companies.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center text-ink-3">
                No corporate companies registered yet.
              </td>
            </tr>
          ) : (
            companies.map((company) => {
              const foundedYear = company.founded || 'N/A';
              const isUpdating = updatingId === company._id;

              return (
                <tr key={company._id} className="hover:bg-canvas/20 transition-colors">
                  {/* Name and logo */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={company.name} logo={company.logo} className="h-10 w-10 shrink-0 border border-border" />
                      <div>
                        <h4 className="font-bold text-ink truncate max-w-[150px]">{company.name}</h4>
                        <p className="text-[10px] text-ink-3 mt-0.5">ID: {company._id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>

                  {/* Website & Industry */}
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-xs text-ink-2 block capitalize font-semibold">{company.industry}</span>
                      {company.website && (
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] text-accent hover:underline flex items-center gap-0.5 mt-0.5 font-mono"
                        >
                          <Globe className="h-3 w-3 shrink-0" />
                          {company.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Size */}
                  <td className="px-6 py-4 text-center font-mono text-ink-2 text-xs">
                    {company.size} emp.
                  </td>

                  {/* Founded */}
                  <td className="px-6 py-4 text-ink-3 text-xs font-mono">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {foundedYear}
                    </span>
                  </td>

                  {/* Verification status badge */}
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1 text-xs font-bold",
                      company.isVerified ? "text-accent" : "text-ink-3"
                    )}>
                      {company.isVerified ? <BadgeCheck className="h-4 w-4 fill-accent-light" /> : <ShieldAlert className="h-4 w-4" />}
                      {company.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>

                  {/* Toggle verification Action */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end">
                      {isUpdating ? (
                        <span className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                      ) : (
                        <button
                          onClick={() => handleToggleVerify(company._id, company.isVerified)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded px-3 py-1.5 text-xs font-bold transition-all border",
                            company.isVerified 
                              ? "border-danger/20 bg-danger-bg text-danger hover:bg-danger/10" 
                              : "border-accent/20 bg-accent-light text-accent hover:bg-accent/10"
                          )}
                        >
                          {company.isVerified ? <X className="h-3.5 w-3.5" /> : <BadgeCheck className="h-3.5 w-3.5" />}
                          {company.isVerified ? 'Revoke' : 'Verify'}
                        </button>
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
