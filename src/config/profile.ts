import { ProfileConfig } from '../types';

/**
 * CONFIGURAÇÃO PADRÃO INICIAL (VAZIA)
 * O sistema agora opera de forma 100% dinâmica através do Supabase.
 * Nenhum dado fixo ou fictício é carregado.
 */
export const emptyProfile: ProfileConfig = {
  id: '',
  user_id: '',
  slug: '',
  name: '',
  role: 'Personal Trainer',
  tagline: '',
  cref: '',
  avatarUrl: '',
  bgImageUrl: '',
  cor_primaria: '#F97316',
  cor_fundo: '#08090C',
  cor_texto: '#F8FAFC',
  socialLinks: {
    whatsapp: '',
    instagram: '',
  },
  ctaButtons: [],
  services: [],
  socialProof: {
    title: '',
    subtitle: '',
    stats: [],
    transformations: [],
    testimonials: []
  },
  vCardData: {
    firstName: '',
    lastName: '',
    organization: '',
    title: '',
    phone: '',
    email: '',
    url: '',
    note: ''
  },
  availableHours: {
    'Manhã': ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
    'Tarde': ['14:00', '15:00', '16:00', '17:00'],
    'Noite': ['18:00', '19:00', '20:00', '21:00']
  }
};

export const profileConfig: ProfileConfig = emptyProfile;
