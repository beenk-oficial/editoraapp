import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const GENRES = [
  { id: 'Ficção Científica', emoji: '🚀' },
  { id: 'Fantasia', emoji: '✨' },
  { id: 'Romance', emoji: '💕' },
  { id: 'Thriller', emoji: '🔪' },
  { id: 'Mistério', emoji: '🔍' },
  { id: 'Horror', emoji: '👁️' },
  { id: 'Autoajuda', emoji: '🌟' },
  { id: 'Negócios', emoji: '📈' },
  { id: 'História', emoji: '📜' },
  { id: 'Aventura', emoji: '⚔️' },
  { id: 'Poesia', emoji: '🌸' },
  { id: 'Infantil', emoji: '🦋' },
];

const AUDIENCES = [
  'Adultos', 'Jovens adultos (18-25)', 'Adolescentes (13-17)',
  'Infantil (6-12)', 'Executivos e empresários', 'Estudantes universitários',
];

interface ProgressEvent {
  type: string;
  message?: string;
  step?: string;
  chapterNumber?: number;
  chapterTitle?: string;
  title?: string;
  author?: string;
  bookId?: string;
  progress?: number;
}

type PageState = 'form' | 'generating' | 'done';

export default function GeneratePage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>('form');
  const [genre, setGenre] = useState('');
  const [theme, setTheme] = useState('');
  const [audience, setAudience] = useState('');
  const [chapters, setChapters] = useState(8);
  const [language, setLanguage] = useState('Português');

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [completedId, setCompletedId] = useState('');
  const [error, setError] = useState('');

  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [events.length]);

  const startGeneration = async () => {
    if (!genre) return setError('Selecione um gênero');
    if (!theme.trim()) return setError('Digite o tema do livro');
    if (!audience) return setError('Selecione o público-alvo');
    setError('');
    setState('generating');
    setProgress(0);
    setEvents([]);

    try {
      const response = await fetch(`${API}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre, theme, targetAudience: audience, language, numChapters: chapters }),
      });

      if (!response.ok) throw new Error('Erro ao iniciar geração');
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event: ProgressEvent = JSON.parse(line.substring(6));
            if (event.type === 'outline_complete') {
              setBookTitle(event.title || '');
              setBookAuthor(event.author || '');
            }
            if (typeof event.progress === 'number') setProgress(event.progress);
            if (event.message) setCurrentStep(event.message);
            if (event.type === 'complete') {
              setCompletedId(event.bookId || '');
              setProgress(100);
              setTimeout(() => setState('done'), 800);
            }
            if (['step', 'chapter_complete', 'outline_complete', 'cover_complete', 'preface_complete', 'conclusion_complete', 'started'].includes(event.type)) {
              setEvents(prev => [...prev, event]);
            }
          } catch (_) {}
        }
      }
    } catch (e: any) {
      setError(e.message);
      setState('form');
    }
  };

  const stepIcon: Record<string, string> = {
    outline: '📋', cover: '🎨', preface: '✍️',
    chapter: '📝', conclusion: '🔖', finalize: '✅', started: '🚀',
  };

  if (state === 'done') {
    return (
      <div className="page" style={{ maxWidth: '600px', textAlign: 'center', paddingTop: '80px' }}>
        <div style={{ fontSize: '72px', marginBottom: '24px' }}>🎉</div>
        <h1 className="page-title" style={{ marginBottom: '12px' }}>Livro Criado!</h1>
        <p style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary-light)', marginBottom: '8px' }}>
          "{bookTitle}"
        </p>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '15px' }}>
          por {bookAuthor}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => router.push(`/books/${completedId}`)}>
            📖 Ler Agora
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => { setState('form'); setTheme(''); setGenre(''); setAudience(''); }}>
            ✨ Criar Outro
          </button>
        </div>
      </div>
    );
  }

  if (state === 'generating') {
    return (
      <div className="page" style={{ maxWidth: '720px' }}>
        <div className="page-header">
          <h1 className="page-title">Gerando Livro</h1>
          {bookTitle ? (
            <p className="page-subtitle">"{bookTitle}" — por {bookAuthor}</p>
          ) : (
            <p className="page-subtitle">A IA está escrevendo seu livro...</p>
          )}
        </div>

        {/* Progress */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{currentStep}</span>
            <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary-light)' }}>{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Event log */}
        <div className="card">
          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
            Log de Progresso
          </div>
          <div ref={logRef} style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {events.map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '6px', borderRadius: '6px', background: 'var(--surface-high)' }}>
                <span>{stepIcon[ev.step || ev.type] || '⚙️'}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  {ev.message || (ev.chapterTitle ? `Capítulo ${ev.chapterNumber}: ${ev.chapterTitle}` : ev.type)}
                </span>
              </div>
            ))}
            {events.length === 0 && (
              <div style={{ color: 'var(--text-dim)', fontSize: '13px', padding: '12px', textAlign: 'center' }} className="pulse">
                Iniciando agentes...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <h1 className="page-title">Criar Livro com IA</h1>
        <p className="page-subtitle">Configure os parâmetros e os agentes escrevem o livro completo</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px', color: 'var(--error)', fontSize: '14px' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div>
          {/* Genre */}
          <div className="form-group">
            <label className="form-label">Gênero Literário *</label>
            <div className="chip-group">
              {GENRES.map(g => (
                <button
                  key={g.id}
                  className={`chip${genre === g.id ? ' active' : ''}`}
                  onClick={() => setGenre(g.id)}
                >
                  <span>{g.emoji}</span> {g.id}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="form-group">
            <label className="form-label">Tema / Assunto *</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="Ex: Uma arqueóloga descobre um artefato alienígena que reescreve a história humana..."
              value={theme}
              onChange={e => setTheme(e.target.value)}
            />
          </div>
        </div>

        <div>
          {/* Audience */}
          <div className="form-group">
            <label className="form-label">Público-Alvo *</label>
            <div className="chip-group">
              {AUDIENCES.map(a => (
                <button
                  key={a}
                  className={`chip${audience === a ? ' active' : ''}`}
                  onClick={() => setAudience(a)}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Chapters */}
          <div className="form-group">
            <label className="form-label">Número de Capítulos</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[4, 6, 8, 10, 12, 15].map(n => (
                <button
                  key={n}
                  className={`btn${chapters === n ? ' btn-primary' : ' btn-secondary'}`}
                  style={{ minWidth: '46px', padding: '8px' }}
                  onClick={() => setChapters(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="form-group">
            <label className="form-label">Idioma</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Português', 'English', 'Español'].map(l => (
                <button
                  key={l}
                  className={`chip${language === l ? ' active' : ''}`}
                  onClick={() => setLanguage(l)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="card" style={{ background: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.2)' }}>
            <div style={{ fontSize: '12px', color: 'var(--primary-light)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
              O que será criado
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.8' }}>
              ✅ Título e sinopse únicos<br />
              ✅ Design de capa personalizado<br />
              ✅ Dedicatória e prefácio<br />
              ✅ {chapters} capítulos completos (~{chapters * 2000} palavras)<br />
              ✅ Epílogo emotivo<br />
              ✅ Avaliações de leitores
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button className="btn btn-primary btn-lg" onClick={startGeneration} style={{ fontSize: '17px', padding: '16px 36px' }}>
          ✨ Gerar Livro com IA
        </button>
        <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
          Processo leva alguns minutos
        </span>
      </div>
    </div>
  );
}
