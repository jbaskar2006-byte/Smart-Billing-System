export const getFoodImage = (name = '') => {
  if (!name) return null;
  const lower = name.toLowerCase();

  if (lower.includes('pongal')) return './images/pongal.png';
  if (lower.includes('vadai') || lower.includes('vada')) return './images/vadai.png';
  if (lower.includes('idli')) return './images/idli.png';
  if (lower.includes('omelette') || lower.includes('omlete')) return './images/omelette.png';
  if (lower.includes('half boil') || lower.includes('halfboil') || lower.includes('boil')) return './images/halfboil.png';
  if (lower.includes('poori') || lower.includes('puri')) return './images/poori.png';
  if (lower.includes('chapati') || lower.includes('parotta') || lower.includes('dosa')) return './images/chapati.png';
  return null;
};

export const getRawFallbackImage = (name = '') => {
  if (!name) return null;
  const lower = name.toLowerCase();
  const githubRawBase = 'https://raw.githubusercontent.com/jbaskar2006-byte/Smart-Billing-System/main/images';

  if (lower.includes('pongal')) return `${githubRawBase}/pongal.png`;
  if (lower.includes('vadai') || lower.includes('vada')) return `${githubRawBase}/vadai.png`;
  if (lower.includes('idli')) return `${githubRawBase}/idli.png`;
  if (lower.includes('omelette') || lower.includes('omlete')) return `${githubRawBase}/omelette.png`;
  if (lower.includes('half boil') || lower.includes('halfboil') || lower.includes('boil')) return `${githubRawBase}/halfboil.png`;
  if (lower.includes('poori') || lower.includes('puri')) return `${githubRawBase}/poori.png`;
  if (lower.includes('chapati') || lower.includes('parotta') || lower.includes('dosa')) return `${githubRawBase}/chapati.png`;
  return null;
};
