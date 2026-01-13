/**
 * Audio Analysis Utilities for Voice Transcription Optimization
 * Provides real-time audio quality assessment and optimization recommendations
 */

export interface AudioQualityMetrics {
  volume: number;
  noiseLevel: number;
  clarity: number;
  frequency: number;
  clipping: boolean;
  signalToNoise: number;
}

export interface TranscriptionSettings {
  language: string;
  dialect: string;
  speakingRate: 'slow' | 'normal' | 'fast';
  audioQuality: 'low' | 'medium' | 'high';
  noiseReduction: boolean;
  autoGainControl: boolean;
  echoCancellation: boolean;
}

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
    }
  }

  /**
   * Initialize audio analysis for a given media stream
   */
  public initializeAnalysis(stream: MediaStream): boolean {
    if (!this.audioContext) {
      console.error('AudioContext not available');
      return false;
    }

    try {
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
      
      this.source = this.audioContext.createMediaStreamSource(stream);
      this.source.connect(this.analyser);
      
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      return true;
    } catch (error) {
      console.error('Failed to initialize audio analysis:', error);
      return false;
    }
  }

  /**
   * Get real-time audio quality metrics
   */
  public getAudioQualityMetrics(): AudioQualityMetrics | null {
    if (!this.analyser || !this.dataArray) {
      return null;
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate volume (RMS)
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i] * this.dataArray[i];
    }
    const volume = Math.sqrt(sum / this.dataArray.length) / 255;

    // Calculate noise level (low frequency content)
    const noiseRange = Math.floor(this.dataArray.length * 0.1); // First 10% of frequencies
    let noiseSum = 0;
    for (let i = 0; i < noiseRange; i++) {
      noiseSum += this.dataArray[i];
    }
    const noiseLevel = (noiseSum / noiseRange) / 255;

    // Calculate clarity (high frequency content vs total)
    const clarityRange = Math.floor(this.dataArray.length * 0.3); // 30-100% of frequencies
    let claritySum = 0;
    for (let i = clarityRange; i < this.dataArray.length; i++) {
      claritySum += this.dataArray[i];
    }
    const clarity = (claritySum / (this.dataArray.length - clarityRange)) / 255;

    // Calculate dominant frequency
    let maxIndex = 0;
    let maxValue = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      if (this.dataArray[i] > maxValue) {
        maxValue = this.dataArray[i];
        maxIndex = i;
      }
    }
    const frequency = (maxIndex * (this.audioContext?.sampleRate || 44100)) / (2 * this.dataArray.length);

    // Detect clipping
    const clipping = volume > 0.95;

    // Calculate signal-to-noise ratio
    const signalToNoise = volume > 0 ? (volume - noiseLevel) / noiseLevel : 0;

    return {
      volume,
      noiseLevel,
      clarity,
      frequency,
      clipping,
      signalToNoise
    };
  }

  /**
   * Get optimization recommendations based on audio analysis
   */
  public getOptimizationRecommendations(metrics: AudioQualityMetrics): string[] {
    const recommendations: string[] = [];

    // Volume recommendations
    if (metrics.volume < 0.1) {
      recommendations.push('🎤 Speak louder or move closer to the microphone (current volume too low)');
    } else if (metrics.volume > 0.9) {
      recommendations.push('🔇 Reduce input volume or move away from microphone (audio may be clipping)');
    }

    // Noise recommendations
    if (metrics.noiseLevel > 0.3) {
      recommendations.push('🔇 Reduce background noise - close windows, turn off fans, move to quieter location');
    }

    // Clarity recommendations
    if (metrics.clarity < 0.2) {
      recommendations.push('🗣️ Speak more clearly and enunciate words - avoid mumbling');
    }

    // Clipping detection
    if (metrics.clipping) {
      recommendations.push('⚠️ Audio is clipping - reduce microphone gain or speak softer');
    }

    // Signal-to-noise ratio
    if (metrics.signalToNoise < 2) {
      recommendations.push('📢 Improve signal-to-noise ratio - speak louder or reduce background noise');
    }

    // Frequency analysis
    if (metrics.frequency < 100 || metrics.frequency > 4000) {
      recommendations.push('🎵 Check microphone positioning - optimal range is 100-4000 Hz for speech');
    }

    return recommendations;
  }

  /**
   * Get optimal transcription settings based on audio analysis
   */
  public getOptimalSettings(metrics: AudioQualityMetrics): Partial<TranscriptionSettings> {
    const settings: Partial<TranscriptionSettings> = {};

    // Audio quality based on overall metrics
    if (metrics.volume > 0.7 && metrics.clarity > 0.4 && metrics.signalToNoise > 3) {
      settings.audioQuality = 'high';
    } else if (metrics.volume > 0.3 && metrics.clarity > 0.2 && metrics.signalToNoise > 1.5) {
      settings.audioQuality = 'medium';
    } else {
      settings.audioQuality = 'low';
    }

    // Noise reduction based on noise level
    settings.noiseReduction = metrics.noiseLevel > 0.2;
    
    // Auto gain control for low volume
    settings.autoGainControl = metrics.volume < 0.4;
    
    // Echo cancellation for poor clarity
    settings.echoCancellation = metrics.clarity < 0.3;

    return settings;
  }

  /**
   * Cleanup resources
   */
  public cleanup() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.dataArray = null;
  }
}

