import { createClient } from '@supabase/supabase-js';
import { LeadAgendamento, LeadStatus, ProfileConfig } from '../types';
import { profileConfig } from '../config/profile';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.trim().length > 0 &&
    !supabaseUrl.includes('placeholder') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.trim().length > 0 &&
    !supabaseAnonKey.includes('placeholder')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const STORAGE_KEY = 'biopersonal_leads_crm_v3';

// Helper de datas relativas para demonstrar os alertas em tempo real
const now = Date.now();
const dayMs = 1000 * 60 * 60 * 24;

const formatDateStr = (timestamp: number) => new Date(timestamp).toISOString().split('T')[0];
const todayStr = formatDateStr(now);

const INITIAL_MOCK_LEADS: LeadAgendamento[] = [
  {
    id: 'lead-1',
    created_at: new Date(now - 55 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now - 55 * 60 * 60 * 1000).toISOString(),
    nome: 'Mariana Duarte',
    whatsapp: '5511987654321',
    objetivo: 'Emagrecimento',
    data_preferencia: todayStr, // Hoje às 11:00
    turno_preferencia: 'Manhã',
    horario: '11:00',
    tipo_atendimento: 'Online',
    observacoes: 'Quero perder 8kg e definir abdômen.',
    status: 'Novo Lead',
    plano_interesse: 'Consultoria Online Black'
  },
  {
    id: 'lead-2',
    created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    nome: 'Rafael Nogueira',
    whatsapp: '5511977771234',
    objetivo: 'Hipertrofia',
    data_preferencia: todayStr, // Hoje às 07:00
    turno_preferencia: 'Manhã',
    horario: '07:00',
    tipo_atendimento: 'Presencial',
    observacoes: 'Treino de força focado em peito e tríceps.',
    status: 'Convertido',
    plano_interesse: 'Personal Presencial VIP',
    plano_tipo: 'Mensal',
    plano_valor: 1200,
    data_inicio: formatDateStr(now - dayMs * 10),
    data_vencimento: formatDateStr(now + dayMs * 20)
  },
  {
    id: 'lead-3',
    created_at: new Date(now - 74 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now - 74 * 60 * 60 * 1000).toISOString(),
    nome: 'Lucas Albuquerque',
    whatsapp: '5511976543210',
    objetivo: 'Hipertrofia',
    data_preferencia: todayStr, // Hoje às 18:00
    turno_preferencia: 'Noite',
    horario: '18:00',
    tipo_atendimento: 'Presencial',
    observacoes: 'Enviei a proposta de consultoria por WhatsApp.',
    status: 'Contato Feito',
    plano_interesse: 'Consultoria Online Black'
  },
  {
    id: 'lead-4',
    created_at: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
    nome: 'Beatriz Vasques',
    whatsapp: '5511965432109',
    objetivo: 'Saúde & Longevidade',
    data_preferencia: todayStr, // Hoje às 09:00
    turno_preferencia: 'Manhã',
    horario: '09:00',
    tipo_atendimento: 'Avaliação',
    observacoes: 'Avaliação física inicial e teste de flexibilidade.',
    status: 'Avaliação Agendada',
    plano_interesse: 'Personal Presencial VIP'
  },
  {
    id: 'lead-5',
    created_at: new Date(now - dayMs * 27).toISOString(),
    updated_at: new Date(now - dayMs * 1).toISOString(),
    nome: 'Juliana Prado',
    whatsapp: '5511954321098',
    objetivo: 'Emagrecimento',
    data_preferencia: formatDateStr(now + dayMs * 1), // Amanhã às 08:00
    turno_preferencia: 'Manhã',
    horario: '08:00',
    tipo_atendimento: 'Online',
    observacoes: 'Evolução incrível, perdeu 3.2kg no 1º mês.',
    status: 'Convertido',
    plano_interesse: 'Consultoria Online Black',
    plano_tipo: 'Mensal',
    plano_valor: 197,
    data_inicio: formatDateStr(now - dayMs * 27),
    data_vencimento: formatDateStr(now + dayMs * 3) // ALERTA: Vence em 3 dias!
  },
  {
    id: 'lead-6',
    created_at: new Date(now - dayMs * 12).toISOString(),
    updated_at: new Date(now - dayMs * 2).toISOString(),
    nome: 'Felipe Santana (VIP)',
    whatsapp: '5511943210987',
    objetivo: 'Hipertrofia',
    data_preferencia: todayStr, // Hoje às 16:00
    turno_preferencia: 'Tarde',
    horario: '16:00',
    tipo_atendimento: 'Presencial',
    observacoes: 'Acompanhamento presencial 3x/semana.',
    status: 'Convertido',
    plano_interesse: 'Personal Presencial VIP',
    plano_tipo: 'Mensal',
    plano_valor: 1200,
    data_inicio: formatDateStr(now - dayMs * 12),
    data_vencimento: formatDateStr(now + dayMs * 18)
  },
  {
    id: 'lead-7',
    created_at: new Date(now - dayMs * 89).toISOString(),
    updated_at: new Date(now - dayMs * 3).toISOString(),
    nome: 'Gustavo Mendonça',
    whatsapp: '5511932109876',
    objetivo: 'Condicionamento Físico',
    data_preferencia: todayStr, // Hoje às 19:00
    turno_preferencia: 'Noite',
    horario: '19:00',
    tipo_atendimento: 'Presencial',
    observacoes: 'Concluindo o Desafio 90 Dias Shape com louvor!',
    status: 'Convertido',
    plano_interesse: 'Desafio 90 Dias Shape',
    plano_tipo: 'Trimestral',
    plano_valor: 497,
    data_inicio: formatDateStr(now - dayMs * 89),
    data_vencimento: formatDateStr(now + dayMs * 1) // ALERTA: Vence amanhã!
  }
];

