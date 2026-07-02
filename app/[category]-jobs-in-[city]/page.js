import React, { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import JobDirectoryClient from '@/components/jobs/JobDirectoryClient';
import connectDB from '@/lib/db';
import Job from '@/models/Job.model';
import User from '@/models/User.model';
import { CATEGORIES, CITIES } from '@/utils/constants';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { notFound } from 'next/navigation';

// Force dynamic rendering — this page reads cookies for saved-job state
export const dynamic = 'force-dynamic';

async function getIntersectionData(categorySlug, citySlug) {
  const category = CATEGORIES.find(cat => cat.slug === categorySlug);
  const cityMatch = CITIES.find(c => c.toLowerCase() === citySlug.toLowerCase());
  
  if (!category || !cityMatch) return null;
  
  return {
    category,
    cityName: cityMatch
  };
}

export async function generateMetadata({ params }) {
  const { category: categorySlug, city: citySlug } = await params;
  const data = await getIntersectionData(categorySlug, citySlug);

  if (!data) {
    return { title: 'Jobs Not Found | HireBoard' };
  }

  const title = `${data.category.name} Jobs in ${data.cityName} | HireBoard`;
  const description = `Browse active verified ${data.category.name} job openings in ${data.cityName} at top companies. Full salary packages, moderated postings, direct apply.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://hireboard.in/${categorySlug}-jobs-in-${citySlug.toLowerCase()}`
    }
  };
}

export default async function IntersectionPage({ params }) {
  const { category: categorySlug, city: citySlug } = await params;
  const data = await getIntersectionData(categorySlug, citySlug);

  if (!data) {
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
      category: categorySlug,
      'location.city': { $regex: new RegExp(`^${data.cityName}$`, 'i') } 
    };
    totalCount = await Job.countDocuments(queryObj);
    
    const queryResult = await Job.find(queryObj)
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(20)
      .populate('company', 'name logo slug isVerified industry size')
      .lean();

    jobs = JSON.parse(JSON.stringify(queryResult));

  } catch (error) {
    console.error('Error loading intersection page:', error);
  }

  const activeParams = {
    category: categorySlug,
    city: data.cityName,
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
              {data.category.name} Jobs in {data.cityName}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-ink-2 max-w-2xl font-normal leading-relaxed">
              Explore open positions for {data.category.name} in {data.cityName}. Compare verified annual salary packages, inspect cultural notes, and apply direct in one click.
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
