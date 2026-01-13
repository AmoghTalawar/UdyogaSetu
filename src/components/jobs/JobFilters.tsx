import React, { useState } from 'react';
import { Filter, MapPin, Briefcase, Clock, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Filters {
  location: string;
  jobType: string;
  experience: string;
  postedDate: string;
}

interface JobFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const JobFilters: React.FC<JobFiltersProps> = ({ filters, onFiltersChange }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      location: '',
      jobType: '',
      experience: '',
      postedDate: '',
    });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Mobile Filter Toggle */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full py-2"
        >
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-[#0B63E5] text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Filter Content */}
      <div className={`${isOpen || 'md:block' ? 'block' : 'hidden'} space-y-6 mt-4 md:mt-0`}>
        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#6B7280]">{activeFilterCount} active filters</span>
            <button
              onClick={clearFilters}
              className="text-sm text-[#0B63E5] hover:text-[#0B63E5]/80 flex items-center space-x-1"
            >
              <X className="w-3 h-3" />
              <span>Clear all</span>
            </button>
          </div>
        )}

        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            {t('jobs.location')}
          </label>
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0B63E5] focus:border-transparent"
          >
            <option value="">All locations</option>
            <option value="bangalore">Bangalore</option>
            <option value="mysore">Mysore</option>
            <option value="hubli">Hubli</option>
            <option value="mangalore">Mangalore</option>
            <option value="dharwad">Dharwad</option>
          </select>
        </div>

        {/* Job Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Briefcase className="w-4 h-4 inline mr-1" />
            Job Type
          </label>
          <div className="space-y-2">
            {[
              { value: '', label: 'All types' },
              { value: 'full-time', label: 'Full Time' },
              { value: 'part-time', label: 'Part Time' },
              { value: 'contract', label: 'Contract' },
              { value: 'remote', label: 'Remote' },
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="jobType"
                  value={option.value}
                  checked={filters.jobType === option.value}
                  onChange={(e) => handleFilterChange('jobType', e.target.value)}
                  className="text-[#0B63E5] focus:ring-[#0B63E5]"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Experience Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Experience Level
          </label>
          <div className="space-y-2">
            {[
              { value: '', label: 'All levels' },
              { value: 'entry', label: 'Entry Level (0-1 years)' },
              { value: 'intermediate', label: 'Intermediate (1-3 years)' },
              { value: 'experienced', label: 'Experienced (3+ years)' },
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="experience"
                  value={option.value}
                  checked={filters.experience === option.value}
                  onChange={(e) => handleFilterChange('experience', e.target.value)}
                  className="text-[#0B63E5] focus:ring-[#0B63E5]"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Posted Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Posted Date
          </label>
          <div className="space-y-2">
            {[
              { value: '', label: 'Any time' },
              { value: '1', label: 'Last 24 hours' },
              { value: '7', label: 'Last week' },
              { value: '30', label: 'Last month' },
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="postedDate"
                  value={option.value}
                  checked={filters.postedDate === option.value}
                  onChange={(e) => handleFilterChange('postedDate', e.target.value)}
                  className="text-[#0B63E5] focus:ring-[#0B63E5]"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobFilters;