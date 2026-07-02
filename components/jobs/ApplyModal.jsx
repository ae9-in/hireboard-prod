'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/utils/cn';

export default function ApplyModal({ job, onClose, onApplied }) {
  const router = useRouter();
  
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [answer, setAnswer] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Mock file uploader helper (simulates uploading to Cloudinary)
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

    // Simulate network delay
    setTimeout(() => {
      // In production, this would make an API call to upload the file to Cloudinary/S3
      setResumeUrl(`https://res.cloudinary.com/hireboard/raw/upload/v123456/resumes/${encodeURIComponent(file.name)}`);
      setUploading(false);
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeUrl) {
      setError('Please upload your resume before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/jobs/${job._id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeUrl,
          coverLetter,
          answers: [
            {
              question: 'Why are you a good fit for this role?',
              answer: answer
            }
          ]
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
        // Trigger success confetti burst!
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
        
        setTimeout(() => {
          if (onApplied) onApplied();
          onClose();
          router.refresh();
        }, 2500);
      } else {
        setError(data.error || 'Failed to submit application. Try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to submit application due to a network error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-3 hover:text-ink hover:bg-grey-50 rounded-full p-1.5 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="p-8 text-center flex flex-col items-center justify-center min-h-[350px]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-success mb-6">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-extrabold text-ink">Application Submitted!</h3>
            <p className="mt-2 text-sm text-ink-2 max-w-sm">
              Your application has been successfully sent to <span className="font-semibold text-accent">{job.company?.name}</span>. You can track its status inside your Candidate Dashboard.
            </p>
            <div className="mt-6 text-xs text-ink-3 animate-pulse">
              Redirecting...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div>
              <span className="text-xs font-bold text-accent bg-accent-light px-2.5 py-1 rounded">
                Apply Direct
              </span>
              <h3 className="mt-3 text-lg font-bold text-ink leading-tight">
                Apply for {job.title}
              </h3>
              <p className="text-xs text-ink-3 mt-1.5 font-medium">
                at {job.company?.name} · {job.location?.city} ({job.workType})
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-danger-bg border border-danger/10 p-3 flex items-start gap-2.5 text-xs font-semibold text-danger">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Resume Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-ink">Upload Resume (PDF only)*</label>
              
              {!resumeUrl ? (
                <div className="relative border-2 border-dashed border-border hover:border-accent rounded-lg p-6 flex flex-col items-center justify-center bg-canvas/40 transition-colors cursor-pointer">
                  <input 
                    type="file" 
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center text-center">
                      <span className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mb-2" />
                      <p className="text-xs text-ink-3 font-semibold">Uploading PDF...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <Upload className="h-8 w-8 text-ink-3 mb-2" />
                      <p className="text-xs font-semibold text-ink-2">Click to select PDF or drag file here</p>
                      <p className="text-[10px] text-ink-3 mt-1 font-medium">Max file size 5MB</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between border border-success/30 bg-success-bg/10 rounded-lg p-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="h-6.5 w-6.5 text-success shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-ink truncate max-w-[250px]">
                        {decodeURIComponent(resumeUrl.split('/').pop())}
                      </p>
                      <p className="text-[10px] text-success font-semibold">Resume uploaded successfully</p>
                    </div>
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

            {/* Screening question */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-ink">
                Why are you a good fit for this role?
              </label>
              <textarea
                rows="3"
                required
                placeholder="List key achievements or experiences that match this job description..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none bg-white transition-all resize-none"
              />
            </div>

            {/* Cover letter (optional) */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-ink">
                Cover Letter (Optional)
              </label>
              <textarea
                rows="3"
                placeholder="Pitch yourself directly to the hiring manager..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none bg-white transition-all resize-none"
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded border border-border px-4 py-2 text-sm font-semibold text-ink-2 hover:bg-grey-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploading}
                className="rounded bg-accent px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-dark disabled:opacity-50 transition-all"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
