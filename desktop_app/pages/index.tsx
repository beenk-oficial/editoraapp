import { useEffect, useState } from 'react';
import Link from 'next/link';
import BookCard from '../components/BookCard';
import BookCover from '../components/BookCover';

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
  reviews?: Array<{ rating: number }>;
}

const GENRES = ['Todos', 'Ficção Científica', 'Fantasia', 'Romance', 'Thriller', 'Mistério', 'Autoajuda', 'Aventura'];

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('Todos');

  useEffect(() => {
    fetch(`${API}/books?status=complete`)
      .then(r => r.json())
      .then(d => { setBooks(d.books || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = selectedGenre === 'Todos' ? books : books.filter(b => b.genre === selectedGenre);
  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Editora AI</h1>
        <p className="page-subtitle">Plataforma de livros gerados por inteligência artificial</p>
      </div>

      {/* Genre filter */}
      <div className="chip-group" style={{ marginBottom: '32px' }}>
        {GENRES.map(g => (
          <button
            key={g}
            className={`chip${selectedGenre === g ? ' active' : ''}`}
            onClick={() => setSelectedGenre(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
          <span>Carregando livros...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✨</div>
          <div className="empty-title">Nenhum livro ainda</div>
          <div className="empty-text">
            Crie seu primeiro livro com IA! Os agentes vão escrever capa, prefácio e capítulos completos.
          </div>
          <Link href="/generate" className="btn btn-primary btn-lg">
            ✨ Criar Primeiro Livro
          </Link>
        </div>
      ) : (
        <>
          {/* Featured book */}
          {featured && (
            <div className="section">
              <h2 className="section-title">Em Destaque</h2>
              <Link href={`/books/${featured.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div
                  className="card"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '220px 1fr',
                    gap: '32px',
                    overflow: 'hidden',
                    borderColor: featured.cover?.secondary + '44',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 40px rgba(0,0,0,0.4)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
                >
                  <BookCover title={featured.title} author={featured.author} cover={featured.cover} />
                  <div style={{ padding: '8px 0' }}>
                    <span className="genre-badge" style={{ marginBottom: '14px', display: 'inline-flex' }}>{featured.genre}</span>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text)', lineHeight: 1.3, letterSpacing: '-0.4px', marginBottom: '8px' }}>
                      {featured.title}
                    </h2>
                    <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '14px' }}>por {featured.author}</p>
                    {featured.cover?.tagline && (
                      <p style={{ fontSize: '14px', color: 'var(--primary-light)', fontStyle: 'italic', marginBottom: '16px' }}>
                        "{featured.cover.tagline}"
                      </p>
                    )}
                    <p style={{ fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.7, marginBottom: '20px' }}>
                      {featured.description}
                    </p>
                    <div className="stats-row">
                      {featured.pages && <span className="stat-badge">📄 {featured.pages} pág.</span>}
                      {featured.estimatedReadingTime && <span className="stat-badge">⏱ {featured.estimatedReadingTime}</span>}
                    </div>
                    <div style={{ marginTop: '24px' }}>
                      <span className="btn btn-primary">📖 Ler Agora</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Books grid */}
          {rest.length > 0 && (
            <div className="section">
              <h2 className="section-title">Mais Livros</h2>
              <div className="book-grid">
                {rest.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
