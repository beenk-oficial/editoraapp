import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import BookCover from '../components/BookCover';
import { API_BASE_URL, COLORS, FONTS } from '../config';

export default function BookDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { bookId } = route.params;

  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/books/${bookId}`)
      .then(r => r.json())
      .then(data => { setBook(data.book); setLoading(false); })
      .catch(() => setLoading(false));
  }, [bookId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Livro não encontrado</Text>
      </View>
    );
  }

  const avgRating = book.reviews?.length
    ? book.reviews.reduce((a: number, r: any) => a + r.rating, 0) / book.reviews.length
    : null;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero section */}
        <View style={[styles.hero, { backgroundColor: book.cover?.primary || COLORS.surfaceHigh }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Voltar</Text>
          </TouchableOpacity>
          <BookCover
            title={book.title}
            author={book.author}
            cover={book.cover}
            width={140}
            height={210}
          />
          <View style={[styles.heroOverlay, { backgroundColor: book.cover?.secondary + '33' }]} />
        </View>

        <View style={styles.content}>
          {/* Title & Author */}
          <Text style={styles.genre}>{book.genre}</Text>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>por {book.author}</Text>

          {/* Cover tagline */}
          {book.cover?.tagline && (
            <Text style={styles.tagline}>"{book.cover.tagline}"</Text>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            {book.pages && <StatBadge icon="📄" value={`${book.pages} págs`} />}
            {book.estimatedReadingTime && <StatBadge icon="⏱" value={book.estimatedReadingTime} />}
            {book.chapters && <StatBadge icon="📑" value={`${book.chapters.length} cap.`} />}
            {avgRating && <StatBadge icon="★" value={avgRating.toFixed(1)} highlight />}
          </View>

          {/* Read button */}
          <TouchableOpacity
            style={styles.readBtn}
            onPress={() => navigation.navigate('Reader', { bookId: book.id, chapterNumber: 1 })}
          >
            <Text style={styles.readBtnText}>📖 Começar a Ler</Text>
          </TouchableOpacity>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sinopse</Text>
            <Text style={styles.description}>{book.description}</Text>
          </View>

          {/* Back cover */}
          {book.backCover && (
            <View style={[styles.section, styles.backCoverSection]}>
              <Text style={styles.sectionTitle}>Contracapa</Text>
              <Text style={styles.backCoverText}>{book.backCover}</Text>
            </View>
          )}

          {/* Chapters list */}
          {book.chapters && book.chapters.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Capítulos</Text>
              {book.chapters.map((ch: any) => (
                <TouchableOpacity
                  key={ch.number}
                  style={styles.chapterRow}
                  onPress={() => navigation.navigate('Reader', { bookId: book.id, chapterNumber: ch.number })}
                >
                  <View style={styles.chapterNumBadge}>
                    <Text style={styles.chapterNum}>{ch.number}</Text>
                  </View>
                  <View style={styles.chapterInfo}>
                    <Text style={styles.chapterTitle}>{ch.title}</Text>
                    {ch.wordCount && (
                      <Text style={styles.chapterMeta}>{ch.wordCount} palavras</Text>
                    )}
                  </View>
                  <Text style={styles.chapterArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Reviews */}
          {book.reviews && book.reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Avaliações dos Leitores</Text>
              {book.reviews.map((review: any, idx: number) => (
                <View key={idx} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewName}>{review.name}</Text>
                    <Text style={styles.reviewRating}>{'★'.repeat(review.rating)}</Text>
                  </View>
                  <Text style={styles.reviewText}>{review.text}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function StatBadge({ icon, value, highlight }: { icon: string; value: string; highlight?: boolean }) {
  return (
    <View style={[styles.statBadge, highlight && styles.statBadgeHighlight]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: COLORS.textMuted, fontSize: FONTS.sizes.lg },
  hero: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  heroOverlay: { position: 'absolute', inset: 0 },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: 20,
    zIndex: 10,
    backgroundColor: '#00000055',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backBtnText: { color: COLORS.text, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  content: { padding: 20 },
  genre: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  author: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    marginTop: 6,
    marginBottom: 12,
  },
  tagline: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primaryLight,
    fontStyle: 'italic',
    marginBottom: 18,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statBadgeHighlight: {
    backgroundColor: COLORS.warning + '22',
    borderColor: COLORS.warning + '44',
  },
  statIcon: { fontSize: 13 },
  statValue: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, fontWeight: '600' },
  statValueHighlight: { color: COLORS.warning },
  readBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  readBtnText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '800' },
  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  description: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    lineHeight: 24,
  },
  backCoverSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backCoverText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  chapterNumBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterNum: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.primary },
  chapterInfo: { flex: 1 },
  chapterTitle: { fontSize: FONTS.sizes.md, color: COLORS.text, fontWeight: '600' },
  chapterMeta: { fontSize: FONTS.sizes.xs, color: COLORS.textDim, marginTop: 2 },
  chapterArrow: { fontSize: 22, color: COLORS.textDim },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reviewName: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.text },
  reviewRating: { fontSize: FONTS.sizes.sm, color: COLORS.warning },
  reviewText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, lineHeight: 20 },
  reviewDate: { fontSize: FONTS.sizes.xs, color: COLORS.textDim, marginTop: 6 },
});
