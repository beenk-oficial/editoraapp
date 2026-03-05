import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BookCard from '../components/BookCard';
import { API_BASE_URL, COLORS, FONTS } from '../config';

const GENRES = [
  { id: 'all', name: 'Todos', emoji: '📚' },
  { id: 'Ficção Científica', name: 'Sci-Fi', emoji: '🚀' },
  { id: 'Fantasia', name: 'Fantasia', emoji: '✨' },
  { id: 'Romance', name: 'Romance', emoji: '💕' },
  { id: 'Thriller', name: 'Thriller', emoji: '🔪' },
  { id: 'Mistério', name: 'Mistério', emoji: '🔍' },
  { id: 'Autoajuda', name: 'Autoajuda', emoji: '🌟' },
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('all');

  const fetchBooks = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/books?status=complete`);
      const data = await res.json();
      setBooks(data.books || []);
    } catch (e) {
      console.error('Failed to fetch books:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBooks();
  };

  const filteredBooks = selectedGenre === 'all'
    ? books
    : books.filter(b => b.genre === selectedGenre);

  const featuredBook = filteredBooks[0];
  const remainingBooks = filteredBooks.slice(1);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerGreeting}>Bem-vindo à</Text>
            <Text style={styles.headerTitle}>Editora AI</Text>
          </View>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => navigation.navigate('Generate')}
          >
            <Text style={styles.createBtnText}>+ Criar Livro</Text>
          </TouchableOpacity>
        </View>

        {/* Genre Filter */}
        <FlatList
          data={GENRES}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genreList}
          keyExtractor={g => g.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.genreChip,
                selectedGenre === item.id && styles.genreChipActive,
              ]}
              onPress={() => setSelectedGenre(item.id)}
            >
              <Text style={styles.genreEmoji}>{item.emoji}</Text>
              <Text
                style={[
                  styles.genreText,
                  selectedGenre === item.id && styles.genreTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />

        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>Carregando livros...</Text>
          </View>
        ) : filteredBooks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✨</Text>
            <Text style={styles.emptyTitle}>Nenhum livro ainda</Text>
            <Text style={styles.emptyDesc}>
              Crie seu primeiro livro com IA! Toque em "+ Criar Livro"
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('Generate')}
            >
              <Text style={styles.emptyBtnText}>Criar Meu Primeiro Livro</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Featured book */}
            {featuredBook && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Em Destaque</Text>
                <TouchableOpacity
                  style={styles.featuredCard}
                  onPress={() => navigation.navigate('BookDetail', { bookId: featuredBook.id })}
                  activeOpacity={0.9}
                >
                  <View
                    style={[
                      styles.featuredBanner,
                      { backgroundColor: featuredBook.cover?.primary || COLORS.surfaceHigh },
                    ]}
                  >
                    <Text style={styles.featuredEmoji}>{featuredBook.cover?.emoji || '📖'}</Text>
                    <View
                      style={[
                        styles.featuredOverlay,
                        { backgroundColor: featuredBook.cover?.secondary + '55' },
                      ]}
                    />
                  </View>
                  <View style={styles.featuredInfo}>
                    <Text style={styles.featuredGenre}>{featuredBook.genre}</Text>
                    <Text style={styles.featuredTitle} numberOfLines={2}>
                      {featuredBook.title}
                    </Text>
                    <Text style={styles.featuredAuthor}>{featuredBook.author}</Text>
                    <Text style={styles.featuredDesc} numberOfLines={3}>
                      {featuredBook.description}
                    </Text>
                    <View style={styles.featuredMeta}>
                      {featuredBook.pages && (
                        <Text style={styles.metaBadge}>{featuredBook.pages} pág.</Text>
                      )}
                      {featuredBook.estimatedReadingTime && (
                        <Text style={styles.metaBadge}>{featuredBook.estimatedReadingTime}</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* More books grid */}
            {remainingBooks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mais Livros</Text>
                <FlatList
                  data={remainingBooks}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.booksList}
                  keyExtractor={b => b.id}
                  renderItem={({ item }) => (
                    <BookCard
                      book={item}
                      onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}
                    />
                  )}
                />
              </View>
            )}
          </>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerGreeting: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textDim,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  createBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
  },
  createBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
  },
  genreList: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  genreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 5,
    marginRight: 8,
  },
  genreChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genreEmoji: {
    fontSize: 14,
  },
  genreText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  genreTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  featuredCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featuredBanner: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  featuredEmoji: {
    fontSize: 64,
    zIndex: 2,
  },
  featuredOverlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
  },
  featuredInfo: {
    padding: 16,
  },
  featuredGenre: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  featuredTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 30,
  },
  featuredAuthor: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 10,
  },
  featuredDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textDim,
    lineHeight: 20,
    marginBottom: 12,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  metaBadge: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    backgroundColor: COLORS.surfaceHigh,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  booksList: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
    marginBottom: 10,
  },
  emptyDesc: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
  },
  emptyBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
  bottomPad: {
    height: 30,
  },
});
