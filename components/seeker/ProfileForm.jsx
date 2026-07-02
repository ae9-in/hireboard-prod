'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function ProfileForm({ initialUser }) {
  const router = useRouter();
  
  const [name, setName] = useState(initialUser.name || '');
  const [phone, setPhone] = useState(initialUser.phone || '');
  
  const prof = initialUser.seekerProfile || {};
  const [headline, setHeadline] = useState(prof.headline || '');
  const [summary, setSummary] = useState(prof.summary || '');
  const [skills, setSkills] = useState(prof.skills ? prof.skills.join(', ') : '');
  const [experience, setExperience] = useState(prof.experience || 0);
  const [currentSalary, setCurrentSalary] = useState(prof.currentSalary || 0);
  const [expectedSalary, setExpectedSalary] = useState(prof.expectedSalary || 0);
  const [noticePeriod, setNoticePeriod] = useState(prof.noticePeriod || 'immediate');
  const [location, setLocation] = useState(prof.location || '');
  const [resumeUrl, setResumeUrl] = useState(prof.resumeUrl || '');

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }

    setUploading(true);
    setError('');

    // Simulate Cloudinary upload delay
    setTimeout(() => {
      setResumeUrl(`https://res.cloudinary.com/hireboard/raw/upload/v123456/resumes/${encodeURIComponent(file.name)}`);
      setUploading(false);
    }, 1200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    // Split skills string back to array of lowercase strings
    const skillsArray = skills
      ? skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
      : [];

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          seekerProfile: {
            headline,
            summary,
            skills: skillsArray,
            experience: Number(experience),
            currentSalary: Number(currentSalary),
            expectedSalary: Number(expectedSalary),
            noticePeriod,
            location,
            resumeUrl
          }
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Failed to update profile settings.');
      }
    } catch (err) {
      console.error(err);
      setError('A network error occurred while updating profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {error && (
        <div className="rounded-lg bg-danger-bg border border-danger/10 p-4 flex items-start gap-2.5 text-sm font-semibold text-danger">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-success-bg border border-success/10 p-4 flex items-center gap-2.5 text-sm font-semibold text-success">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Your candidate profile has been updated successfully!</span>
        </div>
      )}

      {/* Grid segments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Name */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-ink">Full Name*</label>
          <input 
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white transition-all"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-ink">Phone Number</label>
          <input 
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white transition-all"
          />
        </div>

        {/* Headline */}
        <div className="col-span-1 md:col-span-2 space-y-2">
          <label className="block text-sm font-bold text-ink">Professional Headline*</label>
          <input 
            type="text"
            required
            placeholder="e.g. Senior Frontend Engineer | 4 YOE | React & Next.js specialist"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white transition-all"
          />
        </div>

        {/* Summary */}
        <div className="col-span-1 md:col-span-2 space-y-2">
          <label className="block text-sm font-bold text-ink">Professional Summary</label>
          <textarea 
            rows="4"
            placeholder="Summarize your career highlights, tech stacks, and what value you bring to engineering teams..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white transition-all resize-none"
          />
        </div>

        {/* Skills */}
        <div className="col-span-1 md:col-span-2 space-y-2">
          <label className="block text-sm font-bold text-ink">Skills (comma-separated)*</label>
          <input 
            type="text"
            required
            placeholder="react, typescript, node.js, aws, docker, python"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white transition-all"
          />
          <p className="text-[10px] text-ink-3">Separate skills using commas. Keywords will be lowercase and indexed for search engines.</p>
        </div>

        {/* Experience YOE */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-ink">Years of Experience (YOE)*</label>
          <input 
            type="number"
            min="0"
            max="40"
            required
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white transition-all"
          />
        </div>

        {/* Notice Period */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-ink">Notice Period*</label>
          <select
            value={noticePeriod}
            onChange={(e) => setNoticePeriod(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white transition-all cursor-pointer"
          >
            <option value="immediate">Immediate Joiner</option>
            <option value="15days">15 Days</option>
            <option value="30days">30 Days</option>
            <option value="60days">60 Days</option>
            <option value="90days">90 Days</option>
          </select>
        </div>

        {/* Current Salary (LPA) */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-ink">Current Salary (LPA)*</label>
          <input 
            type="number"
            min="0"
            required
            value={currentSalary}
            onChange={(e) => setCurrentSalary(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white transition-all font-mono"
          />
        </div>

        {/* Expected Salary (LPA) */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-ink">Expected Salary (LPA)*</label>
          <input 
            type="number"
            min="0"
            required
            value={expectedSalary}
            onChange={(e) => setExpectedSalary(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white transition-all font-mono"
          />
        </div>

        {/* Location City */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-ink">Current Location (City)*</label>
          <input 
            type="text"
            required
            placeholder="e.g. Bangalore"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white transition-all"
          />
        </div>

        {/* Resume PDF Field */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-ink">Resume Attachment (PDF only)*</label>
          {!resumeUrl ? (
            <div className="relative border-2 border-dashed border-border hover:border-accent rounded-lg p-4 flex flex-col items-center justify-center bg-canvas/30 cursor-pointer">
              <input 
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {uploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  <span className="text-xs text-ink-3">Uploading resume...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold text-ink-2">
                  <Upload className="h-4.5 w-4.5 text-ink-3" />
                  Select candidate resume file
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between border border-success/30 bg-success-bg/10 rounded-lg p-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-5.5 w-5.5 text-success shrink-0" />
                <span className="text-xs text-ink truncate max-w-[200px]">
                  {decodeURIComponent(resumeUrl.split('/').pop())}
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setResumeUrl('')}
                className="text-xs font-bold text-danger hover:underline"
              >
                Remove
              </button>
            </div>
          )}
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
              <Save className="h-4.5 w-4.5" />
              Save Seeker Profile
            </>
          )}
        </button>
      </div>

    </form>
  );
}
