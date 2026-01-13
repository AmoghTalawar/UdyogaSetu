// Notification Service - Handles SMS/WhatsApp via Twilio
import { supabase } from '../utils/supabase';

// Twilio configuration (you'll need to set these in your .env)
const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = import.meta.env.VITE_TWILIO_PHONE_NUMBER;
const TWILIO_WHATSAPP_NUMBER = import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER;

// In a production environment, these should be called from a secure backend
// For demo purposes, we'll create a mock notification service

export interface NotificationPayload {
  phone: string;
  message: string;
  provider?: 'sms' | 'whatsapp';
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Mock SMS service for development/demo
const mockSendSMS = async (payload: NotificationPayload): Promise<NotificationResult> => {
  console.log('📱 Mock SMS Service - Would send:', {
    to: payload.phone,
    message: payload.message,
    provider: payload.provider || 'sms'
  });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate success/failure (90% success rate)
  const isSuccess = Math.random() > 0.1;
  
  if (isSuccess) {
    return {
      success: true,
      messageId: `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`
    };
  } else {
    return {
      success: false,
      error: 'Mock delivery failure'
    };
  }
};

// Real Twilio service (for production)
const realSendSMS = async (payload: NotificationPayload): Promise<NotificationResult> => {
  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.warn('Twilio credentials not configured, falling back to mock service');
      return mockSendSMS(payload);
    }

    const twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    
    const fromNumber = payload.provider === 'whatsapp' 
      ? `whatsapp:${TWILIO_WHATSAPP_NUMBER}` 
      : TWILIO_PHONE_NUMBER;
      
    const toNumber = payload.provider === 'whatsapp' 
      ? `whatsapp:${payload.phone}` 
      : payload.phone;

    const message = await twilio.messages.create({
      body: payload.message,
      from: fromNumber,
      to: toNumber
    });

    return {
      success: true,
      messageId: message.sid
    };
  } catch (error: any) {
    console.error('Twilio SMS error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Main notification service function
export const sendNotification = async (payload: NotificationPayload): Promise<NotificationResult> => {
  // Use mock service for development, real service for production
  const isDevelopment = import.meta.env.DEV || !TWILIO_ACCOUNT_SID;
  
  return isDevelopment ? mockSendSMS(payload) : realSendSMS(payload);
};

// Process pending notifications from the database
export const processPendingNotifications = async () => {
  try {
    console.log('🔄 Processing pending notifications...');
    
    // Get all pending notifications
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10); // Process in batches

    if (error) {
      console.error('Error fetching pending notifications:', error);
      return;
    }

    if (!notifications || notifications.length === 0) {
      console.log('✅ No pending notifications to process');
      return;
    }

    console.log(`📋 Found ${notifications.length} pending notifications`);

    // Process each notification
    for (const notification of notifications) {
      try {
        console.log(`📤 Sending notification ${notification.id} to ${notification.recipient_phone}`);
        
        const result = await sendNotification({
          phone: notification.recipient_phone,
          message: notification.message,
          provider: notification.provider as 'sms' | 'whatsapp'
        });

        // Update notification status in database
        const updateData = {
          status: result.success ? 'sent' : 'failed',
          provider_message_id: result.messageId || null,
          error_message: result.error || null,
          sent_at: new Date().toISOString(),
          ...(result.success && { delivered_at: new Date().toISOString() })
        };

        const { error: updateError } = await supabase
          .from('notifications')
          .update(updateData)
          .eq('id', notification.id);

        if (updateError) {
          console.error(`Error updating notification ${notification.id}:`, updateError);
        } else {
          console.log(`✅ Notification ${notification.id} ${result.success ? 'sent successfully' : 'failed'}`);
        }

        // Small delay between notifications to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error);
        
        // Mark as failed
        await supabase
          .from('notifications')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            sent_at: new Date().toISOString()
          })
          .eq('id', notification.id);
      }
    }

    console.log('🏁 Finished processing notifications');
  } catch (error) {
    console.error('Error in processPendingNotifications:', error);
  }
};

// Start notification processing interval
let notificationInterval: NodeJS.Timeout | null = null;

export const startNotificationProcessor = (intervalMs: number = 30000) => {
  if (notificationInterval) {
    clearInterval(notificationInterval);
  }

  console.log(`🚀 Starting notification processor (every ${intervalMs}ms)`);
  
  // Process immediately
  processPendingNotifications();
  
  // Then process on interval
  notificationInterval = setInterval(processPendingNotifications, intervalMs);
};

export const stopNotificationProcessor = () => {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
    console.log('⏹️ Stopped notification processor');
  }
};

// Utility function to send immediate notification (for testing)
export const sendTestNotification = async (phone: string, message: string, provider: 'sms' | 'whatsapp' = 'sms') => {
  console.log('🧪 Sending test notification...');
  const result = await sendNotification({ phone, message, provider });
  console.log('Test notification result:', result);
  return result;
};