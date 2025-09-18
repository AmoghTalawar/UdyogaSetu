import React, { useState } from 'react';
import { Search, Globe, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Language } from '../../types';
import { useUser, useAuth, SignedIn, SignedOut } from '@clerk/clerk-react';

interface HeaderProps {
  onNavigate?: (page: string) => void;
}

const HeaderSimple: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useUser();
  const { signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    try {
      await signOut();
      onNavigate?.('home');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  const languageOptions = [
    { code: 'hi' as Language, label: 'हिन्दी' },
    { code: 'kn' as Language, label: 'ಕನ್ನಡ' },
    { code: 'en' as Language, label: 'EN' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate?.('home')}>
            <div className="flex items-center space-x-3">
              <img 
                src="/udyoga-setu-logo.png" 
                alt="Udyoga Setu" 
                className="w-10 h-10 logo-stable"
                width="40"
                height="40"
                style={{width: '40px', height: '40px', maxWidth: '40px', maxHeight: '40px'}}
              />
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-[#0B63E5]">Udyoga Setu</h1>
                <p className="text-xs text-[#6B7280] hidden sm:block">Your Voice, Your Career</p>
              </div>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] w-5 h-5" />
              <input
                type="text"
                placeholder={t('jobs.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0B63E5] focus:border-transparent"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Skill Button */}
            <button
              onClick={() => onNavigate?.('skill')}
              className="text-[#0B63E5] font-medium hover:text-[#0B63E5]/80 text-sm"
            >
              {t('nav.skill')}
            </button>

            {/* Language Selector */}
            <div className="relative">
              <div className="flex items-center space-x-1 bg-[#F7FAFC] px-3 py-2 rounded-lg">
                <Globe className="w-4 h-4 text-[#6B7280]" />
                {languageOptions.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      language === lang.code
                        ? 'bg-[#0B63E5] text-white'
                        : 'text-[#6B7280] hover:text-[#0B63E5]'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional Navigation based on Auth Status */}
            <SignedOut>
              <button 
                onClick={() => onNavigate?.('company-signup')}
                className="bg-[#0B63E5] text-white px-4 py-2 rounded-lg hover:bg-[#0B63E5]/90 text-sm font-medium transition-colors"
              >
                {t('nav.companySignup')}
              </button>

              <button 
                onClick={() => onNavigate?.('company-login')}
                className="text-[#0B63E5] font-medium hover:text-[#0B63E5]/80 text-sm"
              >
                {t('nav.companyLogin')}
              </button>
            </SignedOut>

            <SignedIn>
              <button 
                onClick={() => onNavigate?.('company-dashboard')}
                className="flex items-center space-x-2 text-[#0B63E5] font-medium hover:text-[#0B63E5]/80 text-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{t('nav.dashboard')}</span>
              </button>

              <div className="flex items-center space-x-3">
                <img
                  src={user?.imageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user?.fullName || 'Company User'}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </SignedIn>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#6B7280] hover:text-[#0B63E5]"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <div className="space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('jobs.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0B63E5] focus:border-transparent"
                />
              </div>

              {/* Skill Button Mobile */}
              <button
                onClick={() => onNavigate?.('skill')}
                className="block w-full text-left py-3 px-4 text-[#0B63E5] font-medium hover:bg-gray-50 rounded-lg"
              >
                {t('nav.skill')}
              </button>

              {/* Mobile Language Selector */}
              <div className="flex items-center justify-center space-x-2 bg-[#F7FAFC] p-3 rounded-lg">
                <Globe className="w-4 h-4 text-[#6B7280]" />
                {languageOptions.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`px-3 py-2 rounded text-sm font-medium ${
                      language === lang.code
                        ? 'bg-[#0B63E5] text-white'
                        : 'text-[#6B7280] hover:text-[#0B63E5]'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              <SignedOut>
                <div className="space-y-3">
                  <button 
                    onClick={() => onNavigate?.('company-signup')}
                    className="block w-full bg-[#0B63E5] text-white py-3 px-4 rounded-lg font-medium text-center"
                  >
                    {t('nav.companySignup')}
                  </button>
                  <button 
                    onClick={() => onNavigate?.('company-login')}
                    className="block w-full border-2 border-[#0B63E5] text-[#0B63E5] py-3 px-4 rounded-lg font-medium text-center"
                  >
                    {t('nav.companyLogin')}
                  </button>
                </div>
              </SignedOut>
              
              <SignedIn>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={user?.imageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{user?.fullName || 'Company User'}</div>
                      <div className="text-sm text-gray-600">{user?.primaryEmailAddress?.emailAddress}</div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => onNavigate?.('company-dashboard')}
                    className="flex items-center justify-center space-x-2 w-full bg-[#0B63E5] text-white py-3 px-4 rounded-lg font-medium"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{t('nav.dashboard')}</span>
                  </button>
                  
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center justify-center space-x-2 w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </SignedIn>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderSimple;