import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import BookCover from './BookCover';
import { COLORS, FONTS } from '../config';

interface Book {
  id: string;
  title: string;
  author?: string;
  genre?: string;
  description?: string;
  cover?: any;
  pages?: number;
  estimatedReadingTime?: string;
  reviews?: Array<{ rating: number }>;
}

interface BookCardProps {
  book: Book;
  onPress: (book: Book) => void;
  horizontal?: boolean;
}

export default function BookCard({ book, onPress, horizontal = false }: BookCardProps) {
  const avgRating = book.reviews?.length
    ? book.reviews.reduce((a, r) => a + r.rating, 0) / book.reviews.length
    : null;

  if (horizontal) {
    return (
      <TouchableOpacity
        style={styles.horizontalCard}
        onPress={() => onPress(book)}
        activeOpacity={0.85}
      >
        <BookCover
          title={book.title}
          author={book.author}
          cover={book.cover}
          width={80}
          height={118}
        />
        <View style={styles.horizontalInfo}>
          <Text style={styles.genre}>{book.genre}</Text>
          <Text style={styles.horizontalTitle} numberOfLines={2}>{book.title}</Text>
          <Text style={styles.horizontalAuthor} numberOfLines={1}>{book.author}</Text>
          {book.description && (
            <Text style={styles.horizontalDesc} numberOfLines={2}>
              {book.description}
            </Text>
          )}
          <View style={styles.metaRow}>
            {book.pages && (
              <Text style={styles.metaText}>{book.pages} pág.</Text>
            )}
            {book.estimatedReadingTime && (
              <Text style={styles.metaText}>• {book.estimatedReadingTime}</Text>
            )}
            {avgRating && (
              <Text style={styles.ratingText}>★ {avgRating.toFixed(1)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(book)}
      activeOpacity={0.85}
    >
      <BookCover
        title={book.title}
        author={book.author}
        cover={book.cover}
        width={130}
        height={195}
      />
      <View style={styles.info}>
        <Text style={styles.cardTitle} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.cardAuthor} numberOfLines={1}>{book.author}</Text>
        {avgRating && (
          <Text style={styles.ratingText}>★ {avgRating.toFixed(1)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 130,
    marginRight: 14,
  },
  info: {
    marginTop: 8,
  },
  cardTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 18,
  },
  cardAuthor: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  ratingText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.warning,
    marginTop: 3,
    fontWeight: '600',
  },
  // Horizontal card
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  horizontalInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  genre: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  horizontalTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 20,
  },
  horizontalAuthor: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 6,
  },
  horizontalDesc: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textDim,
    lineHeight: 16,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textDim,
  },
});
