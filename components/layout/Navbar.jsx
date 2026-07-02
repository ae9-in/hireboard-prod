'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/layout/Logo';
import { 
  Briefcase, 
  Heart, 
  User, 
  LogOut, 
  Plus, 
  Menu, 
  X, 
  ChevronDown, 
  Shield, 
  Building,
  ClipboardList
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Logo iconClassName="h-9 w-9 text-accent" textClassName="text-xl font-extrabold tracking-tight text-ink" />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/jobs" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-accent",
                isActive('/jobs') ? "text-accent" : "text-ink-2"
              )}
            >
              Find Jobs
            </Link>

          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="h-8 w-24 animate-pulse rounded-md bg-grey-100" />
            ) : !user ? (
              <>
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-ink-2 hover:text-accent transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-dark transition-all duration-200"
                  style={{ textDecoration: 'none' }}
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                {/* Seeker Dashboard Utilities */}
                {user.role === 'seeker' && (
                  <Link 
                    href="/dashboard/saved-jobs" 
                    className="p-2 text-ink-2 hover:text-danger transition-colors relative"
                    title="Saved Jobs"
                  >
                    <Heart className="h-5 w-5" />
                    {user.seekerProfile?.savedJobs?.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                        {user.seekerProfile.savedJobs.length}
                      </span>
                    )}
                  </Link>
                )}

                {/* Employer CTA */}
                {user.role === 'employer' && (
                  <Link 
                    href="/employer/post-job" 
                    className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark shadow-sm transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Post a Job
                  </Link>
                )}

                {/* Dropdown Menu */}
                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                    className="flex items-center gap-2 rounded-full border border-border p-1.5 hover:bg-grey-50 transition-colors"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-light text-accent font-semibold text-xs">
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-ink-2 pr-1">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="h-4 w-4 text-ink-3" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border border-border bg-surface p-1 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="px-3 py-2 border-b border-border mb-1">
                        <p className="text-xs text-ink-3">Signed in as</p>
                        <p className="text-sm font-semibold text-ink truncate">{user.email}</p>
                        <span className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent-light text-accent capitalize">
                          {user.role}
                        </span>
                      </div>

                      {user.role === 'seeker' && (
                        <>
                          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-ink-2 rounded hover:bg-grey-50 hover:text-accent">
                            <ClipboardList className="h-4 w-4" /> Dashboard
                          </Link>
                          <Link href="/dashboard/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-ink-2 rounded hover:bg-grey-50 hover:text-accent">
                            <User className="h-4 w-4" /> Edit Profile
                          </Link>
                        </>
                      )}

                      {user.role === 'employer' && (
                        <>
                          <Link href="/employer" className="flex items-center gap-2 px-3 py-2 text-sm text-ink-2 rounded hover:bg-grey-50 hover:text-accent">
                            <Building className="h-4 w-4" /> Dashboard
                          </Link>
                          <Link href="/employer/company-profile" className="flex items-center gap-2 px-3 py-2 text-sm text-ink-2 rounded hover:bg-grey-50 hover:text-accent">
                            <User className="h-4 w-4" /> Company Details
                          </Link>
                        </>
                      )}

                      {user.role === 'admin' && (
                        <>
                          <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm text-ink-2 rounded hover:bg-grey-50 hover:text-accent">
                            <Shield className="h-4 w-4" /> Admin Console
                          </Link>
                        </>
                      )}

                      <button 
                        onMouseDown={(e) => {
                          e.preventDefault();
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-bg rounded mt-1 border-t border-border pt-2"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-ink-2 hover:bg-grey-50 rounded-md"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-4 space-y-3 animate-in slide-in-from-top duration-200">
          <Link 
            href="/jobs" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-ink-2 py-2 hover:text-accent"
          >
            Find Jobs
          </Link>


          {/* User state drawer options */}
          <div className="border-t border-border pt-4">
            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded bg-grey-100" />
            ) : !user ? (
              <div className="flex flex-col gap-2">
                <Link 
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center items-center rounded-md border border-border px-4 py-2.5 text-base font-semibold text-ink-2 hover:bg-grey-50"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center items-center rounded-md bg-accent px-4 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-accent-dark"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-1 py-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-light text-accent font-bold">
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{user.name}</p>
                    <p className="text-xs text-ink-3">{user.email}</p>
                  </div>
                </div>

                {user.role === 'seeker' && (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-ink-2 hover:text-accent font-medium">Dashboard</Link>
                    <Link href="/dashboard/profile" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-ink-2 hover:text-accent font-medium">Edit Profile</Link>
                    <Link href="/dashboard/saved-jobs" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-ink-2 hover:text-accent font-medium">Saved Jobs ({user.seekerProfile?.savedJobs?.length || 0})</Link>
                  </>
                )}

                {user.role === 'employer' && (
                  <>
                    <Link href="/employer" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-ink-2 hover:text-accent font-medium">Employer Dashboard</Link>
                    <Link href="/employer/post-job" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-ink-2 hover:text-accent font-medium">Post a Job</Link>
                    <Link href="/employer/company-profile" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-ink-2 hover:text-accent font-medium">Company Profile</Link>
                  </>
                )}

                {user.role === 'admin' && (
                  <>
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-ink-2 hover:text-accent font-medium">Admin Panel</Link>
                  </>
                )}

                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded border border-danger/20 bg-danger-bg px-4 py-2 text-sm font-semibold text-danger hover:bg-danger/10 mt-4"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
