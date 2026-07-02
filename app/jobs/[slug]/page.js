import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import JobDetailClient from '@/components/jobs/JobDetailClient';
import JobPostingSchema from '@/components/seo/JobPostingSchema';
import connectDB from '@/lib/db';
import Job from '@/models/Job.model';
import Company from '@/models/Company.model';
import Application from '@/models/Application.model';
import User from '@/models/User.model';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';

// Enable Incremental Static Regeneration (re-generate page after 1 hour if hit)
export const revalidate = 3600;

// 1. Generate Static Params for build-time rendering of all current active jobs
export async function generateStaticParams() {
  try {
    await connectDB();
    const jobs = await Job.find({ status: 'active' }).select('slug').lean();
    return jobs.map(job => ({ slug: job.slug }));
  } catch (error) {
    console.error('Error generating static params for jobs:', error);
    return [];
  }
}

// Helper to query job by slug
async function getJob(slug) {
  await connectDB();
  const job = await Job.findOne({ slug })
    .populate('company', 'name logo slug website isVerified industry size description culture benefits techStack headquarters rating reviewCount activeJobCount')
    .lean();
  return job;
}

// 2. Generate Dynamic Metadata (titles, open graph, canonical links)
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const job = await getJob(slug);

  if (!job) {
    return {
      title: 'Job Not Found | HireBoard',
      description: 'The requested job opening could not be found or has expired.',
    };
  }

  const salaryStr = job.salary.period === 'annual' 
    ? `₹${job.salary.min}–${job.salary.max} LPA`
    : `₹${job.salary.min}–${job.salary.max}/mo`;

  const title = `${job.title} at ${job.company?.name || 'Company'} | ${job.location?.city} | ${salaryStr}`;
  const description = `Apply for ${job.title} job opening at ${job.company?.name || 'Company'} in ${job.location?.city}. Salary: ${salaryStr}. Work Mode: ${job.workType} · Job Type: ${job.jobType} · Experience: ${job.experience?.min}–${job.experience?.max} years YOE. Apply direct on HireBoard.`;

  return {
    title,
    description,
    keywords: [job.title, job.company?.name, job.location?.city, job.category, ...(job.skills || [])],
    openGraph: {
      title,
      description,
      url: `https://hireboard.in/jobs/${job.slug}`,
      siteName: 'HireBoard',
      images: [
        {
          url: job.company?.logo || 'https://hireboard.in/og-default.png',
          alt: `${job.company?.name} Logo`,
        }
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `https://hireboard.in/jobs/${job.slug}`
    },
    robots: {
      index: true,
      follow: true,
    }
  };
}

export default async function JobPage({ params }) {
  const { slug } = await params;
  const job = await getJob(slug);

  if (!job) {
    notFound();
  }

  // Serialize job fields for hydration safety
  const serializedJob = {
    ...job,
    _id: job._id.toString(),
    company: job.company ? {
      ...job.company,
      _id: job.company._id.toString(),
      owner: job.company.owner ? job.company.owner.toString() : null,
      createdAt: job.company.createdAt ? job.company.createdAt.toISOString() : null,
      updatedAt: job.company.updatedAt ? job.company.updatedAt.toISOString() : null,
    } : null,
    postedBy: job.postedBy.toString(),
    createdAt: job.createdAt ? job.createdAt.toISOString() : null,
    updatedAt: job.updatedAt ? job.updatedAt.toISOString() : null,
    applicationDeadline: job.applicationDeadline ? job.applicationDeadline.toISOString() : null,
  };

  let currentUser = null;
  let isSaved = false;
  let alreadyApplied = false;

  try {
    // 3. Retrieve authenticated user details to inspect saved/applied status
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        const userRec = await User.findById(decoded.id).select('name email role seekerProfile').lean();
        if (userRec) {
          currentUser = {
            ...userRec,
            _id: userRec._id.toString(),
            createdAt: userRec.createdAt ? userRec.createdAt.toISOString() : null,
          };
          
          // Check saved status
          if (userRec.seekerProfile?.savedJobs) {
            isSaved = userRec.seekerProfile.savedJobs.some(
              (id) => id.toString() === serializedJob._id
            );
          }

          // Check application status
          const app = await Application.findOne({
            job: serializedJob._id,
            applicant: currentUser._id
          }).select('_id').lean();
          
          if (app) {
            alreadyApplied = true;
          }
        }
      }
    }

    // 4. Increment viewCount asynchronously on visit
    await Job.findByIdAndUpdate(job._id, { $inc: { viewCount: 1 } });
    
  } catch (error) {
    console.error('Error handling user detail check on job details load:', error);
  }

  return (
    <>
      {/* Schema details injection */}
      <JobPostingSchema job={serializedJob} />
      
      <Navbar />
      <main className="flex-1 bg-canvas">
        <JobDetailClient 
          job={serializedJob}
          user={currentUser}
          initialSaved={isSaved}
          alreadyApplied={alreadyApplied}
        />
      </main>
      <Footer />
    </>
  );
}
