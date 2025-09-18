import React from 'react';
import { SignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { ArrowLeft, Building2, Users, TrendingUp, Shield, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CompanyLoginPageProps {
  onNavigate: (page: string) => void;
}

const CompanyLoginPage: React.FC<CompanyLoginPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
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
              <h1 className="text-xl font-bold text-gray-900">Company Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">New company?</span>
              <button
                onClick={() => onNavigate('company-signup')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Side - Information */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white p-12 items-center justify-center">
          <div className="max-w-md">
            <div className="mb-8">
              <img 
                src="/udyoga-setu-logo.png" 
                alt="Udyoga Setu" 
                className="w-16 h-16 logo-stable mb-6"
                width="64"
                height="64"
                style={{width: '64px', height: '64px', maxWidth: '64px', maxHeight: '64px'}}
              />
              <h2 className="text-4xl font-bold mb-4">Welcome to Udyoga Setu</h2>
              <p className="text-xl text-blue-100 mb-8">
                Connect with talented professionals and build your dream team
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Access Top Talent</h3>
                  <p className="text-blue-100">
                    Connect with qualified candidates through our innovative voice and QR application system
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Streamlined Hiring</h3>
                  <p className="text-blue-100">
                    Post jobs, manage applications, and hire faster with our comprehensive dashboard
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Secure Platform</h3>
                  <p className="text-blue-100">
                    Your company data and candidate information are protected with enterprise-grade security
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-blue-800/50 rounded-lg backdrop-blur-sm">
              {/* <h4 className="font-semibold mb-2">💼 Already trusted by 500+ companies</h4> */}
              <p className="text-sm text-blue-100">
                Join leading companies who use our platform to find exceptional talent
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Login</h2>
              <p className="text-gray-600">Access your hiring dashboard</p>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-600">Welcome back to your company dashboard</p>
            </div>

            {/* User Authentication State */}
            <SignedOut>
              {/* Clerk Sign In Component */}
              <div className="flex justify-center">
                <SignIn
                  routing="hash"
                  redirectUrl="/company/dashboard"
                  signUpUrl="/company/signup"
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
                      formFieldAction__password: "text-blue-600 hover:text-blue-700 text-sm font-medium",
                      formFieldHintText: "text-gray-500 text-xs"
                    }
                  }}
                />
              </div>
            </SignedOut>
            
            <SignedIn>
              {/* Already signed in - redirect to dashboard */}
              <div className="text-center p-8 bg-blue-50 rounded-lg border border-blue-200">
                <CheckCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-blue-800 mb-2">
                  {t('company.login.alreadySignedIn', 'Welcome back!')}
                </h3>
                <p className="text-blue-700 mb-4">
                  {t('company.login.redirecting', 'You\'re already signed in. Access your dashboard.')}
                </p>
                <button
                  onClick={() => onNavigate('company-dashboard')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {t('company.login.goToDashboard', 'Go to Dashboard')}
                </button>
              </div>
            </SignedIn>

            {/* Additional Information */}
            <div className="mt-8 text-center">
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-medium text-gray-900 mb-4">🎯 Get Started in Minutes</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                      1
                    </div>
                    <p className="text-gray-600">Sign In</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                      2
                    </div>
                    <p className="text-gray-600">Post Jobs</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                      3
                    </div>
                    <p className="text-gray-600">Hire Talent</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Need help? Contact our support team at{' '}
                <a href="mailto:support@udyogasetu.in" className="text-blue-600 hover:text-blue-700">
                  support@udyogasetu.in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyLoginPage;