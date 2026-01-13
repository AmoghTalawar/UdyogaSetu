import React from 'react';
import { MapPin, Clock, Bookmark, User } from 'lucide-react';
import { Job } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
  onSave?: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply, onSave }) => {
  const { t } = useLanguage();

  const handleApply = () => {
    if (onApply) {
      onApply(job.id);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(job.id);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-[#0B63E5]/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-bold text-lg">C</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
            <p className="text-[#6B7280] font-medium">{job.company_name || 'Company'}</p>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          className="text-[#6B7280] hover:text-[#0B63E5] transition-colors"
          aria-label={t('jobs.save')}
        >
          <Bookmark className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280] mb-4">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{job.location}</span>
        </div>
        
        {(job.salary_min || job.salary_max) && (
          <div className="font-medium text-[#16A34A]">
            {job.salary_min && job.salary_max ? 
              `₹${job.salary_min.toLocaleString()} - ₹${job.salary_max.toLocaleString()}` :
              job.salary_min ? `₹${job.salary_min.toLocaleString()}+` : 
              `Up to ₹${job.salary_max?.toLocaleString()}`
            }
          </div>
        )}
        
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          <span className="capitalize">{job.job_type?.replace('-', ' ')}</span>
        </div>

        <div className="flex items-center">
          <User className="w-4 h-4 mr-1" />
          <span>{job.total_applications || 0} applied</span>
        </div>
      </div>

      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills.slice(0, 3).map((skill, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-[#F7FAFC] text-[#0B63E5] text-xs rounded-full"
          >
            {skill}
          </span>
        ))}
        {job.skills.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-[#6B7280] text-xs rounded-full">
            +{job.skills.length - 3} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-[#6B7280]">
          Posted {Math.floor((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
        </div>
        
        <button
          onClick={handleApply}
          className="bg-[#0B63E5] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#0B63E5]/90 transition-colors focus:ring-2 focus:ring-[#0B63E5]/20 focus:outline-none"
        >
          {t('jobs.apply')}
        </button>
      </div>
    </div>
  );
};

export default JobCard;