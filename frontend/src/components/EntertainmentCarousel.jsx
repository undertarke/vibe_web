import { useCallback, useEffect, useRef, useState } from 'react';
import { PlayIcon, PauseIcon, ChevronRight } from './Icons.jsx';
import './EntertainmentCarousel.css';

const INTERVAL = 5000;
const SERVICE_LABEL = { music: 'Apple Music', fitness: 'Apple Fitness+', arcade: 'Apple Arcade', tv: 'Apple TV' };
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function TvCarousel({ items }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const [hovered, setHovered] = useState(false);
  const dragStart = useRef(null);
  const count = items.length;

  const go = useCallback((i) => setIndex(((i % count) + count) % count), [count]);

  // Auto-advance (paused on hover / when the user pressed pause / when tab hidden)
  useEffect(() => {
    if (!playing || hovered || count < 2) return;
    const t = setTimeout(() => { if (!document.hidden) go(index + 1); }, INTERVAL);
    return () => clearTimeout(t);
  }, [index, playing, hovered, count, go]);

  const onPointerDown = (e) => { dragStart.current = e.clientX; };
  const onPointerUp = (e) => {
    if (dragStart.current == null) return;
    const dx = e.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
  };

  return (
    <div
      className="tv-carousel"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(index + 1);
        if (e.key === 'ArrowLeft') go(index - 1);
      }}
      aria-roledescription="carousel"
    >
      <div className="tv-viewport" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        <ul className="tv-track" style={{ '--index': index }}>
          {items.map((item, i) => {
            const active = i === index;
            return (
              <li
                key={item.id}
                className={`tv-slide ${active ? 'is-active' : ''}`}
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}: ${item.title}`}
                aria-hidden={!active}
                onClick={() => !active && go(i)}
              >
                <img src={item.image_url} alt={item.title} loading={i < 2 ? 'eager' : 'lazy'} draggable="false" />
                <div className="tv-caption">
                  <a className="button button-light" href={item.link_url} tabIndex={active ? 0 : -1}>
                    {item.cta_label}
                    <span className="visually-hidden">: {item.title}</span>
                  </a>
                  <p className="tv-text">
                    {item.genre && <span className="tv-genre">{item.genre} · </span>}
                    {item.tagline}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="tv-controls">
        <div className="tv-dots" role="tablist" aria-label="Choose slide">
          {items.map((item, i) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={i === index}
              aria-label={item.title}
              className={`tv-dot ${i === index ? 'is-active' : ''} ${playing && !hovered && i === index ? 'is-running' : ''}`}
              style={{ '--duration': `${INTERVAL}ms` }}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <button
          className="tv-play"
          aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>
    </div>
  );
}

function Shelf({ items }) {
  const ref = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update]);

  const scroll = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' });

  return (
    <div className="shelf">
      <ul className="shelf-track" ref={ref} onScroll={update}>
        {items.map((item) => (
          <li key={item.id} className="shelf-card">
            <a href={item.link_url}>
              <div className="shelf-media">
                <img src={item.image_url} alt="" loading="lazy" />
              </div>
              <p className="shelf-service">{SERVICE_LABEL[item.service] || item.service}</p>
              <p className="shelf-title">{item.title}</p>
              <span className="shelf-cta">{item.cta_label} <ChevronRight width="7" height="12" /></span>
            </a>
          </li>
        ))}
      </ul>
      <div className="shelf-arrows">
        <button aria-label="Previous" disabled={edges.start} onClick={() => scroll(-1)}>
          <ChevronRight style={{ transform: 'rotate(180deg)' }} />
        </button>
        <button aria-label="Next" disabled={edges.end} onClick={() => scroll(1)}>
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}

export default function EntertainmentCarousel({ title, tv = [], shelf = [] }) {
  if (!tv.length && !shelf.length) return null;
  return (
    <section className="entertainment" aria-labelledby="entertainment-title">
      <h2 id="entertainment-title" className="entertainment-title">{title}</h2>
      {tv.length > 0 && <TvCarousel items={tv} />}
      {shelf.length > 0 && <Shelf items={shelf} />}
    </section>
  );
}