function getLocalLeads(): LeadAgendamento[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_LEADS));
      return INITIAL_MOCK_LEADS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erro ao ler leads do localStorage:', err);
    return INITIAL_MOCK_LEADS;
  }
}

function saveLocalLeads(leads: LeadAgendamento[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch (err) {
    console.error('Erro ao salvar leads no localStorage:', err);
  }
}

/**
 * Cria um novo agendamento (suporta multi-tenant via trainer_id)
 */
export async function createAgendamento(
  data: Omit<LeadAgendamento, 'id' | 'created_at' | 'status'> & { status?: LeadStatus }
): Promise<{ success: boolean; data?: LeadAgendamento; error?: string }> {
  const currentIso = new Date().toISOString();
  const effectiveTrainerId = 
    data.trainer_id || 
    profileConfig.id || 
    (typeof window !== 'undefined' ? localStorage.getItem('biopersonal_trainer_id') : null) || 
    import.meta.env.VITE_TRAINER_ID || 
    undefined;

  const newLead: LeadAgendamento = {
    ...data,
    trainer_id: effectiveTrainerId,
    id: 'lead-' + Math.random().toString(36).substring(2, 9),
    created_at: currentIso,
    updated_at: currentIso,
    status: data.status || 'Novo Lead',
    consentimento_lgpd: data.consentimento_lgpd !== false
  };

  if (supabase) {
    try {
      const payload: Record<string, any> = {
        nome: data.nome,
        whatsapp: data.whatsapp,
        objetivo: data.objetivo,
        data_preferencia: data.data_preferencia,
        turno_preferencia: data.turno_preferencia,
        observacoes: data.observacoes || '',
        plano_interesse: data.plano_interesse || 'Geral',
        status: 'Novo Lead',
        plano_tipo: data.plano_tipo || 'Mensal',
        plano_valor: data.plano_valor || 0,
        data_inicio: data.data_inicio || null,
        data_vencimento: data.data_vencimento || null,
        horario: data.horario || null,
        tipo_atendimento: data.tipo_atendimento || 'Presencial',
        consentimento_lgpd: data.consentimento_lgpd !== false
      };

      // Inclui a foreign key trainer_id se configurada
      if (effectiveTrainerId) {
        payload.trainer_id = effectiveTrainerId;
      }

      const { data: inserted, error } = await supabase
        .from('leads_agendamentos')
        .insert([payload])
        .select()
        .single();

      if (!error && inserted) {
        return { success: true, data: inserted as LeadAgendamento };
      }
      if (error) {
        console.error('Erro ao inserir lead no Supabase com trainer_id:', error);
      }
    } catch (e) {
      console.warn('Supabase erro, fallback para local storage:', e);
    }
  }

  const current = getLocalLeads();
  saveLocalLeads([newLead, ...current]);
  return { success: true, data: newLead };
}

/**
 * Busca leads com ordenação e filtro estrito por trainer_id (multi-tenant)
 */
export async function getLeads(trainerId?: string): Promise<LeadAgendamento[]> {
  const effectiveTrainerId = 
    trainerId || 
    profileConfig.id || 
    (typeof window !== 'undefined' ? localStorage.getItem('biopersonal_trainer_id') : null) || 
    import.meta.env.VITE_TRAINER_ID || 
    undefined;

  if (supabase) {
    try {
      let query = supabase
        .from('leads_agendamentos')
        .select('*');

      // Filtra estritamente os leads do personal autenticado
      if (effectiveTrainerId) {
        query = query.eq('trainer_id', effectiveTrainerId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data) {
        return data as LeadAgendamento[];
      }
      if (error) {
        console.error('Erro ao buscar leads filtrados por trainer_id no Supabase:', error);
      }
    } catch (e) {
      console.warn('Supabase erro ao buscar leads, usando localStorage:', e);
    }
  }

  const local = getLocalLeads();
  if (effectiveTrainerId) {
    return local.filter(l => !l.trainer_id || l.trainer_id === effectiveTrainerId);
  }
  return local;
}

/**
 * Atualiza o status do lead
 */
export async function updateLeadStatus(id: string, status: LeadStatus): Promise<boolean> {
  const currentIso = new Date().toISOString();
  
  if (supabase) {
    try {
      const { error } = await supabase
        .from('leads_agendamentos')
        .update({ status, updated_at: currentIso })
        .eq('id', id);

      if (!error) return true;
    } catch (e) {
      console.warn('Supabase erro ao atualizar status, usando local:', e);
    }
  }

  const leads = getLocalLeads();
  const updated = leads.map(l => (l.id === id ? { ...l, status, updated_at: currentIso } : l));
  saveLocalLeads(updated);
  return true;
}

/**
 * Atualiza campos detalhados do lead (plano, datas, valor)
 */
export async function updateLeadDetails(id: string, updates: Partial<LeadAgendamento>): Promise<boolean> {
  const currentIso = new Date().toISOString();
  const payload = { ...updates, updated_at: currentIso };

  if (supabase) {
    try {
      const { error } = await supabase
        .from('leads_agendamentos')
        .update(payload)
        .eq('id', id);

      if (!error) return true;
    } catch (e) {
      console.warn('Supabase erro ao atualizar detalhes, usando local:', e);
    }
  }

  const leads = getLocalLeads();
  const updated = leads.map(l => (l.id === id ? { ...l, ...payload } : l));
  saveLocalLeads(updated);
  return true;
}

/**
 * Exclui um lead
 */
export async function deleteLead(id: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('leads_agendamentos')
        .delete()
        .eq('id', id);

      if (!error) return true;
    } catch (e) {
      console.warn('Supabase erro ao deletar lead:', e);
    }
  }

  const leads = getLocalLeads();
  const filtered = leads.filter(l => l.id !== id);
  saveLocalLeads(filtered);
  return true;
}

