import React, { useEffect, useState } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Volume2, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { useVoiceRecording } from '../../hooks/useVoiceRecording';
import VoiceOptimizer from './VoiceOptimizer';
import { AudioAnalyzer, AudioQualityMetrics } from '../../utils/audioAnalyzer';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number, transcript?: string) => void;
  onError?: (error: string) => void;
  maxDuration?: number; // in seconds
  className?: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onError,
  maxDuration = 300, // 5 minutes default
  className = ''
}) => {
  const [state, controls] = useVoiceRecording();
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [realTimeMetrics, setRealTimeMetrics] = useState<AudioQualityMetrics | null>(null);
  const [analyzer, setAnalyzer] = useState<AudioAnalyzer | null>(null);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');

  // Handle errors
  useEffect(() => {
    if (state.error && onError) {
      onError(state.error);
    }
  }, [state.error, onError]);

  // Handle recording completion
  useEffect(() => {
    if (state.audioBlob && !state.isRecording) {
      // Stop speech recognition if it's running
      if (speechRecognition) {
        speechRecognition.stop();
      }
      onRecordingComplete(state.audioBlob, state.recordingTime, finalTranscript || liveTranscript);
    }
  }, [state.audioBlob, state.isRecording, state.recordingTime, speechRecognition, finalTranscript, liveTranscript]);

  // Auto-stop recording when max duration is reached
  useEffect(() => {
    if (state.isRecording && state.recordingTime >= maxDuration) {
      controls.stopRecording();
    }
  }, [state.isRecording, state.recordingTime, maxDuration]);

  // Generate mock waveform data during recording
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (state.isRecording && !state.isPaused) {
      interval = setInterval(() => {
        setWaveformData(prev => {
          const newData = [...prev, Math.random() * 100];
          return newData.slice(-50); // Keep last 50 data points
        });
      }, 200); // Increased interval to reduce frequency
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isRecording, state.isPaused]);

  // Initialize real-time analysis and speech recognition when recording starts
  useEffect(() => {
    if (state.isRecording && !analyzer) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const audioAnalyzer = new AudioAnalyzer();
          if (audioAnalyzer.initializeAnalysis(stream)) {
            setAnalyzer(audioAnalyzer);

            // Update metrics every 100ms
            const interval = setInterval(() => {
              const metrics = audioAnalyzer.getAudioQualityMetrics();
              if (metrics) {
                setRealTimeMetrics(metrics);
                // Update waveform based on real audio data
                setWaveformData(prev => {
                  const newData = [...prev, metrics.volume * 100];
                  return newData.slice(-50);
                });
              }
            }, 100);

            // Initialize speech recognition
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
              const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
              const recognition = new SpeechRecognition();

              recognition.continuous = true;
              recognition.interimResults = true;
              recognition.lang = 'en-IN'; // Indian English

              recognition.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscriptText = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                  const transcript = event.results[i][0].transcript;
                  if (event.results[i].isFinal) {
                    finalTranscriptText += transcript;
                  } else {
                    interimTranscript += transcript;
                  }
                }

                setLiveTranscript(interimTranscript);
                if (finalTranscriptText) {
                  setFinalTranscript(prev => prev + finalTranscriptText);
                }
              };

              recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
              };

              recognition.start();
              setSpeechRecognition(recognition);
            }

            return () => {
              clearInterval(interval);
              audioAnalyzer.cleanup();
              if (speechRecognition) {
                speechRecognition.stop();
              }
            };
          }
        })
        .catch(console.error);
    }
  }, [state.isRecording]);

  // Cleanup analyzer when recording stops
  useEffect(() => {
    if (!state.isRecording && analyzer) {
      analyzer.cleanup();
      setAnalyzer(null);
    }
  }, [state.isRecording]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle audio playback
  const togglePlayback = () => {
    if (!state.audioUrl) return;

    if (!audioElement) {
      const audio = new Audio(state.audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        onError?.('Failed to play recording');
      };
      setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  const handleOptimizationComplete = (settings: any) => {
    setIsOptimized(true);
    setShowOptimizer(false);
    console.log('Optimization complete:', settings);
  };

  // Show optimizer modal
  if (showOptimizer) {
    return (
      <div className={`${className}`}>
        <VoiceOptimizer 
          onOptimizationComplete={handleOptimizationComplete}
        />
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowOptimizer(false)}
            className="text-gray-600 hover:text-gray-700 text-sm"
          >
            Skip Optimization
          </button>
        </div>
      </div>
    );
  }

  // Permission request UI
  if (state.permissionStatus === 'denied') {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 text-center ${className}`}>
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Microphone Access Required</h3>
        <p className="text-red-700 mb-4">{state.error}</p>
        <button
          type="button"
          onClick={controls.requestPermission}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!state.isSupported) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center ${className}`}>
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">Browser Not Supported</h3>
        <p className="text-yellow-700">
          Voice recording requires a modern browser. Please use Chrome, Firefox, or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Permission Status */}
      {/* Optimization Status */}
      {!isOptimized && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">Optimize your microphone for better accuracy</span>
            </div>
            <button
              type="button"
              onClick={() => setShowOptimizer(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Optimize
            </button>
          </div>
        </div>
      )}

      {state.permissionStatus === 'checking' && (
        <div className="text-center mb-4">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Requesting microphone access...</p>
        </div>
      )}

      {/* Recording Controls */}
      <div className="text-center mb-6">
        {!state.isRecording && !state.audioBlob && (
          <button
            type="button"
            onClick={state.permissionStatus === 'granted' ? controls.startRecording : controls.requestPermission}
            disabled={state.permissionStatus === 'checking'}
            className="w-20 h-20 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 focus:ring-4 focus:ring-blue-200 focus:outline-none"
            aria-label="Start recording"
          >
            <Mic className="w-8 h-8" />
          </button>
        )}

        {state.isRecording && (
          <div className="space-y-4">
            {/* Live Transcript Display */}
            {(liveTranscript || finalTranscript) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-blue-800">🎤 Live Transcription:</span>
                  <span className="text-xs text-blue-600">(speaking now)</span>
                </div>
                <div className="text-gray-700 min-h-[2rem]">
                  {finalTranscript}
                  <span className="text-blue-600 italic">{liveTranscript}</span>
                  {!finalTranscript && !liveTranscript && (
                    <span className="text-gray-400 italic">Start speaking...</span>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={state.isPaused ? controls.resumeRecording : controls.pauseRecording}
                className="w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors focus:ring-4 focus:ring-orange-200 focus:outline-none"
                aria-label={state.isPaused ? "Resume recording" : "Pause recording"}
              >
                {state.isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </button>
              
              <button
                type="button"
                onClick={controls.stopRecording}
                className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors focus:ring-4 focus:ring-red-200 focus:outline-none"
                aria-label="Stop recording"
              >
                <Square className="w-5 h-5" />
              </button>
            </div>

            {/* Recording indicator */}
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${state.isPaused ? 'bg-orange-500' : 'bg-red-500 animate-pulse'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {state.isPaused ? 'Paused' : 'Recording'} - {formatTime(state.recordingTime)}
              </span>
            </div>
          </div>
        )}

        {state.audioBlob && !state.isRecording && (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Recording Complete ({formatTime(state.recordingTime)})</span>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={togglePlayback}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors focus:ring-4 focus:ring-blue-200 focus:outline-none"
                aria-label={isPlaying ? "Pause playback" : "Play recording"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              
              <button
                type="button"
                onClick={controls.resetRecording}
                className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors focus:ring-4 focus:ring-gray-200 focus:outline-none"
                aria-label="Record again"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Record Again</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Waveform Visualization */}
      {(state.isRecording || waveformData.length > 0) && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Audio Levels</span>
            {realTimeMetrics && (
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>Vol: {Math.round(realTimeMetrics.volume * 100)}%</span>
                <span>Quality: {realTimeMetrics.signalToNoise > 2 ? 'Good' : 'Poor'}</span>
                {realTimeMetrics.clipping && (
                  <span className="text-red-600 font-medium">CLIPPING!</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-end justify-center space-x-1 h-16 bg-gray-50 rounded-lg p-2">
            {waveformData.map((height, index) => (
              <div
                key={index}
                className={`w-1 rounded-full transition-all duration-100 ${
                  state.isRecording && !state.isPaused 
                    ? realTimeMetrics?.clipping 
                      ? 'bg-red-500' 
                      : 'bg-blue-500'
                    : 'bg-gray-400'
                }`}
                style={{ height: `${Math.max(height * 0.4, 4)}px` }}
              />
            ))}
            {waveformData.length === 0 && state.isRecording && (
              <div className="text-sm text-gray-500">Listening...</div>
            )}
          </div>
        </div>
      )}

      {/* Real-time Quality Indicators */}
      {state.isRecording && realTimeMetrics && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-lg font-bold ${
                realTimeMetrics.volume > 0.7 ? 'text-green-600' :
                realTimeMetrics.volume > 0.3 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {Math.round(realTimeMetrics.volume * 100)}%
              </div>
              <div className="text-xs text-gray-600">Volume</div>
            </div>
            <div>
              <div className={`text-lg font-bold ${
                realTimeMetrics.signalToNoise > 3 ? 'text-green-600' :
                realTimeMetrics.signalToNoise > 1.5 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {Math.round(realTimeMetrics.signalToNoise * 10) / 10}
              </div>
              <div className="text-xs text-gray-600">S/N Ratio</div>
            </div>
            <div>
              <div className={`text-lg font-bold ${
                realTimeMetrics.clarity > 0.4 ? 'text-green-600' :
                realTimeMetrics.clarity > 0.2 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {Math.round(realTimeMetrics.clarity * 100)}%
              </div>
              <div className="text-xs text-gray-600">Clarity</div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {maxDuration && state.isRecording && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{formatTime(state.recordingTime)}</span>
            <span>{formatTime(maxDuration)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(state.recordingTime / maxDuration) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center">
        {!state.isRecording && !state.audioBlob && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Click the microphone to start recording your voice message
            </p>
            {!isOptimized && (
              <p className="text-xs text-blue-600">
                💡 Tip: Use the optimization tool above for better transcription accuracy
              </p>
            )}
          </div>
        )}
        
        {state.isRecording && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Speak clearly into your microphone. You can pause and resume as needed.
            </p>
            {realTimeMetrics && realTimeMetrics.volume < 0.2 && (
              <p className="text-xs text-red-600">
                ⚠️ Volume too low - speak louder or move closer to microphone
              </p>
            )}
            {realTimeMetrics && realTimeMetrics.clipping && (
              <p className="text-xs text-red-600">
                ⚠️ Audio clipping detected - reduce volume or move away from microphone
              </p>
            )}
            {realTimeMetrics && realTimeMetrics.noiseLevel > 0.3 && (
              <p className="text-xs text-yellow-600">
                🔇 High background noise detected - try to reduce ambient noise
              </p>
            )}
          </div>
        )}
        
        {state.audioBlob && (
          <p className="text-sm text-gray-600">
            Your recording is ready. You can play it back or record again if needed.
          </p>
        )}
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{state.error}</span>
          </div>
        </div>
      )}

      {/* Accessibility Instructions */}
      <div className="sr-only" aria-live="polite">
        {state.isRecording && !state.isPaused && `Recording in progress. Duration: ${formatTime(state.recordingTime)}`}
        {state.isRecording && !state.isPaused && realTimeMetrics && `Audio quality: Volume ${Math.round(realTimeMetrics.volume * 100)}%, Signal to noise ratio ${Math.round(realTimeMetrics.signalToNoise * 10) / 10}`}
        {state.isPaused && `Recording paused at ${formatTime(state.recordingTime)}`}
        {state.audioBlob && `Recording completed. Duration: ${formatTime(state.recordingTime)}`}
        {state.error && `Error: ${state.error}`}
      </div>
    </div>
  );
};

export default VoiceRecorder;