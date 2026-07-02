import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
import Company from '@/models/Company.model';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// 1. Create company profile
export async function POST(request) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized credentials' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized credentials. Recruiter access only.' }, { status: 401 });
    }

    const body = await request.json();
    const { name, logo, website, industry, size, founded, description, culture, benefits, techStack, headquarters } = body;

    if (!name || !website || !industry || !size || !founded || !description) {
      return NextResponse.json({ error: 'Please provide all required fields' }, { status: 400 });
    }

    // Check if company already exists under this user
    const existingCompany = await Company.findOne({ owner: decoded.id }).lean();
    if (existingCompany) {
      return NextResponse.json({ error: 'You have already created a company profile' }, { status: 409 });
    }

    // Create Company
    const company = await Company.create({
      name,
      logo,
      website,
      industry,
      size,
      founded,
      description,
      culture,
      benefits,
      techStack,
      headquarters,
      isVerified: false,
      owner: decoded.id
    });

    // Update user employer profile with company ID
    await User.findByIdAndUpdate(decoded.id, {
      'employerProfile.company': company._id
    });

    return NextResponse.json({ success: true, company }, { status: 201 });

  } catch (error) {
    console.error('Create Company API Error:', error);
    return NextResponse.json({ error: 'Failed to create company profile' }, { status: 500 });
  }
}

// 2. Update company profile
export async function PUT(request) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized credentials' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized credentials. Recruiter access only.' }, { status: 401 });
    }

    const body = await request.json();
    
    // Find company owned by this user
    const company = await Company.findOne({ owner: decoded.id });
    if (!company) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }

    // Update company fields
    const fields = ['name', 'logo', 'website', 'industry', 'size', 'founded', 'description', 'culture', 'benefits', 'techStack', 'headquarters'];
    fields.forEach(field => {
      if (body[field] !== undefined) {
        company[field] = body[field];
      }
    });

    await company.save();

    return NextResponse.json({ success: true, company });

  } catch (error) {
    console.error('Update Company API Error:', error);
    return NextResponse.json({ error: 'Failed to update company profile' }, { status: 500 });
  }
}

// 3. Get all companies (for dropdowns / selectors)
export async function GET(request) {
  try {
    await connectDB();
    const companies = await Company.find({}).select('name _id').sort({ name: 1 }).lean();
    
    const serialized = companies.map(c => ({
      _id: c._id.toString(),
      name: c.name
    }));

    return NextResponse.json({ success: true, companies: serialized });
  } catch (error) {
    console.error('GET Companies list error:', error);
    return NextResponse.json({ error: 'Failed to retrieve companies list' }, { status: 500 });
  }
}

