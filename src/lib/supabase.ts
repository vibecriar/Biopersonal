import { createClient } from '@supabase/supabase-js';
import { LeadAgendamento, LeadStatus, ProfileConfig } from '../types';
import { emptyProfile } from '../config/profile';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Sanitização estrita contra espaços, aspas acidentais e quebras de linha no .env
export const supabaseUrl = typeof rawSupabaseUrl === 'string'
  ? rawSupabaseUrl.trim().replace(/^["']|["']$/g, '')
  : '';
export const supabaseAnonKey = typeof rawSupabaseAnonKey === 'string'
  ? rawSupabaseAnonKey.trim().replace(/^["']|["']$/g, '')
  : '';

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.length > 0 &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('your-project') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.length > 0 &&
    !supabaseAnonKey.includes('placeholder') &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

// Cliente Supabase com persistência de sessão e autenticação completa para multi-tenant SaaS
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'biopersonal_auth_session'
    }
  })
  : null;

// Helper para validar UUID antes de passar para cláusulas SQL/PostgreSQL
export const isValidUuid = (val?: string | null): boolean => {
  if (!val || typeof val !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());
};

/**
 * Cria um novo agendamento vinculado estritamente ao trainer_id
 */
export async function createAgendamento(
  data: Omit<LeadAgendamento, 'id' | 'created_at' | 'status'> & { status?: LeadStatus }
): Promise<{ success: boolean; data?: LeadAgendamento; error?: string }> {
  if (!data.trainer_id || !isValidUuid(data.trainer_id)) {
    return { success: false, error: 'Trainer ID inválido para agendamento.' };
  }

  if (supabase) {
    try {
      const payload: Record<string, any> = {
        trainer_id: data.trainer_id,
        nome: data.nome.trim(),
        whatsapp: data.whatsapp.replace(/\D/g, ''),
        objetivo: data.objetivo,
        data_preferencia: data.data_preferencia,
        turno_preferencia: data.turno_preferencia,
        observacoes: (data.observacoes || '').trim(),
        plano_interesse: data.plano_interesse || 'Avaliação Inicial',
        status: data.status || 'Novo Lead',
        plano_tipo: data.plano_tipo || 'Mensal',
        plano_valor: data.plano_valor || 0,
        horario: data.horario || null,
        tipo_atendimento: data.tipo_atendimento || 'Presencial',
        payment_method: data.payment_method || 'Pix',
        consentimento_lgpd: data.consentimento_lgpd !== false
      };

      const { data: inserted, error } = await supabase
        .from('leads_agendamentos')
        .insert([payload])
        .select()
        .single();

      if (!error && inserted) {
        return { success: true, data: inserted as LeadAgendamento };
      }
      if (error) {
        return { success: false, error: error.message };
      }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Erro ao registrar agendamento' };
    }
  }

  return { success: false, error: 'Supabase não conectado' };
}

/**
 * Busca leads estritamente vinculados ao trainer_id no Supabase.
 * Nunca retorna leads fictícios de exemplo.
 */
export async function getLeads(trainerId?: string): Promise<LeadAgendamento[]> {
  if (!trainerId || !isValidUuid(trainerId)) {
    return [];
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('leads_agendamentos')
        .select('*')
        .eq('trainer_id', trainerId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as LeadAgendamento[];
      }
      if (error) {
        console.error('Erro ao buscar leads no Supabase:', error);
      }
    } catch (e) {
      console.warn('Erro ao buscar leads:', e);
    }
  }

  return [];
}

/**
 * Atualiza o status do lead no Supabase
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
      console.warn('Erro ao atualizar status do lead:', e);
    }
  }

  return false;
}

/**
 * Atualiza campos detalhados do lead no Supabase
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
      console.warn('Erro ao atualizar detalhes do lead:', e);
    }
  }

  return false;
}

/**
 * Exclui um lead no Supabase
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
      console.warn('Erro ao deletar lead:', e);
    }
  }

  return false;
}

/**
 * Converte um registro do banco de dados (tabela trainers) para a interface ProfileConfig.
 * Mapeia as colunas reais da tabela (nome, slug, cref, whatsapp, role, tagline, instagram,
 * avatar_url, bg_image_url, plans, social_proof, available_hours, cor_primaria, cor_fundo, cor_texto).
 */
