import { Router } from 'express';
import { getNav, getSections, getCarousel, getFooter } from '../services/content.js';

const router = Router();

// Everything the homepage needs in a single request
router.get('/home', async (req, res) => {
  const [nav, sections, carousel, footer] = await Promise.all([
    getNav(), getSections(), getCarousel(), getFooter(),
  ]);
  res.json({
    nav,
    heroes: sections.filter((s) => s.type === 'hero'),
    promos: sections.filter((s) => s.type === 'promo'),
    carousel,
    footer,
  });
});

router.get('/nav', async (req, res) => res.json(await getNav()));
router.get('/carousel', async (req, res) => res.json(await getCarousel()));
router.get('/footer', async (req, res) => res.json(await getFooter()));

export default router;