const TRAINER_CACHE_KEY = 'biopersonal_trainer_profile_v1';

/**
 * Busca os dados do treinador (Tenant) no Supabase de forma dinâmica
 * Fallback para cache local e profileConfig padrão
 */
export async function getTrainer(trainerId?: string): Promise<ProfileConfig> {
  const effectiveId =
    trainerId ||
    (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('trainer_id') : null) ||
    (typeof window !== 'undefined' ? localStorage.getItem('biopersonal_trainer_id') : null) ||
    import.meta.env.VITE_TRAINER_ID ||
    profileConfig.id ||
    undefined;

  if (supabase) {
    try {
      let query = supabase.from('trainers').select('*');
      if (effectiveId) {
        query = query.eq('id', effectiveId);
      }
      const { data, error } = await query.limit(1).maybeSingle();

      if (!error && data) {
        const mappedProfile: ProfileConfig = {
          id: data.id,
          name: data.name || profileConfig.name,
          role: data.role || profileConfig.role,
          tagline: data.tagline || data.bio || profileConfig.tagline,
          cref: data.cref || profileConfig.cref,
          avatarUrl: data.avatar_url || profileConfig.avatarUrl,
          bgImageUrl: data.bg_image_url || profileConfig.bgImageUrl,
          socialLinks: {
            whatsapp: data.phone || profileConfig.socialLinks.whatsapp,
            whatsappDefaultMessage: profileConfig.socialLinks.whatsappDefaultMessage,
            instagram: data.instagram || profileConfig.socialLinks.instagram,
            youtube: profileConfig.socialLinks.youtube,
            strava: profileConfig.socialLinks.strava,
          },
          ctaButtons: profileConfig.ctaButtons,
          services: Array.isArray(data.plans) && data.plans.length > 0 ? data.plans : profileConfig.services,
          socialProof: (data.social_proof && typeof data.social_proof === 'object' && Object.keys(data.social_proof).length > 0)
            ? data.social_proof
            : profileConfig.socialProof,
          vCardData: {
            ...profileConfig.vCardData,
            firstName: data.name?.split(' ')[0] || profileConfig.vCardData.firstName,
            lastName: data.name?.split(' ').slice(1).join(' ') || profileConfig.vCardData.lastName,
            phone: data.phone || profileConfig.socialLinks.whatsapp,
            title: `Personal Trainer - ${data.cref || profileConfig.cref}`,
          },
          availableHours: (data.available_hours && typeof data.available_hours === 'object')
            ? data.available_hours
            : profileConfig.availableHours,
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem('biopersonal_trainer_id', data.id);
          localStorage.setItem(TRAINER_CACHE_KEY, JSON.stringify(mappedProfile));
        }

        return mappedProfile;
      }
    } catch (err) {
      console.warn('Erro ao carregar dados do trainer no Supabase, usando fallback:', err);
    }
  }

  // Fallback para cache local
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(TRAINER_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      // Ignora erro
    }
  }

  return profileConfig;
}

