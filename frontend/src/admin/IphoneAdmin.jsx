import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api.js';
import IphoneForm from './IphoneForm.jsx';
import { STATUS_LABELS, formatDate, formatPrice } from './format.js';
import './IphoneAdmin.css';

const LOW_STOCK = 20;

export default function IphoneAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, row = edit
  const [toast, setToast] = useState(null);
  const toastTimer = useRef();

  useEffect(() => { document.title = 'Quản lý iPhone'; }, []);

  const notify = useCallback((message, kind = 'ok') => {
    clearTimeout(toastTimer.current);
    setToast({ message, kind });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const load = useCallback(async (signal) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (status) params.set('status', status);
    try {
      const rows = await api(`/iphones?${params}`, { signal });
      setItems(rows);
      setError(null);
    } catch (err) {
      if (err.name !== 'AbortError') setError(err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [q, status]);

  // Debounce search typing; status changes go through the same path
  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(() => load(ctrl.signal), 250);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [load]);

  const stats = useMemo(() => ({
    models: items.length,
    onSale: items.filter((i) => i.status === 'available' || i.status === 'preorder').length,
    stock: items.reduce((n, i) => n + i.stock, 0),
    low: items.filter((i) => i.status !== 'discontinued' && i.stock < LOW_STOCK).length,
  }), [items]);

  const handleSave = async (data) => {
    const isNew = !editing?.id;
    const saved = await api(isNew ? '/iphones' : `/iphones/${editing.id}`, {
      method: isNew ? 'POST' : 'PUT',
      body: JSON.stringify(data),
    });
    setEditing(null);
    notify(isNew ? `Đã thêm ${saved.name}` : `Đã lưu ${saved.name}`);
    load();
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Xóa "${item.name}"? Thao tác này không thể hoàn tác.`)) return;
    try {
      await api(`/iphones/${item.id}`, { method: 'DELETE' });
      setItems((list) => list.filter((i) => i.id !== item.id));
      notify(`Đã xóa ${item.name}`);
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const filtered = q.trim() || status;

  return (
    <div className="admin">
      <header className="admin-bar">
        <div className="admin-bar-inner">
          <a href="/" className="admin-back">‹ Trang chủ</a>
          <a href="/iphone" className="admin-back">Xem trang iPhone ›</a>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-head">
          <div>
            <h1>Quản lý iPhone</h1>
            <p className="admin-sub">Danh mục các mẫu iPhone mới nhất: giá, cấu hình, màu sắc và tồn kho.</p>
          </div>
          <button className="button button-primary" onClick={() => setEditing({})}>+ Thêm iPhone</button>
        </div>

        <dl className="admin-stats">
          <div><dt>Số mẫu{filtered ? ' (đang lọc)' : ''}</dt><dd>{stats.models}</dd></div>
          <div><dt>Đang bán / đặt trước</dt><dd>{stats.onSale}</dd></div>
          <div><dt>Tổng tồn kho</dt><dd>{stats.stock.toLocaleString('vi-VN')}</dd></div>
          <div className={stats.low ? 'is-warn' : ''}><dt>Sắp hết hàng (&lt; {LOW_STOCK})</dt><dd>{stats.low}</dd></div>
        </dl>

        <div className="admin-toolbar">
          <label className="admin-search">
            <span className="visually-hidden">Tìm kiếm</span>
            <input
              type="search"
              placeholder="Tìm theo tên, chip, tagline…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <label>
            <span className="visually-hidden">Lọc trạng thái</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
        </div>

        {error ? (
          <div className="admin-empty">
            <p>Không tải được dữ liệu: {error.message}</p>
            <button className="button button-secondary" onClick={() => load()}>Thử lại</button>
          </div>
        ) : !loading && !items.length ? (
          <div className="admin-empty">
            <p>{filtered ? 'Không có iPhone nào khớp bộ lọc.' : 'Chưa có iPhone nào.'}</p>
            {!filtered && <button className="button button-primary" onClick={() => setEditing({})}>Thêm iPhone đầu tiên</button>}
          </div>
        ) : (
          <div className={`admin-table-wrap${loading ? ' is-loading' : ''}`} aria-busy={loading}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Cấu hình</th>
                  <th>Màu sắc</th>
                  <th className="num">Giá từ</th>
                  <th className="num">Tồn kho</th>
                  <th>Trạng thái</th>
                  <th><span className="visually-hidden">Thao tác</span></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="cell-product">
                      <Thumb item={item} />
                      <div>
                        <strong>{item.name}</strong>
                        {item.tagline && <span className="muted">{item.tagline}</span>}
                        <span className="muted small">Phát hành: {formatDate(item.release_date)}</span>
                      </div>
                    </td>
                    <td data-label="Cấu hình">
                      <div className="cell-stack">
                        <span>{[item.chip, item.display_inches && `${item.display_inches}″`].filter(Boolean).join(' · ') || '—'}</span>
                        <div className="chips">
                          {item.storage_options.map((s) => <span key={s} className="chip">{s}</span>)}
                        </div>
                      </div>
                    </td>
                    <td data-label="Màu sắc">
                      <div className="swatches">
                        {item.colors.length ? item.colors.map((c) => (
                          <span key={c.name} className="swatch" style={{ background: c.hex }} title={c.name} aria-label={c.name} />
                        )) : '—'}
                      </div>
                    </td>
                    <td className="num" data-label="Giá từ">{formatPrice(item.price_from)}</td>
                    <td className="num" data-label="Tồn kho">
                      <span className={item.status !== 'discontinued' && item.stock < LOW_STOCK ? 'stock-low' : ''}>
                        {item.stock.toLocaleString('vi-VN')}
                      </span>
                    </td>
                    <td data-label="Trạng thái"><span className={`badge badge-${item.status}`}>{STATUS_LABELS[item.status]}</span></td>
                    <td className="cell-actions">
                      <button className="link-btn" onClick={() => setEditing(item)}>Sửa</button>
                      <button className="link-btn danger" onClick={() => handleDelete(item)}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {editing && <IphoneForm initial={editing} onSave={handleSave} onClose={() => setEditing(null)} />}

      <div className={`admin-toast${toast ? ' is-visible' : ''}${toast?.kind === 'error' ? ' is-error' : ''}`} role="status">
        {toast?.message}
      </div>
    </div>
  );
}

function Thumb({ item }) {
  const [broken, setBroken] = useState(false);
  if (item.image_url && !broken) {
    return <img className="thumb" src={item.image_url} alt="" loading="lazy" onError={() => setBroken(true)} />;
  }
  const c = item.colors[0]?.hex || '#d2d2d7';
  return (
    <span className="thumb thumb-placeholder" aria-hidden="true">
      <span className="thumb-phone" style={{ background: c }} />
    </span>
  );
}