export function mapTrainerRowToProfile(data: any): ProfileConfig {
  const name = data.nome || data.name || '';
  const cref = data.cref || '';
  const phone = data.whatsapp || data.phone || '';
  const firstName = name.split(' ')[0] || '';
  const lastName = name.split(' ').slice(1).join(' ') || '';

  return {
    id: data.id,
    user_id: data.user_id || undefined,
    slug: data.slug || undefined,
    data_expiracao: data.data_expiracao || undefined,
    active: data.active !== false,
    cor_primaria: data.cor_primaria || '#F97316',
    cor_fundo: data.cor_fundo || '#08090C',
    cor_texto: data.cor_texto || '#F8FAFC',
    name: name,
    role: data.role || 'Personal Trainer',
    tagline: data.tagline || data.bio || '',
    cref: cref,
    avatarUrl: data.avatar_url || '',
    bgImageUrl: data.bg_image_url || '',
    socialLinks: {
      whatsapp: phone,
      whatsappDefaultMessage: 'Olá! Vim pelo seu Biosite e gostaria de saber mais sobre seu acompanhamento.',
      instagram: data.instagram || '',
      youtube: '',
      strava: '',
    },
    ctaButtons: [
      {
        id: 'whatsapp',
        label: 'Falar no WhatsApp',
        sublabel: 'Tire dúvidas direto com o Personal',
        icon: 'MessageCircle',
        action: 'whatsapp',
        badge: 'Online agora',
        highlight: true
      },
      {
        id: 'consultoria',
        label: 'Planos & Consultoria',
        sublabel: 'Acompanhamento Exclusivo',
        icon: 'Dumbbell',
        action: 'consultoria',
        badge: 'Vagas Abertas'
      }
    ],
    services: Array.isArray(data.plans) ? data.plans : [],
    socialProof: (data.social_proof && typeof data.social_proof === 'object') ? {
      ativo: data.social_proof.ativo !== false,
      rating: data.social_proof.rating || '5.0',
      ratingText: data.social_proof.ratingText || 'Avaliação 5.0 no Google',
      totalStudents: data.social_proof.totalStudents || '+ de 300 alunos transformados',
      results: Array.isArray(data.social_proof.results) ? data.social_proof.results : [],
      title: data.social_proof.title || 'Resultados Comprovados',
      subtitle: data.social_proof.subtitle || '',
      stats: Array.isArray(data.social_proof.stats) ? data.social_proof.stats : [],
      transformations: Array.isArray(data.social_proof.transformations) ? data.social_proof.transformations : [],
      testimonials: Array.isArray(data.social_proof.testimonials) ? data.social_proof.testimonials : []
    } : {
      ativo: true,
      rating: '5.0',
      ratingText: 'Avaliação 5.0 no Google',
      totalStudents: '+ de 300 alunos transformados',
      results: [],
      title: 'Resultados Comprovados',
      subtitle: '',
      stats: [],
      transformations: [],
      testimonials: []
    },
    vCardData: {
      firstName: firstName,
      lastName: lastName,
      organization: name ? `${name} Personal Trainer` : 'Personal Trainer',
      title: cref ? `Personal Trainer - ${cref}` : 'Personal Trainer',
      phone: phone,
      email: data.email || '',
      url: data.slug && typeof window !== 'undefined' ? `${window.location.origin}/p/${data.slug}` : '',
      note: data.tagline || data.bio || ''
    },
    availableHours: (data.available_hours && typeof data.available_hours === 'object')
      ? data.available_hours
      : {
        'Manhã': ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
        'Tarde': ['14:00', '15:00', '16:00', '17:00'],
        'Noite': ['18:00', '19:00', '20:00', '21:00']
      }
  };
}

