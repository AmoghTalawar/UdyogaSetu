import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Language } from '../../types';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

interface LanguageSwitcherProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'compact' | 'header';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '',
  showLabel = true,
  variant = 'default'
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: LanguageOption[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    setIsOpen(false);
  };

  // Variant-specific styles
  const getButtonStyles = () => {
    switch (variant) {
      case 'compact':
        return 'px-3 py-2 text-sm';
      case 'header':
        return 'px-4 py-2 bg-white/10 border-white/20 hover:bg-white/20 text-white';
      default:
        return 'px-4 py-2';
    }
  };

  const getDropdownStyles = () => {
    switch (variant) {
      case 'header':
        return 'bg-white border border-gray-200 shadow-lg';
      default:
        return 'bg-white border border-gray-200 shadow-lg';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Language Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${getButtonStyles()}
          border border-gray-300 rounded-lg
          hover:bg-gray-50 transition-colors
          flex items-center space-x-2
          font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none
          ${variant === 'header' ? 'text-white hover:text-white' : 'text-gray-700'}
        `}
      >
        <Globe className="w-4 h-4" />
        {showLabel && (
          <span className={variant === 'compact' ? 'hidden sm:inline' : ''}>
            {variant === 'header' ? currentLanguage.nativeName : currentLanguage.name}
          </span>
        )}
        <div className="flex items-center space-x-1">
          <span className="text-sm">{currentLanguage.flag}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`
          absolute top-full left-0 mt-1 w-48 
          ${getDropdownStyles()}
          rounded-lg z-50
        `}>
          <div className="py-2">
            {/* Header */}
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Select Language
              </p>
            </div>

            {/* Language Options */}
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`
                  w-full px-4 py-3 text-left
                  hover:bg-blue-50 transition-colors
                  flex items-center justify-between
                  ${language === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                `}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{lang.flag}</span>
                  <div>
                    <div className="font-medium">{lang.nativeName}</div>
                    <div className="text-sm text-gray-500">{lang.name}</div>
                  </div>
                </div>
                
                {language === lang.code && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-100 mt-2">
              <p className="text-xs text-gray-500">
                The entire page will be translated to your selected language
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;