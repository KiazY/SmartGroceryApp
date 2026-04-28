import AsyncStorage from '@react-native-async-storage/async-storage';
import { ParsedItem } from './ai';

const STORAGE_KEY = '@grocery_list';

export interface GroceryItem extends ParsedItem {
  id: string;
  completed: boolean;
  completedAt?: number;
}

export const loadGroceryList = async (): Promise<GroceryItem[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Failed to load list.", e);
    return [];
  }
};

export const saveGroceryList = async (list: GroceryItem[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(list);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error("Failed to save list.", e);
  }
};
