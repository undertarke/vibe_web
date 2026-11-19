import { useEffect, useRef, useState } from 'react';
import { AppleLogo, SearchIcon, BagIcon, ChevronRight } from './Icons.jsx';
import './GlobalNav.css';

const QUICK_LINKS = [
  { label: 'Find a Store', url: 'https://www.apple.com/retail/' },
  { label: 'Apple Vision Pro', url: 'https://www.apple.com/apple-vision-pro/' },
  { label: 'AirPods', url: 'https://www.apple.com/airpods/' },
  { label: 'Apple Intelligence', url: 'https://www.apple.com/apple-intelligence/' },
  { label: 'Apple Trade In', url: 'https://www.apple.com/us/shop/goto/trade_in' },
];

function Flyout({ item }) {
  return (
    <div className="flyout-inner">
      {item.flyout.map((group) => (
        <div key={group.title} className={`flyout-group ${group.primary ? 'is-primary' : ''}`}>
          <h2 className="flyout-title">{group.title}</h2>
          <ul>
            {group.links.map((l) => (
              <li key={l.label}><a href={l.url}>{l.label}</a></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function GlobalNav({ items }) {
  const [openId, setOpenId] = useState(null);       // desktop flyout
  const [panel, setPanel] = useState(null);         // 'search' | 'bag' | null
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileItem, setMobileItem] = useState(null);
  const closeTimer = useRef();

  const active = items.find((i) => i.id === openId);
  const expanded = Boolean(active?.flyout.length) || panel !== null;

  const open = (id) => { clearTimeout(closeTimer.current); setPanel(null); setOpenId(id); };
  const scheduleClose = () => { closeTimer.current = setTimeout(() => setOpenId(null), 150); };
  const closeAll = () => { setOpenId(null); setPanel(null); };

  // Esc closes everything; lock scroll while the mobile menu is open
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && (closeAll(), setMobileOpen(false), setMobileItem(null));
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
  }, [mobileOpen]);

  const toggleMobile = () => {
    setMobileOpen((v) => !v);
    setMobileItem(null);
  };

  const togglePanel = (name) => { setOpenId(null); setPanel((p) => (p === name ? null : name)); };

  return (
    <>
      <div className={`nav-curtain ${expanded ? 'is-visible' : ''}`} onClick={closeAll} />
      <header className={`globalnav ${expanded ? 'is-expanded' : ''} ${mobileOpen ? 'is-mobile-open' : ''}`}>
        <nav className="globalnav-content" aria-label="Global" onMouseLeave={scheduleClose}>
          <ul className="globalnav-list">
            <li className="globalnav-item globalnav-apple">
              <a href="/" aria-label="Apple"><AppleLogo /></a>
            </li>
            {items.map((item) => (
              <li
                key={item.id}
                className={`globalnav-item globalnav-menu ${openId === item.id ? 'is-active' : ''}`}
                onMouseEnter={() => open(item.id)}
              >
                <a href={item.url} onFocus={() => open(item.id)}>{item.label}</a>
              </li>
            ))}
            <li className="globalnav-item globalnav-icon">
              <button aria-label="Search apple.com" onClick={() => togglePanel('search')}><SearchIcon /></button>
            </li>
            <li className="globalnav-item globalnav-icon">
              <button aria-label="Shopping Bag" onClick={() => togglePanel('bag')}><BagIcon /></button>
            </li>
            <li className="globalnav-item globalnav-burger">
              <button
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                onClick={toggleMobile}
              >
                <span className="burger-line" /><span className="burger-line" />
              </button>
            </li>
          </ul>

          {/* Desktop flyouts */}
          <div className="flyout" onMouseEnter={() => clearTimeout(closeTimer.current)}>
            {active && active.flyout.length > 0 && <Flyout key={active.id} item={active} />}
            {panel === 'search' && (
              <div className="flyout-inner flyout-search">
                <form action="https://www.apple.com/us/search" method="get" className="search-form">
                  <SearchIcon className="search-icon" />
                  <input name="q" placeholder="Search apple.com" autoFocus aria-label="Search apple.com" />
                </form>
                <div className="flyout-group">
                  <h2 className="flyout-title">Quick Links</h2>
                  <ul className="quick-links">
                    {QUICK_LINKS.map((l) => (
                      <li key={l.label}><a href={l.url}>→ {l.label}</a></li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {panel === 'bag' && (
              <div className="flyout-inner flyout-bag">
                <h2 className="bag-title">Your Bag is empty.</h2>
                <p className="bag-text">
                  <a href="https://www.apple.com/us/shop/signIn">Sign in</a> to see if you have any saved items
                </p>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile full-screen menu */}
        <div className="mobile-menu" aria-hidden={!mobileOpen}>
          {mobileItem ? (
            <div className="mobile-sub">
              <button className="mobile-back" onClick={() => setMobileItem(null)}>‹ Back</button>
              <Flyout item={mobileItem} />
            </div>
          ) : (
            <ul className="mobile-list">
              {items.map((item) => (
                <li key={item.id}>
                  {item.flyout.length ? (
                    <button onClick={() => setMobileItem(item)}>
                      {item.label} <ChevronRight />
                    </button>
                  ) : (
                    <a href={item.url}>{item.label}</a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>
    </>
  );
}
