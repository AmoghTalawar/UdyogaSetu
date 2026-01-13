import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Volume2, AlertCircle, CheckCircle, Globe, FileText } from 'lucide-react';
import { parseTranscriptToResume } from '../../utils/resumeParser';

// Type declarations for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start(): void;
  stop(): void;
  abort(): void;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface MultilingualVoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, transcript: string, language: string, resumeData?: any) => void;
  onError: (error: string) => void;
  maxDuration?: number;
  className?: string;
}

const MultilingualVoiceRecorder: React.FC<MultilingualVoiceRecorderProps> = ({
  onRecordingComplete,
  onError,
  maxDuration = 300,
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<any>(null);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [showTranscriptEdit, setShowTranscriptEdit] = useState(false);
  const [isHttpsRequired, setIsHttpsRequired] = useState(false);
  const [isSpeechRecognitionWorking, setIsSpeechRecognitionWorking] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const languages: Language[] = [
    { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  ];

  const prompts = {
    'en-US': "Please tell us about yourself, your experience, skills, education, and why you're interested in this position. Speak clearly and take your time.",
    'hi-IN': "कृपया अपने बारे में, अपने अनुभव, कौशल, शिक्षा, और इस पद में आपकी रुचि के बारे में बताएं। स्पष्ट रूप से बोलें और अपना समय लें।",
    'kn-IN': "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬಗ್ಗೆ, ನಿಮ್ಮ ಅನುಭವ, ಕೌಶಲ್ಯಗಳು, ಶಿಕ್ಷಣ, ಮತ್ತು ಈ ಹುದ್ದೆಯಲ್ಲಿ ನಿಮ್ಮ ಆಸಕ್ತಿಯ ಬಗ್ಗೆ ಹೇಳಿ। ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ ಮತ್ತು ನಿಮ್ಮ ಸಮಯವನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ।"
  };

  // Check HTTPS requirement for mobile devices
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isHttps = window.location.protocol === 'https:';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // Voice features require HTTPS on mobile devices (except localhost for development)
    setIsHttpsRequired(isMobile && !isHttps && !isLocalhost);
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      if (recognitionRef.current) {
        recognitionRef.current.continuous = false; // Changed from true to false for better stability
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = selectedLanguage;

        console.log('Speech recognition initialized for language:', selectedLanguage);

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptText = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcriptText;
            } else {
              interimTranscript += transcriptText;
            }
          }

          setTranscript(prev => {
            const newTranscript = prev + finalTranscript;
            return newTranscript;
          });
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error, event);

          // Handle different types of speech recognition errors
          let errorMessage = '';
          let isRecoverable = false;
          let shouldShowError = true;

          switch (event.error) {
            case 'network':
              errorMessage = 'Speech recognition service is currently unavailable. This may be due to network connectivity issues or browser restrictions in production environments. Please try using the text-based application instead.';
              isRecoverable = false;
              break;
            case 'not-allowed':
              errorMessage = 'Microphone access was denied. Please allow microphone access and try again.';
              isRecoverable = true;
              break;
            case 'no-speech':
              // No speech detected - this is normal, don't show error
              console.warn('No speech detected in audio - this is normal if user didn\'t speak');
              shouldShowError = false;
              isRecoverable = true;
              // Continue with whatever was recorded
              return;
            case 'aborted':
              console.log('Speech recognition aborted - this may be normal during pause/resume');
              shouldShowError = false;
              isRecoverable = true;
              break;
            case 'audio-capture':
              errorMessage = 'Audio capture failed. Please check your microphone and try again.';
              isRecoverable = true;
              break;
            case 'service-not-allowed':
              errorMessage = 'Speech recognition service is not allowed in this context. Please try using the text-based application instead.';
              isRecoverable = false;
              break;
            default:
              errorMessage = `Speech recognition error: ${event.error}. Please try using the text-based application instead.`;
              isRecoverable = false;
          }

          // Set a flag to indicate speech recognition is not working (but keep recording)
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            setIsSpeechRecognitionWorking(false);
            console.warn('Speech recognition marked as not working due to error:', event.error);
          }

          // Only call onError for non-recoverable errors
          if (shouldShowError && !isRecoverable) {
            onError(errorMessage);
          }
        };

        recognitionRef.current.onend = () => {
           // Handle recognition ending gracefully
           console.log('Speech recognition ended');
           // Don't automatically restart - let it be controlled by recording state
         };
      }
    }
  }, [selectedLanguage, onError]);

  // Timer management
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused, maxDuration]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      setTranscript('');
      setAudioBlob(null);
      setAudioUrl(null);
      setDuration(0);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Start speech recognition (if available and working)
      if (recognitionRef.current && isSpeechRecognitionWorking) {
        try {
          recognitionRef.current.lang = selectedLanguage;
          recognitionRef.current.start();
          console.log('Speech recognition started for recording');
        } catch (error) {
          console.warn('Speech recognition start failed:', error);
          setIsSpeechRecognitionWorking(false);
          // Continue with recording even if speech recognition fails
        }
      } else {
        console.log('Speech recognition not available or not working');
      }

    } catch (error) {
      onError('Failed to start recording: ' + (error as Error).message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.warn('Error stopping speech recognition:', error);
      }
    }
    
    setIsRecording(false);
    setIsPaused(false);
  };

  // Auto-generate resume when recording stops
  useEffect(() => {
    if (audioBlob && !isRecording && !generatedResume && !isGeneratingResume) {
      // Automatically generate resume after recording is complete
      // Even if transcript is empty, allow user to proceed
      setTimeout(() => {
        generateResume();
      }, 500); // Small delay to ensure UI is ready
    }
  }, [audioBlob, isRecording, generatedResume, isGeneratingResume]);

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.warn('Error stopping speech recognition during pause:', error);
      }
    }
    setIsPaused(true);
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
    }
    // Restart speech recognition when resuming
    if (recognitionRef.current && isSpeechRecognitionWorking) {
      try {
        recognitionRef.current.lang = selectedLanguage;
        recognitionRef.current.start();
        console.log('Speech recognition restarted on resume');
      } catch (error) {
        console.warn('Error restarting speech recognition on resume:', error);
      }
    }
    setIsPaused(false);
  };

  const resetRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscript('');
    setGeneratedResume(null);
    audioChunksRef.current = [];
    
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (!audioUrl) return;

    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const generateResume = async () => {
    setIsGeneratingResume(true);
    
    try {
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (transcript.trim()) {
        // Use the improved multilingual parser if transcript exists
        const resumeData = parseTranscriptToResume(transcript, selectedLanguage);
        setGeneratedResume(resumeData);
        
        // Only log in development mode
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Resume generated from transcript:', {
            name: resumeData.personalInfo.name,
            experienceCount: resumeData.experience.length,
            skillsCount: resumeData.skills.length,
            educationCount: resumeData.education.length,
            language: resumeData.language
          });
        }
      } else {
        // If no transcript, create a minimal resume structure
        if (process.env.NODE_ENV === 'development') {
          console.info('ℹ️ No speech detected - providing empty resume template for manual entry');
        }
        
        setGeneratedResume({
          personalInfo: {
            name: 'Your Name',
            summary: 'Please enter your professional summary'
          },
          experience: [],
          skills: [],
          education: [],
          language: selectedLanguage,
          generatedAt: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('❌ Resume generation error:', error);
      // Don't show error, just create empty resume
      setGeneratedResume({
        personalInfo: {
          name: 'Your Name',
          summary: 'Please enter your professional summary'
        },
        experience: [],
        skills: [],
        education: [],
        language: selectedLanguage,
        generatedAt: new Date().toISOString()
      });
    } finally {
      setIsGeneratingResume(false);
    }
  };


  const handleComplete = () => {
    if (audioBlob) {
      // Use transcript if available, otherwise use a default message
      const finalTranscript = transcript.trim() || 'Voice recording completed (no speech detected - text details entered)';
      
      // Ensure we have a generated resume, even if empty
      if (!generatedResume) {
        setGeneratedResume({
          personalInfo: {
            name: 'Your Name',
            summary: 'Please enter your professional summary'
          },
          experience: [],
          skills: [],
          education: [],
          language: selectedLanguage,
          generatedAt: new Date().toISOString()
        });
      }
      
      onRecordingComplete(audioBlob, finalTranscript, selectedLanguage, generatedResume);
      // Reset the component after successful completion
      resetRecording();
    }
  };

  const downloadResume = () => {
    if (generatedResume) {
      const resumeText = formatResumeAsText(generatedResume);
      const blob = new Blob([resumeText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedResume.personalInfo.name}_Resume.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const formatResumeAsText = (resume: any) => {
    return `
${resume.personalInfo.name}
Generated Resume

SUMMARY
${resume.personalInfo.summary}

EXPERIENCE
${resume.experience.map((exp: any) => `• ${exp.description}`).join('\n')}

SKILLS
${resume.skills.map((skill: string) => `• ${skill}`).join('\n')}

EDUCATION
${resume.education.map((edu: any) => `• ${edu.description}`).join('\n')}

Generated from voice application in ${resume.language}
Generated on: ${new Date(resume.generatedAt).toLocaleDateString()}
`.trim();
  };

  // Check if speech recognition is supported
  const isSpeechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* HTTPS Warning for Mobile */}
      {isHttpsRequired && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-red-800">HTTPS Required for Voice Features</h4>
          </div>
          <p className="text-sm text-red-700 mb-3">
            Voice recording and speech recognition require a secure HTTPS connection on mobile devices.
            Please access this application through a secure connection (https://) to use voice features.
          </p>
          <div className="text-xs text-red-600">
            <strong>Note:</strong> This is a browser security requirement for mobile devices.
          </div>
        </div>
      )}

      {/* Browser Support Warning */}
      {!isSpeechRecognitionSupported && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <h4 className="font-semibold text-yellow-800">Speech Recognition Not Supported</h4>
          </div>
          <p className="text-sm text-yellow-700">
            Your browser doesn't support speech recognition. Please use Chrome, Firefox, Safari, or Edge for the best experience.
          </p>
        </div>
      )}

      {/* Speech Recognition Service Warning */}
      {isSpeechRecognitionSupported && !isSpeechRecognitionWorking && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h4 className="font-semibold text-orange-800">Speech Recognition Service Unavailable</h4>
          </div>
          <p className="text-sm text-orange-700 mb-3">
            The speech recognition service is currently unavailable. This may be due to network connectivity issues or browser restrictions in production environments.
          </p>
          <div className="bg-orange-100 p-3 rounded-lg">
            <p className="text-sm text-orange-800 mb-2">
              <strong>Alternative:</strong> You can still record your voice and manually enter your information, or use the text-based application method.
            </p>
            <p className="text-xs text-orange-700">
              Voice recording will work, but automatic transcription may not be available.
            </p>
          </div>
        </div>
      )}

      {/* Language Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Globe className="w-4 h-4 inline mr-2" />
          Select Language / भाषा चुनें / ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ
        </label>
        <div className="grid grid-cols-3 gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                selectedLanguage === lang.code
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="text-lg mb-1">{lang.flag}</div>
              <div className="text-xs font-medium">{lang.nativeName}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Recording Instructions</h4>
        <p className="text-sm text-blue-800 mb-2">
          {prompts[selectedLanguage as keyof typeof prompts]}
        </p>
        {!isSpeechRecognitionWorking && (
          <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 mt-3">
            <p className="text-sm text-orange-800">
              <strong>Note:</strong> Automatic speech-to-text transcription is currently unavailable. You can still record your voice and manually enter your information afterward.
            </p>
          </div>
        )}
      </div>

      {/* Recording Controls */}
      <div className="text-center mb-6">
        {!isRecording && !audioBlob && (
          <button
            onClick={startRecording}
            disabled={isHttpsRequired}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 focus:ring-4 focus:outline-none mx-auto ${
              isHttpsRequired
                ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                : 'bg-red-500 hover:bg-red-600 text-white hover:scale-105 focus:ring-red-200'
            }`}
            title={
              isHttpsRequired
                ? 'HTTPS required for voice features on mobile'
                : !isSpeechRecognitionSupported
                ? 'Start voice recording (transcription not supported in this browser)'
                : isSpeechRecognitionWorking
                ? 'Start voice recording with automatic transcription'
                : 'Start voice recording (transcription may not work)'
            }
          >
            <Mic className="w-8 h-8" />
          </button>
        )}

        {isRecording && (
          <div className="space-y-4">
            <div className="flex justify-center space-x-4">
              <button
                onClick={isPaused ? resumeRecording : pauseRecording}
                className="w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors"
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </button>
              
              <button
                onClick={stopRecording}
                className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <Square className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-orange-500' : 'bg-red-500 animate-pulse'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {isPaused ? 'Paused' : 'Recording'} - {formatTime(duration)}
              </span>
            </div>
          </div>
        )}

        {audioBlob && !isRecording && (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Recording Complete ({formatTime(duration)})</span>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={togglePlayback}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              
              <button
                onClick={resetRecording}
                className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Record Again</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {isRecording && (
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{formatTime(duration)}</span>
            <span>{formatTime(maxDuration)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(duration / maxDuration) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Transcript Section */}
      {(transcript || !isSpeechRecognitionWorking || audioBlob) && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">
              Transcript
              {!isSpeechRecognitionWorking && (
                <span className="ml-2 text-sm text-orange-600 font-normal">(Manual Entry Required)</span>
              )}
            </h4>
            <button
              onClick={() => setShowTranscriptEdit(!showTranscriptEdit)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {showTranscriptEdit ? 'Hide' : 'Edit'}
            </button>
          </div>

          {!isSpeechRecognitionWorking && !transcript && (
            <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Speech recognition is unavailable.</strong> Please manually enter your information below after recording your voice.
              </p>
            </div>
          )}

          {showTranscriptEdit ? (
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={6}
              placeholder={
                !isSpeechRecognitionWorking
                  ? "Please enter your personal and professional information here (name, experience, skills, education, etc.)..."
                  : "Edit your transcript here or add more details..."
              }
            />
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 max-h-32 overflow-y-auto">
              {transcript || (!isSpeechRecognitionWorking
                ? 'Please manually enter your information here after recording (name, experience, skills, education, etc.)...'
                : 'Transcription will appear here as you speak...')}
            </div>
          )}
        </div>
      )}

      {/* Resume Generation Status */}
      {audioBlob && transcript && (
        <div className="mb-6">
          {isGeneratingResume && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-800 font-medium">Generating your resume...</span>
              </div>
              <p className="text-sm text-blue-600">Please wait while we process your voice and create your professional resume.</p>
            </div>
          )}

          {generatedResume && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <h5 className="font-medium text-green-900">Resume Generated Successfully!</h5>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-green-700">
                <div>
                  <p><strong>Name:</strong> {generatedResume.personalInfo.name}</p>
                  <p><strong>Experience Items:</strong> {generatedResume.experience.length}</p>
                </div>
                <div>
                  <p><strong>Skills Identified:</strong> {generatedResume.skills.length}</p>
                  <p><strong>Education Entries:</strong> {generatedResume.education.length}</p>
                </div>
              </div>
              <div className="mt-3 text-center">
                <button
                  onClick={() => {
                    setGeneratedResume(null);
                    setTranscript('');
                  }}
                  className="text-green-700 hover:text-green-800 text-sm font-medium underline"
                >
                  Regenerate Resume
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review and Apply Button */}
      {audioBlob && !isGeneratingResume && (
        <div className="text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800 mb-2">
              📝 <strong>Review Required:</strong> Please complete your personal information below to proceed with your application.
            </p>
            <p className="text-xs text-yellow-700">
              {generatedResume
                ? 'Your resume has been automatically generated from your voice recording.'
                : 'Please enter your information manually to generate your resume.'
              }
            </p>
            {!isSpeechRecognitionWorking && (
              <p className="text-xs text-orange-700 mt-2">
                💡 <strong>Tip:</strong> Since speech recognition is unavailable, please manually enter your information in the transcript section above.
              </p>
            )}
          </div>
          <button
            onClick={handleComplete}
            disabled={!transcript && !generatedResume}
            className={`px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 mx-auto ${
              !transcript && !generatedResume
                ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            title={
              !transcript && !generatedResume
                ? 'Please enter your information or wait for resume generation'
                : 'Proceed with your application'
            }
          >
            <FileText className="w-4 h-4" />
            <span>Review and Apply</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MultilingualVoiceRecorder;