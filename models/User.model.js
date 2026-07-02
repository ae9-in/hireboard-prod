import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, enum: ['seeker', 'employer', 'admin'], default: 'seeker' },
  avatar:       { type: String, default: null },  // Cloudinary URL or initials avatar placeholder
  phone:        { type: String, default: null },
  isVerified:   { type: Boolean, default: false },
  isActive:     { type: Boolean, default: true },
  
  // Seeker-specific profile details
  seekerProfile: {
    headline:     String,         // e.g. "React Developer | 3 YOE | Open to Work"
    summary:      String,
    resumeUrl:    String,         // Cloudinary URL
    skills:       [{ type: String, lowercase: true }],
    experience:   { type: Number, default: 0 },         // Years, 0 for fresher
    currentSalary: Number,        // in LPA
    expectedSalary: Number,       // in LPA
    noticePeriod: { type: String, enum: ['immediate', '15days', '30days', '60days', '90days'] },
    location:     String,
    preferredLocations: [String],
    savedJobs:          [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    workType:     [{ type: String, enum: ['remote', 'hybrid', 'onsite'] }],
    linkedinUrl:  String,
    portfolioUrl: String,
    githubUrl:    String,
    education: [{
      institution: String,
      degree:      String,
      field:       String,
      startYear:   Number,
      endYear:     Number
    }],
    experience_detail: [{
      company:    String,
      role:       String,
      startDate:  Date,
      endDate:    Date,
      isCurrent:  Boolean,
      description: String
    }],
  },

  // Employer-specific profile details
  employerProfile: {
    company:        { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    companyName:    { type: String, default: '' },
    companyWebsite: { type: String, default: '' },
    industry:       { type: String, default: '' },
    designation:    { type: String, default: '' },
    companyEmail:   { type: String, default: '' },
    companySize:    { type: String, default: '' },
    linkedin:       { type: String, default: '' },
    gst:            { type: String, default: '' },
    contactNumber:  { type: String, default: '' },
  },

  // Recruiter approval fields
  status:           { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  isApproved:       { type: Boolean, default: true },
  approvedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  approvedAt:       { type: Date, default: null },
  rejectionReason:  { type: String, default: null },

  // Auth tokens
  emailVerifyToken:  String,
  emailVerifyExpiry: Date,
  resetToken:        String,
  resetTokenExpiry:  Date,
  lastLogin:         Date,
}, { timestamps: true });

// Password compare method
userSchema.methods.comparePassword = async function(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Never return password or auth tokens in direct JSON serialization
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.emailVerifyToken;
  delete obj.emailVerifyExpiry;
  delete obj.resetToken;
  delete obj.resetTokenExpiry;
  return obj;
};

export default mongoose.models.User || mongoose.model('User', userSchema);
