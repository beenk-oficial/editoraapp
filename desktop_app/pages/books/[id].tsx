import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import BookCover from '../../components/BookCover';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Chapter {
  number: number;
  title: string;
  content: string;
  wordCount?: number;
  summary?: string;
}

interface Book {
  id: string;
  title: string;
  author?: string;
  genre?: string;
  description?: string;
  backCover?: string;
  dedication?: string;
  preface?: string;
  conclusion?: string;
  cover?: any;
  chapters?: Chapter[];
  pages?: number;
  estimatedReadingTime?: string;
  totalWords?: number;
  themes?: string[];
  reviews?: Array<{ name: string; rating: number; text: string; date: string }>;
}

type ReaderView = 'detail' | 'preface' | 'chapter' | 'epilogue';

const FONT_SIZES = [15, 17, 19, 21];
const READING_THEMES = {
  dark: { '--reader-bg': '#0a0a0f', '--reader-text': '#e2e8f0', '--reader-surface': '#13131a' },
  sepia: { '--reader-bg': '#f4e9d0', '--reader-text': '#3d2b1f', '--reader-surface': '#ede0c4' },
  light: { '--reader-bg': '#ffffff', '--reader-text': '#1e293b', '--reader-surface': '#f8fafc' },
};
type ReadingTheme = keyof typeof READING_THEMES;

