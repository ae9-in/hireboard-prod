import React, { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import JobDirectoryClient from '@/components/jobs/JobDirectoryClient';
import connectDB from '@/lib/db';
import Job from '@/models/Job.model';
import User from '@/models/User.model';
import { CITIES } from '@/utils/constants';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

export async function generateStaticParams() {
  // Return lowercase slugs for URL mapping
  return CITIES.map(city => ({ city: city.toLowerCase() }));
}

async function getCityName(citySlug) {
  const match = CITIES.find(c => c.toLowerCase() === citySlug.toLowerCase());
  return match || null;
}

export async function generateMetadata({ params }) {
  const { city: citySlug } = await params;
  const cityName = await getCityName(citySlug);
  
  if (!cityName) {
    return { title: 'Location Not Found | HireBoard' };
  }

  const title = `Jobs in ${cityName} | Apply Direct | HireBoard`;
  const description = `Browse active verified job openings in ${cityName} at top companies. Full salary visibility, moderated listings, and quick apply.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://hireboard.in/location/${citySlug.toLowerCase()}`
    }
  };
}

export default async function LocationPage({ params }) {
  const { city: citySlug } = await params;
  const cityName = await getCityName(citySlug);

  if (!cityName) {
    notFound();
  }

  let jobs = [];
  let totalCount = 0;
  let savedJobsList = [];

  try {
    await connectDB();

    // Fetch saved jobs list
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        const user = await User.findById(decoded.id).select('seekerProfile.savedJobs').lean();
        if (user?.seekerProfile?.savedJobs) {
          savedJobsList = user.seekerProfile.savedJobs.map(id => id.toString());
        }
      }
    }

    const queryObj = { 
      status: 'active', 
      'location.city': { $regex: new RegExp(`^${cityName}$`, 'i') } 
    };
    totalCount = await Job.countDocuments(queryObj);
    
    const queryResult = await Job.find(queryObj)
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(20)
      .populate('company', 'name logo slug isVerified industry size')
      .lean();

    jobs = queryResult.map(job => ({
      ...job,
      _id: job._id.toString(),
      company: job.company ? {
        ...job.company,
        _id: job.company._id.toString()
      } : null,
      postedBy: job.postedBy.toString(),
      createdAt: job.createdAt ? job.createdAt.toISOString() : null,
      updatedAt: job.updatedAt ? job.updatedAt.toISOString() : null,
    }));

  } catch (error) {
    console.error('Error loading location page:', error);
  }

  const activeParams = {
    city: cityName,
    savedJobsList,
    page: 1
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-canvas">
        {/* Special SEO Hero details */}
        <div className="bg-white border-b border-border py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:text-left">
            <h1 className="font-display text-3xl font-extrabold text-ink tracking-tight">
              Jobs in {cityName}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-ink-2 max-w-2xl font-normal leading-relaxed">
              Explore verified job openings in {cityName}. Compare annual packages, review company insights, and submit your resume directly to active recruiters.
            </p>
          </div>
        </div>
        <Suspense fallback={
          <div className="mx-auto max-w-7xl px-4 py-16 text-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent inline-block" />
          </div>
        }>
          <JobDirectoryClient 
            jobs={jobs} 
            totalCount={totalCount} 
            activeParams={activeParams} 
          />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
