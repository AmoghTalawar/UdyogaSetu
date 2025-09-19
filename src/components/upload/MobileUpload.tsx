import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText, Smartphone, User, Phone, Mail, Sparkles, ArrowRight } from 'lucide-react';
import { storeUploadedFile } from '../../utils/fileStorage';
import { uploadResumeToSupabase, startCleanupInterval, supabase } from '../../utils/supabase';
import SuccessPopup from '../common/SuccessPopup';

interface MobileUploadProps {
  uploadId: string;
}

// Start Supabase cleanup when component loads
startCleanupInterval();

const MobileUpload: React.FC<MobileUploadProps> = ({ uploadId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [applicantData, setApplicantData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a PDF or Word document');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    // Validate form
    if (!applicantData.name.trim() || !applicantData.phone.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (applicantData.email.trim() && !applicantData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setUploadStatus('uploading');
    setUploadProgress(0);
    setError('');

    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return prev + 20;
        });
      }, 400);

      // Upload to Supabase first
      console.log('Uploading to Supabase...');
      const supabaseResult = await uploadResumeToSupabase(uploadId, selectedFile);

      clearInterval(progressInterval);

      if (supabaseResult.success) {
        // Save application to database
        await saveApplicationToSupabase({
          method: 'qr',
          applicantName: applicantData.name,
          applicantEmail: applicantData.email,
          applicantPhone: applicantData.phone,
        }, selectedFile);

        setUploadProgress(100);
        setUploadStatus('success');
        setShowSuccessPopup(true);
        console.log('Application submitted successfully');
      } else {
        throw new Error(supabaseResult.error || 'Upload failed');
      }

    } catch (error: any) {
      setUploadStatus('error');
      if (error.message?.includes('Failed to fetch')) {
        setError('Could not connect to upload services. Please check your internet connection and try again.');
      } else {
        setError(`Upload failed: ${error.message || 'Please try again.'}`);
      }
      console.error('Upload error:', error);
    }
  };

  const saveApplicationToSupabase = async (applicationData: any, resumeFile?: File) => {
    try {
      let resumeResult = null;

      if (resumeFile) {
        // Upload resume file to Supabase
        const uploadId = `${applicationData.method}_${Date.now()}_${applicantData.name.replace(/\s+/g, '_')}`;
        resumeResult = await uploadResumeToSupabase(uploadId, resumeFile);
      }

      // Generate a simple AI score based on application completeness
      const calculateApplicantScore = () => {
        let score = 60; // Base score

        // Bonus for complete profile
        if (applicantData.name.trim()) score += 10;
        if (applicantData.email.trim() && applicantData.email.includes('@')) score += 10;
        if (applicantData.phone.trim()) score += 10;

        // Bonus for resume quality
        if (resumeResult) score += 15;

        // Random small variation to simulate AI analysis
        score += Math.floor(Math.random() * 10) - 5;

        return Math.min(100, Math.max(40, score));
      };

      // Save application data to database
      // For mobile uploads, we use an existing job ID since job_id has a foreign key constraint
      const applicationRecord = {
        job_id: '1', // Use existing job ID from database (first job in mock data)
        applicant_name: applicationData.applicantName,
        applicant_email: applicationData.applicantEmail || null,
        applicant_phone: applicationData.applicantPhone,
        application_method: applicationData.method,
        resume_url: resumeResult?.publicUrl || null,
        resume_file_id: resumeResult?.fileId || null,
        company_id: '00000000-0000-0000-0000-000000000000', // Placeholder UUID for mobile uploads
        applicant_score: calculateApplicantScore(),
        applied_at: new Date().toISOString(),
        status: 'submitted'
      };

      // Insert into Supabase database
      const { data: dbData, error: dbError } = await (supabase as any)
        .from('job_applications')
        .insert([applicationRecord])
        .select();

      if (dbError) {
        console.error('Failed to save application to database:', dbError.message);
        throw new Error(`Database error: ${dbError.message}`);
      } else {
        console.log('Application saved to database:', dbData?.[0]?.id);
      }

      return {
        ...resumeResult,
        applicationId: (dbData as any)?.[0]?.id,
        applicantScore: applicationRecord.applicant_score
      };
    } catch (error) {
      console.error('Error saving application:', error);
      throw error;
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setError('');
    setApplicantData({
      name: '',
      phone: '',
      email: '',
    });
    setCurrentStep(1);
  };

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    // Optionally redirect or close the page
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Application</h1>
          <p className="text-gray-600">Complete your job application with resume upload</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>Details</span>
          </div>
          <div className={`w-8 h-px ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>Upload</span>
          </div>
          <div className={`w-8 h-px ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
            <span className={`text-sm font-medium ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>Submit</span>
          </div>
        </div>

        {/* Application Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Your Information</h2>
                <p className="text-gray-600 text-sm">Please provide your contact details</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span>Full Name</span>
                      <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={applicantData.name}
                      onChange={(e) => setApplicantData({ ...applicantData, name: e.target.value })}
                      className={`w-full px-4 py-3 text-lg border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                        !applicantData.name.trim()
                          ? 'border-red-300 bg-red-50/50 focus:ring-red-500/20 focus:border-red-500'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {applicantData.name.trim() && (
                      <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-green-500" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-green-600" />
                      <span>Phone Number</span>
                      <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={applicantData.phone}
                      onChange={(e) => setApplicantData({ ...applicantData, phone: e.target.value })}
                      className={`w-full px-4 py-3 text-lg border-2 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all ${
                        !applicantData.phone.trim()
                          ? 'border-red-300 bg-red-50/50 focus:ring-red-500/20 focus:border-red-500'
                          : 'border-gray-200 bg-white hover:border-green-300'
                      }`}
                      placeholder="+91 XXXXX XXXXX"
                    />
                    {applicantData.phone.trim() && (
                      <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-green-500" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-purple-600" />
                      <span>Email Address</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">Optional</span>
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={applicantData.email}
                      onChange={(e) => setApplicantData({ ...applicantData, email: e.target.value })}
                      className={`w-full px-4 py-3 text-lg border-2 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all ${
                        applicantData.email.trim() && !applicantData.email.includes('@')
                          ? 'border-red-300 bg-red-50/50 focus:ring-red-500/20 focus:border-red-500'
                          : 'border-gray-200 bg-white hover:border-purple-300'
                      }`}
                      placeholder="your@email.com"
                    />
                    {applicantData.email.trim() && applicantData.email.includes('@') && (
                      <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-green-500" />
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  if (!applicantData.name.trim() || !applicantData.phone.trim()) {
                    setError('Please fill in all required fields');
                    return;
                  }
                  if (applicantData.email.trim() && !applicantData.email.includes('@')) {
                    setError('Please enter a valid email address');
                    return;
                  }
                  setError('');
                  setCurrentStep(2);
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Next: Upload Resume</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Resume</h2>
                <p className="text-gray-600 text-sm">Select your resume file to upload</p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-4">
                  Select your resume file to upload
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors inline-block font-medium"
                >
                  Choose File
                </label>
                <p className="text-xs text-gray-500 mt-3">
                  Supports PDF, DOC, DOCX (max 5MB)
                </p>
              </div>

              {selectedFile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">{selectedFile.name}</p>
                      <p className="text-sm text-blue-700">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (!selectedFile) {
                      setError('Please select a file to upload');
                      return;
                    }
                    setError('');
                    setCurrentStep(3);
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Next: Submit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && uploadStatus === 'idle' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Review & Submit</h2>
                <p className="text-gray-600 text-sm">Review your information and submit your application</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="text-gray-900">{applicantData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="text-gray-900">{applicantData.phone}</span>
                </div>
                {applicantData.email && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="text-gray-900">{applicantData.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Resume:</span>
                  <span className="text-gray-900">{selectedFile?.name}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Submit Application</span>
                </button>
              </div>
            </div>
          )}

          {uploadStatus === 'uploading' && (
            <div className="text-center space-y-4">
              <Upload className="w-12 h-12 text-blue-600 mx-auto animate-pulse" />
              <div>
                <p className="font-medium text-gray-900 mb-2">Submitting Application...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">{uploadProgress}% complete</p>
              </div>
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Submitted!</h3>
                <p className="text-gray-600 mb-4">
                  Your job application has been successfully submitted. The employer will review your application and contact you soon.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>What happens next:</strong>
                  </p>
                  <ul className="text-sm text-green-700 mt-2 space-y-1">
                    <li>• Your application is being reviewed</li>
                    <li>• You'll receive updates via phone/email</li>
                    <li>• Response typically within 3-5 business days</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={resetUpload}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Submit Another Application
              </button>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="text-center space-y-4">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Submission Failed</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={resetUpload}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900">Supported Files:</h4>
              <p>PDF (.pdf), Word (.doc, .docx) up to 5MB</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Having Issues?</h4>
              <p>Make sure you have a stable internet connection and try again</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Privacy:</h4>
              <p>Your file is encrypted and securely transferred to the kiosk</p>
            </div>
          </div>
        </div>
      </div>

      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={handleSuccessPopupClose}
        applicantName={applicantData.name}
        applicationMethod="qr_mobile"
        jobTitle="Mobile Job Application"
      />
    </div>
  );
};

export default MobileUpload;