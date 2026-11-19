import { Router } from 'express';
import { query } from '../db.js';
import { getSections } from '../services/content.js';
import { httpError } from '../middleware/errorHandler.js';

// CRUD for homepage sections (heroes + promo tiles)
const router = Router();

const FIELDS = [
  'slug', 'type', 'theme', 'logo_url', 'headline', 'subheadline', 'footnote_ref',
  'image_url', 'image_alt', 'image_position', 'primary_cta_label', 'primary_cta_url',
  'secondary_cta_label', 'secondary_cta_url', 'sort_order', 'is_active',
];

const pick = (body) =>
  Object.fromEntries(FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

router.get('/', async (req, res) => {
  res.json(await getSections({ includeInactive: req.query.all === '1' }));
});

router.get('/:id', async (req, res) => {
  const [row] = await query('SELECT * FROM sections WHERE id = ? OR slug = ?', [req.params.id, req.params.id]);
  if (!row) throw httpError(404, 'Section not found');
  res.json(row);
});

router.post('/', async (req, res) => {
  const data = pick(req.body || {});
  if (!data.slug || !data.type || !data.headline) {
    throw httpError(400, 'slug, type and headline are required');
  }
  const result = await query('INSERT INTO sections SET ?', [data]);
  const [row] = await query('SELECT * FROM sections WHERE id = ?', [result.insertId]);
  res.status(201).json(row);
});

router.put('/:id', async (req, res) => {
  const data = pick(req.body || {});
  if (!Object.keys(data).length) throw httpError(400, 'No updatable fields provided');
  const result = await query('UPDATE sections SET ? WHERE id = ?', [data, req.params.id]);
  if (!result.affectedRows) throw httpError(404, 'Section not found');
  const [row] = await query('SELECT * FROM sections WHERE id = ?', [req.params.id]);
  res.json(row);
});

router.delete('/:id', async (req, res) => {
  const result = await query('DELETE FROM sections WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) throw httpError(404, 'Section not found');
  res.status(204).end();
});

export default router;
