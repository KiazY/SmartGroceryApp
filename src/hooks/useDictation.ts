import { useCallback, useRef, useState } from 'react';
import {
  ExpoSpeechRecognitionModule,
  type ExpoSpeechRecognitionErrorCode,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

interface UseDictationOptions {
  onTranscript: (transcript: string) => void;
  onError?: (error: ExpoSpeechRecognitionErrorCode) => void;
}

export function useDictation({ onTranscript, onError }: UseDictationOptions) {
  const [isListening, setIsListening] = useState(false);
  const hasSpokenRef = useRef(false);

  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
    hasSpokenRef.current = false;
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript;
    if (transcript) {
      hasSpokenRef.current = true;
      onTranscript(transcript);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    setIsListening(false);
    if (event.error !== 'no-speech' && event.error !== 'aborted') {
      console.error('Speech recognition error:', event.error, event.message);
      onError?.(event.error);
    }
  });

  const startListening = useCallback(async () => {
    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      return false;
    }

    ExpoSpeechRecognitionModule.start({
      lang: 'pt-PT',
      interimResults: true,
      continuous: true,
      // Keep all audio/transcription on-device — never send speech data over the network.
      requiresOnDeviceRecognition: true,
    });
    return true;
  }, []);

  const stopListening = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  return { isListening, startListening, stopListening };
}
