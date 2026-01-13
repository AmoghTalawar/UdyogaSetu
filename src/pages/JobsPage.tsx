import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  Star, 
  Heart, 
  ArrowRight,
  Grid3X3, 
  List, 
  SlidersHorizontal,
  Zap,
  Building2,
  Users,
  TrendingUp,
  Eye,
  Bookmark,
  ChevronDown,
  X,
  Mic
} from 'lucide-react';
import HeaderSimple from '../components/common/HeaderSimple';
import Footer from '../components/common/Footer';
import ApplyModal from '../components/apply/ApplyModal';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import VoiceSearchModal from '../components/voice/VoiceSearchModal';
import { JobService, Job } from '../services/jobService';
import { useLanguage } from '../contexts/LanguageContext';
import { testCompanyColumnsExist } from '../utils/addCompanyColumns';

interface JobsPageProps {
  onNavigate: (page: string) => void;
}

const JobsPage: React.FC<JobsPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const [filters, setFilters] = useState({
    jobType: '',
    experience: '',
    salaryRange: '',
    company: '',
    remote: false,
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        // First, test if company columns exist
        const columnTest = await testCompanyColumnsExist();
        if (!columnTest.exist) {
          console.error('🚨 Missing database columns:', columnTest.error);
          console.log('🔧 The company_name and company_about columns are missing from the jobs table.');
          console.log('🔧 Please run the SQL script in add_company_columns.sql to add them.');
        }
        
        const fetchedJobs = await JobService.getActiveJobs();
        if (fetchedJobs.length > 0) {
          console.log('Fetched jobs from database:', fetchedJobs);
          console.log('First job company data:', {
            company_name: fetchedJobs[0].company_name,
            company_about: fetchedJobs[0].company_about,
            company_id: fetchedJobs[0].company_id
          });
          setJobs(fetchedJobs);
          setFilteredJobs(fetchedJobs);
        } else {
          // Use comprehensive mock data if no jobs from database
          const mockJobs: Job[] = [
            {
              id: '1',
              title: 'Senior Software Engineer',
              company: 'Google India',
              company_name: 'Google India',
              company_about: 'Leading technology company focused on organizing the world\'s information and making it universally accessible. We build products that help billions of users connect, discover, and get things done.',
              location: 'Bangalore, Karnataka',
              job_type: 'full-time',
              salary_min: 2500000,
              salary_max: 4000000,
              description: 'Join our team to build next-generation cloud infrastructure and scalable systems that serve billions of users worldwide.',
              requirements: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
              benefits: ['Health Insurance', 'Stock Options', 'Flexible Hours', 'Learning Budget'],
              experience_level: 'senior',
              skills: ['JavaScript', 'React', 'Node.js', 'System Design'],
              contact_email: 'careers@google.com',
              company_id: 'google',
              status: 'active',
              created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
              video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
            },
            {
              id: '2',
              title: 'Data Scientist',
              company: 'Microsoft',
              company_name: 'Microsoft',
              company_about: 'Global technology leader empowering every person and organization on the planet to achieve more through innovative software, services, and devices.',
              location: 'Hyderabad, Telangana',
              job_type: 'full-time',
              salary_min: 1800000,
              salary_max: 2800000,
              description: 'Work on cutting-edge AI and machine learning projects that impact millions of users across Microsoft products.',
              requirements: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Azure'],
              benefits: ['Health Insurance', 'Stock Options', 'Remote Work', 'Professional Development'],
              experience_level: 'mid',
              skills: ['Python', 'ML/AI', 'Data Analysis', 'Statistics'],
              contact_email: 'jobs@microsoft.com',
              company_id: 'microsoft',
              status: 'active',
              created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
              video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
            },
            {
              id: '3',
              title: 'Frontend Developer',
              company: 'Flipkart',
              company_name: 'Flipkart',
              company_about: 'India\'s leading e-commerce marketplace offering millions of products with the best prices and fast delivery across the country.',
              location: 'Bangalore, Karnataka',
              job_type: 'full-time',
              salary_min: 1200000,
              salary_max: 2000000,
              description: 'Build responsive and intuitive user interfaces for India\'s leading e-commerce platform.',
              requirements: ['React', 'JavaScript', 'CSS3', 'HTML5', 'Redux'],
              benefits: ['Health Insurance', 'ESOP', 'Flexible Hours', 'Learning Budget'],
              experience_level: 'mid',
              skills: ['React', 'JavaScript', 'CSS', 'UI/UX'],
              contact_email: 'careers@flipkart.com',
              company_id: 'flipkart',
              status: 'active',
              created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
              video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
            },
            {
              id: '4',
              title: 'Product Manager',
              company: 'Zomato',
              company_name: 'Zomato',
              company_about: 'India\'s largest food delivery and restaurant discovery platform connecting millions of customers with their favorite restaurants.',
              location: 'Gurugram, Haryana',
              job_type: 'full-time',
              salary_min: 2000000,
              salary_max: 3500000,
              description: 'Lead product strategy and execution for our food delivery platform serving 200M+ users.',
              requirements: ['Product Strategy', 'Data Analysis', 'User Research', 'Agile', 'SQL'],
              benefits: ['Health Insurance', 'Stock Options', 'Meal Credits', 'Growth Opportunities'],
              experience_level: 'senior',
              skills: ['Product Management', 'Strategy', 'Analytics', 'Leadership'],
              contact_email: 'careers@zomato.com',
              company_id: 'zomato',
              status: 'active',
              created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
              video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
            },
            {
              id: '4',
              title: 'Product Manager',
              company: 'Zomato',
              company_name: 'Zomato',
              company_about: 'India\'s largest food delivery and restaurant discovery platform connecting millions of customers with their favorite restaurants.',
              location: 'Gurugram, Haryana',
              job_type: 'full-time',
              salary_min: 2000000,
              salary_max: 3500000,
              description: 'Lead product strategy and execution for our food delivery platform serving 200M+ users.',
              requirements: ['Product Strategy', 'Data Analysis', 'User Research', 'Agile', 'SQL'],
              benefits: ['Health Insurance', 'Stock Options', 'Meal Credits', 'Growth Opportunities'],
              experience_level: 'senior',
              skills: ['Product Management', 'Strategy', 'Analytics', 'Leadership'],
              contact_email: 'careers@zomato.com',
              company_id: 'zomato',
              status: 'active',
              created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '5',
              title: 'DevOps Engineer',
              company: 'Paytm',
              company_name: 'Paytm',
              company_about: 'India\'s leading digital payments and financial services company enabling seamless money transfers, bill payments, and e-commerce.',
              location: 'Noida, Uttar Pradesh',
              job_type: 'full-time',
              salary_min: 1500000,
              salary_max: 2500000,
              description: 'Build and maintain scalable infrastructure for India\'s largest fintech platform.',
              requirements: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
              benefits: ['Health Insurance', 'Stock Options', 'Flexible Hours', 'Tech Allowance'],
              experience_level: 'mid',
              skills: ['DevOps', 'Cloud', 'Infrastructure', 'Automation'],
              contact_email: 'careers@paytm.com',
              company_id: 'paytm',
              status: 'active',
              created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '6',
              title: 'UX Designer',
              company: 'Swiggy',
              company_name: 'Swiggy',
              company_about: 'India\'s leading on-demand convenience platform delivering food, groceries, and essentials to millions of customers across hundreds of cities.',
              location: 'Bangalore, Karnataka',
              job_type: 'full-time',
              salary_min: 1000000,
              salary_max: 1800000,
              description: 'Design delightful user experiences for millions of food delivery customers.',
              requirements: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'HTML/CSS'],
              benefits: ['Health Insurance', 'ESOP', 'Design Tools', 'Flexible Work'],
              experience_level: 'mid',
              skills: ['UX Design', 'UI Design', 'Research', 'Prototyping'],
              contact_email: 'careers@swiggy.com',
              company_id: 'swiggy',
              status: 'active',
              created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          setJobs(mockJobs);
          setFilteredJobs(mockJobs);
        }
      } catch (error) {
        console.error('Error loading jobs:', error);
        // Still show mock data on error
          const mockJobs: Job[] = [
            {
              id: '1',
              title: 'Software Engineer',
              company: 'Tech Solutions Inc.',
              company_name: 'Tech Solutions Inc.',
              company_about: 'Leading technology solutions provider focused on creating innovative software products for businesses worldwide.',
              location: 'Bangalore, Karnataka',
              job_type: 'full-time',
              salary_min: 800000,
              salary_max: 1200000,
              description: 'We are looking for a skilled software engineer to join our team.',
              requirements: ['React', 'TypeScript', 'Node.js'],
              benefits: ['Health Insurance', 'Flexible Hours'],
              experience_level: 'mid',
              skills: ['JavaScript', 'React', 'Node.js'],
              contact_email: 'hr@techsolutions.com',
              company_id: 'company1',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              application_deadline: null,
              salary_currency: 'INR'
            }
          ];
        setJobs(mockJobs);
        setFilteredJobs(mockJobs);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);

  useEffect(() => {
    let filtered = [...jobs];

    // Apply search filters
    if (searchQuery.trim()) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.company_name || job.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (locationQuery.trim()) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(locationQuery.toLowerCase())
      );
    }

    // Apply advanced filters
    if (filters.jobType) {
      filtered = filtered.filter(job => job.job_type === filters.jobType);
    }

    if (filters.experience) {
      filtered = filtered.filter(job => job.experience_level === filters.experience);
    }

    if (filters.company) {
      filtered = filtered.filter(job => 
        (job.company_name || job.company || '').toLowerCase().includes(filters.company.toLowerCase())
      );
    }

    if (filters.salaryRange) {
      const [min, max] = filters.salaryRange.split('-').map(s => parseInt(s.replace(/[^\d]/g, '')));
      if (min) {
        filtered = filtered.filter(job => job.salary_min >= min * 100000);
      }
      if (max) {
        filtered = filtered.filter(job => job.salary_max <= max * 100000);
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'salary_high':
        filtered.sort((a, b) => b.salary_max - a.salary_max);
        break;
      case 'salary_low':
        filtered.sort((a, b) => a.salary_min - b.salary_min);
        break;
      case 'relevance':
      default:
        // Keep original order for relevance
        break;
    }

    setFilteredJobs(filtered);
  }, [jobs, filters, sortBy, searchQuery, locationQuery]);

  const handleApply = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setIsApplyModalOpen(true);
    }
  };

  const handleViewJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      console.log('Viewing job details:', {
        id: job.id,
        title: job.title,
        company_name: job.company_name,
        company_about: job.company_about,
        company_id: job.company_id,
        video_url: job.video_url,
        hasVideo: !!job.video_url
      });
      setViewingJob(job);
      setIsJobDetailOpen(true);
    }
  };

  const handleSave = (jobId: string) => {
    const newSavedJobs = new Set(savedJobs);
    if (savedJobs.has(jobId)) {
      newSavedJobs.delete(jobId);
    } else {
      newSavedJobs.add(jobId);
    }
    setSavedJobs(newSavedJobs);
  };

  const formatSalary = (min: number, max: number) => {
    const formatAmount = (amount: number) => {
      if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
      if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
      return `₹${amount.toLocaleString()}`;
    };
    return `${formatAmount(min)} - ${formatAmount(max)}`;
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getExperienceLabel = (exp: string) => {
    switch (exp) {
      case 'entry': return 'Entry Level (0-2 years)';
      case 'mid': return 'Mid Level (2-5 years)';
      case 'senior': return 'Senior Level (5+ years)';
      default: return exp;
    }
  };

  const getCompanyLogo = (company: string) => {
    const logos: { [key: string]: string } = {
      'Google India': 'https://cdn.worldvectorlogo.com/logos/google-2015.svg',
      'Microsoft': 'https://cdn.worldvectorlogo.com/logos/microsoft-5.svg',
      'Flipkart': 'https://cdn.worldvectorlogo.com/logos/flipkart-1.svg',
      'Zomato': 'https://cdn.worldvectorlogo.com/logos/zomato-logo.svg',
      'Paytm': 'https://cdn.worldvectorlogo.com/logos/paytm-2.svg',
      'Swiggy': 'https://cdn.worldvectorlogo.com/logos/swiggy-1.svg',
    };
    return logos[company] || `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=3b82f6&color=ffffff&size=40`;
  };

  const handleApplicationSubmit = (applicationData: any) => {
    // Check if we have a valid resume file
    if (applicationData.method === 'upload' && !applicationData.hasValidResume) {
      alert('Error: No resume file provided. Please upload a resume or use voice application.');
      return;
    }
    
    // Simulate application submission
    console.log('Application submitted:', {
      ...applicationData,
      resumeFileName: applicationData.resumeFile?.name || 'No file',
      fileSize: applicationData.resumeFile?.size || 0
    });
    
    // Show success message
    alert(`Application submitted successfully for ${applicationData.method} method!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
      <HeaderSimple onNavigate={onNavigate} />
      
      {/* Language Switcher - Floating in top right */}
      <div className="fixed top-4 right-4 z-40">
        <LanguageSwitcher variant="header" className="shadow-lg" />
      </div>
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute top-10 left-10 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
            <div className="absolute top-32 right-20 w-2 h-2 bg-white/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-white/20 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className={`text-center transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('jobs.title')}
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              {t('jobs.subtitle')}
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder={t('jobs.search')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-16 py-4 text-lg border-0 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                    {/* Voice Search Button */}
                    <button
                      onClick={() => setIsVoiceSearchOpen(true)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                      title={t('apply.voice')}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={t('jobs.location')}
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-lg border-0 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                  </div>
                  
                  <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                    <Search className="w-5 h-5" />
                    <span>{t('search.button')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats Banner */}
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 transform transition-all duration-1000 delay-200 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-blue-200 shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{filteredJobs.length}</p>
                  <p className="text-sm text-gray-600">{t('jobs.activeJobs')}</p>
                </div>
              </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-green-200 shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{[...new Set(jobs.map(j => j.company_name || j.company))].length}+</p>
                  <p className="text-sm text-gray-600">{t('jobs.companies')}</p>
                </div>
              </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-orange-200 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">85%</p>
                  <p className="text-sm text-gray-600">{t('jobs.successRate')}</p>
                </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-purple-200 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">2.3K</p>
                  <p className="text-sm text-gray-600">{t('jobs.thisWeek')}</p>
                </div>
            </div>
          </div>
        </div>

        {/* Job Categories */}
        <div className={`mb-8 transform transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
              <span>{t('jobs.browseCategory')}</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: 'Technology', icon: '💻', count: jobs.filter(j => j.title.toLowerCase().includes('engineer') || j.title.toLowerCase().includes('developer')).length },
                { name: 'Design', icon: '🎨', count: jobs.filter(j => j.title.toLowerCase().includes('design')).length },
                { name: 'Marketing', icon: '📈', count: jobs.filter(j => j.title.toLowerCase().includes('marketing')).length },
                { name: 'Finance', icon: '💰', count: jobs.filter(j => j.title.toLowerCase().includes('finance') || j.title.toLowerCase().includes('analyst')).length },
                { name: 'Sales', icon: '🤝', count: jobs.filter(j => j.title.toLowerCase().includes('sales')).length },
                { name: 'Operations', icon: '⚙️', count: jobs.filter(j => j.title.toLowerCase().includes('operations') || j.title.toLowerCase().includes('manager')).length },
              ].map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSearchQuery(category.name)}
                  className="group p-4 bg-white/50 hover:bg-white/80 rounded-xl border border-gray-200 hover:border-indigo-300 transition-all hover:shadow-lg"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600">{category.name}</div>
                    <div className="text-xs text-gray-500">{category.count || 0} jobs</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Controls Bar */}
        <div className={`bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 p-6 mb-8 transform transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Results Summary */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900">
                  {filteredJobs.length} {t('jobs.found')}
                </span>
              </div>
              {(searchQuery || locationQuery) && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">for</span>
                  {searchQuery && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {searchQuery}
                    </span>
                  )}
                  {locationQuery && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      📍 {locationQuery}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  isFilterOpen 
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{t('jobs.filters')}</span>
                {Object.values(filters).some(v => v) && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </button>
              
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-2 pr-10 font-medium text-gray-700 hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="newest">{t('jobs.sort.latest')}</option>
                  <option value="relevance">{t('jobs.sort.relevant')}</option>
                  <option value="salary_high">{t('jobs.sort.salaryHigh')}</option>
                  <option value="salary_low">{t('jobs.sort.salaryLow')}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-md text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-white shadow-md text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Advanced Filters Panel */}
          {isFilterOpen && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                  <select
                    value={filters.jobType}
                    onChange={(e) => setFilters({...filters, jobType: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                  <select
                    value={filters.experience}
                    onChange={(e) => setFilters({...filters, experience: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Levels</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                  <select
                    value={filters.salaryRange}
                    onChange={(e) => setFilters({...filters, salaryRange: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any Salary</option>
                    <option value="5-10">5-10 LPA</option>
                    <option value="10-20">10-20 LPA</option>
                    <option value="20-30">20-30 LPA</option>
                    <option value="30+">30+ LPA</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    placeholder="Filter by company"
                    value={filters.company}
                    onChange={(e) => setFilters({...filters, company: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {Object.values(filters).some(v => v) && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setFilters({ jobType: '', experience: '', salaryRange: '', company: '', remote: false })}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear Filters</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Featured Jobs Section */}
        {!searchQuery && !locationQuery && !Object.values(filters).some(v => v) && (
          <div className={`mb-8 transform transition-all duration-1000 delay-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                  <span>🔥 {t('jobs.featuredJobs')}</span>
                </h3>
                <button 
                  onClick={() => setSortBy('salary_high')}
                  className="text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1"
                >
                  <span>{t('jobs.viewAll')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.slice(0, 3).map((job, index) => (
                  <div key={job.id} className="bg-white rounded-xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={getCompanyLogo(job.company_name || job.company || 'Company')}
                            alt={job.company_name || job.company || 'Company'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{job.title}</h4>
                          <p className="text-sm text-gray-600">{job.company_name || job.company || 'Company Name'}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        HOT
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-green-600 font-semibold">
                        {formatSalary(job.salary_min, job.salary_max)}
                      </span>
                      <span className="text-gray-500 text-sm">{job.location}</span>
                    </div>
                    
                    <button
                      onClick={() => handleApply(job.id)}
                      className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      {t('jobs.quickApply')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Salary Insights */}
        {!searchQuery && !locationQuery && (
          <div className={`mb-8 transform transition-all duration-1000 delay-800 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                <span>💰 {t('jobs.salaryInsights')}</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('jobs.averageSalary')}</p>
                      <p className="text-xl font-bold text-green-600">₹18.5L</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{t('jobs.acrossPositions')}</p>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('jobs.topPaying')}</p>
                      <p className="text-xl font-bold text-blue-600">₹40L+</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{t('jobs.seniorTechRoles')}</p>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('jobs.entryLevel')}</p>
                      <p className="text-xl font-bold text-orange-600">₹8-12L</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{t('jobs.freshGraduates')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Jobs Grid */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
              </div>
              <p className="mt-4 text-lg font-medium text-gray-600">Finding perfect jobs for you...</p>
              <p className="text-sm text-gray-400">This won't take long</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('jobs.noJobsFound')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('jobs.noJobsDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setLocationQuery('');
                    setFilters({ jobType: '', experience: '', salaryRange: '', company: '', remote: false });
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  {t('jobs.clearFilters')}
                </button>
                <button
                  onClick={() => onNavigate('home')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  {t('jobs.backToHome')}
                </button>
              </div>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredJobs.map((job, index) => (
                <div
                  key={job.id}
                  className={`transform transition-all duration-500 hover:scale-105 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  {/* Custom Job Card */}
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 overflow-hidden group">
                    {/* Card Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={getCompanyLogo(job.company_name || job.company || 'Company')}
                              alt={job.company_name || job.company || 'Company'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {job.title}
                            </h3>
                            <p className="text-gray-600 font-medium">{job.company_name || job.company || 'Company Name'}</p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleSave(job.id)}
                          className={`p-2 rounded-full transition-all ${
                            savedJobs.has(job.id)
                              ? 'text-red-500 bg-red-50 hover:bg-red-100'
                              : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${savedJobs.has(job.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      
                      {/* Job Details */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Briefcase className="w-4 h-4" />
                            <span className="capitalize">{job.job_type?.replace('-', ' ') || 'Not specified'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{getTimeAgo(job.created_at)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <span className="font-semibold text-green-600">
                              {formatSalary(job.salary_min, job.salary_max)}
                            </span>
                          </div>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {getExperienceLabel(job.experience_level)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Skills */}
                    <div className="px-6 pb-4">
                      <div className="flex flex-wrap gap-2">
                        {(job.skills || []).slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {(job.skills || []).length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs">
                            +{(job.skills || []).length - 4} more
                          </span>
                        )}
                      </div>
                    </div>


                    
                    {/* Description */}

                    
                    
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleApply(job.id)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                          <Zap className="w-4 h-4" />
                          <span>{t('jobs.quickApply')}</span>
                        </button>
                        <button 
                          onClick={() => handleViewJob(job.id)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors flex items-center space-x-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>{t('jobs.view')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Company Spotlight */}
        {!searchQuery && !locationQuery && (
          <div className={`mt-12 mb-8 transform transition-all duration-1000 delay-900 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 border border-indigo-200 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                <span>🏢 {t('jobs.topHiringCompanies')}</span>
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {[...new Set(jobs.map(j => j.company_name || j.company || 'Company'))].slice(0, 6).map((company) => {
                  const companyJobs = jobs.filter(j => (j.company_name || j.company) === company);
                  return (
                    <div key={company} className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all cursor-pointer">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl overflow-hidden bg-gray-100">
                          <img
                            src={getCompanyLogo(company)}
                            alt={company}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            onClick={() => setFilters({...filters, company: company})}
                          />
                        </div>
                        <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1 text-sm">
                          {company}
                        </h4>
                        <p className="text-xs text-gray-500">{companyJobs.length} {t('jobs.openPositions')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 text-center">
                <button 
                  onClick={() => setSortBy('newest')}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium flex items-center space-x-2 mx-auto"
                >
                  <Building2 className="w-4 h-4" />
                  <span>{t('jobs.viewAllCompanies')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Job Search Tips & Quick Actions */}
        <div className={`mt-8 mb-8 transform transition-all duration-1000 delay-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Job Search Tips */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                <span>💡 {t('jobs.jobSearchTips')}</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-600 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t('jobs.useVoiceApps')}</p>
                    <p className="text-xs text-gray-600">{t('jobs.voiceAppDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-600 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t('jobs.filterBySalary')}</p>
                    <p className="text-xs text-gray-600">{t('jobs.filterSalaryDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-600 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t('jobs.saveInteresting')}</p>
                    <p className="text-xs text-gray-600">{t('jobs.saveJobDesc')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <span className="w-2 h-6 bg-rose-500 rounded-full"></span>
                <span>⚡ {t('jobs.quickActions')}</span>
              </h3>
              <div className="space-y-4">
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setLocationQuery('');
                    setSortBy('salary_high');
                  }}
                  className="w-full flex items-center space-x-3 p-4 bg-white/70 hover:bg-white rounded-xl transition-all group"
                >
                  <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center group-hover:bg-rose-200">
                    <TrendingUp className="w-5 h-5 text-rose-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">{t('jobs.highestPaying')}</p>
                    <p className="text-xs text-gray-600">{t('jobs.viewSalarySorted')}</p>
                  </div>
                </button>
                
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setLocationQuery('');
                    setSortBy('newest');
                  }}
                  className="w-full flex items-center space-x-3 p-4 bg-white/70 hover:bg-white rounded-xl transition-all group"
                >
                  <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center group-hover:bg-rose-200">
                    <Clock className="w-5 h-5 text-rose-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">{t('jobs.latestJobs')}</p>
                    <p className="text-xs text-gray-600">{t('jobs.freshPostings')}</p>
                  </div>
                </button>
                
                <button 
                  onClick={() => setFilters({...filters, experience: 'entry'})}
                  className="w-full flex items-center space-x-3 p-4 bg-white/70 hover:bg-white rounded-xl transition-all group"
                >
                  <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center group-hover:bg-rose-200">
                    <Users className="w-5 h-5 text-rose-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">{t('jobs.entryLevelJobs')}</p>
                    <p className="text-xs text-gray-600">{t('jobs.perfectForGraduates')}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Detail Modal */}
      {viewingJob && (
        <div className={`fixed inset-0 z-50 overflow-y-auto transition-all duration-300 ${
          isJobDetailOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
              onClick={() => setIsJobDetailOpen(false)}
            ></div>
            
            <div className={`relative inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl ${
              isJobDetailOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}>
              {/* Modal Header */}
              <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-8">
                <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                <button
                  onClick={() => setIsJobDetailOpen(false)}
                  className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="relative flex items-start space-x-6">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/20 backdrop-blur-sm flex-shrink-0 border-2 border-white/30">
                    <img
                      src={getCompanyLogo(viewingJob.company_name || viewingJob.company || 'Company')}
                      alt={viewingJob.company_name || viewingJob.company || 'Company'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 text-white">
                    <h1 className="text-3xl font-bold mb-2">{viewingJob.title}</h1>
                    <p className="text-xl text-blue-100 mb-4">{viewingJob.company_name || viewingJob.company || 'Company Name'}</p>
                    <div className="flex items-center space-x-6 text-blue-100">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5" />
                        <span>{viewingJob.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-5 h-5" />
                        <span className="capitalize">{viewingJob.job_type?.replace('-', ' ') || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5" />
                        <span>Posted {getTimeAgo(viewingJob.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="max-h-[70vh] overflow-y-auto">
                <div className="px-8 py-6 space-y-8">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-600">{t('jobs.salaryRange')}</p>
                          <p className="text-lg font-bold text-green-700">
                            {formatSalary(viewingJob.salary_min, viewingJob.salary_max)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-600">{t('jobs.experienceLevel.' + viewingJob.experience_level, 'Experience Level')}</p>
                          <p className="text-lg font-bold text-blue-700">
                            {getExperienceLabel(viewingJob.experience_level)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-6 border border-purple-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-purple-600">{t('jobs.jobType', 'Job Type')}</p>
                          <p className="text-lg font-bold text-purple-700 capitalize">
                            {t('jobs.' + (viewingJob.job_type?.replace('-', '') || 'remote'), viewingJob.job_type?.replace('-', ' ') || 'Not specified')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Job Description */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                      <span>{t('jobs.jobDescription')}</span>
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {viewingJob.description}
                    </p>
                  </div>

                  {/* Job Video */}
                  {(() => {
                    console.log('Video section check:', {
                      video_url: viewingJob.video_url,
                      hasVideo: !!viewingJob.video_url,
                      jobId: viewingJob.id,
                      jobTitle: viewingJob.title
                    });
                    return viewingJob.video_url && (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                          <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                          <span>🎥 Company Video</span>
                        </h3>
                        <div className="bg-white rounded-xl p-4 shadow-lg">
                          <video
                            controls
                            className="w-full rounded-lg shadow-md"
                            poster={getCompanyLogo(viewingJob.company_name || viewingJob.company || 'Company')}
                          >
                            <source src={viewingJob.video_url} type="video/mp4" />
                            <source src={viewingJob.video_url} type="video/webm" />
                            <source src={viewingJob.video_url} type="video/ogg" />
                            Your browser does not support the video tag.
                          </video>
                          <p className="text-sm text-gray-600 mt-3 text-center">
                            Learn more about {viewingJob.company_name || viewingJob.company || 'the company'} and the work culture
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Requirements */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
                      <span>{t('jobs.requirements')}</span>
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(viewingJob.requirements || []).map((req, index) => (
                          <li key={index} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                            <span className="text-gray-700">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Skills */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                      <span>{t('jobs.skills')}</span>
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {(viewingJob.skills || []).map((skill, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-xl font-medium hover:bg-indigo-200 transition-colors"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Benefits */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                      <span>{t('jobs.benefits')}</span>
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(viewingJob.benefits || []).map((benefit, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Star className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-gray-700 font-medium">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Company Info */}
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                      <span>{t('jobs.aboutCompany')} {viewingJob.company_name || viewingJob.company || 'Company'}</span>
                    </h3>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-lg">
                        <img
                          src={getCompanyLogo(viewingJob.company_name || viewingJob.company || 'Company')}
                          alt={viewingJob.company_name || viewingJob.company || 'Company'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{viewingJob.company_name || viewingJob.company || 'Company Name'}</h4>
                        <p className="text-gray-600">Technology Company</p>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {viewingJob.company_about && viewingJob.company_about.trim() 
                        ? viewingJob.company_about 
                        : 'Join one of the world\'s most innovative companies and work on products that impact billions of users globally. We offer competitive compensation, excellent benefits, and opportunities for growth and learning.'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleSave(viewingJob.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      savedJobs.has(viewingJob.id)
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${savedJobs.has(viewingJob.id) ? 'fill-current' : ''}`} />
                    <span>{savedJobs.has(viewingJob.id) ? t('jobs.saved') : t('jobs.saveJob')}</span>
                  </button>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Eye className="w-4 h-4" />
                    <span>{t('jobs.jobId')}: {viewingJob.id}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsJobDetailOpen(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
                  >
                    {t('jobs.close')}
                  </button>
                  <button
                    onClick={() => {
                      setIsJobDetailOpen(false);
                      handleApply(viewingJob.id);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <Zap className="w-5 h-5" />
                    <span>{t('jobs.applyNow')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {selectedJob && (
        <ApplyModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          job={selectedJob}
          onSubmit={handleApplicationSubmit}
        />
      )}

      {/* Voice Search Modal */}
      <VoiceSearchModal
        isOpen={isVoiceSearchOpen}
        onClose={() => setIsVoiceSearchOpen(false)}
        onSearchComplete={(query, language) => {
          setSearchQuery(query);
          // Optionally filter by location if the query contains location info
          const locationKeywords = ['in ', 'at ', 'bangalore', 'mumbai', 'delhi', 'chennai', 'hyderabad', 'pune', 'kolkata'];
          const lowerQuery = query.toLowerCase();
          for (const keyword of locationKeywords) {
            if (lowerQuery.includes(keyword)) {
              const parts = lowerQuery.split(keyword);
              if (parts.length > 1) {
                const location = parts[parts.length - 1].trim();
                if (location) {
                  setLocationQuery(location);
                  break;
                }
              }
            }
          }
        }}
      />

      <Footer />
    </div>
  );
};

export default JobsPage;