/**
 * Busca os dados do treinador no Supabase por Slug (ex: /p/personal-demo ou ?p=personal-demo).
 * Consulta diretamente supabase.from('trainers').select('*').eq('slug', slug).single().
 * Nunca retorna dados de outro personal caso o slug não exista.
 */
export async function getTrainerBySlug(slug: string): Promise<ProfileConfig | null> {
  const cleanSlug = slug.trim().toLowerCase().replace(/^\/+/, '');
  if (!cleanSlug) return null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('trainers')
        .select('*')
        .eq('slug', cleanSlug)
        .single();

      if (!error && data) {
        return mapTrainerRowToProfile(data);
      }
    } catch (err) {
      console.warn('Erro ao buscar trainer por slug:', err);
    }
  }

  return null;
}

/**
 * Busca o registro de personal vinculado ao usuário autenticado (user_id do Supabase Auth):
 * supabase.from('trainers').select('*').eq('user_id', user.id).single()
 */
export async function getTrainerByUserId(userId: string): Promise<ProfileConfig | null> {
  if (!supabase || !isValidUuid(userId)) return null;

  try {
    const { data, error } = await supabase
      .from('trainers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      return mapTrainerRowToProfile(data);
    }
  } catch (err) {
    console.warn('Erro ao buscar trainer por user_id:', err);
  }

  return null;
}

/**
 * Busca o usuário atualmente autenticado no Supabase Auth
 */
export async function getCurrentAuthUser() {
  if (!supabase) return null;
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;
    return session.user;
  } catch (err) {
    return null;
  }
}

/**
 * Realiza login do personal usando E-mail e Senha no Supabase Auth
 */
export async function signInTrainer(email: string, password: string) {
  if (!supabase) {
    return {
      data: null,
      error: { message: 'Supabase não está configurado. Preencha as chaves no arquivo .env.' }
    };
  }
  return await supabase.auth.signInWithPassword({
    email: email.trim(),
    password
  });
}

/**
 * Desconecta o personal (Logout)
 */
export async function signOutTrainer() {
  if (!supabase) return;
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Erro ao deslogar:', err);
  }
}

/**
 * Busca dados do treinador por ID no Supabase (sem cache local fictício)
 */
export async function getTrainer(trainerId?: string): Promise<ProfileConfig | null> {
  if (!trainerId || !isValidUuid(trainerId)) return null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('trainers')
        .select('*')
        .eq('id', trainerId)
        .single();

      if (!error && data) {
        return mapTrainerRowToProfile(data);
      }
    } catch (err) {
      console.warn('Erro ao carregar trainer por ID:', err);
    }
  }

  return null;
}

export interface TrainerUpdatePayload {
  nome: string;
  slug: string;
  cref: string;
  whatsapp: string;
  role: string;
  tagline: string;
  instagram: string;
  avatar_url: string;
  bg_image_url: string;
  plans: any;
  social_proof: any;
  available_hours: any;
  cor_primaria: string;
  cor_fundo: string;
  cor_texto: string;
}

/**
 * Atualiza o perfil do personal trainer no Supabase usando EXCLUSIVAMENTE o user_id autenticado
 * e enviando apenas as 15 colunas exatas da tabela trainers:
 * nome, slug, cref, whatsapp, role, tagline, instagram, avatar_url, bg_image_url,
 * plans, social_proof, available_hours, cor_primaria, cor_fundo, cor_texto.
 * Filtrando estritamente por .eq('user_id', user.id).
 */
