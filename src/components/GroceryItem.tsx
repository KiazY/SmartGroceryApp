import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2, Circle, Trash2 } from 'lucide-react-native';
import { GroceryItem as GroceryItemType } from '../services/storage';

interface GroceryItemProps {
  item: GroceryItemType;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export const GroceryItem: React.FC<GroceryItemProps> = ({ item, onToggle, onRemove }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.checkboxContainer} onPress={() => onToggle(item.id)}>
        {item.completed ? (
          <CheckCircle2 color="#3B82F6" size={24} />
        ) : (
          <Circle color="#6B7280" size={24} />
        )}
        <View style={styles.textContainer}>
          <Text style={[styles.name, item.completed && styles.completedText]}>
            {item.name}
          </Text>
          <Text style={styles.quantity}>{item.quantity}</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.deleteButton}>
        <Trash2 color="#EF4444" size={20} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F2937',
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
    color: '#F9FAFB',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  quantity: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
});
