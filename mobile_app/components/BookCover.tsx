import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CoverData {
  primary?: string;
  secondary?: string;
  accent?: string;
  emoji?: string;
  tagline?: string;
  gradientAngle?: number;
}

interface BookCoverProps {
  title: string;
  author?: string;
  cover?: CoverData;
  width?: number;
  height?: number;
  showTitle?: boolean;
}

export default function BookCover({
  title,
  author,
  cover,
  width = 120,
  height = 180,
  showTitle = true,
}: BookCoverProps) {
  const primary = cover?.primary || '#1e293b';
  const secondary = cover?.secondary || '#7c3aed';
  const accent = cover?.accent || '#f1f5f9';
  const emoji = cover?.emoji || '📖';

  // Simulate gradient with layered views
  const fontSize = title.length > 20 ? Math.max(9, Math.floor(width * 0.085)) : Math.floor(width * 0.1);

  return (
    <View style={[styles.container, { width, height, backgroundColor: primary }]}>
      {/* Gradient simulation with diagonal stripe */}
      <View
        style={[
          styles.gradientOverlay,
          { backgroundColor: secondary, opacity: 0.45 },
        ]}
      />
      {/* Decorative corner accent */}
      <View style={[styles.cornerAccent, { borderColor: accent, opacity: 0.25 }]} />

      {/* Top decoration */}
      <View style={styles.topSection}>
        <Text style={[styles.emoji, { fontSize: Math.floor(width * 0.22) }]}>
          {emoji}
        </Text>
      </View>

      {/* Bottom book info */}
      {showTitle && (
        <View style={[styles.bottomSection, { backgroundColor: primary + 'cc' }]}>
          <Text
            style={[styles.title, { fontSize, color: accent }]}
            numberOfLines={3}
          >
            {title}
          </Text>
          {author && (
            <Text
              style={[styles.author, { fontSize: Math.max(8, fontSize * 0.72), color: accent + 'aa' }]}
              numberOfLines={1}
            >
              {author}
            </Text>
          )}
        </View>
      )}

      {/* Decorative horizontal lines */}
      <View style={[styles.line, { top: height * 0.12, backgroundColor: secondary, opacity: 0.6 }]} />
      <View style={[styles.line, { top: height * 0.16, backgroundColor: secondary, opacity: 0.3, width: '60%' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    transform: [{ skewX: '-15deg' }, { translateX: -20 }],
  },
  cornerAccent: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderWidth: 1,
    borderRadius: 4,
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
  },
  emoji: {
    textAlign: 'center',
  },
  bottomSection: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    paddingTop: 6,
  },
  title: {
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 15,
    marginBottom: 3,
  },
  author: {
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  line: {
    position: 'absolute',
    height: 1,
    width: '80%',
    left: '10%',
  },
});
