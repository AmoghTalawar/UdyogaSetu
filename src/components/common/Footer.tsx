import React from 'react';
import { Globe, Phone, Mail } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Platform Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-[#6B7280] hover:text-[#0B63E5] text-sm">{t('footer.about')}</a></li>
              <li><a href="#" className="text-[#6B7280] hover:text-[#0B63E5] text-sm">How it works</a></li>
              <li><a href="#" className="text-[#6B7280] hover:text-[#0B63E5] text-sm">FAQs</a></li>
              <li><a href="#" className="text-[#6B7280] hover:text-[#0B63E5] text-sm">Accessibility</a></li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Employers</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-[#6B7280] hover:text-[#0B63E5] text-sm">{t('employer.post')}</a></li>
              <li><a href="#" className="text-[#6B7280] hover:text-[#0B63E5] text-sm">Employer Help</a></li>
              <li><a href="#" className="text-[#6B7280] hover:text-[#0B63E5] text-sm">Pricing</a></li>
              <li><a href="#" className="text-[#6B7280] hover:text-[#0B63E5] text-sm">Success Stories</a></li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal & Contact</h3>
            <ul className="space-y-3 mb-4">
              <li><a href="#" className="text-[#6B7280] hover:text-[#0B63E5] text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-[#6B7280] hover:text-[#0B63E5] text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-[#6B7280] hover:text-[#0B63E5] text-sm">{t('footer.contact')}</a></li>
            </ul>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-[#6B7280]">
                <Phone className="w-4 h-4 mr-2" />
                <span>1800-JOBHELP</span>
              </div>
              <div className="flex items-center text-sm text-[#6B7280]">
                <Mail className="w-4 h-4 mr-2" />
                <span>help@udyogasetu.in</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <div className="flex items-center space-x-2">
              <img 
                src="/udyoga-setu-logo.png" 
                alt="Udyoga Setu" 
                className="w-6 h-6 logo-stable"
                width="24"
                height="24"
                style={{width: '24px', height: '24px', maxWidth: '24px', maxHeight: '24px'}}
              />
              <h2 className="text-xl font-bold text-[#0B63E5]">Udyoga Setu</h2>
            </div>
            <div className="flex items-center space-x-2 bg-[#F7FAFC] px-3 py-1 rounded">
              <Globe className="w-4 h-4 text-[#6B7280]" />
              <span className="text-sm text-[#6B7280]">हिन्दी | ಕನ್ನಡ | EN</span>
            </div>
          </div>
          
          <div className="text-sm text-[#6B7280]">
            © 2025 Udyoga Setu. Building inclusive opportunities.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;