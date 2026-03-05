import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_BASE_URL, COLORS, FONTS } from '../config';

const FONT_SIZES = [14, 16, 18, 20, 22];
const THEMES = {
  dark: { bg: '#0a0a0f', text: '#e2e8f0', muted: '#64748b', surface: '#13131a' },
  sepia: { bg: '#f4e9d0', text: '#3d2b1f', muted: '#7a5c3a', surface: '#ede0c4' },
  light: { bg: '#ffffff', text: '#1e293b', muted: '#64748b', surface: '#f8fafc' },
};

type ThemeKey = keyof typeof THEMES;

export default function BookReaderScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { bookId, chapterNumber: initialChapter = 1 } = route.params;

  const [book, setBook] = useState<any>(null);
  const [chapter, setChapter] = useState<any>(null);
  const [currentChapter, setCurrentChapter] = useState(initialChapter);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(1); // index in FONT_SIZES
  const [theme, setTheme] = useState<ThemeKey>('dark');
  const [showControls, setShowControls] = useState(false);
  const [showPreface, setShowPreface] = useState(initialChapter === 0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/books/${bookId}`)
      .then(r => r.json())
      .then(data => {
        setBook(data.book);
        const ch = data.book?.chapters?.find((c: any) => c.number === currentChapter);
        setChapter(ch || data.book?.chapters?.[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [bookId]);

  const loadChapter = (num: number) => {
    if (!book) return;
    if (num === 0) {
      setShowPreface(true);
      setCurrentChapter(0);
    } else {
      const ch = book.chapters?.find((c: any) => c.number === num);
      if (ch) {
        setChapter(ch);
        setCurrentChapter(num);
        setShowPreface(false);
      }
    }
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const T = THEMES[theme];
  const fs = FONT_SIZES[fontSize];
  const totalChapters = book?.chapters?.length || 0;

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: T.bg }]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  const currentContent = showPreface ? book?.preface : chapter?.content;
  const currentTitle = showPreface ? 'Prefácio' : chapter?.title;
  const chapterNum = showPreface ? null : currentChapter;

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      {/* Top bar */}
      <View style={[styles.topBar, { backgroundColor: T.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: T.muted }]}>‹ {book?.title}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowControls(v => !v)}>
          <Text style={[styles.settingsIcon, { color: T.muted }]}>Aa</Text>
        </TouchableOpacity>
      </View>

      {/* Controls panel */}
      {showControls && (
        <View style={[styles.controls, { backgroundColor: T.surface }]}>
          <View style={styles.controlRow}>
            <Text style={[styles.controlLabel, { color: T.muted }]}>Tamanho</Text>
            <View style={styles.fontSizeRow}>
              <TouchableOpacity onPress={() => setFontSize(f => Math.max(0, f - 1))}>
                <Text style={[styles.fsBtn, { color: T.text }]}>A−</Text>
              </TouchableOpacity>
              <Text style={[styles.fsValue, { color: T.muted }]}>{fs}px</Text>
              <TouchableOpacity onPress={() => setFontSize(f => Math.min(FONT_SIZES.length - 1, f + 1))}>
                <Text style={[styles.fsBtn, { color: T.text }]}>A+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.controlRow}>
            <Text style={[styles.controlLabel, { color: T.muted }]}>Tema</Text>
            <View style={styles.themeRow}>
              {(Object.keys(THEMES) as ThemeKey[]).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.themeBtn, { backgroundColor: THEMES[t].bg, borderColor: theme === t ? COLORS.primary : T.muted }]}
                  onPress={() => setTheme(t)}
                />
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Content */}
      <ScrollView ref={scrollRef} style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.chapterHeader}>
          {chapterNum && (
            <Text style={[styles.chapterLabel, { color: COLORS.primary }]}>
              Capítulo {chapterNum}
            </Text>
          )}
          <Text style={[styles.chapterTitle, { color: T.text, fontSize: fs + 6 }]}>
            {currentTitle}
          </Text>
        </View>

        <Text style={[styles.body, { color: T.text, fontSize: fs, lineHeight: fs * 1.85 }]}>
          {currentContent || 'Conteúdo não disponível.'}
        </Text>

        {/* Chapter navigation */}
        <View style={styles.navRow}>
          {(showPreface ? false : currentChapter > 1) && (
            <TouchableOpacity
              style={[styles.navBtn, { borderColor: T.muted }]}
              onPress={() => loadChapter(currentChapter - 1)}
            >
              <Text style={[styles.navBtnText, { color: T.text }]}>‹ Anterior</Text>
            </TouchableOpacity>
          )}
          {!showPreface && currentChapter < totalChapters && (
            <TouchableOpacity
              style={[styles.navBtnPrimary]}
              onPress={() => {
                if (currentChapter === totalChapters) {
                  // Show epilogue
                } else {
                  loadChapter(currentChapter + 1);
                }
              }}
            >
              <Text style={styles.navBtnPrimaryText}>
                {currentChapter === totalChapters ? 'Epílogo' : 'Próximo ›'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom chapter list */}
      <View style={[styles.bottomBar, { backgroundColor: T.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chapterPills}>
          {book?.preface && (
            <TouchableOpacity
              style={[styles.pill, showPreface && styles.pillActive]}
              onPress={() => loadChapter(0)}
            >
              <Text style={[styles.pillText, showPreface && styles.pillTextActive]}>Pref.</Text>
            </TouchableOpacity>
          )}
          {book?.chapters?.map((ch: any) => (
            <TouchableOpacity
              key={ch.number}
              style={[styles.pill, !showPreface && currentChapter === ch.number && styles.pillActive]}
              onPress={() => loadChapter(ch.number)}
            >
              <Text style={[styles.pillText, !showPreface && currentChapter === ch.number && styles.pillTextActive]}>
                {ch.number}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff11',
  },
  backText: { fontSize: FONTS.sizes.sm, fontWeight: '600' },
  settingsIcon: { fontSize: FONTS.sizes.md, fontWeight: '700' },
  controls: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff11',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  controlLabel: { fontSize: FONTS.sizes.sm, fontWeight: '600' },
  fontSizeRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  fsBtn: { fontSize: FONTS.sizes.lg, fontWeight: '700' },
  fsValue: { fontSize: FONTS.sizes.sm },
  themeRow: { flexDirection: 'row', gap: 8 },
  themeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
  scroll: { flex: 1 },
  chapterHeader: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
  },
  chapterLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  chapterTitle: {
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 34,
  },
  body: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    letterSpacing: 0.2,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  navBtnText: { fontSize: FONTS.sizes.md, fontWeight: '600' },
  navBtnPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  navBtnPrimaryText: { color: '#fff', fontSize: FONTS.sizes.md, fontWeight: '700' },
  bottomBar: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#ffffff11',
  },
  chapterPills: {
    paddingHorizontal: 16,
    gap: 6,
  },
  pill: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ffffff22',
    marginRight: 6,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: { fontSize: FONTS.sizes.sm, color: COLORS.textDim, fontWeight: '600' },
  pillTextActive: { color: COLORS.white },
});
