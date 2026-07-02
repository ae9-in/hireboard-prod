import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  job:       { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company:   { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  
  // Application data
  resumeUrl:    { type: String, required: true },   // Snapshot of resume at application time
  coverLetter:  String,   // Optional
  answers:      [{        // Custom questions answered during apply
    question: String,
    answer:   String
  }],
  
  // Status pipeline
  status: {
    type: String,
    enum: ['applied', 'viewed', 'shortlisted', 'interview_scheduled', 'offer', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  
  // Employer actions
  employerNote:   String,   // Internal note, not visible to applicant
  statusHistory: [{
    status:    String,
    changedAt: { type: Date, default: Date.now },
    note:      String
  }],
  
  // Seeker visibility
  isWithdrawn:   { type: Boolean, default: false },
  withdrawnAt:   Date,
  
  // Source tracking (SEO insight)
  source: { type: String, enum: ['direct', 'google', 'linkedin', 'referral', 'other'], default: 'direct' },
  
}, { timestamps: true });

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true }); // One application per job
applicationSchema.index({ applicant: 1, createdAt: -1 });
applicationSchema.index({ job: 1, status: 1 });

export default mongoose.models.Application || mongoose.model('Application', applicationSchema);
