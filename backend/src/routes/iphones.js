import { Router } from 'express';
import { query } from '../db.js';
import { httpError } from '../middleware/errorHandler.js';

// CRUD for the iPhone catalogue shown on /admin/iphones
const router = Router();

const STATUSES = ['available', 'preorder', 'coming_soon', 'discontinued'];

const COLUMNS = `id, slug, name, tagline, chip, display_inches, storage_options, colors, price_from,
  stock, status, DATE_FORMAT(release_date, '%Y-%m-%d') AS release_date, image_url, product_url,
  sort_order, created_at, updated_at`;

const slugify = (s) =>
  String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64);

const emptyToNull = (v) => (v === '' || v === undefined ? null : v);

const toRow = (r) => ({
  ...r,
  display_inches: r.display_inches === null ? null : Number(r.display_inches),
  price_from: Number(r.price_from),
});

const findById = async (id) => {
  const [row] = await query(`SELECT ${COLUMNS} FROM iphones WHERE id = ?`, [id]);
  if (!row) throw httpError(404, 'iPhone not found');
  return toRow(row);
};

/** Validate + normalise a request body. `partial` allows omitting fields (PUT). */
function parse(body, { partial = false } = {}) {
  const b = body || {};
  const out = {};
  const has = (k) => b[k] !== undefined;

  if (has('name') || !partial) {
    const name = String(b.name ?? '').trim();
    if (!name) throw httpError(400, 'Tên iPhone là bắt buộc');
    out.name = name.slice(0, 128);
  }
  if (has('slug') || !partial) {
    const slug = slugify(b.slug || out.name || '');
    if (!slug && !partial) throw httpError(400, 'Slug không hợp lệ');
    if (slug) out.slug = slug;
  }
  for (const k of ['tagline', 'chip', 'image_url', 'product_url']) {
    if (has(k)) out[k] = emptyToNull(typeof b[k] === 'string' ? b[k].trim() : b[k]);
  }
  if (has('display_inches')) {
    const v = emptyToNull(b.display_inches);
    if (v !== null && !(Number(v) > 0 && Number(v) < 100)) throw httpError(400, 'Kích thước màn hình không hợp lệ');
    out.display_inches = v === null ? null : Number(v);
  }
  if (has('price_from') || !partial) {
    const v = Number(b.price_from);
    if (!Number.isFinite(v) || v < 0) throw httpError(400, 'Giá phải là số ≥ 0');
    out.price_from = v;
  }
  if (has('stock')) {
    const v = Number(b.stock);
    if (!Number.isInteger(v) || v < 0) throw httpError(400, 'Tồn kho phải là số nguyên ≥ 0');
    out.stock = v;
  }
  if (has('sort_order')) {
    const v = Number(b.sort_order);
    if (!Number.isInteger(v)) throw httpError(400, 'Thứ tự phải là số nguyên');
    out.sort_order = v;
  }
  if (has('status')) {
    if (!STATUSES.includes(b.status)) throw httpError(400, `Trạng thái phải là: ${STATUSES.join(', ')}`);
    out.status = b.status;
  }
  if (has('release_date')) {
    const v = emptyToNull(b.release_date);
    if (v !== null && !/^\d{4}-\d{2}-\d{2}$/.test(v)) throw httpError(400, 'Ngày phát hành phải có dạng YYYY-MM-DD');
    out.release_date = v;
  }
  if (has('storage_options') || !partial) {
    const list = Array.isArray(b.storage_options) ? b.storage_options : [];
    out.storage_options = JSON.stringify([...new Set(list.map((s) => String(s).trim()).filter(Boolean))]);
  }
  if (has('colors') || !partial) {
    const list = Array.isArray(b.colors) ? b.colors : [];
    const colors = list
      .map((c) => ({ name: String(c?.name ?? '').trim(), hex: String(c?.hex ?? '').trim() }))
      .filter((c) => c.name);
    if (colors.some((c) => !/^#[0-9a-f]{6}$/i.test(c.hex))) throw httpError(400, 'Mã màu phải có dạng #rrggbb');
    out.colors = JSON.stringify(colors);
  }
  return out;
}

const save = async (sql, params) => {
  try {
    return await query(sql, params);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw httpError(409, 'Slug này đã tồn tại');
    throw err;
  }
};

router.get('/', async (req, res) => {
  const where = [];
  const params = [];
  const q = String(req.query.q || '').trim();
  if (q) {
    where.push('(name LIKE ? OR chip LIKE ? OR tagline LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (STATUSES.includes(req.query.status)) {
    where.push('status = ?');
    params.push(req.query.status);
  }
  const rows = await query(
    `SELECT ${COLUMNS} FROM iphones ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY sort_order, release_date DESC, id`,
    params
  );
  res.json(rows.map(toRow));
});

router.get('/:id', async (req, res) => {
  res.json(await findById(req.params.id));
});

router.post('/', async (req, res) => {
  const data = parse(req.body);
  const result = await save('INSERT INTO iphones SET ?', [data]);
  res.status(201).json(await findById(result.insertId));
});

router.put('/:id', async (req, res) => {
  const data = parse(req.body, { partial: true });
  if (!Object.keys(data).length) throw httpError(400, 'Không có trường nào để cập nhật');
  const result = await save('UPDATE iphones SET ? WHERE id = ?', [data, req.params.id]);
  if (!result.affectedRows) throw httpError(404, 'iPhone not found');
  res.json(await findById(req.params.id));
});

router.delete('/:id', async (req, res) => {
  const result = await query('DELETE FROM iphones WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) throw httpError(404, 'iPhone not found');
  res.status(204).end();
});

export default router;
