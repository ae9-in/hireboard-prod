'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  Building, 
  PlusSquare, 
  Briefcase, 
  Users, 
  LogOut 
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function EmployerSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard Overview', href: '/employer', icon: Building },
    { name: 'Post a Job', href: '/employer/post-job', icon: PlusSquare },
    { name: 'Manage Openings', href: '/employer/jobs', icon: Briefcase },
    { name: 'Manage Applicants', href: '/employer/applications', icon: Users },
    { name: 'Company Profile', href: '/employer/company-profile', icon: Building },
  ];

  return (
    <aside className="w-full md:w-64 bg-surface border-r border-border min-h-screen p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="px-3 py-2">
          <h2 className="text-xs font-semibold text-accent uppercase tracking-wider">Recruiter Portal</h2>
        </div>
        <nav className="space-y-1">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            // Handle active checks correctly. Let's exact match or sub-matches except for base /employer
            const active = item.href === '/employer' 
              ? pathname === '/employer' 
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name + idx}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active 
                    ? "bg-accent text-white shadow-sm shadow-accent-glow" 
                    : "text-ink-2 hover:bg-grey-50 hover:text-accent"
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
