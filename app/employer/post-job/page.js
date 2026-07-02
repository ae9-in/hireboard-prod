'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@/utils/constants';
import { Save, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function PostJobPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('software-engineering');
  const [subcategory, setSubcategory] = useState('');
  const [workType, setWorkType] = useState('remote');
  const [jobType, setJobType] = useState('full-time');
  
  const [expMin, setExpMin] = useState(0);
  const [expMax, setExpMax] = useState(1);
  
  const [salMin, setSalMin] = useState(3);
  const [salMax, setSalMax] = useState(6);
  const [salPeriod, setSalPeriod] = useState('annual');
  const [isNegotiable, setIsNegotiable] = useState(false);
  
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [requirements, setRequirements] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [deadline, setDeadline] = useState('');

  // Admin company posting list
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [companiesLoading, setCompaniesLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      setCompaniesLoading(true);
      fetch('/api/companies')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.companies) {
            setCompanies(data.companies);
            if (data.companies.length > 0) {
              setSelectedCompany(data.companies[0]._id);
            }
          }
        })
        .catch(err => console.error('Error fetching companies:', err))
        .finally(() => setCompaniesLoading(false));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    // Validations
    if (Number(expMin) > Number(expMax)) {
      setError('Minimum experience cannot be greater than maximum experience.');
      setSubmitting(false);
      return;
    }
    
    if (Number(salMin) > Number(salMax)) {
      setError('Minimum salary cannot be greater than maximum salary.');
      setSubmitting(false);
      return;
    }

    if (user?.role === 'admin' && !selectedCompany) {
      setError('Please select a company to post on behalf of.');
      setSubmitting(false);
      return;
    }

    // Split arrays
    const skillsArray = skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const reqsArray = requirements.split('\n').map(r => r.trim()).filter(Boolean);
    const respsArray = responsibilities.split('\n').map(r => r.trim()).filter(Boolean);

    const payload = {
      title,
      category,
      subcategory,
      workType,
      jobType,
      experience: {
        min: Number(expMin),
        max: Number(expMax)
      },
      salary: {
        min: Number(salMin),
        max: Number(salMax),
        period: salPeriod,
        currency: 'INR',
        isNegotiable
      },
      location: {
        city: city || 'Remote',
        state: state || 'Remote',
        country: 'India'
      },
      description,
      skills: skillsArray,
      requirements: reqsArray,
      responsibilities: respsArray,
      applicationDeadline: deadline ? new Date(deadline).toISOString() : null,
      ...(user?.role === 'admin' && { company: selectedCompany })
    };

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        // Reset form
        setTitle('');
        setSubcategory('');
        setDescription('');
        setSkills('');
        setRequirements('');
        setResponsibilities('');
        setCity('');
        setState('');
        setDeadline('');
        
        setTimeout(() => {
          if (user?.role === 'admin') {
            router.push('/admin/jobs');
          } else {
            router.push('/employer/jobs');
          }
        }, 2000);
      } else {
        setError(data.error || 'Failed to submit job listing.');
      }
    } catch (err) {
      console.error(err);
      setError('A network error occurred while posting job.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const backLink = user?.role === 'admin' ? '/admin' : '/employer';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link href={backLink} className="p-1.5 hover:bg-grey-50 rounded text-ink-3 hover:text-ink">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
            Create Job Opening
          </h1>
          <p className="text-xs sm:text-sm text-ink-2">
            Post an opening. It will go live after admin moderation.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-danger-bg border border-danger/10 p-4 flex items-start gap-2.5 text-sm font-semibold text-danger">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-success-bg border border-success/10 p-4 flex items-center gap-2.5 text-sm font-semibold text-success">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Job opening posted successfully! Redirecting to list...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="border-t border-border pt-6 space-y-6">
        
        {/* Admin Section: Select Company */}
        {user?.role === 'admin' && (
          <div className="bg-canvas/40 border border-border p-4 rounded-lg space-y-2">
            <label className="block text-sm font-bold text-ink">Post On Behalf Of (Admin Only)*</label>
            {companiesLoading ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-3">
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                Loading verified companies...
              </div>
            ) : companies.length === 0 ? (
              <div className="text-xs font-bold text-danger">
                No verified companies found in the database. Please verify a company first.
              </div>
            ) : (
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white cursor-pointer font-bold"
              >
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Core details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-ink">Job Title*</label>
            <input 
              type="text"
              required
              placeholder="e.g. Senior React Developer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-ink">Job Category*</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-ink">Subcategory / Specialization</label>
            <input 
              type="text"
              placeholder="e.g. Frontend, Fullstack, Mobile"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-ink">Work Mode*</label>
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white cursor-pointer"
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-ink">Job Type*</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white cursor-pointer"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
          </div>

          {/* Location details */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-ink">City Location*</label>
            <input 
              type="text"
              required={workType !== 'remote'}
              placeholder="e.g. Bangalore (Enter 'Remote' if remote)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-ink">State / Region</label>
            <input 
              type="text"
              placeholder="e.g. Karnataka"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
            />
          </div>

          {/* Experience limits */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-ink">Min YOE Required*</label>
              <input 
                type="number"
                min="0"
                required
                value={expMin}
                onChange={(e) => setExpMin(e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-ink">Max YOE Required*</label>
              <input 
                type="number"
                min="0"
                required
                value={expMax}
                onChange={(e) => setExpMax(e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
              />
            </div>
          </div>

          {/* Salary details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-ink">Min Salary*</label>
              <input 
                type="number"
                min="0"
                required
                placeholder={salPeriod === 'annual' ? 'LPA' : 'Monthly'}
                value={salMin}
                onChange={(e) => setSalMin(e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-ink">Max Salary*</label>
              <input 
                type="number"
                min="0"
                required
                placeholder={salPeriod === 'annual' ? 'LPA' : 'Monthly'}
                value={salMax}
                onChange={(e) => setSalMax(e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white font-mono"
              />
            </div>
          </div>

          {/* Salary options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-ink">Salary Period*</label>
              <select
                value={salPeriod}
                onChange={(e) => setSalPeriod(e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white cursor-pointer"
              >
                <option value="annual">Lakhs Per Annum (LPA)</option>
                <option value="monthly">Monthly stipend</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-8">
              <input 
                type="checkbox"
                id="isNegotiable"
                checked={isNegotiable}
                onChange={(e) => setIsNegotiable(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-border text-accent focus:ring-accent cursor-pointer"
              />
              <label htmlFor="isNegotiable" className="text-sm font-semibold text-ink-2 cursor-pointer select-none">
                Salary is negotiable
              </label>
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-ink">Application Deadline</label>
            <input 
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white font-mono cursor-pointer"
            />
          </div>
        </div>

        {/* Rich description */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-ink">Job Description (Markdown supported)*</label>
          <textarea 
            rows="6"
            required
            placeholder="Outline the role, day-to-day work, engineering stack, and benefits..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
          />
        </div>

        {/* Skills input */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-ink">Required Skills (comma-separated)*</label>
          <input 
            type="text"
            required
            placeholder="react, typescript, css, next.js"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
          />
        </div>

        {/* Requirements */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-ink">Requirements List (One per line)*</label>
          <textarea 
            rows="4"
            required
            placeholder="Bachelor's degree in CS or equivalent&#10;3+ years of professional React experience&#10;Familiarity with tailwind and responsive layouts"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white font-mono"
          />
        </div>

        {/* Responsibilities */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-ink">Responsibilities List (One per line)*</label>
          <textarea 
            rows="4"
            required
            placeholder="Develop modular and reusable UI components&#10;Collaborate with product designers and backend developers&#10;Optimize frontend load times and responsiveness"
            value={responsibilities}
            onChange={(e) => setResponsibilities(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white font-mono"
          />
        </div>

        <div className="border-t border-border pt-6 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded bg-accent px-6 py-2.5 text-sm font-bold text-white hover:bg-accent-dark shadow-sm disabled:opacity-50 transition-all cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Posting Listing...
              </>
            ) : (
              <>
                <Save className="h-4.5 w-4.5" />
                Post Job Opening
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
