interface CoverData {
  primary?: string;
  secondary?: string;
  accent?: string;
  emoji?: string;
  tagline?: string;
}

interface BookCoverProps {
  title: string;
  author?: string;
  cover?: CoverData;
  width?: number;
  className?: string;
}

export default function BookCover({ title, author, cover, width, className = '' }: BookCoverProps) {
  const primary = cover?.primary || '#1e293b';
  const secondary = cover?.secondary || '#7c3aed';
  const accent = cover?.accent || '#f1f5f9';
  const emoji = cover?.emoji || '📖';

  const style: React.CSSProperties = width ? { width } : {};

  return (
    <div className={`book-cover ${className}`} style={{ ...style, background: primary }}>
      <div className="book-cover-overlay" style={{ background: secondary }} />
      <div className="book-cover-border" />
      <div className="book-cover-top">{emoji}</div>
      <div className="book-cover-bottom" style={{ background: `${primary}cc` }}>
        <div className="book-cover-title" style={{ color: accent }} title={title}>
          {title.length > 30 ? title.substring(0, 28) + '…' : title}
        </div>
        {author && (
          <div className="book-cover-author" style={{ color: accent }}>
            {author}
          </div>
        )}
      </div>
    </div>
  );
}
