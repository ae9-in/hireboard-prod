import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedJobs from '@/components/home/FeaturedJobs';
import StatsBanner from '@/components/home/StatsBanner';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import NewsletterSection from '@/components/home/NewsletterSection';

import connectDB from '@/lib/db';
import Job from '@/models/Job.model';
import Company from '@/models/Company.model';

// Revalidate this page every hour (3600 seconds) for fresh listings and stats
export const revalidate = 3600;

export default async function HomePage() {
  let featuredJobs = [];
  let topCompanies = [];
  let categoryCounts = {};
  let activeJobsCount = 0;
  let companiesCount = 0;

  try {
    await connectDB();

    // 1. Fetch featured active jobs
    featuredJobs = await Job.find({ status: 'active', isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('company', 'name logo slug isVerified')
      .lean();

    // Serialize object ids for client component consumption
    featuredJobs = JSON.parse(JSON.stringify(featuredJobs));

    // 2. Fetch active companies
    topCompanies = await Company.find({})
      .sort({ activeJobCount: -1, rating: -1 })
      .limit(6)
      .lean();

    topCompanies = topCompanies.map(comp => ({
      ...comp,
      _id: comp._id.toString(),
      owner: comp.owner ? comp.owner.toString() : null,
      createdAt: comp.createdAt ? comp.createdAt.toISOString() : null,
      updatedAt: comp.updatedAt ? comp.updatedAt.toISOString() : null,
    }));

    // 3. Aggregate active job counts per category
    const aggregates = await Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    aggregates.forEach(agg => {
      if (agg._id) {
        categoryCounts[agg._id] = agg.count;
      }
    });

    // 4. Fetch platform counts for stats banner
    const [jobsCount, compsCount] = await Promise.all([
      Job.countDocuments({ status: 'active' }),
      Company.countDocuments({})
    ]);
    activeJobsCount = jobsCount;
    companiesCount = compsCount;

  } catch (error) {
    console.error('Error fetching homepage database data:', error);
    // Fallback to empty states if database connection fails or is not yet seeded
    featuredJobs = [];
    topCompanies = [];
    categoryCounts = {};
    activeJobsCount = 0;
    companiesCount = 0;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <CategoryGrid counts={categoryCounts} />
        <FeaturedJobs jobs={featuredJobs} />
        <StatsBanner activeJobsCount={activeJobsCount} companiesCount={companiesCount} />
        <HowItWorksSection />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
