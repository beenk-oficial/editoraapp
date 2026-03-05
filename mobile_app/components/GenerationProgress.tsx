import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { COLORS, FONTS } from '../config';

interface ProgressEvent {
  type: string;
  message?: string;
  chapterNumber?: number;
  chapterTitle?: string;
  step?: string;
}

interface GenerationProgressProps {
  progress: number;
  currentStep: string;
  events: ProgressEvent[];
  title?: string;
  author?: string;
}

export default function GenerationProgress({
  progress,
  currentStep,
  events,
  title,
  author,
}: GenerationProgressProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [events.length]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const stepIcon = (step: string) => {
    const icons: Record<string, string> = {
      outline: '📋',
      cover: '🎨',
      preface: '✍️',
      chapter: '📝',
      conclusion: '🔖',
      finalize: '✅',
      started: '🚀',
    };
    return icons[step] || '⚙️';
  };

  return (
    <View style={styles.container}>
      {/* Animated indicator */}
      <Animated.View style={[styles.glowDot, { transform: [{ scale: pulseAnim }] }]} />

      {/* Book preview when title is known */}
      {title && (
        <View style={styles.bookPreview}>
          <Text style={styles.previewLabel}>Criando</Text>
          <Text style={styles.previewTitle} numberOfLines={2}>{title}</Text>
          {author && <Text style={styles.previewAuthor}>por {author}</Text>}
        </View>
      )}

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
      </View>

      {/* Current step */}
      <Text style={styles.currentStep}>{currentStep}</Text>

      {/* Event log */}
      <ScrollView
        ref={scrollRef}
        style={styles.eventLog}
        showsVerticalScrollIndicator={false}
      >
        {events.slice(-12).map((event, idx) => (
          <View key={idx} style={styles.eventRow}>
            <Text style={styles.eventIcon}>{stepIcon(event.step || event.type)}</Text>
            <Text style={styles.eventText} numberOfLines={2}>
              {event.message || event.chapterTitle
                ? `Capítulo ${event.chapterNumber}: ${event.chapterTitle}`
                : event.type}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  glowDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    marginBottom: 20,
    shadowColor: COLORS.primaryLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  bookPreview: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  previewLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  previewTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 28,
  },
  previewAuthor: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  progressPercent: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.primaryLight,
    minWidth: 38,
    textAlign: 'right',
  },
  currentStep: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  eventLog: {
    width: '100%',
    maxHeight: 180,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
    gap: 8,
  },
  eventIcon: {
    fontSize: 14,
    marginTop: 1,
  },
  eventText: {
    flex: 1,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    lineHeight: 17,
  },
});
