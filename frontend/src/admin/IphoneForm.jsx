import { useEffect, useRef, useState } from 'react';
import { STATUS_LABELS, STORAGE_PRESETS } from './format.js';

const EMPTY = {
  name: '', slug: '', tagline: '', chip: '', display_inches: '', price_from: '', stock: 0,
  status: 'available', release_date: '', image_url: '', product_url: '', sort_order: 0,
  storage_options: [], colors: [],
};

const toForm = (row) => {
  const f = { ...EMPTY };
  for (const k of Object.keys(EMPTY)) if (row[k] !== undefined && row[k] !== null) f[k] = row[k];
  return f;
};

export default function IphoneForm({ initial, onSave, onClose }) {
  const isNew = !initial.id;
  const [form, setForm] = useState(() => toForm(initial));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    const d = dialogRef.current;
    d.showModal();
    return () => d.close();
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleStorage = (s) => setForm((f) => ({
    ...f,
    storage_options: f.storage_options.includes(s)
      ? f.storage_options.filter((x) => x !== s)
      : STORAGE_PRESETS.filter((p) => p === s || f.storage_options.includes(p)),
  }));

  const setColor = (i, key, value) => setForm((f) => ({
    ...f,
    colors: f.colors.map((c, j) => (j === i ? { ...c, [key]: value } : c)),
  }));
  const addColor = () => setForm((f) => ({ ...f, colors: [...f.colors, { name: '', hex: '#d2d2d7' }] }));
  const removeColor = (i) => setForm((f) => ({ ...f, colors: f.colors.filter((_, j) => j !== i) }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({
        ...form,
        stock: Number(form.stock) || 0,
        sort_order: Number(form.sort_order) || 0,
        colors: form.colors.filter((c) => c.name.trim()),
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="admin-dialog"
      aria-labelledby="iphone-form-title"
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === dialogRef.current) onClose(); }}
    >
      <form onSubmit={submit}>
        <header className="dialog-head">
          <h2 id="iphone-form-title">{isNew ? 'Thêm iPhone' : `Sửa ${initial.name}`}</h2>
          <button type="button" className="dialog-close" onClick={onClose} aria-label="Đóng">×</button>
        </header>

        <div className="dialog-body">
          <fieldset>
            <legend>Thông tin chung</legend>
            <div className="grid-2">
              <Field label="Tên *">
                <input required maxLength={128} value={form.name} onChange={set('name')} placeholder="iPhone 18 Pro" autoFocus />
              </Field>
              <Field label="Slug" hint="Để trống để tự tạo từ tên">
                <input maxLength={64} value={form.slug} onChange={set('slug')} placeholder="iphone-18-pro" />
              </Field>
            </div>
            <Field label="Tagline">
              <input maxLength={255} value={form.tagline} onChange={set('tagline')} placeholder="Pro further." />
            </Field>
            <div className="grid-3">
              <Field label="Chip">
                <input maxLength={64} value={form.chip} onChange={set('chip')} placeholder="A20 Pro" />
              </Field>
              <Field label="Màn hình (inch)">
                <input type="number" step="0.1" min="1" max="99" value={form.display_inches} onChange={set('display_inches')} />
              </Field>
              <Field label="Ngày phát hành">
                <input type="date" value={form.release_date} onChange={set('release_date')} />
              </Field>
            </div>
          </fieldset>

          <fieldset>
            <legend>Bán hàng</legend>
            <div className="grid-3">
              <Field label="Giá từ (USD) *">
                <input type="number" required min="0" step="0.01" value={form.price_from} onChange={set('price_from')} placeholder="999" />
              </Field>
              <Field label="Tồn kho">
                <input type="number" min="0" step="1" value={form.stock} onChange={set('stock')} />
              </Field>
              <Field label="Trạng thái">
                <select value={form.status} onChange={set('status')}>
                  {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
            </div>
            <div className="field">
              <span className="field-label">Dung lượng</span>
              <div className="toggle-group">
                {STORAGE_PRESETS.map((s) => (
                  <label key={s} className={`toggle${form.storage_options.includes(s) ? ' is-on' : ''}`}>
                    <input type="checkbox" checked={form.storage_options.includes(s)} onChange={() => toggleStorage(s)} />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Màu sắc</legend>
            {form.colors.map((c, i) => (
              <div className="color-row" key={i}>
                <input type="color" value={c.hex} onChange={(e) => setColor(i, 'hex', e.target.value)} aria-label="Mã màu" />
                <input value={c.name} onChange={(e) => setColor(i, 'name', e.target.value)} placeholder="Tên màu (vd. Deep Blue)" aria-label="Tên màu" />
                <code>{c.hex}</code>
                <button type="button" className="link-btn danger" onClick={() => removeColor(i)}>Bỏ</button>
              </div>
            ))}
            <button type="button" className="link-btn" onClick={addColor}>+ Thêm màu</button>
          </fieldset>

          <fieldset>
            <legend>Hình ảnh & liên kết</legend>
            <Field label="URL ảnh">
              <input type="url" value={form.image_url} onChange={set('image_url')} placeholder="https://…" />
            </Field>
            {form.image_url && <img className="image-preview" src={form.image_url} alt="Xem trước" />}
            <div className="grid-2">
              <Field label="URL trang sản phẩm">
                <input type="url" value={form.product_url} onChange={set('product_url')} placeholder="https://www.apple.com/…" />
              </Field>
              <Field label="Thứ tự hiển thị">
                <input type="number" step="1" value={form.sort_order} onChange={set('sort_order')} />
              </Field>
            </div>
          </fieldset>
        </div>

        <footer className="dialog-foot">
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="button" className="button button-secondary" onClick={onClose}>Hủy</button>
          <button type="submit" className="button button-primary" disabled={saving}>
            {saving ? 'Đang lưu…' : isNew ? 'Thêm' : 'Lưu thay đổi'}
          </button>
        </footer>
      </form>
    </dialog>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}
