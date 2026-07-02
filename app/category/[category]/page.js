import React, { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import JobDirectoryClient from '@/components/jobs/JobDirectoryClient';
import connectDB from '@/lib/db';
import Job from '@/models/Job.model';
import User from '@/models/User.model';
import { CATEGORIES } from '@/utils/constants';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

export async function generateStaticParams() {
  return CATEGORIES.map(cat => ({ category: cat.slug }));
}

async function getCategoryData(categorySlug) {
  const category = CATEGORIES.find(cat => cat.slug === categorySlug);
  if (!category) return null;
  return category;
}

export async function generateMetadata({ params }) {
  const { category: categorySlug } = await params;
  const category = await getCategoryData(categorySlug);
  
  if (!category) {
    return { title: 'Category Not Found | HireBoard' };
  }

  const title = `${category.name} Jobs in India | Apply Direct | HireBoard`;
  const description = `Browse active verified ${category.name} job openings at top companies. Full salary visibility, moderated postings, and quick apply. No spam.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://hireboard.in/category/${categorySlug}`
    }
  };
}

export default async function CategoryPage({ params }) {
  const { category: categorySlug } = await params;
  const category = await getCategoryData(categorySlug);

  if (!category) {
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

    const queryObj = { status: 'active', category: categorySlug };
    totalCount = await Job.countDocuments(queryObj);
    
    const queryResult = await Job.find(queryObj)
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(20)
      .populate('company', 'name logo slug isVerified industry size')
      .lean();

    jobs = JSON.parse(JSON.stringify(queryResult));

  } catch (error) {
    console.error('Error loading category page:', error);
  }

  const activeParams = {
    category: categorySlug,
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
              {category.name} Jobs
            </h1>
            <p className="mt-2 text-sm sm:text-base text-ink-2 max-w-2xl font-normal leading-relaxed">
              Explore verified career pathways in {category.name}. View salary packages up front, apply in under 2 minutes, and monitor candidate status directly.
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
