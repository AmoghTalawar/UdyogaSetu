import React, { useState, useEffect } from 'react';
import { QrCode, Mic, Upload, Search, CheckCircle2, AlertCircle, Phone } from 'lucide-react';
import QRScanner from '../components/kiosk/QRScanner';
import VoiceRecorder from '../components/voice/VoiceRecorder';
import SuccessPopup from '../components/common/SuccessPopup';
import {
  submitApplication,
  uploadResumeToSupabase,
  checkApplicationStatus,
  APPLICATION_METHOD,
  APPLICATION_STATUS
} from '../utils/supabase';
import { ApplicationWithDetails } from '../utils/database.types';
import { getUploadedFile } from '../utils/fileStorage';

interface KioskPageProps {
  onNavigate?: (page: string) => void;
}

type ApplicationMode = 'select' | 'qr-scan' | 'voice' | 'upload' | 'status-check' | 'success';

const KioskPage: React.FC<KioskPageProps> = ({ onNavigate }) => {
  const [mode, setMode] = useState<ApplicationMode>(() => {
    // Check if job ID is provided in URL
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('job');
    // If job ID is provided, go directly to upload mode (skip selection)
    return jobId ? 'upload' : 'upload';
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(() => {
    // Get job ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('job');
  });
  const [uploadId, setUploadId] = useState<string | null>(() => {
    // Get upload ID from URL parameters (for QR upload functionality)
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('uploadId');
  });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [jobTitle, setJobTitle] = useState('Job Position');
  
  // Form data
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [voiceRecording, setVoiceRecording] = useState<Blob | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  
  // Status check
  const [statusPhone, setStatusPhone] = useState('');
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);

  // Check for uploaded file when uploadId is present
  useEffect(() => {
    const checkForUploadedFile = async () => {
      if (uploadId) {
        try {
          console.log('Checking for uploaded file with uploadId:', uploadId);
          const file = await getUploadedFile(uploadId);
          if (file) {
            setResumeFile(file);
            console.log('File found and set:', file.name);
          } else {
            console.log('No file found for uploadId:', uploadId);
          }
        } catch (error) {
          console.error('Error checking for uploaded file:', error);
        }
      }
    };

    checkForUploadedFile();
  }, [uploadId]);

  const resetForm = () => {
    setApplicantName('');
    setApplicantEmail('');
    setApplicantPhone('');
    setResumeFile(null);
    setVoiceRecording(null);
    setVoiceTranscript('');
    setError(null);
    setSuccess(null);
  };

  const handleQRScan = (result: string) => {
    console.log('QR Scan result:', result);
    
    // Parse QR code result - assuming it contains job ID
    try {
      // QR code might be a URL like: https://jobportal.com/apply/job-id
      // or just the job ID directly
      const jobId = result.includes('/') ? result.split('/').pop() : result;
      
      if (jobId) {
        setSelectedJobId(jobId);
        setMode('upload');
      } else {
        setError('Invalid QR code. Please scan a valid job QR code.');
        setMode('select');
      }
    } catch (err) {
      setError('Failed to process QR code. Please try again.');
      setMode('select');
    }
  };

  const handleVoiceComplete = (audioBlob: Blob, transcript: string) => {
    setVoiceRecording(audioBlob);
    setVoiceTranscript(transcript);
    console.log('Voice recording completed:', { transcript, audioBlob });
  };

  const handleFileUpload = (file: File) => {
    setResumeFile(file);
    console.log('Resume file selected:', file.name);
  };

  const submitJobApplication = async () => {
    if (!selectedJobId) {
      setError('No job selected. Please scan a QR code first.');
      return;
    }

    if (!applicantName || !applicantPhone) {
      setError('Please provide your name and phone number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let resumeUrl = '';
      let voiceUrl = '';
      const applicationMethod = resumeFile ? APPLICATION_METHOD.KIOSK_QR : APPLICATION_METHOD.KIOSK_VOICE;

      // Upload resume file if provided
      if (resumeFile) {
        const uploadId = `kiosk_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const uploadResult = await uploadResumeToSupabase(uploadId, resumeFile);
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload resume');
        }
        
        resumeUrl = uploadResult.publicUrl || '';
      }

      // Upload voice recording if provided
      if (voiceRecording) {
        // In a real implementation, you'd upload the voice recording to storage
        // For now, we'll just note it in the transcript
        voiceUrl = 'pending_voice_upload';
      }

      // Submit application
      const applicationData = {
        job_id: selectedJobId,
        applicant_name: applicantName,
        applicant_email: applicantEmail || undefined,
        applicant_phone: applicantPhone,
        application_method: applicationMethod,
        resume_url: resumeUrl || undefined,
        voice_recording_url: voiceUrl || undefined,
        voice_transcript: voiceTranscript || undefined,
        kiosk_id: 'KIOSK_001', // This would come from kiosk config
        submission_location: 'Mall Kiosk - Downtown',
      };

      const result = await submitApplication(applicationData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit application');
      }

      setSuccess('Application submitted successfully!');
      setShowSuccessPopup(true);
      
      // Don't auto-reset form - let user close popup manually

    } catch (err) {
      console.error('Application submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!statusPhone) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await checkApplicationStatus(statusPhone);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to check status');
      }

      if (!result.data || result.data.length === 0) {
        setError('No applications found for this phone number');
        return;
      }

      setApplications(result.data);
    } catch (err) {
      console.error('Status check error:', err);
      setError(err instanceof Error ? err.message : 'Failed to check status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      case 'under_review': return 'text-yellow-600';
      case 'shortlisted': return 'text-blue-600';
      case 'hired': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'hired':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Job Application Kiosk
          </h1>
          <p className="text-xl text-gray-600">
            Apply for jobs instantly or check your application status
          </p>
        </div>



        {/* Upload Application */}
        {mode === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Application</h2>
              
              <div className="space-y-6">
                {/* Personal Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume File *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {resumeFile ? resumeFile.name : 'Click to select resume file'}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX (max 5MB)
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between">
                  <button
                    onClick={() => window.history.back()}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={submitJobApplication}
                    disabled={loading || !applicantName || !applicantPhone || !resumeFile}
                    className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mt-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Success Popup */}
        <SuccessPopup
          isOpen={showSuccessPopup}
          onClose={() => {
            setShowSuccessPopup(false);
            resetForm();
            // Go back to previous page or close window
            window.history.back();
          }}
          applicantName={applicantName}
          applicationMethod={resumeFile ? 'qr' : 'voice'}
          jobTitle={jobTitle}
        />
      </div>
    </div>
  );
};

export default KioskPage;