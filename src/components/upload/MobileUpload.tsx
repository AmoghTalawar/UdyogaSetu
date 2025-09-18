import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText, Smartphone } from 'lucide-react';
import { storeUploadedFile } from '../../utils/fileStorage';
import { uploadResumeToSupabase, startCleanupInterval } from '../../utils/supabase';

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

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Progress simulation for better UX
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
        // Supabase upload succeeded
        setUploadProgress(100);
        setUploadStatus('success');
        console.log('File uploaded to Supabase successfully:', supabaseResult.publicUrl);
        
        // Also store in local storage as backup
        try {
          await storeUploadedFile(uploadId, selectedFile);
        } catch (localError) {
          console.warn('Local storage backup failed:', localError);
          // Continue anyway since Supabase upload succeeded
        }
        
        return;
      }
      
      // If Supabase fails, try local server as fallback
      console.log('Supabase upload failed, trying local server...', supabaseResult.error);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('uploadId', uploadId);

      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Local server upload failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Store in local storage as backup
      await storeUploadedFile(uploadId, selectedFile);
      
      setUploadProgress(100);
      setUploadStatus('success');

      console.log('File uploaded to local server:', result);

    } catch (error) {
      setUploadStatus('error');
      if (error.message.includes('Failed to fetch')) {
        setError('Could not connect to upload services. Please check your internet connection and try again.');
      } else {
        setError(`Upload failed: ${error.message || 'Please try again.'}`);
      }
      console.error('Upload error:', error);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Resume</h1>
          <p className="text-gray-600">Upload your resume to complete the job application</p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {uploadStatus === 'idle' && (
            <div className="space-y-6">
              {/* File Input */}
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

              {/* Selected File */}
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

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!selectedFile}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Upload Resume
              </button>
            </div>
          )}

          {/* Uploading State */}
          {uploadStatus === 'uploading' && (
            <div className="text-center space-y-4">
              <Upload className="w-12 h-12 text-blue-600 mx-auto animate-pulse" />
              <div>
                <p className="font-medium text-gray-900 mb-2">Uploading...</p>
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

          {/* Success State */}
          {uploadStatus === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Successful!</h3>
                <p className="text-gray-600 mb-4">
                  Your resume has been sent to the kiosk. You can now return to complete your application.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>Next steps:</strong>
                  </p>
                  <ul className="text-sm text-green-700 mt-2 space-y-1">
                    <li>• Return to the kiosk</li>
                    <li>• Complete any remaining application details</li>
                    <li>• Submit your application</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={resetUpload}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Upload Different File
              </button>
            </div>
          )}

          {/* Error State */}
          {uploadStatus === 'error' && (
            <div className="text-center space-y-4">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Failed</h3>
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

        {/* Help Section */}
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
    </div>
  );
};

export default MobileUpload;