import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { ApplicationWithDetails } from '../utils/database.types';

// Hook for real-time application updates
export const useRealtimeApplications = (companyId: string | null) => {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!companyId) return;

    console.log('🔄 Setting up real-time subscription for company:', companyId);

    // Subscribe to applications table changes for this company's jobs
    const applicationsChannel = supabase
      .channel('applications-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'applications',
          filter: `job.company_id=eq.${companyId}` 
        }, 
        (payload) => {
          console.log('📨 Real-time application update:', payload);
          
          setLastUpdate(new Date());
          
          // Handle different events
          switch (payload.eventType) {
            case 'INSERT':
              console.log('➕ New application received:', payload.new);
              // Reload applications to get full data with joins
              loadApplications();
              break;
              
            case 'UPDATE':
              console.log('🔄 Application updated:', payload.new);
              setApplications(prev => 
                prev.map(app => 
                  app.id === payload.new.id 
                    ? { ...app, ...payload.new }
                    : app
                )
              );
              break;
              
            case 'DELETE':
              console.log('🗑️ Application deleted:', payload.old);
              setApplications(prev => 
                prev.filter(app => app.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log('🔌 Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Subscribe to notifications table to show when notifications are sent
    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('📩 New notification sent:', payload.new);
          // Could show a toast notification here
        }
      )
      .subscribe();

    // Load initial applications
    loadApplications();

    // Cleanup function
    return () => {
      console.log('🔌 Unsubscribing from real-time channels');
      applicationsChannel.unsubscribe();
      notificationsChannel.unsubscribe();
    };
  }, [companyId]);

  const loadApplications = async () => {
    if (!companyId) return;

    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          job:jobs(*),
          reviewer:company_users(full_name)
        `)
        .eq('job.company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading applications:', error);
        return;
      }

      setApplications(data || []);
    } catch (err) {
      console.error('Exception loading applications:', err);
    }
  };

  return {
    applications,
    isConnected,
    lastUpdate,
    refetch: loadApplications
  };
};

// Hook for real-time notification status updates
export const useRealtimeNotifications = () => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [lastNotification, setLastNotification] = useState<any>(null);

  useEffect(() => {
    console.log('🔔 Setting up notifications subscription');

    const channel = supabase
      .channel('notifications-status')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('📨 Notification status update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setNotificationCount(prev => prev + 1);
            setLastNotification(payload.new);
          } else if (payload.eventType === 'UPDATE') {
            setLastNotification(payload.new);
          }
        }
      )
      .subscribe((status) => {
        console.log('🔔 Notifications subscription status:', status);
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return {
    notificationCount,
    lastNotification
  };
};

// Hook for connection status monitoring
export const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Monitor Supabase connection
    const channel = supabase
      .channel('connection-test')
      .subscribe((status) => {
        setSupabaseConnected(status === 'SUBSCRIBED');
      });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      channel.unsubscribe();
    };
  }, []);

  return {
    isOnline,
    supabaseConnected,
    isConnected: isOnline && supabaseConnected
  };
};

// Hook for live statistics
export const useRealtimeStats = (companyId: string | null) => {
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    todayCount: 0
  });

  useEffect(() => {
    if (!companyId) return;

    const updateStats = async () => {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('status, created_at')
          .eq('job.company_id', companyId);

        if (error) throw error;

        const today = new Date().toDateString();
        const newStats = data.reduce(
          (acc, app) => {
            acc.total++;
            
            switch (app.status) {
              case 'submitted':
                acc.new++;
                break;
              case 'under_review':
                acc.underReview++;
                break;
              case 'approved':
                acc.approved++;
                break;
              case 'rejected':
                acc.rejected++;
                break;
            }

            if (new Date(app.created_at).toDateString() === today) {
              acc.todayCount++;
            }

            return acc;
          },
          { total: 0, new: 0, underReview: 0, approved: 0, rejected: 0, todayCount: 0 }
        );

        setStats(newStats);
      } catch (err) {
        console.error('Error updating stats:', err);
      }
    };

    // Update stats initially
    updateStats();

    // Subscribe to changes
    const channel = supabase
      .channel('stats-updates')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications'
        },
        () => {
          // Recalculate stats on any application change
          updateStats();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [companyId]);

  return stats;
};