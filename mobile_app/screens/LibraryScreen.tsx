import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BookCard from '../components/BookCard';
import { API_BASE_URL, COLORS, FONTS } from '../config';

export default function LibraryScreen() {
  const navigation = useNavigation<any>();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('list');

  const fetchBooks = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/books`);
      const data = await res.json();
      setBooks(data.books || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const filteredBooks = books.filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase()) ||
    b.genre?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Excluir Livro', `Tem certeza que deseja excluir "${title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await fetch(`${API_BASE_URL}/books/${id}`, { method: 'DELETE' });
          setBooks(prev => prev.filter(b => b.id !== id));
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Biblioteca</Text>
        <Text style={styles.headerSub}>{books.length} livro{books.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título, autor ou gênero..."
          placeholderTextColor={COLORS.textDim}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyText}>Carregando...</Text>
        </View>
      ) : filteredBooks.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>{search ? '🔍' : '📚'}</Text>
          <Text style={styles.emptyTitle}>
            {search ? 'Nenhum resultado' : 'Biblioteca vazia'}
          </Text>
          <Text style={styles.emptyText}>
            {search
              ? `Nenhum livro encontrado para "${search}"`
              : 'Crie seu primeiro livro com IA!'}
          </Text>
          {!search && (
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => navigation.navigate('Generate')}
            >
              <Text style={styles.createBtnText}>+ Criar Livro</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredBooks}
          keyExtractor={b => b.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBooks(); }} tintColor={COLORS.primary} />
          }
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.bookRow}>
              <View style={styles.bookCardWrap}>
                <BookCard
                  book={item}
                  onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}
                  horizontal
                />
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id, item.title)}
              >
                <Text style={styles.deleteBtnText}>🗑</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  clearSearch: {
    fontSize: 16,
    color: COLORS.textDim,
    paddingLeft: 8,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookCardWrap: {
    flex: 1,
  },
  deleteBtn: {
    paddingLeft: 8,
    paddingVertical: 16,
  },
  deleteBtnText: {
    fontSize: 18,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  createBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
  },
  createBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
});
