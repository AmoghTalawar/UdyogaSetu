import React, { useState } from 'react';
import { Search, Mic, Upload } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import VoiceSearchModal from '../voice/VoiceSearchModal';

interface HeroSectionProps {
  onBrowseJobs: () => void;
  onEmployerPortal: () => void;
  onVoiceSearch?: (query: string, language: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onBrowseJobs, onEmployerPortal, onVoiceSearch }) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);

  return (
    <div className="bg-gradient-to-br from-[#F7FAFC] to-white py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-lg text-[#6B7280] mb-8 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            
            {/* Search Bar */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B7280] w-5 h-5" />
              <input
                type="text"
                placeholder={t('jobs.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-16 py-4 text-lg border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0B63E5] focus:border-transparent"
              />
              {/* Voice Search Button */}
              <button
                onClick={() => setIsVoiceSearchOpen(true)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-[#FF7A18] hover:text-[#FF7A18]/80 hover:bg-[#FF7A18]/10 rounded-full transition-colors"
                title="Search by voice"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={onBrowseJobs}
                className="bg-[#0B63E5] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#0B63E5]/90 transition-colors focus:ring-2 focus:ring-[#0B63E5]/20 focus:outline-none"
              >
                {t('jobs.browse')}
              </button>
              <button
                onClick={onEmployerPortal}
                className="border border-[#0B63E5] text-[#0B63E5] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#0B63E5]/5 transition-colors"
              >
                For Employers
              </button>
            </div>

            {/* Quick Apply Features */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                <div className="w-8 h-8 bg-[#FF7A18]/10 rounded-full flex items-center justify-center">
                  <Mic className="w-4 h-4 text-[#FF7A18]" />
                </div>
                <span>Apply with Voice</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                <div className="w-8 h-8 bg-[#16A34A]/10 rounded-full flex items-center justify-center">
                  <Upload className="w-4 h-4 text-[#16A34A]" />
                </div>
                <span>Upload Resume</span>
              </div>
            </div>
          </div>

          {/* Right Content - Illustration */}
          <div className="relative">
            <div className="bg-[#F6EFE6] rounded-2xl p-8 relative overflow-hidden">
              <img
                src="https://images.pexels.com/photos/3184639/pexels-photo-3184639.jpeg?auto=compress&cs=tinysrgb&w=600&h=400"
                alt="People collaborating"
                className="w-full h-80 object-cover rounded-lg"
              />
              
              {/* Floating Stats */}
              <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-lg">
                <div className="text-2xl font-bold text-[#0B63E5]">2,500+</div>
                <div className="text-xs text-[#6B7280]">Active Jobs</div>
              </div>
              
              <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg">
                <div className="text-2xl font-bold text-[#16A34A]">850+</div>
                <div className="text-xs text-[#6B7280]">Successful Hires</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Voice Search Modal */}
      <VoiceSearchModal
        isOpen={isVoiceSearchOpen}
        onClose={() => setIsVoiceSearchOpen(false)}
        onSearchComplete={(query, language) => {
          setSearchQuery(query);
          if (onVoiceSearch) {
            onVoiceSearch(query, language);
          }
        }}
      />
    </div>
  );
};

export default HeroSection;