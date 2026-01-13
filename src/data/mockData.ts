import { Job, Application, Employer } from '../types';

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Sales Associate',
    company: 'Sunrise Textiles',
    companyLogo: 'https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg?auto=compress&cs=tinysrgb&w=100&h=100',
    location: 'Bangalore',
    salary: '₹18,000 - ₹25,000',
    type: 'full-time',
    description: 'We are looking for a dynamic Sales Associate to join our retail team. The ideal candidate will have excellent communication skills and a passion for customer service.',
    requirements: ['Basic English communication', '1-2 years retail experience', 'Customer service skills'],
    responsibilities: ['Assist customers with product selection', 'Handle cash transactions', 'Maintain store cleanliness'],
    postedDate: new Date('2025-01-10'),
    status: 'live',
    skills: ['Customer Service', 'Sales', 'Communication'],
    experience: '1-2 years',
    applicantCount: 23
  },
  {
    id: '2',
    title: 'Factory Worker',
    company: 'Karnataka Manufacturing',
    location: 'Mysore',
    salary: '₹15,000 - ₹20,000',
    type: 'full-time',
    description: 'Join our manufacturing team as a Factory Worker. Training will be provided for the right candidate.',
    requirements: ['Physical fitness', 'Basic safety awareness', 'Willingness to learn'],
    responsibilities: ['Operate machinery', 'Quality control checks', 'Follow safety protocols'],
    postedDate: new Date('2025-01-09'),
    status: 'live',
    skills: ['Manufacturing', 'Quality Control', 'Safety'],
    experience: 'Entry level',
    applicantCount: 45
  },
  {
    id: '3',
    title: 'Delivery Executive',
    company: 'QuickDeliver',
    location: 'Hubli',
    salary: '₹12,000 + incentives',
    type: 'full-time',
    description: 'Looking for reliable delivery executives to join our growing logistics network. Own vehicle preferred.',
    requirements: ['Valid driving license', 'Own two-wheeler', 'Knowledge of local area'],
    responsibilities: ['Deliver packages on time', 'Collect payments', 'Maintain delivery records'],
    postedDate: new Date('2025-01-08'),
    status: 'live',
    skills: ['Driving', 'Time Management', 'Customer Service'],
    experience: 'Entry level',
    applicantCount: 67
  },
  {
    id: '4',
    title: 'Data Entry Operator',
    company: 'InfoTech Solutions',
    location: 'Mangalore',
    salary: '₹16,000 - ₹22,000',
    type: 'full-time',
    description: 'We need a detail-oriented Data Entry Operator to join our team. Basic computer skills required.',
    requirements: ['Basic computer skills', 'Typing speed 30+ WPM', 'Attention to detail'],
    responsibilities: ['Enter data accurately', 'Maintain databases', 'Generate reports'],
    postedDate: new Date('2025-01-07'),
    status: 'live',
    skills: ['Data Entry', 'MS Office', 'Typing'],
    experience: '0-1 years',
    applicantCount: 34
  }
];

export const mockApplications: Application[] = [
  {
    id: 'app-1',
    jobId: '1',
    applicantName: 'Rajesh Kumar',
    phone: '+91 9876543210',
    email: 'rajesh@email.com',
    skills: ['Customer Service', 'Sales', 'Hindi', 'English'],
    status: 'applied',
    appliedDate: new Date('2025-01-10'),
    method: 'voice',
    matchScore: 85,
    voiceTranscript: 'Hello, my name is Rajesh Kumar. I have worked in retail for 2 years. I can speak Hindi, English and basic Kannada. I am good with customers and enjoy helping them find what they need.'
  },
  {
    id: 'app-2',
    jobId: '1',
    applicantName: 'Priya Sharma',
    phone: '+91 9876543211',
    email: 'priya@email.com',
    resumeUrl: '/mock-resume.pdf',
    skills: ['Sales', 'Customer Service', 'Communication'],
    status: 'shortlisted',
    appliedDate: new Date('2025-01-09'),
    method: 'upload',
    matchScore: 92
  }
];

export const mockEmployers: Employer[] = [
  {
    id: 'emp-1',
    companyName: 'Sunrise Textiles',
    email: 'hr@sunrise.com',
    verified: true,
    activeJobs: 3,
    totalApplications: 45,
    joinedDate: new Date('2024-12-01')
  },
  {
    id: 'emp-2',
    companyName: 'Karnataka Manufacturing',
    email: 'jobs@karnataka-mfg.com',
    verified: true,
    activeJobs: 2,
    totalApplications: 67,
    joinedDate: new Date('2024-11-15')
  }
];