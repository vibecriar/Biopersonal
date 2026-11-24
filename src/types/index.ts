export type ActionType = 'whatsapp' | 'instagram' | 'consultoria' | 'agendamento' | 'external' | 'socialProof';

export interface CTAButton {
  id: string;
  label: string;
  sublabel?: string;
  icon: string; // Lucide icon name or key
  action: ActionType;
  url?: string;
  badge?: string;
  highlight?: boolean;
}

export interface ServicePlan {
  id: string;
  name: string;
  tag: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  whatsappMessage: string;
}

export interface TransformationItem {
  id: string;
  name: string;
  result: string;
  tag?: string;
  timeFrame: string;
  description: string;
  quote?: string;
  beforeImg: string;
  afterImg: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatar: string;
  rating: number;
}

export interface SocialProofResultItem {
  id: string;
  name: string; // ex: "Carlos M."
  result: string; // ex: "-12kg em 3 meses sem dieta restritiva"
  photoUrl: string; // URL da foto do resultado no bucket avatars
}

export interface SocialProofData {
  ativo?: boolean; // Chave ativar/desativar exibição da seção no Biosite
  rating?: string | number; // Nota em estrelas (ex: "5.0")
  ratingText?: string; // Texto de avaliação (ex: "Avaliação 5.0 no Google" ou "Satisfação máxima")
  totalStudents?: string; // Número de alunos atendidos (ex: "+ de 300 alunos transformados")
  results?: SocialProofResultItem[]; // Lista de cards de resultados com foto
  title?: string;
  subtitle?: string;
  stats?: Array<{ label: string; value: string }>;
  transformations?: TransformationItem[];
  testimonials?: TestimonialItem[];
}

export interface VCardData {
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  phone: string; // e.g. "+5511999999999"
  email: string;
  url: string;
  note: string;
}

export interface ProfileConfig {
  id?: string; // ID ou UUID do Personal (Tenant) no Supabase
  user_id?: string; // UUID do usuário no Supabase Auth (auth.users)
  slug?: string; // Slug único para URL pública (ex: /marcos-personal)
  data_expiracao?: string; // Data de vencimento da assinatura de 6 meses (YYYY-MM-DD)
  active?: boolean; // Status de ativação da assinatura no SaaS
  cor_primaria?: string; // Cor primária (hex, ex: #F97316)
  cor_fundo?: string; // Cor de fundo do biosite (hex, ex: #08090C ou #FFFFFF)
  cor_texto?: string; // Cor de texto do biosite (hex, ex: #F8FAFC)
  name: string;
  role: string;
  tagline: string;
  cref: string; // Registro CREF
  avatarUrl: string;
  bgImageUrl: string;
  socialLinks: {
    whatsapp: string; // Number with country code, e.g. "5511999998888"
    whatsappDefaultMessage?: string;
    instagram: string; // Profile username or full URL
    youtube?: string;
    strava?: string;
  };
  ctaButtons: CTAButton[];
  services: ServicePlan[];
  socialProof: SocialProofData;
  vCardData: VCardData;
  availableHours?: Record<'Manhã' | 'Tarde' | 'Noite', string[]>;
}

export type LeadStatus = 'Novo Lead' | 'Contato Feito' | 'Avaliação Agendada' | 'Convertido';
export type PlanDuration = 'Mensal' | 'Trimestral' | 'Semestral';
export type PaymentMethod = 'Pix' | 'Cartão / Recorrência' | 'Boleto' | 'Dinheiro';

export interface LeadAgendamento {
  id: string;
  trainer_id?: string; // Chave estrangeira para a tabela trainers
  created_at: string;
  updated_at?: string;
  nome: string;
  whatsapp: string;
  objetivo: string;
  data_preferencia: string;
  turno_preferencia: 'Manhã' | 'Tarde' | 'Noite';
  observacoes?: string;
  status: LeadStatus;
  plano_interesse?: string;
  
  // Campos de Gestão de Alunos Ativos & Renovação
  plano_tipo?: PlanDuration;
  plano_valor?: number;
  data_inicio?: string;
  data_vencimento?: string;
  payment_method?: PaymentMethod;

  // Campos de Agenda de Atendimentos
  horario?: string; // Ex: "07:00", "08:00", "18:00"
  tipo_atendimento?: 'Presencial' | 'Online' | 'Avaliação';

  // Conformidade LGPD
  consentimento_lgpd?: boolean;
}

