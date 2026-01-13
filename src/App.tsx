import React, { useState, useEffect } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { LanguageProvider } from './contexts/LanguageContext';
import HomePage from './pages/HomePage';
import JobsPage from './pages/JobsPage';
import CompanyLoginPage from './pages/CompanyLoginPage';
import CompanySignupPage from './pages/CompanySignupPage';
import CompanyDashboard from './pages/CompanyDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import KioskPage from './pages/KioskPage';
import PostJobPage from './pages/PostJobPage';
import SkillPage from './pages/SkillPage';
import CourseDetailPage from './pages/CourseDetailPage';
import MobileUpload from './components/upload/MobileUpload';
import './styles/animations.css';

// Initialize Clerk with your publishable key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Loading component for any potential loading states
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);


function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    // Check URL parameters on app load
    const path = window.location.pathname;

    // Handle mobile upload routes (no auth required)
    if (path.startsWith('/mobile-upload/')) {
      return 'mobile-upload';
    }

    // Handle kiosk with job parameter (no auth required)
    if (path === '/kiosk' || path.startsWith('/kiosk')) {
      return 'kiosk';
    }

    // Handle course detail routes
    if (path.startsWith('/course-detail/')) {
      const courseId = path.split('/course-detail/')[1];
      return `course-detail/${courseId}`;
    }

    // Handle other routes
    if (path === '/jobs') return 'jobs';
    if (path === '/company-login') return 'company-login';
    if (path === '/company-signup') return 'company-signup';
    if (path === '/company-dashboard') return 'company-dashboard';
    if (path === '/employer-dashboard') return 'employer-dashboard';
    if (path === '/post-job') return 'post-job';
    if (path === '/skill') return 'skill';

    return 'home';
  });
  
  console.log('App component is rendering');
  console.log('Clerk key present:', !!clerkPubKey);
  console.log('Current page:', currentPage);
  
  // Handle browser navigation (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;

      if (path.startsWith('/mobile-upload/')) {
        setCurrentPage('mobile-upload');
      } else if (path === '/kiosk' || path.startsWith('/kiosk')) {
        setCurrentPage('kiosk');
      } else if (path.startsWith('/course-detail/')) {
        const courseId = path.split('/course-detail/')[1];
        setCurrentPage(`course-detail/${courseId}`);
      } else if (path === '/jobs') {
        setCurrentPage('jobs');
      } else if (path === '/company-login') {
        setCurrentPage('company-login');
      } else if (path === '/company-signup') {
        setCurrentPage('company-signup');
      } else if (path === '/company-dashboard') {
        setCurrentPage('company-dashboard');
      } else if (path === '/employer-dashboard') {
        setCurrentPage('employer-dashboard');
      } else if (path === '/post-job') {
        setCurrentPage('post-job');
      } else if (path === '/skill') {
        setCurrentPage('skill');
      } else {
        setCurrentPage('home');
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    // Update URL without reload
    let url = '/';
    if (page === 'home') {
      url = '/';
    } else if (page.startsWith('course-detail/')) {
      url = `/${page}`;
    } else {
      url = `/${page}`;
    }
    window.history.pushState({}, '', url);
  };

  // Check if current route requires authentication
  const requiresAuth = () => {
    return !['mobile-upload', 'kiosk'].includes(currentPage) &&
           !currentPage.startsWith('course-detail/');
  };

  // Only check Clerk key if authentication is required
  if (requiresAuth() && !clerkPubKey) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: 'red' }}>Configuration Error</h1>
        <p>Missing Clerk publishable key. Please check your environment configuration.</p>
      </div>
    );
  }

  const renderPage = () => {
    try {
      if (currentPage.startsWith('course-detail/')) {
        const courseId = currentPage.split('/')[1];
        return <CourseDetailPage onNavigate={handleNavigate} courseId={courseId} />;
      }

      switch (currentPage) {
        case 'jobs':
          return <JobsPage onNavigate={handleNavigate} />;
        case 'company-login':
          return <CompanyLoginPage onNavigate={handleNavigate} />;
        case 'company-signup':
          return <CompanySignupPage onNavigate={handleNavigate} />;
        case 'company-dashboard':
          return <CompanyDashboard onNavigate={handleNavigate} />;
        case 'employer-dashboard':
          return <EmployerDashboard onNavigate={handleNavigate} />;
        case 'kiosk':
          return <KioskPage onNavigate={handleNavigate} />;
        case 'post-job':
          return <PostJobPage onNavigate={handleNavigate} />;
        case 'skill':
          return <SkillPage onNavigate={handleNavigate} />;
        case 'mobile-upload':
          // Extract upload ID from URL path
          const uploadId = window.location.pathname.split('/mobile-upload/')[1];
          return <MobileUpload uploadId={uploadId} />;
        default:
          return <HomePage onNavigate={handleNavigate} />;
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          <h1 style={{ color: 'red' }}>Page Load Error</h1>
          <p>There was an error loading the page. Check the browser console for details.</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
  };
  
  // Render with or without ClerkProvider based on route requirements
  if (requiresAuth()) {
    return (
      <ClerkProvider publishableKey={clerkPubKey}>
        <LanguageProvider>
          <div className="App">
            {renderPage()}
          </div>
        </LanguageProvider>
      </ClerkProvider>
    );
  } else {
    // Public routes (mobile-upload, kiosk) don't need Clerk authentication
    return (
      <LanguageProvider>
        <div className="App">
          {renderPage()}
        </div>
      </LanguageProvider>
    );
  }
}

export default App;
