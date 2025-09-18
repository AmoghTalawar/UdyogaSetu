import React from 'react';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { Shield, Lock, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onNavigate: (page: string) => void;
  fallbackPage?: string;
  title?: string;
  subtitle?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  onNavigate, 
  fallbackPage = 'company-login',
  title = 'Access Required',
  subtitle = 'Please sign in to access this page'
}) => {
  const { t } = useLanguage();

  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      
      <SignedOut>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-blue-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {t('auth.accessRequired', title)}
              </h1>
              
              <p className="text-gray-600 mb-8">
                {t('auth.signInRequired', subtitle)}
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => onNavigate(fallbackPage)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <User className="w-5 h-5" />
                  <span>{t('auth.signIn', 'Sign In')}</span>
                </button>
                
                <div className="flex items-center space-x-4">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-gray-500 text-sm">or</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                
                <button
                  onClick={() => onNavigate('company-signup')}
                  className="w-full border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all font-medium"
                >
                  {t('auth.createAccount', 'Create Account')}
                </button>
                
                <button
                  onClick={() => onNavigate('home')}
                  className="w-full text-gray-500 hover:text-gray-700 transition-colors text-sm"
                >
                  {t('auth.backHome', 'Back to Home')}
                </button>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>Secure Login</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Protected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
};

export default ProtectedRoute;