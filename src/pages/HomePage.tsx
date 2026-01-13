import React, { useState, useEffect } from 'react';
import HeaderSimple from '../components/common/HeaderSimple';
import Footer from '../components/common/Footer';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import VoiceSearchModal from '../components/voice/VoiceSearchModal';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  TrendingUp, 
  Zap, 
  Shield, 
  Globe, 
  Users,
  Star, 
  ChevronRight,
  Play,
  Award,
  Target,
  Sparkles,
  Mic
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSearch = () => {
    // Navigate to jobs page with search parameters
    onNavigate('jobs');
    // TODO: Pass search parameters to JobsPage
    console.log('Searching for:', { query: searchQuery, location });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };


  const stats = [
    { number: '50K+', label: t('home.stats.activeJobs'), icon: Briefcase },
    { number: '25K+', label: t('home.stats.verifiedCompanies'), icon: Target },
    { number: '100K+', label: t('home.stats.jobSeekers'), icon: Users },
    { number: '95%', label: t('home.stats.successRate'), icon: Award }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
      <HeaderSimple onNavigate={onNavigate} />
      
      {/* Language Switcher - Floating in top right */}
      <div className="fixed top-4 right-4 z-40">
        <LanguageSwitcher variant="header" className="shadow-lg" />
      </div>
      
      <main className="relative overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Hero Background Image */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/95 via-blue-50/90 to-indigo-50/95 z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1920&h=1080&fit=crop&auto=format&q=80&blend=rgba(248,250,252,0.85)&blend-mode=overlay"
              alt="Modern office workspace background"
              className="w-full h-full object-cover opacity-30"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden z-5">
            <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>

          <div className="relative max-w-7xl mx-auto">
            <div className={`text-center transform transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              {/* Logo and Brand */}
              <div className="flex flex-col items-center mb-8">
                <div className="mb-6">
                  <div className="relative w-32 h-32 mx-auto">
                    {/* Outer rotating rings inspired by original design */}
                    <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 animate-rotate-slow">
                      <div className="absolute inset-2 bg-white rounded-full"></div>
                    </div>
                    <div className="absolute inset-2 rounded-full border-3 border-transparent bg-gradient-to-r from-teal-300 via-cyan-400 to-blue-500 animate-rotate-medium">
                      <div className="absolute inset-2 bg-white rounded-full"></div>
                    </div>
                    <div className="absolute inset-4 rounded-full border-2 border-transparent bg-gradient-to-r from-blue-300 via-indigo-400 to-purple-500 animate-rotate-fast">
                      <div className="absolute inset-2 bg-white rounded-full"></div>
                    </div>
                    
                    {/* Center white circle with animation */}
                    <div className="absolute inset-6 bg-white rounded-full animate-breathe shadow-lg">
                    </div>
                  </div>
                </div>
                
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-200/50 rounded-full mb-8 backdrop-blur-sm">
                  <span className="text-2xl mr-2">🎤</span>
                  <span className="text-sm font-medium text-blue-700">
                    {t('home.aiPowered')}
                  </span>
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                  {t('home.yourVoice')}
                </span>
                <br />
                <span className="text-gray-700">
                  {t('home.yourCareer')}
                </span>
              </h1>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                {t('home.subtitle')}
              </h2>
              
              <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                {t('home.description')}
              </p>

              {/* Enhanced Search Bar */}
              <div className={`max-w-4xl mx-auto transform transition-all duration-1000 delay-300 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 p-3">
                  <div className="flex flex-col lg:flex-row gap-3">
                    {/* Job Title Search */}
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder={t('search.jobTitle', 'Search jobs by role (e.g., Software Engineer, Data Analyst)')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full pl-12 pr-16 py-4 text-lg border-0 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder-gray-500"
                      />
                      {/* Voice Search Button */}
                      <button
                        onClick={() => setIsVoiceSearchOpen(true)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                        title="Search by voice"
                      >
                        <Mic className="w-5 h-5" />
                      </button>
                    </div>
                    
                    
                    {/* Search Button */}
                    <button
                      onClick={handleSearch}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 min-w-fit"
                    >
                      <Search className="w-5 h-5" />
                      <span className="hidden sm:inline">{t('search.button', 'Search Jobs')}</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                  
                  {/* Popular Searches */}
                  <div className="mt-4 px-2">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-sm text-gray-500">{t('search.popular')} </span>
                      {['Software Engineer', 'Data Analyst', 'Product Manager', 'Full Stack Developer'].map((term) => (
                        <button
                          key={term}
                          onClick={() => setSearchQuery(term)}
                          className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`flex flex-col sm:flex-row gap-4 justify-center mt-8 transform transition-all duration-1000 delay-500 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <button
                  onClick={() => onNavigate('jobs')}
                  className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <Briefcase className="w-5 h-5" />
                  <span>{t('home.browseJobs')}</span>
                </button>
                
                <button className="group border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-500 hover:text-blue-600 transform hover:scale-105 transition-all flex items-center justify-center space-x-2 bg-white/50 backdrop-blur-sm">
                  <span className="text-xl">🎬</span>
                  <span>{t('home.watchDemo')}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center mb-16 transform transition-all duration-1000 delay-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t('home.howItWorks')}
              </h2>
              <p className="text-xl text-gray-600">
                {t('home.howItWorksSubtitle')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {/* Step 1: Browse Jobs */}
              <div className={`text-center transform transition-all duration-1000 delay-800 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('home.step1.title')}</h3>
                <p className="text-gray-600">
                  {t('home.step1.description')}
                </p>
              </div>
              
              {/* Step 2: Apply with Voice */}
              <div className={`text-center transform transition-all duration-1000 delay-900 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🎤</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('home.step2.title')}</h3>
                <p className="text-gray-600">
                  {t('home.step2.description')}
                </p>
              </div>
              
              {/* Step 3: Upload Resume */}
              <div className={`text-center transform transition-all duration-1000 delay-1000 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📄</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('home.step3.title')}</h3>
                <p className="text-gray-600">
                  {t('home.step3.description')}
                </p>
              </div>
              
              {/* Step 4: Get Notified */}
              <div className={`text-center transform transition-all duration-1000 delay-1100 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🔔</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('home.step4.title')}</h3>
                <p className="text-gray-600">
                  {t('home.step4.description')}
                </p>
              </div>
            </div>
            
            {/* Offline Kiosks Section */}
            <div className={`bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl p-8 lg:p-12 transform transition-all duration-1000 delay-1200 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <h3 className="text-3xl font-bold text-gray-900">
                    {t('home.offlineKiosks')}
                  </h3>
                  <p className="text-lg text-gray-600">
                    {t('home.offlineDescription')}
                  </p>
                  
                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">150+</div>
                      <div className="text-sm text-gray-600">{t('home.kiosksActive')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">98%</div>
                      <div className="text-sm text-gray-600">{t('home.uptime')}</div>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  {/* Kiosk Image */}
                  <div className="relative bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&h=400&fit=crop&auto=format&q=80"
                      alt="Community support center - people receiving assistance with job applications at local kiosk"
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/3184454/pexels-photo-3184454.jpeg?auto=compress&cs=tinysrgb&w=600&h=400';
                      }}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Content Overlay */}
                    <div className="absolute bottom-6 left-6 text-white">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <span className="text-2xl">🤝</span>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{t('home.communitySupport')}</div>
                          <div className="text-sm opacity-90">{t('home.localAssistance')}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats Badge */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-gray-900">{t('home.active247')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce flex items-center justify-center">
                    <span className="text-lg">📍</span>
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-400 rounded-full animate-bounce flex items-center justify-center" style={{animationDelay: '1s'}}>
                    <span className="text-xs">✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className={`py-16 border-y border-gray-100 bg-white/50 backdrop-blur-sm transform transition-all duration-1000 delay-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className={`text-center transform transition-all duration-500 hover:scale-105`} style={{animationDelay: `${index * 100}ms`}}>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl mb-4">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Image Content Section */}
        <section className="py-24 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div className={`transform transition-all duration-1000 delay-300 ${
                  isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                }`}>
                  <h2 className="text-4xl font-bold text-gray-900 mb-6">
                    {t('home.revolutionary')}
                  </h2>
                  <p className="text-xl text-gray-600 mb-8">
                    {t('home.revolutionarySubtitle')}
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">🎙️</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{t('home.voiceFirst')}</h3>
                        <p className="text-gray-600">{t('home.voiceFirstDesc')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">🤖</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{t('home.aiMatching')}</h3>
                        <p className="text-gray-600">{t('home.aiMatchingDesc')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">🌐</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{t('home.multiLanguage')}</h3>
                        <p className="text-gray-600">{t('home.multiLanguageDesc')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Content - Hero Image */}
              <div className={`relative transform transition-all duration-1000 delay-500 ${
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
              }`}>
                {/* Main Hero Image Container */}
                <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-6 shadow-2xl overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
                    <div className="absolute top-4 right-4 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl animate-pulse"></div>
                    <div className="absolute bottom-4 left-4 w-24 h-24 bg-purple-400/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
                  </div>
                  
                  {/* Main Hero Image */}
                  <div className="relative z-10">
                    <img
                      src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=600&h=400&fit=crop&auto=format&q=80"
                      alt="Professional team collaboration - people working together on laptops and discussing career opportunities"
                      className="w-full h-80 object-cover rounded-2xl shadow-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600&h=400';
                      }}
                    />
                    
                    {/* Overlay Stats Cards */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/50">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">5,250+</div>
                          <div className="text-xs text-gray-600">Active Jobs</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/50">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">98%</div>
                          <div className="text-xs text-gray-600">Success Rate</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Voice Application Indicator */}
                    <div className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-3 shadow-lg animate-bounce">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <span className="text-xl">🎤</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Feature Cards */}
                <div className="absolute -top-8 -left-8 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-4 shadow-xl transform rotate-3 hover:rotate-0 transition-transform z-20">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <div className="text-sm font-bold">{t('home.instantApply')}</div>
                      <div className="text-xs opacity-90">{t('home.voiceQr')}</div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-4 shadow-xl transform -rotate-3 hover:rotate-0 transition-transform z-20">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🌐</span>
                    <div>
                      <div className="text-sm font-bold">{t('home.multiLanguage')}</div>
                      <div className="text-xs opacity-90">{t('home.languages')}</div>
                    </div>
                  </div>
                </div>
                
                {/* Background Blur Effects */}
                <div className="absolute -z-10 top-12 -right-12 w-40 h-40 bg-gradient-to-r from-blue-300/30 to-indigo-400/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -z-10 -bottom-12 -left-12 w-36 h-36 bg-gradient-to-r from-purple-300/30 to-pink-400/30 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Commitment Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-lg text-gray-600 mb-12">
                {t('home.commitment')}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Verified Employers */}
                <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home.verifiedEmployers')}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {t('home.verifiedEmployersDesc')}
                  </p>
                  <div className="text-2xl font-bold text-blue-600">500+ {t('home.verified')}</div>
                </div>
                
                {/* Community Support */}
                <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home.communitySupportTitle')}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {t('home.communitySupportDesc')}
                  </p>
                  <div className="text-2xl font-bold text-orange-600">{t('home.support247')}</div>
                </div>
                
                {/* Local Presence */}
                <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home.localPresence')}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {t('home.localPresenceDesc')}
                  </p>
                  <div className="text-2xl font-bold text-green-600">150+ {t('home.locations')}</div>
                </div>
                
                {/* Success Stories */}
                <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home.successStoriesTitle')}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {t('home.successStoriesDesc')}
                  </p>
                  <div className="text-2xl font-bold text-purple-600">850+ {t('home.hired')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Success Stories from Community */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t('home.successStoriesHeading')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('home.successStoriesSubheading')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Success Story 1 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face&auto=format" 
                    alt="Anita Devi" 
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiMzQjgyRjYiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAxMmMtMS4xIDAtMi0uOS0yLTJzLjktMiAyLTIgMiAuOSAyIDItLjkgMi0yIDJ6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz4KPHN2Zz4KPHN2Zz4=';
                    }}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Anita Devi</h3>
                <p className="text-sm text-gray-600 mb-4">Dharwad</p>
                <p className="text-gray-700 leading-relaxed">
                  {t('home.anitaQuote')}
                </p>
              </div>
              
              {/* Success Story 2 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face&auto=format" 
                    alt="Rajesh Kumar" 
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiMxMEI5ODEiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAxMmMtMS4xIDAtMi0uOS0yLTJzLjktMiAyLTIgMiAuOSAyIDItLjkgMi0yIDJ6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz4KPHN2Zz4KPHN2Zz4=';
                    }}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Rajesh Kumar</h3>
                <p className="text-sm text-gray-600 mb-4">Mysore</p>
                <p className="text-gray-700 leading-relaxed">
                  {t('home.rajeshQuote')}
                </p>
              </div>
              
              {/* Success Story 3 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b73c4c4a?w=64&h=64&fit=crop&crop=face&auto=format" 
                    alt="Mohammed Ali" 
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiM4QjVDRjYiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAxMmMtMS4xIDAtMi0uOS0yLTJzLjktMiAyLTIgMiAuOSAyIDItLjkgMi0yIDJ6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz4KPHN2Zz4KPHN2Zz4=';
                    }}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mohammed Ali</h3>
                <p className="text-sm text-gray-600 mb-4">Hubli</p>
                <p className="text-gray-700 leading-relaxed">
                  {t('home.mohammedQuote')}
                </p>
              </div>
            </div>
          </div>
        </section>


      </main>
      
      {/* Voice Search Modal */}
      <VoiceSearchModal
        isOpen={isVoiceSearchOpen}
        onClose={() => setIsVoiceSearchOpen(false)}
        onSearchComplete={(query, language) => {
          setSearchQuery(query);
          // Navigate to jobs page with voice search query
          onNavigate('jobs');
        }}
      />
      
      <Footer />
    </div>
  );
};

export default HomePage;