export default function BookPage() {
  const router = useRouter();
  const { id } = router.query as { id: string };

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ReaderView>('detail');
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [fontSize, setFontSize] = useState(1);
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('dark');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/books/${id}`)
      .then(r => r.json())
      .then(d => { setBook(d.book); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="page"><div className="loading-spinner"><div className="spinner" /> Carregando...</div></div>;
  }

  if (!book) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <div className="empty-title">Livro não encontrado</div>
          <Link href="/library" className="btn btn-primary">← Voltar à Biblioteca</Link>
        </div>
      </div>
    );
  }

  const avgRating = book.reviews?.length
    ? (book.reviews.reduce((a, r) => a + r.rating, 0) / book.reviews.length).toFixed(1)
    : null;

  const readerBg = READING_THEMES[readingTheme]['--reader-bg'];
  const readerText = READING_THEMES[readingTheme]['--reader-text'];
  const readerSurface = READING_THEMES[readingTheme]['--reader-surface'];

  const isReading = view !== 'detail';

  if (isReading) {
    const content =
      view === 'preface' ? book.preface :
      view === 'epilogue' ? book.conclusion :
      activeChapter?.content;
    const title =
      view === 'preface' ? 'Prefácio' :
      view === 'epilogue' ? 'Epílogo' :
      activeChapter?.title;
    const chapterNum = view === 'chapter' ? activeChapter?.number : null;

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100vh', background: readerBg }}>
        {/* TOC sidebar */}
        <div style={{ background: readerSurface, borderRight: '1px solid rgba(255,255,255,0.08)', padding: '24px 0', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          <div style={{ padding: '0 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '8px' }}>
            <button className="btn btn-secondary" style={{ fontSize: '13px', padding: '7px 12px' }} onClick={() => setView('detail')}>
              ← Detalhes
            </button>
            <div style={{ marginTop: '12px', fontSize: '13px', fontWeight: '700', color: readerText, lineHeight: 1.4 }}>{book.title}</div>
          </div>

          {book.preface && (
            <button
              onClick={() => setView('preface')}
              style={{ width: '100%', textAlign: 'left', padding: '10px 16px', background: view === 'preface' ? 'var(--primary)' : 'transparent', color: view === 'preface' ? 'white' : readerText, border: 'none', cursor: 'pointer', fontSize: '13px', opacity: 0.85 }}
            >
              Prefácio
            </button>
          )}

          {book.chapters?.map(ch => (
            <button
              key={ch.number}
              onClick={() => { setActiveChapter(ch); setView('chapter'); }}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 16px',
                background: view === 'chapter' && activeChapter?.number === ch.number ? 'var(--primary)' : 'transparent',
                color: view === 'chapter' && activeChapter?.number === ch.number ? 'white' : readerText,
                border: 'none', cursor: 'pointer', fontSize: '13px',
                display: 'flex', gap: '8px', alignItems: 'flex-start',
              }}
            >
              <span style={{ opacity: 0.5, minWidth: '20px', fontWeight: '600' }}>{ch.number}</span>
              <span style={{ lineHeight: 1.4 }}>{ch.title}</span>
            </button>
          ))}

          {book.conclusion && (
            <button
              onClick={() => setView('epilogue')}
              style={{ width: '100%', textAlign: 'left', padding: '10px 16px', background: view === 'epilogue' ? 'var(--primary)' : 'transparent', color: view === 'epilogue' ? 'white' : readerText, border: 'none', cursor: 'pointer', fontSize: '13px', opacity: 0.85 }}
            >
              Epílogo
            </button>
          )}
        </div>

        {/* Reader content */}
        <div style={{ background: readerBg, overflowY: 'auto', height: '100vh', position: 'relative' }}>
          {/* Reader controls */}
          <div style={{ position: 'sticky', top: 0, background: readerSurface + 'ee', padding: '12px 32px', display: 'flex', justifyContent: 'flex-end', gap: '8px', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => setFontSize(f => Math.max(0, f - 1))}>A−</button>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => setFontSize(f => Math.min(FONT_SIZES.length - 1, f + 1))}>A+</button>
            {(['dark', 'sepia', 'light'] as ReadingTheme[]).map(t => (
              <button
                key={t}
                onClick={() => setReadingTheme(t)}
                style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: READING_THEMES[t]['--reader-bg'],
                  border: `2px solid ${readingTheme === t ? 'var(--primary)' : 'rgba(255,255,255,0.2)'}`,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>

          <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 40px' }}>
            {chapterNum && (
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>
                Capítulo {chapterNum}
              </div>
            )}
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: readerText, letterSpacing: '-0.4px', marginBottom: '36px', lineHeight: 1.3 }}>
              {title}
            </h1>
            <div style={{ fontSize: `${FONT_SIZES[fontSize]}px`, lineHeight: '1.9', color: readerText, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {content || 'Conteúdo não disponível.'}
            </div>

            {/* Chapter navigation */}
            {view === 'chapter' && activeChapter && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '60px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                {activeChapter.number > 1 && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      const prev = book.chapters?.find(c => c.number === activeChapter.number - 1);
                      if (prev) setActiveChapter(prev);
                    }}
                  >
                    ‹ Capítulo Anterior
                  </button>
                )}
                {book.chapters && activeChapter.number < book.chapters.length && (
                  <button
                    className="btn btn-primary"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => {
                      const next = book.chapters?.find(c => c.number === activeChapter.number + 1);
                      if (next) setActiveChapter(next);
                    }}
                  >
                    Próximo Capítulo ›
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Detail view
  return (
    <div className="page" style={{ maxWidth: '960px' }}>
      {/* Back */}
      <div style={{ marginBottom: '24px' }}>
        <Link href="/library" style={{ color: 'var(--text-muted)', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          ← Biblioteca
        </Link>
      </div>

      {/* Hero */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '40px', marginBottom: '40px' }}>
        <BookCover title={book.title} author={book.author} cover={book.cover} />
        <div>
          <span className="genre-badge" style={{ marginBottom: '16px', display: 'inline-flex' }}>{book.genre}</span>
          <h1 style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text)', lineHeight: 1.2, letterSpacing: '-0.6px', marginBottom: '10px' }}>
            {book.title}
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '12px' }}>por {book.author}</p>
          {book.cover?.tagline && (
            <p style={{ fontSize: '15px', color: 'var(--primary-light)', fontStyle: 'italic', marginBottom: '18px' }}>
              "{book.cover.tagline}"
            </p>
          )}
          <div className="stats-row" style={{ marginBottom: '24px' }}>
            {book.pages && <span className="stat-badge">📄 {book.pages} pág.</span>}
            {book.estimatedReadingTime && <span className="stat-badge">⏱ {book.estimatedReadingTime}</span>}
            {book.chapters && <span className="stat-badge">📑 {book.chapters.length} cap.</span>}
            {book.totalWords && <span className="stat-badge">📝 {book.totalWords.toLocaleString()} palavras</span>}
            {avgRating && <span className="stat-badge" style={{ color: 'var(--warning)' }}>★ {avgRating}</span>}
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {book.preface && (
              <button className="btn btn-secondary" onClick={() => setView('preface')}>
                📖 Ler Prefácio
              </button>
            )}
            {book.chapters && book.chapters.length > 0 && (
              <button className="btn btn-primary btn-lg" onClick={() => { setActiveChapter(book.chapters![0]); setView('chapter'); }}>
                🚀 Começar a Ler
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* Description */}
      <div className="section">
        <h2 className="section-title">Sinopse</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '15px' }}>{book.description}</p>
      </div>

      {/* Back cover */}
      {book.backCover && (
        <div className="section">
          <h2 className="section-title">Contracapa</h2>
          <div className="card" style={{ borderColor: 'rgba(124,58,237,0.2)', background: 'rgba(124,58,237,0.04)' }}>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontStyle: 'italic' }}>{book.backCover}</p>
          </div>
        </div>
      )}

      {/* Chapters */}
      {book.chapters && book.chapters.length > 0 && (
        <div className="section">
          <h2 className="section-title">Capítulos</h2>
          <div style={{ display: 'grid', gap: '8px' }}>
            {book.chapters.map(ch => (
              <button
                key={ch.number}
                onClick={() => { setActiveChapter(ch); setView('chapter'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', color: 'var(--text)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,58,237,0.06)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)'; }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: 'var(--primary)', flexShrink: 0 }}>
                  {ch.number}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{ch.title}</div>
                  {ch.wordCount && <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>{ch.wordCount.toLocaleString()} palavras</div>}
                </div>
                <span style={{ color: 'var(--text-dim)', fontSize: '18px' }}>›</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {book.reviews && book.reviews.length > 0 && (
        <div className="section">
          <h2 className="section-title">Avaliações</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {book.reviews.map((r, i) => (
              <div key={i} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text)', fontSize: '14px' }}>{r.name}</span>
                  <span style={{ color: 'var(--warning)', fontSize: '14px' }}>{'★'.repeat(r.rating)}</span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{r.text}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px' }}>{r.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
