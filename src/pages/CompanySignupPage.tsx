import React from 'react';
import { SignUp, SignedIn, SignedOut } from '@clerk/clerk-react';
import { ArrowLeft, Building2, Users, TrendingUp, Shield, CheckCircle, Star, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CompanySignupPageProps {
  onNavigate: (page: string) => void;
}

const CompanySignupPage: React.FC<CompanySignupPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">Join Our Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Already have an account?</span>
              <button
                onClick={() => onNavigate('company-login')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Side - Enhanced Information */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-12 items-center justify-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute bottom-32 right-20 w-24 h-24 bg-blue-300 rounded-full"></div>
            <div className="absolute top-1/2 right-10 w-16 h-16 bg-indigo-300 rounded-full"></div>
          </div>
          
          <div className="max-w-lg relative z-10">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <img 
                  src="/udyoga-setu-logo.png" 
                  alt="Udyoga Setu" 
                  className="w-16 h-16 logo-stable"
                  width="64"
                  height="64"
                  style={{width: '64px', height: '64px', maxWidth: '64px', maxHeight: '64px'}}
                />
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                Start Hiring 
                <span className="text-blue-200"> Top Talent</span> Today
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of companies using our AI-powered platform to find exceptional candidates through voice and QR applications
              </p>
            </div>

            {/* Features Grid */}
            <div className="space-y-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Smart Candidate Matching</h3>
                  <p className="text-blue-100">
                    AI-powered matching system connects you with candidates who fit your specific requirements
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Voice & QR Applications</h3>
                  <p className="text-blue-100">
                    Revolutionary application system allowing candidates to apply via voice recording or QR codes
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Enterprise Security</h3>
                  <p className="text-blue-100">
                    Bank-level security with GDPR compliance and encrypted data storage
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Global Reach</h3>
                  <p className="text-blue-100">
                    Multi-language support and global candidate pool across 50+ countries
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            {/* <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">500+</div>
                <div className="text-sm text-blue-200">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">10K+</div>
                <div className="text-sm text-blue-200">Applications</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">95%</div>
                <div className="text-sm text-blue-200">Success Rate</div>
              </div>
            </div> */}

            {/* Testimonial */}
            {/* <div className="p-6 bg-blue-800/50 rounded-xl backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format"
                  alt="CEO"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="font-semibold text-sm">Sarah Johnson</div>
                  <div className="text-blue-200 text-xs">CEO, TechCorp</div>
                </div>
              </div>
              <p className="text-sm text-blue-100 italic">
                "This platform transformed our hiring process. We found our entire development team in just 2 weeks!"
              </p>
            </div> */}
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="max-w-md w-full">
            {/* Mobile Header for smaller screens */}
            <div className="lg:hidden text-center mb-8">
              <img 
                src="/udyoga-setu-logo.png" 
                alt="Udyoga Setu" 
                className="w-16 h-16 logo-stable mx-auto mb-4"
                width="64"
                height="64"
                style={{width: '64px', height: '64px', maxWidth: '64px', maxHeight: '64px'}}
              />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Company Account</h2>
              <p className="text-gray-600">Start hiring top talent today</p>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
              <p className="text-gray-600">Join our community of successful companies</p>
            </div>

            {/* Benefits Checklist */}
            <div className="mb-8 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3">✨ What you get:</h4>
              <div className="space-y-2">
                {[
                  'Unlimited job postings',
                  'Advanced candidate filtering',
                  'Real-time application notifications',
                  'Detailed analytics dashboard',
                  '24/7 customer support'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* User Authentication State */}
            <SignedOut>
              {/* Clerk Sign Up Component */}
              <div className="flex justify-center">
                <SignUp
                  routing="hash"
                  redirectUrl="/company/dashboard"
                  signInUrl="/company/login"
                  fallbackRedirectUrl="/company/dashboard"
                  appearance={{
                    elements: {
                      formButtonPrimary: 
                        "bg-blue-600 hover:bg-blue-700 text-sm normal-case font-medium transition-all duration-200",
                      card: "shadow-xl border-0 bg-white rounded-2xl",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: 
                        "bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-all duration-200 rounded-lg",
                      socialButtonsBlockButtonText: "font-medium text-sm",
                      dividerLine: "bg-gray-300",
                      dividerText: "text-gray-500 font-medium text-sm",
                      formFieldLabel: "text-gray-800 font-semibold text-sm",
                      formFieldInput: 
                        "border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition-all duration-200",
                      footerActionLink: "text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200",
                      identityPreviewText: "font-medium",
                      identityPreviewEditButton: "text-blue-600 hover:text-blue-700 transition-colors duration-200",
                      formFieldAction__password: "text-blue-600 hover:text-blue-700 text-sm font-medium",
                      formFieldHintText: "text-gray-500 text-xs"
                    }
                  }}
                />
              </div>
            </SignedOut>
            
            <SignedIn>
              {/* Already signed in - redirect to dashboard */}
              <div className="text-center p-8 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  {t('company.register.alreadySignedIn', 'You\'re already signed in!')}
                </h3>
                <p className="text-green-700 mb-4">
                  {t('company.register.redirecting', 'Redirecting to your dashboard...')}
                </p>
                <button
                  onClick={() => onNavigate('company-dashboard')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  {t('company.register.goToDashboard', 'Go to Dashboard')}
                </button>
              </div>
            </SignedIn>

            {/* Process Steps */}
            <div className="mt-8 text-center">
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">🚀 Get started in 3 simple steps</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold shadow-lg">
                      1
                    </div>
                    <p className="text-gray-600 font-medium">Create Account</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold shadow-lg">
                      2
                    </div>
                    <p className="text-gray-600 font-medium">Post Your First Job</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold shadow-lg">
                      3
                    </div>
                    <p className="text-gray-600 font-medium">Start Hiring</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center space-x-4 mb-3">
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-600 font-medium">SSL Secured</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-gray-600 font-medium">GDPR Compliant</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Questions? Reach out to us at{' '}
                <a href="mailto:hello@udyogasetu.in" className="text-blue-600 hover:text-blue-700 font-medium">
                  hello@udyogasetu.in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySignupPage;