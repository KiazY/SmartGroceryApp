import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { X, Sun, Moon, Smartphone } from 'lucide-react-native';
import { useTheme, ThemeMode } from '../theme/ThemeContext';

const LLAMA_LICENSE_URL = 'https://www.llama.com/llama3_2/license/';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
  { mode: 'light', label: 'Claro', icon: Sun },
  { mode: 'dark', label: 'Escuro', icon: Moon },
  { mode: 'system', label: 'Automático', icon: Smartphone },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const { colors, mode, setMode } = useTheme();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Definições</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color={colors.text} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Aparência</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {THEME_OPTIONS.map(({ mode: optionMode, label, icon: Icon }, index) => (
              <TouchableOpacity
                key={optionMode}
                style={[
                  styles.row,
                  index < THEME_OPTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
                onPress={() => setMode(optionMode)}
              >
                <View style={styles.rowLeft}>
                  <Icon color={colors.text} size={20} />
                  <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    { borderColor: mode === optionMode ? colors.primary : colors.border },
                  ]}
                >
                  {mode === optionMode && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Sobre</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, padding: 16 }]}>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              A Lista de Compras processa tudo localmente no teu telemóvel: o reconhecimento de voz e a
              inteligência artificial que organiza a tua lista funcionam sem ligação à internet.
            </Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              Não recolhemos, armazenamos nem partilhamos nenhum dos teus dados — nem a tua voz, nem a
              tua lista de compras saem do teu dispositivo.
            </Text>
            <Text style={[styles.paragraph, { color: colors.text, marginTop: 8 }]}>
              Construído com Llama. Esta app usa o modelo Llama 3.2 1B Instruct (Meta) para interpretar os
              teus pedidos de compras.
            </Text>
            <TouchableOpacity onPress={() => Linking.openURL(LLAMA_LICENSE_URL)}>
              <Text style={[styles.link, { color: colors.primary }]}>Ver licença do Llama 3.2</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 16,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    fontSize: 16,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
});