/**
 * Microphone testing utilities
 */
export class MicrophoneTest {
  /**
   * Test microphone quality and provide recommendations
   */
  static async testMicrophone(): Promise<{
    isWorking: boolean;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
    technicalDetails: any;
  }> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      const analyzer = new AudioAnalyzer();
      analyzer.initializeAnalysis(stream);

      // Test for 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const metrics = analyzer.getAudioQualityMetrics();
      const recommendations = metrics ? analyzer.getOptimizationRecommendations(metrics) : [];

      // Determine quality rating
      let quality: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
      if (metrics) {
        const score = (metrics.volume * 0.3) + (metrics.clarity * 0.3) + 
                     (Math.min(metrics.signalToNoise / 5, 1) * 0.4);
        
        if (score > 0.8) quality = 'excellent';
        else if (score > 0.6) quality = 'good';
        else if (score > 0.4) quality = 'fair';
      }

      // Cleanup
      stream.getTracks().forEach(track => track.stop());
      analyzer.cleanup();

      return {
        isWorking: true,
        quality,
        recommendations,
        technicalDetails: metrics
      };

    } catch (error) {
      return {
        isWorking: false,
        quality: 'poor',
        recommendations: [
          'Microphone access denied or not available',
          'Check browser permissions and microphone connection'
        ],
        technicalDetails: { error: error.message }
      };
    }
  }

  /**
   * Get system audio capabilities
   */
  static async getAudioCapabilities(): Promise<{
    devices: MediaDeviceInfo[];
    constraints: MediaTrackSupportedConstraints;
    recommendations: string[];
  }> {
    const recommendations: string[] = [];

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      
      const constraints = navigator.mediaDevices.getSupportedConstraints();

      // Provide device recommendations
      if (audioInputs.length === 0) {
        recommendations.push('No microphone detected - please connect a microphone');
      } else if (audioInputs.length === 1) {
        recommendations.push('Using default microphone - consider using a dedicated headset for better quality');
      } else {
        recommendations.push(`${audioInputs.length} microphones available - select the best quality option`);
      }

      // Check for advanced features
      if (!constraints.echoCancellation) {
        recommendations.push('Echo cancellation not supported - use headphones to prevent feedback');
      }
      if (!constraints.noiseSuppression) {
        recommendations.push('Noise suppression not supported - ensure quiet environment');
      }

      return {
        devices: audioInputs,
        constraints,
        recommendations
      };

    } catch (error) {
      return {
        devices: [],
        constraints: {},
        recommendations: ['Unable to access audio devices - check browser permissions']
      };
    }
  }
}

/**
 * Speaking technique analyzer
 */
export class SpeechAnalyzer {
  /**
   * Analyze speaking pace and provide recommendations
   */
  static analyzeSpeechPace(transcript: string, duration: number): {
    wordsPerMinute: number;
    recommendation: string;
    optimal: boolean;
  } {
    const wordCount = transcript.split(/\s+/).filter(word => word.length > 0).length;
    const wordsPerMinute = Math.round((wordCount / duration) * 60);

    let recommendation = '';
    let optimal = false;

    if (wordsPerMinute < 120) {
      recommendation = 'Speaking too slowly - try to speak at a more natural pace (120-160 WPM optimal)';
    } else if (wordsPerMinute > 180) {
      recommendation = 'Speaking too quickly - slow down for better transcription accuracy';
    } else {
      recommendation = 'Good speaking pace for transcription';
      optimal = true;
    }

    return {
      wordsPerMinute,
      recommendation,
      optimal
    };
  }

  /**
   * Analyze transcript quality and provide speaking tips
   */
  static analyzeTranscriptQuality(transcript: string): {
    confidence: number;
    issues: string[];
    tips: string[];
  } {
    const issues: string[] = [];
    const tips: string[] = [];

    // Check for common transcription issues
    const hasRepeatedWords = /\b(\w+)\s+\1\b/gi.test(transcript);
    const hasIncompleteWords = /\b\w{1,2}\b/g.test(transcript);
    const hasLongPauses = /\.{3,}|…/g.test(transcript);
    const hasUnclearSections = /\[unclear\]|\[inaudible\]/gi.test(transcript);

    if (hasRepeatedWords) {
      issues.push('Repeated words detected');
      tips.push('Avoid repeating words - pause and think before speaking');
    }

    if (hasIncompleteWords) {
      issues.push('Very short words detected (possible unclear speech)');
      tips.push('Enunciate clearly and complete each word fully');
    }

    if (hasLongPauses) {
      issues.push('Long pauses detected');
      tips.push('Maintain steady speech flow - brief pauses are okay');
    }

    if (hasUnclearSections) {
      issues.push('Unclear sections in transcription');
      tips.push('Speak directly into microphone and avoid background noise');
    }

    // Calculate confidence based on issues
    const confidence = Math.max(0, 100 - (issues.length * 20));

    return {
      confidence,
      issues,
      tips
    };
  }
}