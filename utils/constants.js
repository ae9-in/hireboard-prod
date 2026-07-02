// List of standard Job Categories on HireBoard
export const CATEGORIES = [
  { id: 'software-engineering', name: 'Software Engineering', slug: 'software-engineering', icon: 'Code' },
  { id: 'data-science', name: 'Data Science & AI', slug: 'data-science', icon: 'Database' },
  { id: 'product-management', name: 'Product Management', slug: 'product-management', icon: 'Briefcase' },
  { id: 'design', name: 'Design & UX/UI', slug: 'design', icon: 'Palette' },
  { id: 'marketing', name: 'Marketing & Growth', slug: 'marketing', icon: 'Megaphone' },
  { id: 'sales', name: 'Sales & Business', slug: 'sales', icon: 'TrendingUp' },
  { id: 'operations', name: 'Operations & Support', slug: 'operations', icon: 'Cpu' },
  { id: 'finance', name: 'Finance & Accounts', slug: 'finance', icon: 'CircleDollarSign' },
  { id: 'hr', name: 'Human Resources', slug: 'hr', icon: 'Users' },
  { id: 'devops', name: 'DevOps & Cloud', slug: 'devops', icon: 'Terminal' },
  { id: 'cybersecurity', name: 'Cybersecurity', slug: 'cybersecurity', icon: 'ShieldAlert' },
  { id: 'business-development', name: 'Business Development', slug: 'business-development', icon: 'Handshake' },
  { id: 'other', name: 'Other Openings', slug: 'other', icon: 'Layers' },
];

// Top cities in India for local SEO and filtering
export const CITIES = [
  'Bangalore',
  'Mumbai',
  'Delhi NCR',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Remote'
];

// List of popular skills for autocomplete and search tags
export const POPULAR_SKILLS = [
  'React', 'Node.js', 'Express', 'Next.js', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript',
  'Python', 'Django', 'FastAPI', 'Go', 'Rust', 'Java', 'Spring Boot', 'C++', 'C#', '.NET',
  'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'DynamoDB', 'Cassandra',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'DevOps',
  'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'NLP', 'Computer Vision',
  'Figma', 'UI/UX Design', 'Product Design', 'Wireframing', 'Prototyping', 'Adobe XD',
  'SEO', 'Content Writing', 'Copywriting', 'Google Analytics', 'Digital Marketing', 'AdWords',
  'Sales', 'Lead Generation', 'Cold Calling', 'Negotiation', 'CRM', 'Salesforce',
  'Financial Modeling', 'Accounting', 'Taxation', 'Tally', 'Excel', 'Corporate Finance',
  'Talent Acquisition', 'Recruiting', 'Employee Engagement', 'HR Operations', 'Payroll',
  'Agile', 'Scrum', 'Product Roadmap', 'Product Analytics', 'Amplitude', 'Mixpanel',
  'Customer Support', 'Zendesk', 'Operations Management', 'Logistics', 'Supply Chain'
];

// Color palette for company avatar initialization
export const COMPANY_COLORS = [
  '#2563EB', // Cobalt Blue
  '#7C3AED', // Premium Violet
  '#059669', // Success Emerald
  '#D97706', // Warning Amber
  '#DC2626', // Danger Red
  '#0891B2', // Cyan
  '#9333EA', // Purple
  '#16A34A', // Green
  '#EA580C', // Orange
  '#0284C7'  // Sky Blue
];

/**
 * Helper to deterministically hash a company name to one of the COMPANY_COLORS
 * @param {String} name Company name
 * @returns {String} Hex code color
 */
export function getCompanyColor(name) {
  if (!name) return COMPANY_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COMPANY_COLORS.length;
  return COMPANY_COLORS[index];
}

/**
 * Helper to extract company initials from its name
 * @param {String} name Company name
 * @returns {String} 1-2 char initials
 */
export function getCompanyInitials(name) {
  if (!name) return 'HW';
  const cleanName = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const words = cleanName.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return words[0].substring(0, 2).toUpperCase();
}
