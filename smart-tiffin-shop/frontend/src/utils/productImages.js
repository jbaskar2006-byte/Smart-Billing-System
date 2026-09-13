export const getFoodImage = (name = '') => {
  if (!name) return null;
  const lower = name.toLowerCase();
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;

  if (lower.includes('pongal')) return `${cleanBase}images/pongal.png`;
  if (lower.includes('vadai') || lower.includes('vada')) return `${cleanBase}images/vadai.png`;
  if (lower.includes('idli')) return `${cleanBase}images/idli.png`;
  if (lower.includes('omelette') || lower.includes('omlete')) return `${cleanBase}images/omelette.png`;
  if (lower.includes('half boil') || lower.includes('halfboil') || lower.includes('boil')) return `${cleanBase}images/halfboil.png`;
  if (lower.includes('poori') || lower.includes('puri')) return `${cleanBase}images/poori.png`;
  if (lower.includes('chapati') || lower.includes('parotta') || lower.includes('dosa')) return `${cleanBase}images/chapati.png`;
  return null;
};
