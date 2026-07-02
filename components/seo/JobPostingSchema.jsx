import React from 'react';

/**
 * Structured Data component for Google Jobs listing.
 * Renders JSON-LD representation of the Job model.
 */
export default function JobPostingSchema({ job }) {
  if (!job) return null;

  const validThroughDate = job.applicationDeadline 
    ? new Date(job.applicationDeadline).toISOString()
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Default to 30 days in future

  // Convert LPA (Lakhs Per Annum) to raw Rupees for Google Schema standard
  const minAnnualSalary = job.salary.period === 'annual' ? job.salary.min * 100000 : job.salary.min * 12 * 1000;
  const maxAnnualSalary = job.salary.period === 'annual' ? job.salary.max * 100000 : job.salary.max * 12 * 1000;

  const schema = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "identifier": {
      "@type": "PropertyValue",
      "name": job.company?.name || 'Company',
      "value": job._id.toString()
    },
    "datePosted": job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString(),
    "validThrough": validThroughDate,
    // Map to Schema.org employment type standards
    "employmentType": job.jobType === 'full-time' 
      ? "FULL_TIME" 
      : job.jobType === 'part-time' 
        ? "PART_TIME" 
        : job.jobType === 'contract' 
          ? "CONTRACTOR" 
          : job.jobType === 'internship' 
            ? "INTERN" 
            : "OTHER",
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company?.name || 'Company',
      "sameAs": job.company?.website || 'https://hireboard.in',
      "logo": job.company?.logo || 'https://hireboard.in/og-default.png'
    },
    // Location parameters
    "jobLocation": job.workType === 'remote' ? {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "IN"
      }
    } : {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location?.city || 'Bangalore',
        "addressRegion": job.location?.state || 'Karnataka',
        "addressCountry": "IN"
      }
    },
    "jobLocationType": job.workType === 'remote' ? "TELECOMMUTE" : undefined,
    // Base salary standard
    "baseSalary": {
      "@type": "MonetaryAmount",
      "currency": job.salary?.currency || 'INR',
      "value": {
        "@type": "QuantitativeValue",
        "minValue": minAnnualSalary,
        "maxValue": maxAnnualSalary,
        "unitText": "YEAR"
      }
    },
    // Experience requirements
    "experienceRequirements": {
      "@type": "OccupationalExperienceRequirements",
      "monthsOfExperience": (job.experience?.min || 0) * 12
    },
    "skills": job.skills ? job.skills.join(', ') : '',
    "qualifications": job.requirements ? job.requirements.join(', ') : '',
    "url": `https://hireboard.in/jobs/${job.slug}`,
    "applicationContact": {
      "@type": "ContactPoint",
      "contactType": "HR",
      "url": `https://hireboard.in/jobs/${job.slug}#apply`
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
