import Link from 'next/link';
import { useRouter } from 'next/router';

const NAV_ITEMS = [
  { href: '/', icon: '🏠', label: 'Início' },
  { href: '/library', icon: '📚', label: 'Biblioteca' },
  { href: '/generate', icon: '✨', label: 'Criar Livro' },
];

export default function Navigation() {
  const router = useRouter();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-title">📖 Editora AI</div>
        <div className="sidebar-logo-sub">Powered by Claude</div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => {
          const isActive = router.pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div style={{ padding: '12px', background: 'rgba(124,58,237,0.08)', borderRadius: '10px', border: '1px solid rgba(124,58,237,0.15)' }}>
          <div style={{ fontSize: '11px', color: 'var(--primary-light)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
            Agentes Ativos
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.7' }}>
            🧠 Roteirista<br />
            🎨 Designer de Capa<br />
            ✍️ Escritor<br />
            📝 Editor
          </div>
        </div>
      </div>
    </aside>
  );
}
