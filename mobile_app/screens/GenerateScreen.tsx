import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GenerationProgress from '../components/GenerationProgress';
import { API_BASE_URL, COLORS, FONTS } from '../config';

const GENRES = [
  { id: 'Ficção Científica', name: 'Ficção Científica', emoji: '🚀' },
  { id: 'Fantasia', name: 'Fantasia', emoji: '✨' },
  { id: 'Romance', name: 'Romance', emoji: '💕' },
  { id: 'Thriller', name: 'Thriller', emoji: '🔪' },
  { id: 'Mistério', name: 'Mistério', emoji: '🔍' },
  { id: 'Horror', name: 'Horror', emoji: '👁️' },
  { id: 'Autoajuda', name: 'Autoajuda', emoji: '🌟' },
  { id: 'Negócios', name: 'Negócios', emoji: '📈' },
  { id: 'História', name: 'História', emoji: '📜' },
  { id: 'Aventura', name: 'Aventura', emoji: '⚔️' },
];

const AUDIENCES = [
  'Adultos', 'Jovens adultos (18-25)', 'Adolescentes (13-17)',
  'Infantil (6-12)', 'Executivos e empresários', 'Estudantes universitários',
];

const CHAPTER_OPTIONS = [4, 6, 8, 10, 12];

type Step = 'form' | 'generating' | 'done';

interface ProgressEvent {
  type: string;
  message?: string;
  step?: string;
  chapterNumber?: number;
  chapterTitle?: string;
}

