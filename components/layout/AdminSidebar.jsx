'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  ShieldAlert, 
  ClipboardCheck, 
  Users, 
  Building2, 
  LogOut,
  UserCheck,
  FilePlus
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Analytics & Overview', href: '/admin', icon: ShieldAlert },
    { name: 'Moderate Jobs', href: '/admin/jobs', icon: ClipboardCheck },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Recruiter Requests', href: '/admin/recruiters', icon: UserCheck },
    { name: 'Companies Board', href: '/admin/companies', icon: Building2 },
    { name: 'Post Job (As Company)', href: '/employer/post-job', icon: FilePlus },
  ];

  return (
    <aside className="w-full md:w-64 bg-surface border-r border-border min-h-screen p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="px-3 py-2">
          <h2 className="text-xs font-semibold text-danger uppercase tracking-wider flex items-center gap-1.5">
            Admin Moderation
          </h2>
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active 
                    ? "bg-grey-900 text-white shadow-sm" 
                    : "text-ink-2 hover:bg-grey-50 hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-border pt-4 mt-auto">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-danger-bg transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
