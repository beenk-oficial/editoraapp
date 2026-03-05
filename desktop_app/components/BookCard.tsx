import Link from 'next/link';
import BookCover from './BookCover';

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
  status?: string;
  progress?: number;
}

interface BookCardProps {
  book: Book;
  horizontal?: boolean;
}

export default function BookCard({ book, horizontal = false }: BookCardProps) {
  const avgRating = book.reviews?.length
    ? (book.reviews.reduce((a, r) => a + r.rating, 0) / book.reviews.length).toFixed(1)
    : null;

  if (horizontal) {
    return (
      <Link href={`/books/${book.id}`} className="book-card fade-in" style={{ display: 'flex', gap: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', textDecoration: 'none' }}>
        <BookCover title={book.title} author={book.author} cover={book.cover} width={80} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {book.genre && <span className="genre-badge" style={{ marginBottom: '8px', display: 'inline-flex' }}>{book.genre}</span>}
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginTop: '8px', marginBottom: '4px', lineHeight: 1.4 }} title={book.title}>
            {book.title}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{book.author}</div>
          {book.description && (
            <div style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: '10px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {book.description}
            </div>
          )}
          <div className="book-info-meta">
            {book.pages && <span>📄 {book.pages} pág.</span>}
            {book.estimatedReadingTime && <span>⏱ {book.estimatedReadingTime}</span>}
            {avgRating && <span className="rating">★ {avgRating}</span>}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/books/${book.id}`} className="book-card fade-in" style={{ textDecoration: 'none' }}>
      <BookCover title={book.title} author={book.author} cover={book.cover} />
      <div className="book-info">
        <div className="book-info-title" title={book.title}>
          {book.title.length > 40 ? book.title.substring(0, 38) + '…' : book.title}
        </div>
        <div className="book-info-author">{book.author}</div>
        <div className="book-info-meta">
          {avgRating && <span className="rating">★ {avgRating}</span>}
          {book.pages && <span>{book.pages} pág.</span>}
        </div>
      </div>
    </Link>
  );
}
