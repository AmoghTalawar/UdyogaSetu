import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Mic, 
  FileText, 
  QrCode, 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  Shield,
  Zap,
  Star
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Job } from '../../types';
import MultilingualVoiceRecorder from '../voice/MultilingualVoiceRecorder';
import QRUpload from '../upload/QRUpload';
import { fileStorageService } from '../../utils/fileStorage';
import { uploadResumeToSupabase, supabase } from '../../utils/supabase';
import SuccessPopup from '../common/SuccessPopup';
import { formatResumeAsHTML } from '../../utils/resumeParser';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  onSubmit: (applicationData: any) => void;
}

const ApplyModal: React.FC<ApplyModalProps> = ({ isOpen, onClose, job, onSubmit }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'qr' | 'voice'>('qr');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [qrUploadedFile, setQrUploadedFile] = useState<File | null>(null);
  const [voiceData, setVoiceData] = useState<{
    audioBlob: Blob | null;
    transcript: string;
    language: string;
    resumeData?: any;
  }>({ audioBlob: null, transcript: '', language: 'en-US' });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [applicantData, setApplicantData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF or Word document (.pdf, .doc, .docx)');
        return;
      }
      
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert('File size must be less than 5MB. Please compress your file or choose a smaller one.');
        return;
      }
      
      setSelectedFile(file);
      console.log('File selected:', file.name, 'Size:', (file.size / 1024).toFixed(1) + 'KB');
    }
  };

  const handleVoiceComplete = (audioBlob: Blob, transcript: string, language: string, resumeData?: any) => {
    setVoiceData({ audioBlob, transcript, language, resumeData });
  };

  const saveApplicationToSupabase = async (applicationData: any, resumeFile?: File) => {
    try {
      let resumeResult = null;
      
      if (resumeFile) {
        // Upload resume file to Supabase
        const uploadId = `${applicationData.method}_${Date.now()}_${applicantData.name.replace(/\s+/g, '_')}`;
        resumeResult = await uploadResumeToSupabase(uploadId, resumeFile);
      }
      
      // Generate a simple AI score based on application completeness and method
      const calculateApplicantScore = () => {
        let score = 60; // Base score
        
        // Bonus for complete profile
        if (applicantData.name.trim()) score += 10;
        if (applicantData.email.trim() && applicantData.email.includes('@')) score += 10;
        if (applicantData.phone.trim()) score += 10;
        
        // Bonus for method
        if (applicationData.method === 'voice') score += 10; // Voice shows initiative
        
        // Bonus for resume quality (simplified)
        if (resumeResult || applicationData.resumeData) score += 15;
        
        // Random small variation to simulate AI analysis
        score += Math.floor(Math.random() * 10) - 5;
        
        return Math.min(100, Math.max(40, score));
      };
      
      // Get company_id from job data (fetch from jobs table)
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('company_id')
        .eq('id', applicationData.jobId)
        .single();
      
      if (jobError) {
        console.error('Error fetching job company_id:', jobError);
        // Continue with null company_id as fallback
      }
      
      // Save application data to database
      const applicationRecord = {
        job_id: applicationData.jobId,
        applicant_name: applicantData.name,
        applicant_email: applicantData.email || null,
        applicant_phone: applicantData.phone,
        application_method: applicationData.method,
        resume_url: resumeResult?.publicUrl || null,
        resume_file_id: resumeResult?.fileId || null,
        voice_language: applicationData.voiceLanguage || null,
        voice_transcript: applicationData.voiceTranscript || null,
        company_id: jobData?.company_id || null,
        applicant_score: calculateApplicantScore(),
        applied_at: new Date().toISOString(),
        status: 'submitted'
      };
      
      // Insert into Supabase database
      const { data: dbData, error: dbError } = await supabase
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
        applicationId: dbData?.[0]?.id,
        applicantScore: applicationRecord.applicant_score
      };
    } catch (error) {
      console.error('Error saving application:', error);
      throw error;
    }
  };

  const saveGeneratedResumeToSupabase = async (resumeData: any, applicantName: string) => {
    try {
      // Format resume as HTML and convert to PDF-like format
      const resumeContent = formatResumeAsHTML(resumeData, applicantName);
      const resumeBlob = new Blob([resumeContent], { type: 'application/octet-stream' });
      const resumeFile = new File([resumeBlob], `${applicantName.replace(/\s+/g, '_')}_Generated_Resume.html`, {
        type: 'application/octet-stream'
      });

      return resumeFile;
    } catch (error) {
      console.error('Error creating generated resume:', error);
      return null;
    }
  };

  // Helper function to format resume as HTML
  const formatResumeAsHTML = (resumeData: any, applicantName: string): string => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume - ${applicantName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        .contact-info { background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .section { margin: 25px 0; }
        ul { padding-left: 20px; }
        .skills { display: flex; flex-wrap: wrap; gap: 10px; }
        .skill { background: #3498db; color: white; padding: 5px 10px; border-radius: 15px; font-size: 14px; }
    </style>
</head>
<body>
    <h1>${applicantName}</h1>
    
    <div class="contact-info">
        ${resumeData.contact?.phone ? `<p><strong>Phone:</strong> ${resumeData.contact.phone}</p>` : ''}
        ${resumeData.contact?.email ? `<p><strong>Email:</strong> ${resumeData.contact.email}</p>` : ''}
        ${resumeData.contact?.location ? `<p><strong>Location:</strong> ${resumeData.contact.location}</p>` : ''}
    </div>
    
    ${resumeData.summary ? `
    <div class="section">
        <h2>Professional Summary</h2>
        <p>${resumeData.summary}</p>
    </div>
    ` : ''}
    
    ${resumeData.skills && resumeData.skills.length > 0 ? `
    <div class="section">
        <h2>Skills</h2>
        <div class="skills">
            ${resumeData.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
        </div>
    </div>
    ` : ''}
    
    ${resumeData.experience && resumeData.experience.length > 0 ? `
    <div class="section">
        <h2>Work Experience</h2>
        ${resumeData.experience.map((exp, index) => `
            <div style="margin-bottom: 20px;">
                <h3>${exp.title || 'Position'} at ${exp.company || 'Company'}</h3>
                ${exp.duration ? `<p><em>${exp.duration}</em></p>` : ''}
                ${exp.description ? `<p>${exp.description}</p>` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}
    
    ${resumeData.education && resumeData.education.length > 0 ? `
    <div class="section">
        <h2>Education</h2>
        ${resumeData.education.map((edu, index) => `
            <div style="margin-bottom: 15px;">
                <h3>${edu.degree || edu.qualification || 'Education'}</h3>
                ${edu.institution ? `<p><strong>${edu.institution}</strong></p>` : ''}
                ${edu.year ? `<p><em>${edu.year}</em></p>` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}
    
    <div class="section">
        <p><em>Generated on: ${new Date().toLocaleDateString()}</em></p>
    </div>
</body>
</html>`;

    return htmlContent;
  };


  const resetForm = () => {
    // Reset all form data
    setApplicantData({
      name: '',
      phone: '',
      email: '',
    });
    
    // Reset file uploads
    setSelectedFile(null);
    setQrUploadedFile(null);
    
    // Reset voice data
    setVoiceData({
      audioBlob: null,
      transcript: '',
      language: 'en-US',
    });
    
    // Reset to QR tab
    setActiveTab('qr');
  };

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    onClose(); // Close the main modal
  };

  const handleQRFileReceived = (file: File) => {
    setSelectedFile(file);
    setQrUploadedFile(file);
    // File received successfully, stay on QR tab
    setActiveTab('qr');
  };

  const handleVoiceError = (error: string) => {
    console.error('Voice recording error:', error);
    // You could show a toast notification here
  };

  const validateForm = () => {
    const errors = [];
    
    if (!applicantData.name.trim()) {
      errors.push('Full name is required');
    }
    
    if (!applicantData.phone.trim()) {
      errors.push('Phone number is required');
    }
    
    // Email is optional, but if provided, it must be valid
    if (applicantData.email.trim() && !applicantData.email.includes('@')) {
      errors.push('Please enter a valid email format');
    }
    
    if (activeTab === 'qr' && !selectedFile && !qrUploadedFile) {
      errors.push('Please upload a resume file');
    }
    
    if (activeTab === 'voice' && (!voiceData.audioBlob || !voiceData.transcript || !voiceData.resumeData)) {
      errors.push('Please complete voice recording and resume generation');
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate form
      const errors = validateForm();
      if (errors.length > 0) {
        alert('Please complete all required fields:\n' + errors.join('\n'));
        setIsSubmitting(false);
        return;
      }

      let applicationData: any = {
        jobId: job.id,
        method: activeTab,
        applicantName: applicantData.name,
        applicantEmail: applicantData.email,
        applicantPhone: applicantData.phone,
      };

      let resumeFile = null;

      if (activeTab === 'qr') {
        const fileToSubmit = selectedFile || qrUploadedFile;
        resumeFile = fileToSubmit;
        applicationData = {
          ...applicationData,
          resumeFile: fileToSubmit,
          hasValidResume: !!fileToSubmit,
        };
        console.log('Submitting QR application with file:', fileToSubmit?.name);
      } else if (activeTab === 'voice') {
        // Create resume file from generated data
        if (voiceData.resumeData) {
          resumeFile = await saveGeneratedResumeToSupabase(voiceData.resumeData, applicantData.name);
        }

        applicationData = {
          ...applicationData,
          voiceTranscript: voiceData.transcript,
          voiceLanguage: voiceData.language,
          audioBlob: voiceData.audioBlob,
          resumeData: voiceData.resumeData,
          generatedResumeFile: resumeFile,
          hasValidResume: !!resumeFile,
        };
        console.log('Submitting voice application with generated resume');
      }

      // Save to Supabase with applicant information
      await saveApplicationToSupabase(applicationData, resumeFile);

      // Show success popup instead of just closing
      setShowSuccessPopup(true);
      
      // Reset form after successful submission
      resetForm();
      
      onSubmit(applicationData);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className={`fixed inset-0 z-50 overflow-y-auto transition-all duration-300 ${
      isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`} aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 py-6 text-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className={`relative inline-block w-full max-w-4xl transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}>
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header with Gradient */}
            <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-8">
              <div className="absolute inset-0 bg-black/10"></div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 left-4 w-12 h-12 bg-white/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute bottom-4 right-8 w-8 h-8 bg-white/10 rounded-full blur-lg animate-pulse" style={{animationDelay: '1s'}}></div>
              
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="relative">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-white">
                    <h2 className="text-3xl font-bold mb-2">
                      Apply to {job.title}
                    </h2>
                    <p className="text-blue-100 text-lg">
                      {job.company} • {job.location}
                    </p>
                  </div>
                </div>
                
                {/* Progress Steps */}
                <div className="flex items-center space-x-4 mt-6">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      currentStep >= 1 ? 'bg-white text-blue-600' : 'bg-white/30 text-white/70'
                    }`}>
                      1
                    </div>
                    <span className="text-blue-100 text-sm font-medium">Choose Method</span>
                  </div>
                  <div className="w-8 h-px bg-white/30"></div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      currentStep >= 2 ? 'bg-white text-blue-600' : 'bg-white/30 text-white/70'
                    }`}>
                      2
                    </div>
                    <span className="text-blue-100 text-sm font-medium">Your Details</span>
                  </div>
                  <div className="w-8 h-px bg-white/30"></div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      currentStep >= 3 ? 'bg-white text-blue-600' : 'bg-white/30 text-white/70'
                    }`}>
                      3
                    </div>
                    <span className="text-blue-100 text-sm font-medium">Submit</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="max-h-[70vh] overflow-y-auto">
              <div className="px-8 py-8 space-y-8">
                {/* Application Method Selection */}
                <div className={`transform transition-all duration-500 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                    <h3 className="text-2xl font-bold text-gray-900">Choose Your Application Method</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div 
                      onClick={() => {
                        setActiveTab('qr');
                        setCurrentStep(2);
                      }}
                      className={`group cursor-pointer rounded-2xl border-2 p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                        activeTab === 'qr'
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg'
                          : 'border-gray-200 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        activeTab === 'qr' 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                          : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                      }`}>
                        <QrCode className="w-10 h-10" />
                      </div>
                      <h4 className={`text-xl font-bold mb-3 ${
                        activeTab === 'qr' ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-600'
                      }`}>
                        📱 QR Code Upload
                      </h4>
                      <p className={`text-sm leading-relaxed ${
                        activeTab === 'qr' ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        Scan QR code with your phone to upload resume directly from your mobile device. Quick and secure!
                      </p>
                      
                      {activeTab === 'qr' && (
                        <div className="mt-4 flex items-center justify-center space-x-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Selected</span>
                        </div>
                      )}
                    </div>
                    
                    <div 
                      onClick={() => {
                        setActiveTab('voice');
                        setCurrentStep(2);
                      }}
                      className={`group cursor-pointer rounded-2xl border-2 p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                        activeTab === 'voice'
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-100 shadow-lg'
                          : 'border-gray-200 hover:border-purple-300 bg-white'
                      }`}
                    >
                      <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        activeTab === 'voice' 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg' 
                          : 'bg-gray-100 text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-600'
                      }`}>
                        <Mic className="w-10 h-10" />
                      </div>
                      <h4 className={`text-xl font-bold mb-3 ${
                        activeTab === 'voice' ? 'text-purple-700' : 'text-gray-900 group-hover:text-purple-600'
                      }`}>
                        🎤 Voice Application
                      </h4>
                      <p className={`text-sm leading-relaxed ${
                        activeTab === 'voice' ? 'text-purple-600' : 'text-gray-600'
                      }`}>
                        Tell us about yourself in your preferred language. Our AI will create your resume automatically!
                      </p>
                      
                      {activeTab === 'voice' && (
                        <div className="mt-4 flex items-center justify-center space-x-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Benefits Section */}
                  <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <Shield className="w-6 h-6 text-green-600" />
                      <h4 className="text-lg font-semibold text-green-800">Why Apply with Udyoga Setu?</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-green-700">Instant Application</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <Shield className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-green-700">Secure & Private</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <Star className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-green-700">AI-Powered Matching</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                {(activeTab === 'qr' || activeTab === 'voice') && (
                  <div className={`transform transition-all duration-500 delay-300 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-2 h-8 bg-green-500 rounded-full"></div>
                      <h3 className="text-2xl font-bold text-gray-900">Your Contact Information</h3>
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Required</span>
                    </div>
                    
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name Field */}
                        <div className="md:col-span-2">
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
                              onChange={(e) => {
                                setApplicantData({ ...applicantData, name: e.target.value });
                                setCurrentStep(2);
                              }}
                              className={`w-full px-4 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                                !applicantData.name.trim() 
                                  ? 'border-red-300 bg-red-50/50 focus:ring-red-500/20 focus:border-red-500' 
                                  : 'border-gray-200 bg-white hover:border-blue-300'
                              }`}
                              placeholder="Enter your full name as per documents"
                              required
                            />
                            {applicantData.name.trim() && (
                              <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-green-500" />
                            )}
                          </div>
                          {!applicantData.name.trim() && (
                            <p className="flex items-center space-x-2 text-sm text-red-600 mt-2">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              <span>Full name is required for the application</span>
                            </p>
                          )}
                        </div>
                        
                        {/* Phone Field */}
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
                              className={`w-full px-4 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all ${
                                !applicantData.phone.trim() 
                                  ? 'border-red-300 bg-red-50/50 focus:ring-red-500/20 focus:border-red-500' 
                                  : 'border-gray-200 bg-white hover:border-green-300'
                              }`}
                              placeholder="+91 XXXXX XXXXX"
                              required
                            />
                            {applicantData.phone.trim() && (
                              <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-green-500" />
                            )}
                          </div>
                          {!applicantData.phone.trim() && (
                            <p className="flex items-center space-x-2 text-sm text-red-600 mt-2">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              <span>Phone number is required</span>
                            </p>
                          )}
                        </div>
                        
                        {/* Email Field */}
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
                              className={`w-full px-4 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all ${
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
                          {applicantData.email.trim() && !applicantData.email.includes('@') && (
                            <p className="flex items-center space-x-2 text-sm text-red-600 mt-2">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              <span>Please enter a valid email format</span>
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Privacy Notice */}
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-start space-x-3">
                          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h5 className="text-sm font-semibold text-blue-800 mb-1">Privacy Protected</h5>
                            <p className="text-sm text-blue-700">
                              Your information is encrypted and will only be shared with the hiring company for this specific application.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                
                {activeTab === 'qr' && (
                  <div className={`transform transition-all duration-500 delay-500 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                      <h3 className="text-2xl font-bold text-gray-900">Upload Your Resume</h3>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 border border-blue-200">
                      <QRUpload
                        onFileReceived={handleQRFileReceived}
                        onClose={() => setActiveTab('qr')}
                        jobId={job.id}
                      />
                    </div>
                  </div>
                )}

                {/* Voice Tab Content */}
                {activeTab === 'voice' && (
                  <div className={`transform transition-all duration-500 delay-500 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                      <h3 className="text-2xl font-bold text-gray-900">Record Your Voice Application</h3>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-8 border border-purple-200">
                      <MultilingualVoiceRecorder
                        onRecordingComplete={handleVoiceComplete}
                        onError={handleVoiceError}
                        maxDuration={300}
                        className=""
                      />
                      
                      {voiceData.resumeData && (
                        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 rounded-2xl">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-lg font-bold text-green-800 mb-3">
                                ✅ Resume Generated Successfully!
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="bg-white/70 rounded-xl p-3">
                                  <div className="font-semibold text-green-700">Language</div>
                                  <div className="text-green-600">{voiceData.language}</div>
                                </div>
                                <div className="bg-white/70 rounded-xl p-3">
                                  <div className="font-semibold text-green-700">Transcript Length</div>
                                  <div className="text-green-600">{voiceData.transcript.length} characters</div>
                                </div>
                                <div className="bg-white/70 rounded-xl p-3">
                                  <div className="font-semibold text-green-700">Generated For</div>
                                  <div className="text-green-600">{voiceData.resumeData.personalInfo.name}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Footer */}
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50/50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                {/* Progress Indicator */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className={`w-3 h-3 rounded-full ${
                      (activeTab === 'qr' || activeTab === 'voice') ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span>Method Selected</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className={`w-3 h-3 rounded-full ${
                      applicantData.name.trim() && applicantData.phone.trim() ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span>Details Complete</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className={`w-3 h-3 rounded-full ${
                      ((activeTab === 'qr' && (selectedFile || qrUploadedFile)) || 
                       (activeTab === 'voice' && voiceData.resumeData)) ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span>Ready to Submit</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting ||
                      !applicantData.name.trim() ||
                      !applicantData.phone.trim() ||
                      (applicantData.email.trim() && !applicantData.email.includes('@')) ||
                      (activeTab === 'qr' && !selectedFile && !qrUploadedFile) ||
                      (activeTab === 'voice' && (!voiceData.audioBlob || !voiceData.transcript || !voiceData.resumeData))
                    }
                    className={`relative px-8 py-3 rounded-xl font-bold text-lg transition-all duration-200 transform ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : (!applicantData.name.trim() || !applicantData.phone.trim() || 
                           (applicantData.email.trim() && !applicantData.email.includes('@')) ||
                           (activeTab === 'qr' && !selectedFile && !qrUploadedFile) ||
                           (activeTab === 'voice' && (!voiceData.audioBlob || !voiceData.transcript || !voiceData.resumeData)))
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-105 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5" />
                        <span>Submit Application</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Application Summary */}
              {(activeTab === 'qr' || activeTab === 'voice') && applicantData.name.trim() && (
                <div className="mt-6 p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50">
                  <div className="flex items-center justify-between text-sm">
                    <div className="space-y-1">
                      <div><span className="font-medium text-gray-700">Applying as:</span> <span className="text-gray-900">{applicantData.name}</span></div>
                      <div><span className="font-medium text-gray-700">Method:</span> <span className="text-gray-900 capitalize">{activeTab === 'qr' ? 'QR Code Upload' : 'Voice Application'}</span></div>
                    </div>
                    <div className="text-right space-y-1">
                      <div><span className="font-medium text-gray-700">Position:</span> <span className="text-blue-600">{job.title}</span></div>
                      <div><span className="font-medium text-gray-700">Company:</span> <span className="text-gray-900">{job.company}</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>
      
      {/* Success Popup */}
      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={handleSuccessPopupClose}
        applicantName={applicantData.name}
        applicationMethod={activeTab}
        jobTitle={job.title}
      />
    </div>
  </div>
    </>
  );
};

export default ApplyModal;
