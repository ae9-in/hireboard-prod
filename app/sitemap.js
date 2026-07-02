import connectDB from '@/lib/db';
import Job from '@/models/Job.model';

export default async function sitemap() {
  let jobUrls = [];

  try {
    await connectDB();
    
    const activeJobs = await Job.find({ status: 'active' })
      .select('slug updatedAt')
      .lean();

    jobUrls = activeJobs.map(job => ({
      url: `https://hireboard.in/jobs/${job.slug}`,
      lastModified: job.updatedAt || new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Sitemap DB query failed, outputting static routes only:', error);
  }

  const categories = [
    'software-engineering', 'data-science', 'product-management',
    'design', 'marketing', 'sales', 'operations'
  ];
  const cities = ['bangalore', 'mumbai', 'delhi', 'hyderabad', 'pune', 'chennai', 'remote'];

  const categoryUrls = categories.map(cat => ({
    url: `https://hireboard.in/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const locationUrls = cities.map(city => ({
    url: `https://hireboard.in/location/${city}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const intersectionUrls = [];
  for (const cat of categories) {
    for (const city of cities) {
      intersectionUrls.push({
        url: `https://hireboard.in/${cat}-jobs-in-${city}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9, // Highest priority keyword capture landing pages
      });
    }
  }

  return [
    { url: 'https://hireboard.in', lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: 'https://hireboard.in/jobs', lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: 'https://hireboard.in/companies', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    ...jobUrls,
    ...categoryUrls,
    ...locationUrls,
    ...intersectionUrls,
  ];
}
