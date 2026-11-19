import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { useHomeData } from '../hooks/useHomeData.js';
import GlobalNav from '../components/GlobalNav.jsx';
import Footer from '../components/Footer.jsx';
import { formatPrice } from '../admin/format.js';
import './IphoneLineup.css';

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'available', label: 'Đang bán' },
  { key: 'preorder', label: 'Đặt trước' },
  { key: 'coming_soon', label: 'Sắp ra mắt' },
];

const SORTS = {
  featured: { label: 'Nổi bật', fn: (a, b) => a.sort_order - b.sort_order },
  newest: { label: 'Mới nhất', fn: (a, b) => (b.release_date || '').localeCompare(a.release_date || '') },
  priceAsc: { label: 'Giá: thấp → cao', fn: (a, b) => a.price_from - b.price_from },
  priceDesc: { label: 'Giá: cao → thấp', fn: (a, b) => b.price_from - a.price_from },
};

const NEW_DAYS = 120;
const isNew = (iso) => iso && (Date.now() - new Date(iso)) / 864e5 <= NEW_DAYS && new Date(iso) <= new Date();

const storageRange = (list) =>
  !list.length ? '—' : list.length === 1 ? list[0] : `${list[0]} – ${list[list.length - 1]}`;

export default function IphoneLineup() {
  const home = useHomeData(); // nav + footer, shared with the homepage
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('featured');

  useEffect(() => { document.title = 'iPhone - Apple'; }, []);

  const fetchList = () =>
    api('/iphones')
      // discontinued models never reach the public page
      .then((rows) => setItems(rows.filter((r) => r.status !== 'discontinued')))
      .catch(setError);
  useEffect(() => { fetchList(); }, []);
  const retry = () => { setError(null); fetchList(); };

  const present = useMemo(() => new Set(items?.map((i) => i.status)), [items]);
  const visible = useMemo(
    () => (items || []).filter((i) => filter === 'all' || i.status === filter).sort(SORTS[sort].fn),
    [items, filter, sort]
  );

  return (
    <>
      <GlobalNav items={home.data?.nav ?? []} />
      <main className="lineup">
        <header className="lineup-hero">
          <h1>iPhone</h1>
          <p>Chọn mẫu iPhone dành cho bạn.</p>
        </header>

        {error ? (
          <div className="page-status">
            <p>Không tải được danh sách iPhone: {error.message}</p>
            <button className="button button-primary" onClick={retry}>Thử lại</button>
          </div>
        ) : !items ? (
          <div className="page-status" aria-busy="true"><span className="spinner" /></div>
        ) : (
          <>
            <div className="lineup-controls">
              <div className="lineup-filters" role="group" aria-label="Lọc theo trạng thái">
                {FILTERS.filter((f) => f.key === 'all' || present.has(f.key)).map((f) => (
                  <button
                    key={f.key}
                    className={`pill${filter === f.key ? ' is-active' : ''}`}
                    aria-pressed={filter === f.key}
                    onClick={() => setFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <label className="lineup-sort">
                <span>Sắp xếp</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  {Object.entries(SORTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
                </select>
              </label>
            </div>

            {visible.length ? (
              <ul className="lineup-grid">
                {visible.map((item) => <ProductCard key={item.id} item={item} />)}
              </ul>
            ) : (
              <p className="lineup-empty">Hiện chưa có mẫu iPhone nào trong mục này.</p>
            )}

            {items.length > 1 && <CompareTable items={[...items].sort(SORTS.featured.fn)} />}
          </>
        )}
      </main>
      {home.data && <Footer {...home.data.footer} />}
    </>
  );
}

function ProductCard({ item }) {
  const [colorIdx, setColorIdx] = useState(0);
  const color = item.colors[colorIdx];
  const soldOut = item.status === 'available' && item.stock === 0;

  const eyebrow =
    item.status === 'coming_soon' ? 'Sắp ra mắt'
    : item.status === 'preorder' ? 'Đặt trước ngay'
    : soldOut ? 'Tạm hết hàng'
    : isNew(item.release_date) ? 'Mới'
    : null;

  const cta =
    item.status === 'coming_soon' ? null
    : item.status === 'preorder' ? 'Đặt trước'
    : soldOut ? null
    : 'Mua';

  return (
    <li className="card">
      <PhoneArt name={item.name} hex={color?.hex} />

      {item.colors.length > 0 && (
        <div className="card-colors">
          <div className="card-swatches" role="radiogroup" aria-label={`Màu ${item.name}`}>
            {item.colors.map((c, i) => (
              <button
                key={c.name}
                role="radio"
                aria-checked={i === colorIdx}
                aria-label={c.name}
                title={c.name}
                className={`card-swatch${i === colorIdx ? ' is-active' : ''}`}
                style={{ '--swatch': c.hex }}
                onClick={() => setColorIdx(i)}
              />
            ))}
          </div>
          <span className="card-color-name">{color?.name}</span>
        </div>
      )}

      {eyebrow && <p className={`card-eyebrow${soldOut ? ' is-muted' : ''}`}>{eyebrow}</p>}
      <h2 className="card-name">{item.name}</h2>
      {item.tagline && <p className="card-tagline">{item.tagline}</p>}
      <p className="card-price">
        {item.status === 'coming_soon' ? 'Giá dự kiến từ ' : 'Từ '}{formatPrice(item.price_from)}
      </p>

      <div className="card-ctas">
        {cta && item.product_url && (
          <a className="button button-primary" href={item.product_url}>{cta}</a>
        )}
        {item.product_url && (
          <a className="card-link" href={item.product_url}>Tìm hiểu thêm <span aria-hidden="true">›</span></a>
        )}
      </div>

      <dl className="card-specs">
        <div><dt>Chip</dt><dd>{item.chip || '—'}</dd></div>
        <div><dt>Màn hình</dt><dd>{item.display_inches ? `${item.display_inches} inch` : '—'}</dd></div>
        <div><dt>Dung lượng</dt><dd>{storageRange(item.storage_options)}</dd></div>
      </dl>
    </li>
  );
}

/** Simple CSS render of the phone, tinted with the selected colour. */
function PhoneArt({ name, hex = '#d2d2d7' }) {
  const fold = /duo|fold|flip/i.test(name);
  return (
    <div className="card-art" aria-hidden="true">
      <div className={`phone${fold ? ' phone-fold' : ''}`} style={{ '--tint': hex }}>
        {fold && <span className="phone-panel" />}
        <span className="phone-panel">
          <span className="phone-camera" />
        </span>
      </div>
    </div>
  );
}

function CompareTable({ items }) {
  const rows = [
    ['Giá từ', (i) => formatPrice(i.price_from)],
    ['Chip', (i) => i.chip || '—'],
    ['Màn hình', (i) => (i.display_inches ? `${i.display_inches} inch` : '—')],
    ['Dung lượng', (i) => i.storage_options.join(', ') || '—'],
    ['Màu sắc', (i) => i.colors.length ? (
      <span className="compare-swatches">
        {i.colors.map((c) => <span key={c.name} style={{ background: c.hex }} title={c.name} />)}
      </span>
    ) : '—'],
  ];
  return (
    <section className="compare" aria-labelledby="compare-title">
      <h2 id="compare-title">So sánh các mẫu iPhone</h2>
      <div className="compare-scroll" tabIndex={0}>
        <table>
          <thead>
            <tr>
              <th scope="col"><span className="visually-hidden">Thông số</span></th>
              {items.map((i) => <th key={i.id} scope="col">{i.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, get]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {items.map((i) => <td key={i.id}>{get(i)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
