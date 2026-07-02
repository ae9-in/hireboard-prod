'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ShieldAlert, CheckCircle, Ban, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/utils/cn';

export default function UsersModerator({ initialUsers = [] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [updatingId, setUpdatingId] = useState(null);

  const handleToggleActive = async (userId, currentActive) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !currentActive } : u));
        router.refresh();
      }
    } catch (err) {
      console.error('Error toggling user active state:', err);
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
            <th className="px-6 py-4">User Name</th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">Created Date</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-border/60 font-medium">
          {users.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center text-ink-3">
                No users registered on the platform.
              </td>
            </tr>
          ) : (
            users.map((user) => {
              const joinedDate = user.createdAt
                ? format(new Date(user.createdAt), 'MMM dd, yyyy')
                : 'Recently';
              
              const isUpdating = updatingId === user._id;

              return (
                <tr key={user._id} className="hover:bg-canvas/20 transition-colors">
                  {/* Name */}
                  <td className="px-6 py-4">
                    <span className="font-bold text-ink">{user.name}</span>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 text-ink-2 font-mono text-xs">
                    {user.email}
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider select-none border",
                      user.role === 'admin' && "bg-grey-900 border-grey-900 text-white",
                      user.role === 'employer' && "bg-accent-light border-accent/10 text-accent",
                      user.role === 'seeker' && "bg-indigo-50 border-indigo-100 text-indigo-600"
                    )}>
                      {user.role}
                    </span>
                  </td>

                  {/* Joined */}
                  <td className="px-6 py-4 text-ink-3 text-xs font-mono">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {joinedDate}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1 text-xs font-bold",
                      user.isActive ? "text-success" : "text-danger"
                    )}>
                      {user.isActive ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      {user.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end">
                      {isUpdating ? (
                        <span className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                      ) : (
                        user.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleActive(user._id, user.isActive)}
                            className={cn(
                              "inline-flex items-center gap-1 rounded px-3 py-1.5 text-xs font-bold transition-all border",
                              user.isActive 
                                ? "border-danger/20 bg-danger-bg text-danger hover:bg-danger/10" 
                                : "border-success/20 bg-success-bg text-success hover:bg-success/10"
                            )}
                          >
                            {user.isActive ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                            {user.isActive ? 'Block' : 'Unblock'}
                          </button>
                        )
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
