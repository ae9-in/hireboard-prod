import mongoose from 'mongoose';
import slugify from 'slugify';

const companySchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, unique: true, index: true },
  logo:        { type: String, default: null },       // Cloudinary URL or initials avatar placeholder
  website:     String,
  industry:    String,
  size:        { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'] },
  founded:     Number,
  description: String,
  culture:     String,       // Rich text about work culture
  benefits:    [String],     // ["Health insurance", "Remote work", "ESOP"]
  techStack:   [String],     // ["React", "Node.js", "AWS"]
  
  headquarters: {
    city:    String,
    state:   String,
    country: { type: String, default: 'India' },
  },
  
  socialLinks: {
    linkedin:  String,
    twitter:   String,
    glassdoor: String,
  },
  
  isVerified:  { type: Boolean, default: false },  // Blue checkmark
  rating:      { type: Number, min: 0, max: 5, default: 0 },
  reviewCount: { type: Number, default: 0 },
  activeJobCount: { type: Number, default: 0 },
  
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
}, { timestamps: true });

companySchema.index({ name: 'text' });

companySchema.pre('save', async function() {
  if (this.isNew || this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

export default mongoose.models.Company || mongoose.model('Company', companySchema);
