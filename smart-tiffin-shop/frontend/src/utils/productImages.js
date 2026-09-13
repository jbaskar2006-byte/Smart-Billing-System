export const getFoodImage = (name = '') => {
  if (!name) return null;
  const lower = name.toLowerCase();
  if (lower.includes('pongal')) return '/images/pongal.png';
  if (lower.includes('vadai') || lower.includes('vada')) return '/images/vadai.png';
  if (lower.includes('idli')) return '/images/idli.png';
  if (lower.includes('omelette') || lower.includes('omlete')) return '/images/omelette.png';
  if (lower.includes('half boil') || lower.includes('halfboil') || lower.includes('boil')) return '/images/halfboil.png';
  if (lower.includes('poori') || lower.includes('puri')) return '/images/poori.png';
  if (lower.includes('chapati') || lower.includes('parotta') || lower.includes('dosa')) return '/images/chapati.png';
  return null;
};
