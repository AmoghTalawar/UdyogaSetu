import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { supabase } from '../utils/supabase';

interface Company {
  id: string;
  email: string;
  company_name: string;
  company_description: string;
  website: string;
  location: string;
  contact_person: string;
  phone: string;
  created_at: string;
  is_verified: boolean;
}

interface CompanyAuthContextType {
  company: Company | null;
  loading: boolean;
  createCompanyProfile: (companyData: any) => Promise<{ success: boolean; error?: string }>;
  refreshCompanyData: () => Promise<void>;
  isAuthenticated: boolean;
  isCompanySetup: boolean;
}

const CompanyAuthContext = createContext<CompanyAuthContextType | undefined>(undefined);

export const useCompanyAuth = () => {
  const context = useContext(CompanyAuthContext);
  if (context === undefined) {
    throw new Error('useCompanyAuth must be used within a CompanyAuthProvider');
  }
  return context;
};

export const CompanyAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!userLoaded || !isSignedIn || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get company details using Clerk user ID
        const { data: companyData, error } = await supabase
          .from('companies')
          .select('*')
          .eq('clerk_user_id', user.id)
          .single();

        if (companyData && !error) {
          setCompany(companyData);
        } else if (error && error.code !== 'PGRST116') {
          // PGRST116 is "not found" error, which is expected for new users
          console.error('Error fetching company data:', error);
        }
      } catch (error) {
        console.error('Company data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [user, userLoaded, isSignedIn]);

  const createCompanyProfile = async (companyData: any): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setLoading(true);

      // Create company profile in Supabase
      const { data: newCompany, error: profileError } = await supabase
        .from('companies')
        .insert([{
          clerk_user_id: user.id,
          email: user.primaryEmailAddress?.emailAddress || companyData.email,
          company_name: companyData.company_name,
          company_description: companyData.company_description,
          website: companyData.website,
          location: companyData.location,
          contact_person: companyData.contact_person,
          phone: companyData.phone,
          is_verified: false
        }])
        .select()
        .single();

      if (profileError) {
        return { success: false, error: 'Failed to create company profile: ' + profileError.message };
      }

      if (newCompany) {
        setCompany(newCompany);
      }

      return { success: true };
    } catch (error) {
      console.error('Company profile creation error:', error);
      return { success: false, error: 'Failed to create company profile' };
    } finally {
      setLoading(false);
    }
  };

  const refreshCompanyData = async (): Promise<void> => {
    if (!user) return;

    try {
      const { data: companyData, error } = await supabase
        .from('companies')
        .select('*')
        .eq('clerk_user_id', user.id)
        .single();

      if (companyData && !error) {
        setCompany(companyData);
      }
    } catch (error) {
      console.error('Error refreshing company data:', error);
    }
  };

  const value: CompanyAuthContextType = {
    company,
    loading,
    createCompanyProfile,
    refreshCompanyData,
    isAuthenticated: isSignedIn && !!company,
    isCompanySetup: !!company
  };

  return (
    <CompanyAuthContext.Provider value={value}>
      {children}
    </CompanyAuthContext.Provider>
  );
};