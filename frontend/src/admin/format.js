export const STATUS_LABELS = {
  available: 'Đang bán',
  preorder: 'Đặt trước',
  coming_soon: 'Sắp ra mắt',
  discontinued: 'Ngừng bán',
};

export const STORAGE_PRESETS = ['128GB', '256GB', '512GB', '1TB', '2TB'];

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2, minimumFractionDigits: 0 });
export const formatPrice = (n) => usd.format(n);

export const formatDate = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};
