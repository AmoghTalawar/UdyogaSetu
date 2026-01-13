import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Volume2, 
  Headphones,
  Gauge,
  Zap,
  RefreshCw
} from 'lucide-react';
import { AudioAnalyzer, MicrophoneTest, AudioQualityMetrics } from '../../utils/audioAnalyzer';

interface VoiceOptimizerProps {
  onOptimizationComplete: (settings: any) => void;
  className?: string;
}

const VoiceOptimizer: React.FC<VoiceOptimizerProps> = ({ 
  onOptimizationComplete, 
  className = '' 
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [audioMetrics, setAudioMetrics] = useState<AudioQualityMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<any>(null);
  const [analyzer, setAnalyzer] = useState<AudioAnalyzer | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const optimizationSteps = [
    { id: 'permission', title: 'Microphone Access', icon: Mic },
    { id: 'hardware', title: 'Hardware Check', icon: Headphones },
    { id: 'quality', title: 'Audio Quality Test', icon: Gauge },
    { id: 'optimization', title: 'Settings Optimization', icon: Settings },
    { id: 'complete', title: 'Ready to Record', icon: CheckCircle }
  ];

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (analyzer) {
      analyzer.cleanup();
      setAnalyzer(null);
    }
  };

  const startOptimization = async () => {
    setIsAnalyzing(true);
    setCurrentStep(0);
    
    try {
      // Step 1: Request microphone permission
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Hardware check
      setCurrentStep(2);
      const capabilities = await MicrophoneTest.getAudioCapabilities();
      
      // Step 3: Audio quality test
      setCurrentStep(3);
      const testResult = await MicrophoneTest.testMicrophone();
      setTestResults(testResult);

      if (testResult.isWorking) {
        // Step 4: Real-time analysis
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100
          }
        });

        setStream(mediaStream);
        const audioAnalyzer = new AudioAnalyzer();
        audioAnalyzer.initializeAnalysis(mediaStream);
        setAnalyzer(audioAnalyzer);

        // Analyze for 5 seconds
        const analysisInterval = setInterval(() => {
          const metrics = audioAnalyzer.getAudioQualityMetrics();
          if (metrics) {
            setAudioMetrics(metrics);
            const recs = audioAnalyzer.getOptimizationRecommendations(metrics);
            setRecommendations(recs);
          }
        }, 100);

        setTimeout(() => {
          clearInterval(analysisInterval);
          setCurrentStep(4);
          
          // Generate optimal settings
          if (audioMetrics) {
            const optimalSettings = audioAnalyzer.getOptimalSettings(audioMetrics);
            onOptimizationComplete({
              ...optimalSettings,
              testResults: testResult,
              capabilities
            });
          }
          
          setTimeout(() => {
            setCurrentStep(5);
            setIsAnalyzing(false);
          }, 1000);
        }, 5000);
      } else {
        setCurrentStep(5);
        setIsAnalyzing(false);
      }

    } catch (error) {
      console.error('Optimization failed:', error);
      setIsAnalyzing(false);
      setRecommendations(['Failed to access microphone. Please check permissions and try again.']);
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return CheckCircle;
      case 'good': return CheckCircle;
      case 'fair': return AlertTriangle;
      case 'poor': return XCircle;
      default: return AlertTriangle;
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Voice Recording Optimization
        </h3>
        <p className="text-sm text-gray-600">
          Let's optimize your microphone settings for the best transcription accuracy
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {optimizationSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === index + 1;
            const isCompleted = currentStep > index + 1;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  isCompleted 
                    ? 'bg-green-100 text-green-600' 
                    : isActive 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs text-center ${
                  isActive ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / optimizationSteps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Start Button */}
      {currentStep === 0 && (
        <div className="text-center">
          <button
            onClick={startOptimization}
            disabled={isAnalyzing}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors focus:ring-4 focus:ring-blue-200 focus:outline-none"
          >
            {isAnalyzing ? 'Optimizing...' : 'Start Optimization'}
          </button>
        </div>
      )}

      {/* Real-time Analysis */}
      {isAnalyzing && currentStep >= 3 && audioMetrics && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Real-time Audio Analysis</h4>
            
            {/* Audio Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(audioMetrics.volume * 100)}%
                </div>
                <div className="text-xs text-gray-600">Volume Level</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(audioMetrics.signalToNoise * 10) / 10}
                </div>
                <div className="text-xs text-gray-600">Signal/Noise</div>
              </div>
            </div>

            {/* Volume Meter */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Audio Level</span>
                <span>{audioMetrics.clipping ? 'CLIPPING!' : 'Good'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-100 ${
                    audioMetrics.clipping 
                      ? 'bg-red-500' 
                      : audioMetrics.volume > 0.7 
                      ? 'bg-green-500' 
                      : audioMetrics.volume > 0.3 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(audioMetrics.volume * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Frequency Visualization */}
            <div className="mb-4">
              <div className="text-xs text-gray-600 mb-1">Frequency Response</div>
              <div className="flex items-end space-x-1 h-8">
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    className="bg-blue-400 rounded-t"
                    style={{ 
                      width: '4px',
                      height: `${Math.random() * 100}%`,
                      opacity: 0.7
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults && (
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Microphone Test Results</h4>
            
            <div className="flex items-center space-x-3 mb-3">
              {(() => {
                const QualityIcon = getQualityIcon(testResults.quality);
                return (
                  <>
                    <QualityIcon className={`w-6 h-6 ${getQualityColor(testResults.quality)}`} />
                    <div>
                      <div className={`font-medium ${getQualityColor(testResults.quality)}`}>
                        {testResults.quality.charAt(0).toUpperCase() + testResults.quality.slice(1)} Quality
                      </div>
                      <div className="text-sm text-gray-600">
                        {testResults.isWorking ? 'Microphone is working' : 'Microphone issues detected'}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {testResults.technicalDetails && (
              <div className="text-xs text-gray-500 mb-3">
                Volume: {Math.round(testResults.technicalDetails.volume * 100)}% | 
                Clarity: {Math.round(testResults.technicalDetails.clarity * 100)}% | 
                S/N Ratio: {Math.round(testResults.technicalDetails.signalToNoise * 10) / 10}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Optimization Recommendations</h4>
          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-yellow-800">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion */}
      {currentStep === 5 && (
        <div className="text-center">
          <div className="mb-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Optimization Complete!
            </h4>
            <p className="text-sm text-gray-600">
              Your microphone is optimized for the best transcription accuracy
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                cleanup();
                setCurrentStep(0);
                setAudioMetrics(null);
                setRecommendations([]);
                setTestResults(null);
              }}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Test Again</span>
            </button>
          </div>
        </div>
      )}

      {/* Troubleshooting Guide */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
            <span>📋 Troubleshooting Guide</span>
            <span className="group-open:rotate-180 transition-transform">▼</span>
          </summary>
          
          <div className="mt-4 space-y-4 text-sm text-gray-600">
            <div>
              <h5 className="font-medium text-gray-900 mb-2">🎤 Audio Quality Issues</h5>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Position microphone 6-8 inches from your mouth</li>
                <li>Speak directly into the microphone, not at an angle</li>
                <li>Use a headset microphone for best results</li>
                <li>Avoid built-in laptop microphones when possible</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-2">🔇 Background Noise</h5>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Close windows and doors to reduce outside noise</li>
                <li>Turn off fans, air conditioning, and other appliances</li>
                <li>Choose a quiet room with soft furnishings</li>
                <li>Avoid hard surfaces that cause echo</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-2">🗣️ Speaking Technique</h5>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Speak at a normal, conversational pace (120-160 words/minute)</li>
                <li>Enunciate clearly and avoid mumbling</li>
                <li>Pause briefly between sentences</li>
                <li>Avoid filler words like "um", "uh", "like"</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-2">⚙️ Technical Settings</h5>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Enable noise suppression in browser settings</li>
                <li>Check microphone permissions are granted</li>
                <li>Update browser to latest version</li>
                <li>Close other applications using the microphone</li>
              </ul>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default VoiceOptimizer;