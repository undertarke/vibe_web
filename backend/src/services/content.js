import { query } from '../db.js';

export async function getNav() {
  const items = await query('SELECT id, label, url FROM nav_items ORDER BY sort_order, id');
  const links = await query(
    `SELECT nav_item_id, group_title, label, url, is_primary
       FROM nav_flyout_links ORDER BY nav_item_id, id`
  );
  return items.map((item) => {
    const groups = [];
    for (const l of links.filter((x) => x.nav_item_id === item.id)) {
      let g = groups.find((x) => x.title === l.group_title);
      if (!g) groups.push((g = { title: l.group_title, primary: !!l.is_primary, links: [] }));
      g.links.push({ label: l.label, url: l.url });
    }
    return { ...item, flyout: groups };
  });
}

export function getSections({ includeInactive = false } = {}) {
  return query(
    `SELECT * FROM sections ${includeInactive ? '' : 'WHERE is_active = 1'} ORDER BY sort_order, id`
  );
}

export async function getCarousel() {
  const rows = await query('SELECT * FROM carousel_items ORDER BY group_name, sort_order, id');
  return {
    title: 'Endless entertainment.',
    tv: rows.filter((r) => r.group_name === 'tv'),
    shelf: rows.filter((r) => r.group_name === 'shelf'),
  };
}

export async function getFooter() {
  const [footnotes, groups, links, legal] = await Promise.all([
    query('SELECT number, content, link_label, link_url FROM footnotes ORDER BY sort_order, id'),
    query('SELECT id, title, column_index FROM footer_groups ORDER BY column_index, sort_order, id'),
    query('SELECT group_id, label, url FROM footer_links ORDER BY group_id, sort_order, id'),
    query('SELECT label, url FROM legal_links ORDER BY sort_order, id'),
  ]);
  const columns = [];
  for (const g of groups) {
    const col = (columns[g.column_index - 1] ||= []);
    col.push({ title: g.title, links: links.filter((l) => l.group_id === g.id).map(({ label, url }) => ({ label, url })) });
  }
  return {
    footnotes,
    columns: columns.filter(Boolean),
    legal,
    copyright: `Copyright © ${new Date().getFullYear()} Apple Inc. All rights reserved.`,
    moreWaysToShop: {
      text: 'More ways to shop:',
      storeUrl: 'https://www.apple.com/retail/',
      retailerUrl: 'https://locate.apple.com/',
      phone: '1-800-MY-APPLE (1-800-692-7753)',
    },
    locale: 'United States',
  };
}
