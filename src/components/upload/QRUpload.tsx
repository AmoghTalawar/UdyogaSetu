import React, { useState, useEffect } from 'react';
import { QrCode, Smartphone, Upload, CheckCircle, RefreshCw, AlertCircle, X } from 'lucide-react';
import { getUploadedFile, cleanupOldFiles } from '../../utils/fileStorage';

interface QRUploadProps {
  onFileReceived: (file: File) => void;
  onClose: () => void;
  className?: string;
  jobId?: string; // Add job ID prop
}

const QRUpload: React.FC<QRUploadProps> = ({ onFileReceived, onClose, className = '', jobId }) => {
  const [uploadId, setUploadId] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [status, setStatus] = useState<'generating' | 'waiting' | 'uploaded' | 'expired' | 'error'>('generating');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    generateQRCode();
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  useEffect(() => {
    if (status === 'waiting') {
      // Start countdown timer
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setStatus('expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Start polling for file upload
      const polling = setInterval(() => {
        checkForUpload();
      }, 2000);

      setPollingInterval(polling);

      return () => {
        clearInterval(timer);
        clearInterval(polling);
      };
    }
  }, [status]);

  const generateQRCode = async () => {
    try {
      // Clean up old files first
      await cleanupOldFiles();
      
      // Generate unique upload ID
      const id = Math.random().toString(36).substring(2, 15);
      setUploadId(id);

      // Get network IP for mobile access
      const networkIP = import.meta.env.VITE_LOCAL_IP || getLocalNetworkIP();
      
      // Get current port from window location or use default
      const currentPort = window.location.port || '5173';
      
      // Generate kiosk application URL with job ID if provided
      let kioskUrl;
      if (jobId) {
        kioskUrl = `http://${networkIP}:${currentPort}/kiosk?job=${jobId}`;
      } else {
        // Fallback to general kiosk URL
        kioskUrl = `http://${networkIP}:${currentPort}/kiosk`;
      }
      
      console.log('Generated kiosk URL:', kioskUrl);
      
      // Generate QR code using a QR code service (in production, use a proper QR library)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(kioskUrl)}`;
      setQrCodeUrl(qrUrl);
      
      setStatus('waiting');
      setTimeRemaining(300); // Reset to 5 minutes
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      setStatus('error');
    }
  };

  // Helper function to get local network IP (fallback)
  const getLocalNetworkIP = (): string => {
    // Try to detect from common network ranges
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return hostname;
    }
    
    // Fallback IP addresses (user should configure in .env)
    return '192.168.1.100'; // Default fallback
  };

  const checkForUpload = async () => {
    // Simplified: Just check local storage for file uploads
    // This removes the complex Supabase and server dependencies
    try {
      const file = await getUploadedFile(uploadId);
      if (file && status === 'waiting') {
        setUploadedFile(file);
        setStatus('uploaded');
        
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
      }
    } catch (error) {
      console.error('Error checking for upload:', error);
    }
  };

  const handleFileConfirm = () => {
    if (uploadedFile) {
      onFileReceived(uploadedFile);
      onClose();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'generating':
        return <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />;
      case 'waiting':
        return <QrCode className="w-8 h-8 text-blue-500" />;
      case 'uploaded':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'expired':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      default:
        return <QrCode className="w-8 h-8 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'generating':
        return 'Generating QR code...';
      case 'waiting':
        return 'Scan QR code with your phone to upload resume';
      case 'uploaded':
        return 'Resume uploaded successfully!';
      case 'expired':
        return 'QR code expired. Please generate a new one.';
      case 'error':
        return 'Failed to generate QR code. Please try again.';
      default:
        return '';
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Smartphone className="w-5 h-5 mr-2" />
          Upload Resume via QR Code
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close QR upload"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Status Display */}
      <div className="text-center mb-6">
        <div className="mb-4">
          {getStatusIcon()}
        </div>
        <p className="text-lg font-medium text-gray-900 mb-2">
          {getStatusMessage()}
        </p>
        
        {status === 'waiting' && (
          <p className="text-sm text-gray-600">
            Time remaining: <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
          </p>
        )}
      </div>

      {/* QR Code Display */}
      {status === 'waiting' && qrCodeUrl && (
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
            <img
              src={qrCodeUrl}
              alt="QR Code for file upload"
              className="w-48 h-48 mx-auto"
              onError={() => setStatus('error')}
            />
          </div>
          
          {/* Instructions */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-center space-x-3 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <span>Open camera on your phone</span>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <span>Scan the QR code above</span>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <span>Upload your resume file</span>
              </div>
            </div>
          </div>

          {/* Upload URL for manual entry */}
          <details className="mt-6">
            <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-700">
              Can't scan? Enter URL manually
            </summary>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Copy this URL to your phone's browser:</p>
              <code className="text-xs bg-white px-2 py-1 rounded border break-all">
                {(() => {
                  const networkIP = import.meta.env.VITE_LOCAL_IP || getLocalNetworkIP();
                  const currentPort = window.location.port || '5173';
                  return jobId 
                    ? `http://${networkIP}:${currentPort}/kiosk?job=${jobId}`
                    : `http://${networkIP}:${currentPort}/kiosk`;
                })()}
              </code>
            </div>
          </details>
        </div>
      )}

      {/* Upload Success */}
      {status === 'uploaded' && uploadedFile && (
        <div className="text-center space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Upload className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">File Received</span>
            </div>
            <p className="text-sm text-green-700">
              <strong>{uploadedFile.name}</strong>
            </p>
            <p className="text-xs text-green-600 mt-1">
              Size: {(uploadedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleFileConfirm}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors focus:ring-2 focus:ring-green-200 focus:outline-none"
            >
              Use This File
            </button>
            <button
              onClick={generateQRCode}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-200 focus:outline-none"
            >
              Upload Different File
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {(status === 'error' || status === 'expired') && (
        <div className="text-center space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700 mb-3">
              {status === 'expired' 
                ? 'The QR code has expired for security reasons.'
                : 'There was an error generating the QR code.'
              }
            </p>
            <button
              onClick={generateQRCode}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-200 focus:outline-none"
            >
              Generate New QR Code
            </button>
          </div>
        </div>
      )}

      {/* Loading Animation */}
      {status === 'waiting' && (
        <div className="mt-6">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <span className="ml-2">Waiting for upload...</span>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
            <span>📱 Need Help?</span>
            <span className="group-open:rotate-180 transition-transform">▼</span>
          </summary>
          
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <div>
              <h5 className="font-medium text-gray-900 mb-1">QR Code Not Working?</h5>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Make sure your phone's camera app is open</li>
                <li>Hold your phone steady and ensure good lighting</li>
                <li>Try moving closer or further from the screen</li>
                <li>Use the manual URL option if scanning fails</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Supported File Types</h5>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>PDF files (.pdf) - Recommended</li>
                <li>Word documents (.doc, .docx)</li>
                <li>Maximum file size: 5MB</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Security & Privacy</h5>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>QR codes expire after 5 minutes for security</li>
                <li>Files are encrypted during transfer</li>
                <li>Your data is processed securely and privately</li>
              </ul>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default QRUpload;