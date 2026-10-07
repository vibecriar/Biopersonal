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

export interface SocialProofData {
  title: string;
  subtitle: string;
  stats: Array<{ label: string; value: string }>;
  transformations: TransformationItem[];
  testimonials: TestimonialItem[];
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

  // Campos de Agenda de Atendimentos
  horario?: string; // Ex: "07:00", "08:00", "18:00"
  tipo_atendimento?: 'Presencial' | 'Online' | 'Avaliação';

  // Conformidade LGPD
  consentimento_lgpd?: boolean;
}

