import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job.model';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    await connectDB();

    const escapedQ = q.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    
    // Find active jobs matching query in title or skills
    const jobs = await Job.find({
      status: 'active',
      $or: [
        { title: { $regex: escapedQ, $options: 'i' } },
        { skills: { $in: [q.toLowerCase().trim()] } }
      ]
    })
      .select('title skills')
      .limit(15)
      .lean();

    const suggestionSet = new Set();
    const queryLower = q.toLowerCase().trim();

    jobs.forEach(job => {
      // 1. Check title
      if (job.title.toLowerCase().includes(queryLower)) {
        suggestionSet.add(job.title);
      }
      
      // 2. Check matching skills
      if (job.skills) {
        job.skills.forEach(skill => {
          if (skill.toLowerCase().includes(queryLower)) {
            suggestionSet.add(skill.charAt(0).toUpperCase() + skill.slice(1)); // Titlecase skill
          }
        });
      }
    });

    const suggestions = Array.from(suggestionSet).slice(0, 6);

    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error('Job Suggestions API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}
