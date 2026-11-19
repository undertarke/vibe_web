import { useState } from 'react';
import './Section.css';

/** Heading: product wordmark image if available, otherwise text. */
function Heading({ section, Tag }) {
  const [logoFailed, setLogoFailed] = useState(false);
  if (section.logo_url && !logoFailed) {
    return (
      <Tag className="unit-headline unit-headline-logo">
        <img src={section.logo_url} alt={section.headline} onError={() => setLogoFailed(true)} />
      </Tag>
    );
  }
  return <Tag className="unit-headline">{section.headline}</Tag>;
}

function Cta({ label, url, variant }) {
  if (!label || !url) return null;
  return (
    <a className={`button button-${variant}`} href={url}>
      {label}
      <span className="visually-hidden">, {url.includes('buy') ? 'Buy' : 'Learn more about'} this product</span>
    </a>
  );
}

export default function Section({ section, priority = false }) {
  const [imgFailed, setImgFailed] = useState(false);
  const isHero = section.type === 'hero';
  const Tag = isHero ? 'h2' : 'h3';

  return (
    <section
      className={`unit unit-${section.type} theme-${section.theme} image-${section.image_position || 'overlay'}`}
      aria-label={section.headline}
      data-slug={section.slug}
    >
      {section.image_url && !imgFailed && (
        <img
          className="unit-image"
          src={section.image_url}
          alt={section.image_alt || ''}
          loading={priority ? 'eager' : 'lazy'}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
        />
      )}
      {section.theme === 'gradient' && <div className="unit-gradient" aria-hidden="true" />}

      <div className="unit-copy">
        <Heading section={section} Tag={Tag} />
        {section.subheadline && (
          <p className="unit-subhead">
            {section.subheadline}
            {section.footnote_ref && (
              <sup className="footnote-ref">
                <a href={`#footnote-${section.footnote_ref}`} aria-label={`Footnote ${section.footnote_ref}`}>
                  {section.footnote_ref}
                </a>
              </sup>
            )}
          </p>
        )}
        <div className="unit-ctas">
          <Cta label={section.primary_cta_label} url={section.primary_cta_url} variant="primary" />
          <Cta label={section.secondary_cta_label} url={section.secondary_cta_url} variant="secondary" />
        </div>
      </div>
    </section>
  );
}