/**
 * Atualiza os dados do treinador no Supabase e reflete em tempo real
 */
export async function updateTrainer(
  trainerId: string,
  updates: Partial<ProfileConfig>
): Promise<{ success: boolean; data?: ProfileConfig; error?: string }> {
  const currentIso = new Date().toISOString();
  const payload: Record<string, any> = {
    updated_at: currentIso
  };

  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.role !== undefined) payload.role = updates.role;
  if (updates.cref !== undefined) payload.cref = updates.cref;
  if (updates.tagline !== undefined) {
    payload.tagline = updates.tagline;
    payload.bio = updates.tagline;
  }
  if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
  if (updates.bgImageUrl !== undefined) payload.bg_image_url = updates.bgImageUrl;
  if (updates.socialLinks?.whatsapp !== undefined) payload.phone = updates.socialLinks.whatsapp;
  if (updates.socialLinks?.instagram !== undefined) payload.instagram = updates.socialLinks.instagram;
  if (updates.services !== undefined) payload.plans = updates.services;
  if (updates.socialProof !== undefined) payload.social_proof = updates.socialProof;
  if (updates.availableHours !== undefined) payload.available_hours = updates.availableHours;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('trainers')
        .update(payload)
        .eq('id', trainerId)
        .select()
        .single();

      if (!error && data) {
        const updated = await getTrainer(trainerId);
        return { success: true, data: updated };
      }
      if (error) {
        console.error('Erro ao atualizar trainer no Supabase:', error);
      }
    } catch (err: any) {
      console.error('Exceção ao atualizar trainer:', err);
    }
  }

  // Fallback e cache local
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(TRAINER_CACHE_KEY);
      const current: ProfileConfig = cached ? JSON.parse(cached) : profileConfig;
      const merged: ProfileConfig = {
        ...current,
        ...updates,
        socialLinks: {
          ...current.socialLinks,
          ...(updates.socialLinks || {})
        },
        services: updates.services || current.services,
        availableHours: updates.availableHours || current.availableHours
      };
      localStorage.setItem(TRAINER_CACHE_KEY, JSON.stringify(merged));
      return { success: true, data: merged };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  return { success: true };
}
