import { useState } from 'react';
import { AppleLogo, ChevronDown } from './Icons.jsx';
import './Footer.css';

function DirectoryGroup({ group }) {
  const [open, setOpen] = useState(false);   // accordion is only used on small screens
  const id = `footer-${group.title.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <div className={`footer-group ${open ? 'is-open' : ''}`}>
      <h3 className="footer-group-title">
        <button aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
          {group.title}
          <ChevronDown className="footer-chevron" />
        </button>
      </h3>
      <div id={id} className="footer-links-wrap">
        <ul className="footer-links">
          {group.links.map((l) => (
            <li key={l.label}><a href={l.url}>{l.label}</a></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Footer({ footnotes = [], columns = [], legal = [], copyright, moreWaysToShop, locale }) {
  return (
    <footer className="footer">
      <div className="footer-content">
        <section className="footer-footnotes" aria-label="Footnotes">
          <ol className="footnotes-numbered">
            {footnotes.filter((f) => f.number).map((f) => (
              <li key={f.number} id={`footnote-${f.number}`}>
                {f.content}{' '}
                {f.link_url && <a href={f.link_url}>{f.link_label || 'Learn more'}</a>}
              </li>
            ))}
          </ol>
          {footnotes.filter((f) => !f.number).map((f, i) => (
            <p key={i}>
              {f.content}{' '}
              {f.link_url && <a href={f.link_url}>{f.link_label || 'Learn more'}</a>}
            </p>
          ))}
        </section>

        <nav className="footer-breadcrumbs" aria-label="Breadcrumbs">
          <a href="/" aria-label="Apple"><AppleLogo width="12" height="32" /></a>
        </nav>

        <nav className="footer-directory" aria-label="Apple Directory">
          {columns.map((col, i) => (
            <div key={i} className="footer-column">
              {col.map((group) => <DirectoryGroup key={group.title} group={group} />)}
            </div>
          ))}
        </nav>

        {moreWaysToShop && (
          <p className="footer-shop">
            {moreWaysToShop.text} <a href={moreWaysToShop.storeUrl}>Find an Apple Store</a> or{' '}
            <a href={moreWaysToShop.retailerUrl}>other retailer</a> near you. Or call {moreWaysToShop.phone}.
          </p>
        )}

        <div className="footer-legal">
          <p className="footer-copyright">{copyright}</p>
          <ul className="footer-legal-links">
            {legal.map((l) => (
              <li key={l.label}><a href={l.url}>{l.label}</a></li>
            ))}
          </ul>
          <a className="footer-locale" href="https://www.apple.com/choose-country-region/">{locale}</a>
        </div>
      </div>
    </footer>
  );
}
