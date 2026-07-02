import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import JobDirectoryClient from '@/components/jobs/JobDirectoryClient';
import connectDB from '@/lib/db';
import Job from '@/models/Job.model';
import Company from '@/models/Company.model';
import User from '@/models/User.model';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function JobsPage({ searchParams }) {
  const params = await searchParams;
  
  // Extract query filters
  const q = params.q || '';
  const city = params.city || '';
  const category = params.category || '';
  const workType = params.workType || '';
  const jobType = params.jobType || '';
  const salaryMin = params.salaryMin ? Number(params.salaryMin) : 0;
  const experienceMax = params.experienceMax ? Number(params.experienceMax) : 15;
  const sort = params.sort || 'date';
  const page = params.page ? Number(params.page) : 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  let jobs = [];
  let totalCount = 0;
  let savedJobsList = [];

  try {
    await connectDB();

    // 1. Fetch user-saved jobs if logged in to show correct heart icon states
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

    // 2. Build mongoose search query object
    const queryObj = { status: 'active' };

    // Text search query matching title, skills, category, or company name
    if (q.trim()) {
      const escapedQ = q.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      
      // Match company IDs by name
      const matchingCompanies = await Company.find({ 
        name: { $regex: escapedQ, $options: 'i' } 
      }).select('_id').lean();
      
      const companyIds = matchingCompanies.map(c => c._id);

      queryObj.$or = [
        { title: { $regex: escapedQ, $options: 'i' } },
        { skills: { $in: [q.trim().toLowerCase()] } },
        { category: { $regex: escapedQ, $options: 'i' } },
        { company: { $in: companyIds } }
      ];
    }

    // City local filter
    if (city.trim()) {
      const cityList = city.split(',').map(c => c.trim());
      // Support regex array matches (e.g. Remote matching, Bangalore matching)
      queryObj['location.city'] = { 
        $in: cityList.map(c => new RegExp(`^${c}$`, 'i')) 
      };
    }

    // Category filter (supports multiple selections)
    if (category.trim()) {
      queryObj.category = { $in: category.split(',') };
    }

    // Work Mode (remote, hybrid, onsite)
    if (workType.trim()) {
      queryObj.workType = { $in: workType.split(',') };
    }

    // Job Type (full-time, part-time, contract, internship, freelance)
    if (jobType.trim()) {
      queryObj.jobType = { $in: jobType.split(',') };
    }

    // Min Salary filter (LPA)
    if (salaryMin > 0) {
      queryObj['salary.max'] = { $gte: salaryMin };
    }

    // Experience filter (max experience should be less than or equal to local YOE selection)
    if (experienceMax < 15) {
      queryObj['experience.min'] = { $lte: experienceMax };
    }

    // 3. Build mongoose sort object
    let sortObj = { createdAt: -1 }; // Default Date
    if (sort === 'relevance' && q.trim()) {
      // If q is provided and sorted by relevance, we sort by matching weight if we did text search, 
      // otherwise fallback to date. We'll fallback to date for regex compatibility.
      sortObj = { isFeatured: -1, createdAt: -1 };
    } else if (sort === 'salary') {
      sortObj = { 'salary.max': -1, createdAt: -1 };
    }

    // 4. Fetch count and documents
    totalCount = await Job.countDocuments(queryObj);
    
    // Query list
    const queryResult = await Job.find(queryObj)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate('company', 'name logo slug isVerified industry size')
      .lean();

    // Serialize MongoDB records for hydration safety
    jobs = JSON.parse(JSON.stringify(queryResult));

  } catch (error) {
    console.error('Error fetching jobs directory page:', error);
    jobs = [];
    totalCount = 0;
  }

  // Active query parameters list to prepopulate components
  const activeParams = {
    q,
    city,
    category,
    workType,
    jobType,
    salaryMin,
    experienceMax,
    sort,
    page,
    savedJobsList
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-canvas">
        <JobDirectoryClient 
          jobs={jobs} 
          totalCount={totalCount} 
          activeParams={activeParams} 
        />
      </main>
      <Footer />
    </>
  );
}
