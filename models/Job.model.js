import mongoose from 'mongoose';
import slugify from 'slugify';

const jobSchema = new mongoose.Schema({
  // Core fields
  title:       { type: String, required: true, trim: true },
  slug:        { type: String, unique: true, index: true },  // SEO URL, auto-generated
  company:     { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  postedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Job details
  description:  { type: String, required: true },   // Rich text / markdown
  requirements: [String],                            // Bullet points
  responsibilities: [String],
  skills:       [{ type: String, lowercase: true }], // Indexed for search
  
  // Classification
  category:    {
    type: String,
    required: true,
    enum: [
      'software-engineering', 'data-science', 'product-management',
      'design', 'marketing', 'sales', 'operations', 'finance',
      'hr', 'customer-success', 'legal', 'content', 'devops',
      'cybersecurity', 'business-development', 'research', 'other'
    ]
  },
  subcategory: String,  // e.g., "frontend", "backend", "fullstack"
  
  // Work details
  workType:    { type: String, enum: ['remote', 'hybrid', 'onsite'], required: true },
  jobType:     { type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'], required: true },
  experience: {
    min: { type: Number, required: true },  // Years
    max: { type: Number, required: true },
  },
  
  // Location
  location: {
    city:    { type: String, required: true },
    state:   String,
    country: { type: String, default: 'India' },
  },
  
  // Salary — MANDATORY
  salary: {
    min:      { type: Number, required: true },  // in LPA (annual) or monthly stipend
    max:      { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    period:   { type: String, enum: ['annual', 'monthly'], default: 'annual' },
    isNegotiable: { type: Boolean, default: false },
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'active', 'paused', 'closed', 'rejected'],
    default: 'pending_review'
  },
  
  // Promotion
  isFeatured:  { type: Boolean, default: false },
  featuredUntil: Date,
  isUrgent:    { type: Boolean, default: false },
  
  // Application statistics
  applicationDeadline: Date,
  applicationCount:    { type: Number, default: 0 },
  viewCount:           { type: Number, default: 0 },
  
  // SEO fields (auto-generated + editable)
  metaTitle:       String,
  metaDescription: String,
  
  // Admin
  rejectionReason: String,
  reviewedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt:      Date,
  
}, { timestamps: true });

// --- INDEXES ---
// Full-text search on title, description, skills
jobSchema.index({ title: 'text', description: 'text', skills: 'text' }, {
  weights: { title: 10, skills: 5, description: 1 }
});
jobSchema.index({ 'location.city': 1, category: 1, status: 1 });
jobSchema.index({ status: 1, isFeatured: -1, createdAt: -1 });
jobSchema.index({ skills: 1, status: 1 });

// --- SLUG & META GENERATION ---
jobSchema.pre('save', async function() {
  if (this.isNew) {
    let companyName = '';
    if (this.company) {
      if (typeof this.company === 'object' && this.company.name) {
        companyName = this.company.name;
      } else {
        const comp = await mongoose.models.Company.findById(this.company).select('name').lean();
        if (comp) {
          companyName = comp.name;
        }
      }
    }

    const city = this.location.city || '';
    const base = `${this.title} ${companyName} ${city} ${new Date().getFullYear()}`;
    const rawSlug = slugify(base, { lower: true, strict: true });
    
    // Ensure uniqueness
    let slug = rawSlug;
    let count = 1;
    while (await mongoose.models.Job.findOne({ slug })) {
      slug = `${rawSlug}-${count++}`;
    }
    this.slug = slug;
    
    // Auto-generate metadata if not populated
    if (!this.metaTitle) {
      this.metaTitle = `${this.title} at ${companyName || 'Company'} | ${city} | HireBoard`;
    }
    if (!this.metaDescription) {
      const salStr = this.salary.period === 'annual' 
        ? `₹${this.salary.min}-${this.salary.max} LPA`
        : `₹${this.salary.min}-${this.salary.max}/mo`;
      this.metaDescription = `${this.title} job opening at ${companyName || 'Company'} in ${city}. Salary: ${salStr}. ${this.jobType}, ${this.workType}. Apply now on HireBoard.`;
    }
  }
});

export default mongoose.models.Job || mongoose.model('Job', jobSchema);