export async function updateTrainerProfileByUserId(
  userId: string,
  payload: TrainerUpdatePayload
): Promise<{ success: boolean; data?: ProfileConfig; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase não está configurado no ambiente.' };
  }

  if (!userId || !isValidUuid(userId)) {
    return { success: false, error: 'Identificador de usuário (user_id) inválido ou ausente.' };
  }

  // Prepara exatamente as 15 colunas existentes na tabela trainers
  const exactPayload = {
    nome: payload.nome ?? '',
    slug: payload.slug ?? '',
    cref: payload.cref ?? '',
    whatsapp: payload.whatsapp ?? '',
    role: payload.role ?? '',
    tagline: payload.tagline ?? '',
    instagram: payload.instagram ?? '',
    avatar_url: payload.avatar_url ?? '',
    bg_image_url: payload.bg_image_url ?? '',
    plans: Array.isArray(payload.plans) ? payload.plans : [],
    social_proof: (payload.social_proof && typeof payload.social_proof === 'object') ? payload.social_proof : {},
    available_hours: (payload.available_hours && typeof payload.available_hours === 'object') ? payload.available_hours : {},
    cor_primaria: payload.cor_primaria || '#F97316',
    cor_fundo: payload.cor_fundo || '#08090C',
    cor_texto: payload.cor_texto || '#F8FAFC'
  };

  try {
    const { data, error } = await supabase
      .from('trainers')
      .update(exactPayload)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Erro no Supabase ao atualizar (.eq user_id):', error);
      return { success: false, error: error.message };
    }

    if (data) {
      return { success: true, data: mapTrainerRowToProfile(data) };
    }

    return { success: false, error: 'Nenhum registro encontrado para atualizar com este user_id.' };
  } catch (err: any) {
    console.error('Exceção ao atualizar perfil por user_id:', err);
    return { success: false, error: err?.message || 'Erro inesperado ao salvar perfil.' };
  }
}

/**
 * Atualiza os dados do treinador no Supabase por ID ou user_id
 */
export async function updateTrainer(
  trainerIdOrUserId: string,
  updates: Partial<ProfileConfig>
): Promise<{ success: boolean; data?: ProfileConfig; error?: string }> {
  if (!trainerIdOrUserId || !isValidUuid(trainerIdOrUserId)) {
    return { success: false, error: 'ID de personal inválido.' };
  }

  const payload: Record<string, any> = {};

  if (updates.name !== undefined) payload.nome = updates.name;
  if (updates.role !== undefined) payload.role = updates.role;
  if (updates.cref !== undefined) payload.cref = updates.cref;
  if (updates.tagline !== undefined) payload.tagline = updates.tagline;
  if (updates.slug !== undefined) payload.slug = updates.slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
  if (updates.bgImageUrl !== undefined) payload.bg_image_url = updates.bgImageUrl;
  if (updates.cor_primaria !== undefined) payload.cor_primaria = updates.cor_primaria;
  if (updates.cor_fundo !== undefined) payload.cor_fundo = updates.cor_fundo;
  if (updates.cor_texto !== undefined) payload.cor_texto = updates.cor_texto;
  if (updates.socialLinks?.whatsapp !== undefined) payload.whatsapp = updates.socialLinks.whatsapp;
  if (updates.socialLinks?.instagram !== undefined) payload.instagram = updates.socialLinks.instagram;
  if (updates.services !== undefined) payload.plans = updates.services;
  if (updates.socialProof !== undefined) payload.social_proof = updates.socialProof;
  if (updates.availableHours !== undefined) payload.available_hours = updates.availableHours;

  if (supabase) {
    try {
      // Tenta atualizar por user_id primeiro, senão por id
      let query = supabase.from('trainers').update(payload);

      const resUser = await query.eq('user_id', trainerIdOrUserId).select().single();
      if (!resUser.error && resUser.data) {
        return { success: true, data: mapTrainerRowToProfile(resUser.data) };
      }

      const resId = await supabase.from('trainers').update(payload).eq('id', trainerIdOrUserId).select().single();
      if (!resId.error && resId.data) {
        return { success: true, data: mapTrainerRowToProfile(resId.data) };
      }

      if (resUser.error) {
        return { success: false, error: resUser.error.message };
      }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Erro inesperado' };
    }
  }

  return { success: false, error: 'Supabase não conectado' };
}
