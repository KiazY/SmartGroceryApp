import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Send } from 'lucide-react-native';

interface ChatInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !isLoading) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="O que precisas de comprar? (ex: 2 pacotes de leite)"
        placeholderTextColor="#9CA3AF"
        value={text}
        onChangeText={setText}
        multiline
        maxLength={200}
      />
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  input: {
    flex: 1,
    backgroundColor: '#374151',
    color: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  button: {
    backgroundColor: '#3B82F6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  buttonDisabled: {
    backgroundColor: '#4B5563',
  },
});
