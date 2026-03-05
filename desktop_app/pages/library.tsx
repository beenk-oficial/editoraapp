import { useEffect, useState } from 'react';
import Link from 'next/link';
import BookCard from '../components/BookCard';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Book {
  id: string;
  title: string;
  author?: string;
  genre?: string;
  description?: string;
  cover?: any;
  pages?: number;
  estimatedReadingTime?: string;
  reviews?: any[];
  status?: string;
  progress?: number;
  chapterCount?: number;
}

type ViewMode = 'grid' | 'list';

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'genre'>('newest');

  useEffect(() => {
    fetch(`${API}/books`)
      .then(r => r.json())
      .then(d => { setBooks(d.books || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Excluir "${title}"?`)) return;
    await fetch(`${API}/books/${id}`, { method: 'DELETE' });
    setBooks(prev => prev.filter(b => b.id !== id));
  };

  const sorted = [...books]
    .filter(b => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.genre?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'genre') return (a.genre || '').localeCompare(b.genre || '');
      return 0; // newest = original order (store is push-order)
    });

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Biblioteca</h1>
          <p className="page-subtitle">{books.length} livro{books.length !== 1 ? 's' : ''} criado{books.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/generate" className="btn btn-primary">
          ✨ Novo Livro
        </Link>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="form-input"
          style={{ flex: 1, minWidth: '240px', maxWidth: '400px' }}
          placeholder="🔍 Buscar por título, autor ou gênero..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="form-input"
          style={{ width: '180px' }}
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
        >
          <option value="newest">Mais Recentes</option>
          <option value="title">Título A-Z</option>
          <option value="genre">Por Gênero</option>
        </select>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className={`btn btn-secondary`}
            style={{ padding: '10px 14px', background: view === 'grid' ? 'var(--primary)' : undefined, color: view === 'grid' ? 'white' : undefined }}
            onClick={() => setView('grid')}
          >
            ⊞
          </button>
          <button
            className={`btn btn-secondary`}
            style={{ padding: '10px 14px', background: view === 'list' ? 'var(--primary)' : undefined, color: view === 'list' ? 'white' : undefined }}
            onClick={() => setView('list')}
          >
            ☰
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /> Carregando...</div>
      ) : sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{search ? '🔍' : '📚'}</div>
          <div className="empty-title">{search ? 'Nenhum resultado' : 'Biblioteca vazia'}</div>
          <div className="empty-text">
            {search ? `Nada encontrado para "${search}"` : 'Sua biblioteca está vazia. Crie um livro com IA!'}
          </div>
          {!search && (
            <Link href="/generate" className="btn btn-primary btn-lg">✨ Criar Livro</Link>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="book-grid">
          {sorted.map(book => (
            <div key={book.id} style={{ position: 'relative' }}>
              <BookCard book={book} />
              <button
                className="btn btn-danger"
                style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 8px', fontSize: '11px', opacity: 0.8 }}
                onClick={e => { e.preventDefault(); handleDelete(book.id, book.title); }}
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sorted.map(book => (
            <div key={book.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookCard book={book} horizontal />
              <button
                className="btn btn-danger"
                style={{ padding: '8px 12px', flexShrink: 0 }}
                onClick={() => handleDelete(book.id, book.title)}
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
