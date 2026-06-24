import React, { useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Send, Mic, Square } from 'lucide-react-native';
import { useDictation } from '../hooks/useDictation';
import { useTheme } from '../theme/ThemeContext';

interface ChatInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, isLoading }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [text, setText] = useState('');
  const dictationBaseTextRef = useRef('');

  const { isListening, startListening, stopListening } = useDictation({
    onTranscript: (transcript) => {
      const base = dictationBaseTextRef.current;
      setText(base ? `${base} ${transcript}` : transcript);
    },
    onError: (error) => {
      if (error === 'language-not-supported') {
        Alert.alert(
          'Ditado indisponível',
          'O reconhecimento de voz em português só funciona com o pacote de idioma instalado no dispositivo (sem ligação à internet). Verifica nas definições de voz/teclado do telemóvel se o português está disponível offline.'
        );
      } else {
        Alert.alert('Erro no ditado', 'Não foi possível reconhecer a tua voz. Tenta novamente.');
      }
    },
  });

  const handleSend = () => {
    if (text.trim() && !isLoading) {
      onSubmit(text);
      setText('');
    }
  };

  const handleMicPress = async () => {
    if (isListening) {
      stopListening();
      return;
    }

    dictationBaseTextRef.current = text.trim();
    const started = await startListening();
    if (!started) {
      Alert.alert(
        'Permissão necessária',
        'Para dictar precisamos de acesso ao microfone e ao reconhecimento de voz. Ativa as permissões nas definições do telemóvel.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="O que precisas de comprar? (ex: 2 pacotes de leite)"
        placeholderTextColor={colors.textMuted}
        value={text}
        onChangeText={setText}
        multiline
        maxLength={200}
        editable={!isListening}
      />
      <TouchableOpacity
        style={[styles.button, styles.micButton, isListening && styles.micButtonActive, isLoading && styles.buttonDisabled]}
        onPress={handleMicPress}
        disabled={isLoading}
      >
        {isListening ? (
          <Square color="#FFFFFF" size={18} />
        ) : (
          <Mic color="#FFFFFF" size={20} />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, (!text.trim() || isLoading) && styles.buttonDisabled]}
        onPress={handleSend}
        disabled={!text.trim() || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Send color="#FFFFFF" size={20} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  button: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  micButton: {
    backgroundColor: colors.textMuted,
  },
  micButtonActive: {
    backgroundColor: colors.danger,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
});
