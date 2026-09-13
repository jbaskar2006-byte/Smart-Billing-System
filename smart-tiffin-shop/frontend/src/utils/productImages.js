import idliImg from '../../public/images/idli.png';
import vadaiImg from '../../public/images/vadai.png';
import pooriImg from '../../public/images/poori.png';
import chapatiImg from '../../public/images/chapati.png';
import pongalImg from '../../public/images/pongal.png';
import omeletteImg from '../../public/images/omelette.png';
import halfboilImg from '../../public/images/halfboil.png';

export const getFoodImage = (name = '') => {
  if (!name) return null;
  const lower = name.toLowerCase();

  if (lower.includes('pongal')) return pongalImg;
  if (lower.includes('vadai') || lower.includes('vada')) return vadaiImg;
  if (lower.includes('idli')) return idliImg;
  if (lower.includes('omelette') || lower.includes('omlete')) return omeletteImg;
  if (lower.includes('half boil') || lower.includes('halfboil') || lower.includes('boil')) return halfboilImg;
  if (lower.includes('poori') || lower.includes('puri')) return pooriImg;
  if (lower.includes('chapati') || lower.includes('parotta') || lower.includes('dosa')) return chapatiImg;
  return null;
};
