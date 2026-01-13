import { useState, useRef, useCallback, useEffect } from 'react';

export interface VoiceRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
  isSupported: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'checking';
}

export interface VoiceRecordingControls {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
  requestPermission: () => Promise<boolean>;
}

export const useVoiceRecording = (): [VoiceRecordingState, VoiceRecordingControls] => {
  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    isPaused: false,
    recordingTime: 0,
    audioBlob: null,
    audioUrl: null,
    error: null,
    isSupported: typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
    permissionStatus: 'prompt'
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }
    
    chunksRef.current = [];
  }, []);

  // Timer function
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now() - pausedTimeRef.current;
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setState(prev => ({ ...prev, recordingTime: Math.floor(elapsed / 1000) }));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Request microphone permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState(prev => ({ 
        ...prev, 
        error: 'Voice recording is not supported in this browser. Please use Chrome, Firefox, or Safari.',
        permissionStatus: 'denied'
      }));
      return false;
    }

    setState(prev => ({ ...prev, permissionStatus: 'checking', error: null }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      // Test successful - stop the stream immediately
      stream.getTracks().forEach(track => track.stop());
      
      setState(prev => ({ ...prev, permissionStatus: 'granted' }));
      return true;
    } catch (error) {
      let errorMessage = 'Failed to access microphone. ';
      
      if (error instanceof Error) {
        switch (error.name) {
          case 'NotAllowedError':
            errorMessage += 'Please allow microphone access and try again.';
            setState(prev => ({ ...prev, permissionStatus: 'denied' }));
            break;
          case 'NotFoundError':
            errorMessage += 'No microphone found. Please connect a microphone and try again.';
            setState(prev => ({ ...prev, permissionStatus: 'denied' }));
            break;
          case 'NotReadableError':
            errorMessage += 'Microphone is being used by another application.';
            setState(prev => ({ ...prev, permissionStatus: 'denied' }));
            break;
          default:
            errorMessage += 'Please check your microphone settings.';
            setState(prev => ({ ...prev, permissionStatus: 'denied' }));
        }
      }
      
      setState(prev => ({ ...prev, error: errorMessage }));
      return false;
    }
  }, [state.isSupported]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      // Request permission if not already granted
      if (state.permissionStatus !== 'granted') {
        const hasPermission = await requestPermission();
        if (!hasPermission) return;
      }

      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });

      streamRef.current = stream;
      chunksRef.current = [];

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setState(prev => ({ 
          ...prev, 
          audioBlob, 
          audioUrl,
          isRecording: false,
          isPaused: false
        }));
        
        stopTimer();
      };

      // Handle errors
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setState(prev => ({ 
          ...prev, 
          error: 'Recording failed. Please try again.',
          isRecording: false,
          isPaused: false
        }));
        cleanup();
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setState(prev => ({ 
        ...prev, 
        isRecording: true, 
        isPaused: false,
        recordingTime: 0,
        audioBlob: null,
        audioUrl: null
      }));
      
      pausedTimeRef.current = 0;
      startTimer();

    } catch (error) {
      console.error('Failed to start recording:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to start recording. Please check your microphone.',
        isRecording: false
      }));
      cleanup();
    }
  }, [state.permissionStatus, requestPermission, startTimer, stopTimer, cleanup]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      stopTimer();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  }, [state.isRecording, stopTimer]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && !state.isPaused) {
      mediaRecorderRef.current.pause();
      stopTimer();
      pausedTimeRef.current = Date.now() - startTimeRef.current;
      setState(prev => ({ ...prev, isPaused: true }));
    }
  }, [state.isRecording, state.isPaused, stopTimer]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && state.isPaused) {
      mediaRecorderRef.current.resume();
      startTimer();
      setState(prev => ({ ...prev, isPaused: false }));
    }
  }, [state.isRecording, state.isPaused, startTimer]);

  // Reset recording
  const resetRecording = useCallback(() => {
    stopRecording();
    cleanup();
    
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }
    
    setState(prev => ({ 
      ...prev, 
      isRecording: false,
      isPaused: false,
      recordingTime: 0,
      audioBlob: null,
      audioUrl: null,
      error: null
    }));
    
    pausedTimeRef.current = 0;
  }, [stopRecording, cleanup, state.audioUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }
    };
  }, [cleanup, state.audioUrl]);

  return [
    state,
    {
      startRecording,
      stopRecording,
      pauseRecording,
      resumeRecording,
      resetRecording,
      requestPermission
    }
  ];
};