export default function GenerateScreen() {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState<Step>('form');
  const [genre, setGenre] = useState('');
  const [theme, setTheme] = useState('');
  const [audience, setAudience] = useState('');
  const [chapters, setChapters] = useState(8);
  const [language, setLanguage] = useState('Português');

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Iniciando...');
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [completedBookId, setCompletedBookId] = useState('');

  const readerRef = useRef<EventSource | null>(null);

  const startGeneration = async () => {
    if (!genre) return Alert.alert('Atenção', 'Selecione um gênero');
    if (!theme.trim()) return Alert.alert('Atenção', 'Digite o tema do livro');
    if (!audience) return Alert.alert('Atenção', 'Selecione o público-alvo');

    setStep('generating');
    setProgress(0);
    setEvents([]);

    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre, theme, targetAudience: audience, language, numChapters: chapters }),
      });

      if (!response.ok) {
        throw new Error('Erro ao iniciar geração');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Stream não disponível');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: ProgressEvent & { progress?: number; title?: string; author?: string; bookId?: string } =
                JSON.parse(line.substring(6));

              if (event.type === 'outline_complete') {
                setBookTitle(event.title || '');
                setBookAuthor(event.author || '');
              }

              if (typeof event.progress === 'number') {
                setProgress(event.progress);
              }

              if (event.message) {
                setCurrentStep(event.message);
              }

              if (event.type === 'complete') {
                setCompletedBookId(event.bookId || '');
                setProgress(100);
                setCurrentStep('Livro criado com sucesso!');
                setTimeout(() => setStep('done'), 800);
              }

              if (['step', 'chapter_complete', 'outline_complete', 'cover_complete', 'preface_complete', 'conclusion_complete'].includes(event.type)) {
                setEvents(prev => [...prev, event]);
              }
            } catch (_) {}
          }
        }
      }
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Erro ao gerar o livro');
      setStep('form');
    }
  };

  if (step === 'generating') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gerando Livro</Text>
          <Text style={styles.headerSub}>A IA está escrevendo seu livro...</Text>
        </View>
        <ScrollView style={styles.progressScroll} showsVerticalScrollIndicator={false}>
          <GenerationProgress
            progress={progress}
            currentStep={currentStep}
            events={events}
            title={bookTitle || undefined}
            author={bookAuthor || undefined}
          />
        </ScrollView>
      </View>
    );
  }

  if (step === 'done') {
    return (
      <View style={[styles.container, styles.doneContainer]}>
        <Text style={styles.doneEmoji}>🎉</Text>
        <Text style={styles.doneTitle}>Livro Criado!</Text>
        <Text style={styles.doneBook}>"{bookTitle}"</Text>
        <Text style={styles.doneAuthor}>por {bookAuthor}</Text>
        <TouchableOpacity
          style={styles.readBtn}
          onPress={() => {
            navigation.navigate('BookDetail', { bookId: completedBookId });
            setStep('form');
          }}
        >
          <Text style={styles.readBtnText}>Ler Agora</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => {
            setStep('form');
            setTheme('');
            setGenre('');
            setAudience('');
          }}
        >
          <Text style={styles.newBtnText}>Criar Outro Livro</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Criar Livro</Text>
          <Text style={styles.headerSub}>Configure seu livro e a IA escreve tudo</Text>
        </View>

        {/* Genre */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Gênero Literário *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {GENRES.map(g => (
              <TouchableOpacity
                key={g.id}
                style={[styles.chip, genre === g.id && styles.chipActive]}
                onPress={() => setGenre(g.id)}
              >
                <Text style={styles.chipEmoji}>{g.emoji}</Text>
                <Text style={[styles.chipText, genre === g.id && styles.chipTextActive]}>
                  {g.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Theme */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tema / Assunto do Livro *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ex: Uma detetive que descobre uma conspiração intergaláctica..."
            placeholderTextColor={COLORS.textDim}
            value={theme}
            onChangeText={setTheme}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Audience */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Público-Alvo *</Text>
          <View style={styles.chipWrap}>
            {AUDIENCES.map(a => (
              <TouchableOpacity
                key={a}
                style={[styles.chip, audience === a && styles.chipActive]}
                onPress={() => setAudience(a)}
              >
                <Text style={[styles.chipText, audience === a && styles.chipTextActive]}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Chapter count */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Número de Capítulos</Text>
          <View style={styles.chapterRow}>
            {CHAPTER_OPTIONS.map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.chapterBtn, chapters === n && styles.chapterBtnActive]}
                onPress={() => setChapters(n)}
              >
                <Text style={[styles.chapterBtnText, chapters === n && styles.chapterBtnTextActive]}>
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Idioma</Text>
          <View style={styles.chipWrap}>
            {['Português', 'English', 'Español'].map(l => (
              <TouchableOpacity
                key={l}
                style={[styles.chip, language === l && styles.chipActive]}
                onPress={() => setLanguage(l)}
              >
                <Text style={[styles.chipText, language === l && styles.chipTextActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.generateBtn} onPress={startGeneration}>
          <Text style={styles.generateBtnText}>✨ Gerar Livro com IA</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          A geração leva alguns minutos. A IA criará título, capa, prefácio, {chapters} capítulos completos e epílogo.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  chipScroll: {
    marginLeft: -4,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    marginBottom: 4,
    gap: 5,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  chipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    minHeight: 90,
  },
  chapterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chapterBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chapterBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chapterBtnText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  chapterBtnTextActive: {
    color: COLORS.white,
  },
  generateBtn: {
    marginHorizontal: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  generateBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  disclaimer: {
    textAlign: 'center',
    color: COLORS.textDim,
    fontSize: FONTS.sizes.xs,
    marginTop: 12,
    paddingHorizontal: 24,
    lineHeight: 18,
  },
  progressScroll: {
    flex: 1,
  },
  doneContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  doneEmoji: {
    fontSize: 72,
    marginBottom: 20,
  },
  doneTitle: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  doneBook: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.primaryLight,
    textAlign: 'center',
    marginBottom: 6,
  },
  doneAuthor: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    marginBottom: 32,
  },
  readBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 14,
    width: '100%',
    alignItems: 'center',
  },
  readBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
  },
  newBtn: {
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 30,
  },
  newBtnText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
});
