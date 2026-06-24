import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2, Circle, Trash2 } from 'lucide-react-native';
import { GroceryItem as GroceryItemType } from '../services/storage';
import { useTheme } from '../theme/ThemeContext';

interface GroceryItemProps {
  item: GroceryItemType;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export const GroceryItem: React.FC<GroceryItemProps> = ({ item, onToggle, onRemove }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.checkboxContainer} onPress={() => onToggle(item.id)}>
        {item.completed ? (
          <CheckCircle2 color={colors.primary} size={24} />
        ) : (
          <Circle color={colors.textMuted} size={24} />
        )}
        <View style={styles.textContainer}>
          <Text style={[styles.name, item.completed && styles.completedText]}>
            {item.name}
          </Text>
          <Text style={styles.quantity}>{item.quantity}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.deleteButton}>
        <Trash2 color={colors.danger} size={20} />
      </TouchableOpacity>
    </View>
  );
};

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  quantity: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
});
