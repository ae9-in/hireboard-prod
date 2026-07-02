'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Upload, Building, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function CompanyProfileForm({ company = null }) {
  const router = useRouter();
  
  const [name, setName] = useState(company?.name || '');
  const [logo, setLogo] = useState(company?.logo || '');
  const [website, setWebsite] = useState(company?.website || '');
  const [industry, setIndustry] = useState(company?.industry || '');
  const [size, setSize] = useState(company?.size || '11-50');
  const [founded, setFounded] = useState(company?.founded || new Date().getFullYear() - 5);
  const [description, setDescription] = useState(company?.description || '');
  
  const [benefits, setBenefits] = useState(company?.benefits ? company.benefits.join(', ') : '');
  const [techStack, setTechStack] = useState(company?.techStack ? company.techStack.join(', ') : '');
  
  const [hqCity, setHqCity] = useState(company?.headquarters?.city || '');
  const [hqState, setHqState] = useState(company?.headquarters?.state || '');
  
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setError('Please upload a PNG or JPEG image only.');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB.');
      return;
    }

    setUploading(true);
    setError('');

    // Simulate Cloudinary image upload delay
    setTimeout(() => {
      setLogo(`https://res.cloudinary.com/hireboard/image/upload/v123456/logos/${encodeURIComponent(file.name)}`);
      setUploading(false);
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    // Split list strings into arrays
    const benefitsArray = benefits
      ? benefits.split(',').map(b => b.trim()).filter(Boolean)
      : [];
    const techArray = techStack
      ? techStack.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const payload = {
      name,
      logo,
      website,
      industry,
      size,
      founded: Number(founded),
      description,
      benefits: benefitsArray,
      techStack: techArray,
      headquarters: {
        city: hqCity,
        state: hqState,
        country: 'India'
      }
    };

    try {
      const res = await fetch('/api/companies', {
        method: company ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Failed to update company settings.');
      }
    } catch (err) {
      console.error(err);
      setError('A network error occurred while updating company profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const isCreationMode = !company;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {isCreationMode && (
        <div className="rounded-lg bg-warning-bg border border-warning/10 p-4 flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-warning">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">Company Profile Required</p>
            <p className="mt-1 font-normal text-ink-2">
              Before you can post job openings, you must set up your company details. This profile is displayed to candidates on your listings.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-danger-bg border border-danger/10 p-4 flex items-start gap-2.5 text-sm font-semibold text-danger">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-success-bg border border-success/10 p-4 flex items-center gap-2.5 text-sm font-semibold text-success">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Company profile updated successfully!</span>
        </div>
      )}

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Company Name */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-ink">Company Legal Name*</label>
          <input 
            type="text"
            required
            placeholder="e.g. Razorpay Technologies"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
          />
        </div>

        {/* Website */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-ink">Website URL*</label>
          <input 
            type="url"
            required
            placeholder="https://company.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white font-mono"
          />
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-ink">Industry Segment*</label>
          <input 
            type="text"
            required
            placeholder="e.g. Fintech, Edtech, E-commerce"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
          />
        </div>

        {/* Company size */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-ink">Employee Size Count*</label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white cursor-pointer"
          >
            <option value="1-10">1-10 Employees</option>
            <option value="11-50">11-50 Employees</option>
            <option value="51-200">51-200 Employees</option>
            <option value="201-500">201-500 Employees</option>
            <option value="501-1000">501-1000 Employees</option>
            <option value="1000+">1000+ Employees</option>
          </select>
        </div>

        {/* Founded Year */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-ink">Year Founded*</label>
          <input 
            type="number"
            min="1800"
            max={new Date().getFullYear()}
            required
            value={founded}
            onChange={(e) => setFounded(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white font-mono"
          />
        </div>

        {/* Headquarters location */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-ink">HQ City*</label>
            <input 
              type="text"
              required
              placeholder="e.g. Bangalore"
              value={hqCity}
              onChange={(e) => setHqCity(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-ink">HQ State</label>
            <input 
              type="text"
              placeholder="e.g. Karnataka"
              value={hqState}
              onChange={(e) => setHqState(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
            />
          </div>
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-ink">Company Brand Logo (JPEG/PNG)*</label>
          {!logo ? (
            <div className="relative border-2 border-dashed border-border hover:border-accent rounded-lg p-4 flex flex-col items-center justify-center bg-canvas/30 cursor-pointer">
              <input 
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {uploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  <span className="text-xs text-ink-3">Uploading logo...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold text-ink-2">
                  <Upload className="h-4.5 w-4.5 text-ink-3" />
                  Select brand image file
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between border border-border bg-white rounded-lg p-2">
              <div className="flex items-center gap-2 min-w-0">
                <img src={logo} alt="Logo preview" className="h-8 w-8 object-contain rounded bg-canvas border border-border shrink-0" />
                <span className="text-xs text-ink truncate max-w-[200px]">
                  {decodeURIComponent(logo.split('/').pop())}
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setLogo('')}
                className="text-xs font-bold text-danger hover:underline"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Benefits */}
        <div className="col-span-1 md:col-span-2 space-y-2">
          <label className="block text-sm font-bold text-ink">Company Benefits (comma-separated)</label>
          <input 
            type="text"
            placeholder="Health insurance, Remote work, ESOPs, Gym stipend, Annual retreats"
            value={benefits}
            onChange={(e) => setBenefits(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
          />
        </div>

        {/* Tech Stack */}
        <div className="col-span-1 md:col-span-2 space-y-2">
          <label className="block text-sm font-bold text-ink">Engineering Stack (comma-separated)</label>
          <input 
            type="text"
            placeholder="React, TypeScript, Node.js, Next.js, AWS, Kubernetes"
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
          />
        </div>

        {/* Description */}
        <div className="col-span-1 md:col-span-2 space-y-2">
          <label className="block text-sm font-bold text-ink">Company Description*</label>
          <textarea 
            rows="5"
            required
            placeholder="Outline your company's core mission, market products, and engineering culture..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white resize-none"
          />
        </div>

      </div>

      <div className="border-t border-border pt-6 flex justify-end">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="inline-flex items-center gap-2 rounded bg-accent px-6 py-2.5 text-sm font-bold text-white hover:bg-accent-dark shadow-sm disabled:opacity-50 transition-all cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Profile...
            </>
          ) : (
            <>
              <Building className="h-4.5 w-4.5" />
              {isCreationMode ? 'Create Brand Profile' : 'Save Company Profile'}
            </>
          )}
        </button>
      </div>

    </form>
  );
}
