import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Volume2, AlertCircle, CheckCircle, Globe, FileText } from 'lucide-react';
import { parseTranscriptToResume } from '../../utils/resumeParser';

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

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = selectedLanguage;
        
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
          console.error('Speech recognition error:', event.error);
          if (event.error !== 'no-speech') {
            onError(`Speech recognition error: ${event.error}`);
          }
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

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.lang = selectedLanguage;
        recognitionRef.current.start();
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
      recognitionRef.current.stop();
    }
    
    setIsRecording(false);
    setIsPaused(false);
  };

  // Auto-generate resume when recording stops
  useEffect(() => {
    if (audioBlob && transcript && !isRecording && !generatedResume && !isGeneratingResume) {
      // Automatically generate resume after recording is complete
      setTimeout(() => {
        generateResume();
      }, 1000); // Small delay to ensure UI is ready
    }
  }, [audioBlob, transcript, isRecording, generatedResume, isGeneratingResume]);

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsPaused(true);
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
    }
    if (recognitionRef.current) {
      recognitionRef.current.start();
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
    if (!transcript.trim()) {
      onError('No transcript available to generate resume');
      return;
    }

    setIsGeneratingResume(true);
    
    try {
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Use the improved multilingual parser
      const resumeData = parseTranscriptToResume(transcript, selectedLanguage);
      setGeneratedResume(resumeData);
      
      console.log('Resume generated:', {
        name: resumeData.personalInfo.name,
        experienceCount: resumeData.experience.length,
        skillsCount: resumeData.skills.length,
        educationCount: resumeData.education.length,
        language: resumeData.language
      });
      
    } catch (error) {
      console.error('Resume generation error:', error);
      onError('Failed to generate resume: ' + (error as Error).message);
    } finally {
      setIsGeneratingResume(false);
    }
  };


  const handleComplete = () => {
    if (audioBlob && transcript && generatedResume) {
      onRecordingComplete(audioBlob, transcript, selectedLanguage, generatedResume);
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

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
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
        <p className="text-sm text-blue-800">
          {prompts[selectedLanguage as keyof typeof prompts]}
        </p>
      </div>

      {/* Recording Controls */}
      <div className="text-center mb-6">
        {!isRecording && !audioBlob && (
          <button
            onClick={startRecording}
            className="w-20 h-20 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 focus:ring-4 focus:ring-red-200 focus:outline-none mx-auto"
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
      {transcript && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Transcript</h4>
            <button
              onClick={() => setShowTranscriptEdit(!showTranscriptEdit)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {showTranscriptEdit ? 'Hide' : 'Edit'}
            </button>
          </div>
          
          {showTranscriptEdit ? (
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={6}
              placeholder="Edit your transcript here..."
            />
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 max-h-32 overflow-y-auto">
              {transcript || 'Transcription will appear here as you speak...'}
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
      {audioBlob && transcript && generatedResume && !isGeneratingResume && (
        <div className="text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800 mb-2">
              📝 <strong>Review Required:</strong> Please complete your personal information below to proceed with your application.
            </p>
            <p className="text-xs text-yellow-700">
              Your resume has been automatically generated from your voice recording.
            </p>
          </div>
          <button
            onClick={handleComplete}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 mx-auto"
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