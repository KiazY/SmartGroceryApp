import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, SectionList, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { ChatInput } from './src/components/ChatInput';
import { GroceryItem } from './src/components/GroceryItem';
import { SettingsModal } from './src/components/SettingsModal';
import { loadGroceryList, saveGroceryList, GroceryItem as GroceryItemType } from './src/services/storage';
import { parseGroceryList, ensureModelReady } from './src/services/llm';
import { Trash2, ChevronDown, ChevronRight, Settings } from 'lucide-react-native';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

function AppContent() {
  const { colors } = useTheme();
  const [items, setItems] = useState<GroceryItemType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'archive'>('list');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [modelProgress, setModelProgress] = useState(0);
  const [modelReady, setModelReady] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  useEffect(() => {
    const initList = async () => {
      const storedList = await loadGroceryList();
      setItems(storedList);
      setIsInitializing(false);
    };
    initList();

    ensureModelReady(setModelProgress)
      .then(() => setModelReady(true))
      .catch((error) => {
        console.error('Failed to load on-device model:', error);
        Alert.alert('Erro', 'Não foi possível preparar o modelo de IA local. Reinicia a app para tentar novamente.');
      });
  }, []);

  const handleToggleItem = async (id: string) => {
    const newItems = items.map(item =>
      item.id === id
        ? {
          ...item,
          completed: !item.completed,
          completedAt: !item.completed ? Date.now() : undefined
        }
        : item
    );
    setItems(newItems);
    await saveGroceryList(newItems);
  };

  const handleRemoveItem = async (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    await saveGroceryList(newItems);
  };

  const handleClearDay = (date: string) => {
    Alert.alert(
      "Apagar Dia",
      `Tens a certeza que queres apagar todas as compras de ${date}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            const newItems = items.filter(item => {
              const itemDate = new Date(item.completedAt || 0).toLocaleDateString('pt-PT');
              return !item.completed || itemDate !== date;
            });
            setItems(newItems);
            await saveGroceryList(newItems);
          }
        }
      ]
    );
  };

  const toggleSection = (date: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const handleClearList = () => {
    const activeItemsCount = items.filter(item => !item.completed).length;
    if (activeItemsCount === 0) return;

    Alert.alert(
      "Apagar Lista",
      "Tens a certeza que queres apagar os itens por comprar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            const onlyArchived = items.filter(item => item.completed);
            setItems(onlyArchived);
            await saveGroceryList(onlyArchived);
          }
        }
      ]
    );
  };

  const handleSendPrompt = async (text: string) => {
    setIsLoading(true);
    try {
      const parsedItems = await parseGroceryList(text);

      const newItems: GroceryItemType[] = parsedItems.map(item => ({
        id: Math.random().toString(36).substr(2, 9),
        name: item.name,
        quantity: item.quantity,
        completed: false
      }));

      const updatedList = [...newItems, ...items];
      setItems(updatedList);
      await saveGroceryList(updatedList);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível processar o teu pedido. Tenta novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const activeItems = items.filter(item => !item.completed);
  const archivedItems = items.filter(item => item.completed);

  const groupedArchivedItems = archivedItems.reduce((acc, item) => {
    const date = new Date(item.completedAt || Date.now()).toLocaleDateString('pt-PT');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, GroceryItemType[]>);

  const sections = Object.keys(groupedArchivedItems).map(date => ({
    title: date,
    data: groupedArchivedItems[date]
  })).sort((a, b) => {
    // Parse 'pt-PT' format (DD/MM/YYYY) for correct sorting
    const parseDate = (d: string) => {
      const [day, month, year] = d.split('/');
      return new Date(`${year}-${month}-${day}`).getTime();
    };
    return parseDate(b.title) - parseDate(a.title);
  });

  const styles = makeStyles(colors);

  if (isInitializing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.background} />
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Lista de Compras</Text>
          <Text style={styles.headerSubtitle}>{activeTab === 'list' ? activeItems.length : archivedItems.length} itens {activeTab === 'list' ? 'na lista' : 'no arquivo'}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setSettingsVisible(true)} style={styles.iconButton}>
            <Settings color={colors.textMuted} size={22} />
          </TouchableOpacity>
          {activeTab === 'list' && activeItems.length > 0 && (
            <TouchableOpacity onPress={handleClearList} style={styles.clearButton}>
              <Trash2 color={colors.danger} size={24} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />

      {!modelReady && (
        <View style={styles.modelBanner}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.modelBannerText}>
            {modelProgress < 1
              ? `A preparar IA local... ${Math.round(modelProgress * 100)}%`
              : 'A carregar modelo...'}
          </Text>
        </View>
      )}

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'list' && styles.activeTab]}
          onPress={() => setActiveTab('list')}
        >
          <Text style={[styles.tabText, activeTab === 'list' && styles.activeTabText]}>Por Comprar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'archive' && styles.activeTab]}
          onPress={() => setActiveTab('archive')}
        >
          <Text style={[styles.tabText, activeTab === 'archive' && styles.activeTabText]}>Arquivo</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {activeTab === 'list' ? (
          <FlatList
            data={activeItems}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <GroceryItem
                item={item}
                onToggle={handleToggleItem}
                onRemove={handleRemoveItem}
              />
            )}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>A tua lista está vazia.</Text>
                <Text style={styles.emptySubtext}>Adiciona itens escrevendo no chat abaixo!</Text>
              </View>
            }
          />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={item => item.id}
            renderItem={({ item, section }) => {
              if (collapsedSections[section.title]) return null;
              return (
                <GroceryItem
                  item={item}
                  onToggle={handleToggleItem}
                  onRemove={handleRemoveItem}
                />
              );
            }}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.sectionHeaderContainer}>
                <TouchableOpacity
                  style={styles.sectionTitleButton}
                  onPress={() => toggleSection(title)}
                >
                  {collapsedSections[title] ? (
                    <ChevronRight color={colors.textMuted} size={20} />
                  ) : (
                    <ChevronDown color={colors.textMuted} size={20} />
                  )}
                  <Text style={styles.sectionHeader}>{title}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleClearDay(title)}
                  style={styles.deleteDayButton}
                >
                  <Trash2 color={colors.danger} size={18} />
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>O teu arquivo está vazio.</Text>
              </View>
            }
          />
        )}
        {activeTab === 'list' && <ChatInput onSubmit={handleSendPrompt} isLoading={isLoading || !modelReady} />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: colors.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  clearButton: {
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textMuted,
  },
  keyboardView: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
  },
  modelBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    gap: 8,
  },
  modelBannerText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.primary,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: 12,
    marginTop: 8,
  },
  sectionTitleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deleteDayButton: {
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 6,
  },
});
