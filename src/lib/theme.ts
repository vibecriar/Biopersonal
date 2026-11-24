export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  cor_primaria: string;
  cor_fundo: string;
  cor_texto: string;
}

export const PRESET_PALETTES: ColorPalette[] = [
  {
    id: 'laranja-neon',
    name: 'Laranja Neon (Padrão)',
    description: 'Energia, alta performance e intensidade clássica',
    cor_primaria: '#F97316',
    cor_fundo: '#08090C',
    cor_texto: '#F8FAFC'
  },
  {
    id: 'verde-eletrico',
    name: 'Verde Elétrico / Force',
    description: 'Musculação pesada, vitalidade e hipertrofia',
    cor_primaria: '#10B981',
    cor_fundo: '#06120D',
    cor_texto: '#F0FDF4'
  },
  {
    id: 'azul-ciano',
    name: 'Azul Ciano / Performance',
    description: 'Corrida, crossfit, foco mental e resistência',
    cor_primaria: '#06B6D4',
    cor_fundo: '#050F1A',
    cor_texto: '#ECFEFF'
  },
  {
    id: 'roxo-ultra',
    name: 'Roxo Ultra / Cyber Fitness',
    description: 'Estilo moderno, estética e consultoria premium',
    cor_primaria: '#8B5CF6',
    cor_fundo: '#0F0A1C',
    cor_texto: '#FAF5FF'
  },
  {
    id: 'dourado-vip',
    name: 'Dourado / Gold VIP',
    description: 'Exclusividade, consultoria de luxo e alto padrão',
    cor_primaria: '#EAB308',
    cor_fundo: '#0D0B05',
    cor_texto: '#FEFCE8'
  }
];

export function isValidHex(hex?: string): boolean {
  if (!hex) return false;
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex.trim());
}

export function hexToRgb(hex?: string): { r: number; g: number; b: number; rgbString: string } {
  const fallback = { r: 249, g: 115, b: 22, rgbString: '249 115 22' };
  if (!hex) return fallback;

  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length !== 6) return fallback;

  const num = parseInt(clean, 16);
  if (isNaN(num)) return fallback;

  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  return { r, g, b, rgbString: `${r} ${g} ${b}` };
}

export function adjustBrightness(hex: string, percent: number): string {
  let { r, g, b } = hexToRgb(hex);
  r = Math.min(255, Math.max(0, Math.round(r + (r * percent) / 100)));
  g = Math.min(255, Math.max(0, Math.round(g + (g * percent) / 100)));
  b = Math.min(255, Math.max(0, Math.round(b + (b * percent) / 100)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Aplica as variáveis CSS dinâmicas no documento (:root e body)
 */
export function applyTheme(colors: {
  cor_primaria?: string;
  cor_fundo?: string;
  cor_texto?: string;
}) {
  if (typeof document === 'undefined') return;

  const primary = isValidHex(colors.cor_primaria) ? colors.cor_primaria! : '#F97316';
  const bg = isValidHex(colors.cor_fundo) ? colors.cor_fundo! : '#08090C';
  const text = isValidHex(colors.cor_texto) ? colors.cor_texto! : '#F8FAFC';

  const { r, g, b, rgbString: primaryRgb } = hexToRgb(primary);
  const primaryLight = adjustBrightness(primary, 15);
  const primaryDark = adjustBrightness(primary, -15);
  const primaryLighter = adjustBrightness(primary, 35);

  const root = document.documentElement;
  root.style.setProperty('--brand-primary', primary);
  root.style.setProperty('--brand-500-rgb', primaryRgb);
  root.style.setProperty('--brand-400', primaryLight);
  root.style.setProperty('--brand-600', primaryDark);
  root.style.setProperty('--brand-300', primaryLighter);
  root.style.setProperty('--brand-glow', primary);
  root.style.setProperty('--brand-bg', bg);
  root.style.setProperty('--brand-text', text);

  // Calcula luminância do fundo para ajustar cartões se for claro ou escuro
  const bgRgb = hexToRgb(bg);
  const luminance = (0.299 * bgRgb.r + 0.587 * bgRgb.g + 0.114 * bgRgb.b) / 255;
  const isLight = luminance > 0.5;

  if (isLight) {
    root.style.setProperty('--brand-card', 'rgba(255, 255, 255, 0.88)');
    root.style.setProperty('--brand-card-interactive', 'rgba(244, 245, 247, 0.92)');
    root.style.setProperty('--brand-modal', 'rgba(255, 255, 255, 0.96)');
    root.style.setProperty('--brand-border', 'rgba(0, 0, 0, 0.12)');
    root.style.setProperty('--brand-input', 'rgba(0, 0, 0, 0.05)');
  } else {
    root.style.setProperty('--brand-card', 'rgba(18, 20, 26, 0.65)');
    root.style.setProperty('--brand-card-interactive', 'rgba(22, 25, 34, 0.6)');
    root.style.setProperty('--brand-modal', 'rgba(12, 14, 18, 0.9)');
    root.style.setProperty('--brand-border', 'rgba(255, 255, 255, 0.12)');
    root.style.setProperty('--brand-input', 'rgba(255, 255, 255, 0.05)');
  }

  document.body.style.backgroundColor = bg;
  document.body.style.color = text;
}
