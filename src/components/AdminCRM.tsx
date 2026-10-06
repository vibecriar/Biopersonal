import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageCircle, 
  Trash2, 
  RefreshCw, 
  Plus, 
  Search, 
  CheckCircle, 
  Clock, 
  Calendar, 
  CalendarDays,
  Lock, 
  ArrowLeft, 
  Database, 
  LayoutGrid,
  List,
  Sparkles,
  PhoneCall,
  Download,
  AlertTriangle,
  Flame,
  FileSpreadsheet,
  Contact,
  CreditCard,
  Edit3,
  TrendingUp,
  Target,
  Send,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { LeadAgendamento, LeadStatus, ProfileConfig } from '../types';
import { 
  getLeads, 
  updateLeadStatus, 
  updateLeadDetails, 
  deleteLead, 
  createAgendamento, 
  isSupabaseConfigured 
} from '../lib/supabase';
import { exportLeadsToVCard, exportLeadsToCSV } from '../lib/vcard';
import { ReactivationTemplatesModal } from './ReactivationTemplatesModal';
import { StudentPlanEditModal } from './StudentPlanEditModal';
import { ScheduleView } from './ScheduleView';

interface AdminCRMProps {
  profile: ProfileConfig;
  onExit: () => void;
  onShowToast: (msg: string) => void;
}

const STATUS_COLUMNS: Array<{ id: LeadStatus; label: string; shortLabel: string; color: string; badge: string }> = [
  { id: 'Novo Lead', label: 'Novos Leads', shortLabel: 'Novos', color: 'border-sky-500/40 bg-sky-500/10 text-sky-400', badge: 'bg-sky-500/20 text-sky-300' },
  { id: 'Contato Feito', label: 'Contato Feito', shortLabel: 'Contato', color: 'border-amber-500/40 bg-amber-500/10 text-amber-400', badge: 'bg-amber-500/20 text-amber-300' },
  { id: 'Avaliação Agendada', label: 'Avaliação Agendada', shortLabel: 'Agendados', color: 'border-purple-500/40 bg-purple-500/10 text-purple-400', badge: 'bg-purple-500/20 text-purple-300' },
  { id: 'Convertido', label: 'Alunos / Convertidos', shortLabel: 'Alunos', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' }
];

export const AdminCRM: React.FC<AdminCRMProps> = ({
  profile,
  onExit,
  onShowToast
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [leads, setLeads] = useState<LeadAgendamento[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'agenda'>('kanban');
  
  // Filtros Rápidos
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGoal, setFilterGoal] = useState<string>('all');
  const [filterOnlyUrgent, setFilterOnlyUrgent] = useState(false);

  // Mobile Tabs
  const [activeMobileTab, setActiveMobileTab] = useState<LeadStatus>('Novo Lead');
  const kanbanScrollRef = useRef<HTMLDivElement>(null);

  // Meta Mensal Editável
  const [monthlyGoal, setMonthlyGoal] = useState<number>(() => {
    const saved = localStorage.getItem('biopersonal_monthly_goal');
    return saved ? Number(saved) : 6000;
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(monthlyGoal.toString());

  // Modais
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [selectedLeadForTemplates, setSelectedLeadForTemplates] = useState<LeadAgendamento | null>(null);
  const [leadForPlanEdit, setLeadForPlanEdit] = useState<LeadAgendamento | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Campos para novo lead manual
  const [newNome, setNewNome] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [newObjetivo, setNewObjetivo] = useState('Hipertrofia');
  const [newData, setNewData] = useState(() => new Date().toISOString().split('T')[0]);
  const [newHorario, setNewHorario] = useState('08:00');
  const [newTipoAtendimento, setNewTipoAtendimento] = useState<'Presencial' | 'Online' | 'Avaliação'>('Presencial');
  const [newTurno, setNewTurno] = useState<'Manhã' | 'Tarde' | 'Noite'>('Manhã');
  const [newObs, setNewObs] = useState('');

  const targetPin = import.meta.env.VITE_ADMIN_PIN || '1234';
  const supabaseActive = isSupabaseConfigured();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === targetPin) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadLeads();
    }
  }, [isAuthenticated]);

  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    await updateLeadStatus(id, newStatus);
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, status: newStatus } : l)));
    onShowToast(`Lead movido para "${newStatus}"`);
  };

  const handleSavePlanUpdates = async (id: string, updates: Partial<LeadAgendamento>) => {
    await updateLeadDetails(id, updates);
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover este lead do histórico?')) return;
    await deleteLead(id);
    setLeads(prev => prev.filter(l => l.id !== id));
    onShowToast('Lead removido.');
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNome || !newWhatsapp) return;

    await createAgendamento({
      nome: newNome,
      whatsapp: newWhatsapp.replace(/\D/g, ''),
      objetivo: newObjetivo,
      data_preferencia: newData,
      turno_preferencia: newTurno,
      observacoes: newObs,
      horario: newHorario,
      tipo_atendimento: newTipoAtendimento,
      status: 'Avaliação Agendada',
      plano_interesse: newTipoAtendimento === 'Avaliação' ? 'Avaliação Física Inicial' : 'Personal Presencial VIP'
    });

    setShowAddModal(false);
    setNewNome('');
    setNewWhatsapp('');
    setNewObs('');
    loadLeads();
    onShowToast('Atendimento agendado com sucesso!');
  };

  // Salvar nova meta
  const handleSaveGoal = () => {
    const val = Number(goalInput) || 6000;
    setMonthlyGoal(val);
    localStorage.setItem('biopersonal_monthly_goal', val.toString());
    setIsEditingGoal(false);
    onShowToast('Meta mensal atualizada!');
  };

  /* -------------------------------------------------------------
   * 1. AUTOMAÇÃO INTELIGENTE DE WHATSAPP (TEMPLATES DINÂMICOS)
   * ------------------------------------------------------------*/
  const buildSmartWhatsAppLink = (lead: LeadAgendamento): string => {
    const cleanPhone = lead.whatsapp.replace(/\D/g, '');
    const firstName = lead.nome.trim().split(' ')[0];
    const trainerName = profile.name.split(' ')[0];
    const dateFormatted = lead.data_preferencia ? lead.data_preferencia.split('-').reverse().join('/') : '';
    const planName = lead.plano_interesse || 'Consultoria';

    let msg = '';

    if (lead.status === 'Novo Lead') {
      msg = `Olá, ${firstName}! Aqui é o ${trainerName}. Recebi seu contato pelo meu site com objetivo de ${lead.objetivo}. Vi que tem preferência pelo período da ${lead.turno_preferencia}. Bora alinhar os detalhes da sua primeira sessão?`;
    } else if (lead.status === 'Contato Feito') {
      msg = `Olá, ${firstName}! Aqui é o ${trainerName}. Passando para saber se conseguiu dar uma olhada na proposta que conversamos e se ficou alguma dúvida sobre os treinos!`;
    } else if (lead.status === 'Avaliação Agendada') {
      msg = `Fala, ${firstName}! Tudo certo para nossa avaliação no dia ${dateFormatted} (${lead.turno_preferencia})? Me confirme aqui para eu reservar seu horário na agenda!`;
    } else if (lead.status === 'Convertido') {
      const renewal = getRenewalAlert(lead);
      if (renewal && renewal.isExpired) {
        msg = `Olá, ${firstName}! Seu plano de ${planName} venceu há ${Math.abs(renewal.daysLeft)} dias. Vamos renovar hoje para continuarmos firmes na sua evolução?`;
      } else if (renewal && renewal.isNearExpiration) {
        msg = `Olá, ${firstName}! Seu plano de ${planName} vence em ${renewal.daysLeft} dias. Vamos renovar para mantermos o foco nos seus resultados?`;
      } else {
        msg = `Fala, ${firstName}! Como estão os treinos dessa semana? Passando para checar se está tudo bem com sua planilha e cargas!`;
      }
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  /* -------------------------------------------------------------
   * 2. SISTEMA DE ALERTAS & CONTROLE DE VENCIMENTO / RENOVAÇÃO
   * ------------------------------------------------------------*/
  // Alerta de Lead Esquecido (> 48h sem contato em Novos ou Contato Feito)
  const getForgottenLeadAlert = (lead: LeadAgendamento) => {
    if (lead.status !== 'Novo Lead' && lead.status !== 'Contato Feito') return null;
    const refDate = lead.updated_at ? new Date(lead.updated_at).getTime() : new Date(lead.created_at).getTime();
    const diffHours = (Date.now() - refDate) / (1000 * 60 * 60);

    if (diffHours >= 48) {
      const days = Math.floor(diffHours / 24);
      return {
        isForgotten: true,
        days,
        label: `⏳ Sem contato há ${days} dia${days > 1 ? 's' : ''}`
      };
    }
    return null;
  };

  // Alerta de Renovação para Alunos Convertidos
  const getRenewalAlert = (lead: LeadAgendamento) => {
    if (lead.status !== 'Convertido' || !lead.data_vencimento) return null;
    const venc = new Date(lead.data_vencimento + 'T23:59:59').getTime();
    const diffDays = Math.ceil((venc - Date.now()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        isExpired: true,
        isNearExpiration: true,
        daysLeft: diffDays,
        label: `🚨 Vencido há ${Math.abs(diffDays)} dia${Math.abs(diffDays) > 1 ? 's' : ''}`
      };
    } else if (diffDays <= 5) {
      return {
        isExpired: false,
        isNearExpiration: true,
        daysLeft: diffDays,
        label: `⚠️ Vence em ${diffDays} dia${diffDays > 1 ? 's' : ''}`
      };
    }
    return {
      isExpired: false,
      isNearExpiration: false,
      daysLeft: diffDays,
      label: `Vence em ${diffDays} dias`
    };
  };

  /* -------------------------------------------------------------
   * 3. FILTRAGEM & SEGMENTAÇÃO
   * ------------------------------------------------------------*/
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      // Busca textual
      const matchesSearch =
        l.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.whatsapp.includes(searchQuery) ||
        l.objetivo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.plano_interesse && l.plano_interesse.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filtro por objetivo
      const matchesGoal = filterGoal === 'all' || l.objetivo === filterGoal;

      // Filtro Apenas Urgentes / Alertas
      let matchesUrgent = true;
      if (filterOnlyUrgent) {
        const forgotten = getForgottenLeadAlert(l);
        const renewal = getRenewalAlert(l);
        matchesUrgent = Boolean(forgotten || (renewal && renewal.isNearExpiration));
      }

      return matchesSearch && matchesGoal && matchesUrgent;
    });
  }, [leads, searchQuery, filterGoal, filterOnlyUrgent]);

  /* -------------------------------------------------------------
   * 4. MINI METRO DE FATURAMENTO & MÉTRICAS
   * ------------------------------------------------------------*/
  const totalLeads = leads.length;
  const countNovos = leads.filter(l => l.status === 'Novo Lead').length;
  const countAgendados = leads.filter(l => l.status === 'Avaliação Agendada').length;
  const countConvertidos = leads.filter(l => l.status === 'Convertido').length;
  
  // Total faturado no mês (soma dos valores dos alunos convertidos ativos)
  const currentBilled = useMemo(() => {
    return leads
      .filter(l => l.status === 'Convertido')
      .reduce((sum, l) => sum + (Number(l.plano_valor) || 0), 0);
  }, [leads]);

  const percentageOfGoal = monthlyGoal > 0 ? Math.min(100, Math.round((currentBilled / monthlyGoal) * 100)) : 0;

  // Sincroniza scroll horizontal no mobile ao mudar de aba
  const handleMobileTabClick = (status: LeadStatus) => {
    setActiveMobileTab(status);
    if (kanbanScrollRef.current) {
      const colIndex = STATUS_COLUMNS.findIndex(c => c.id === status);
      const colWidth = kanbanScrollRef.current.offsetWidth * 0.88;
      kanbanScrollRef.current.scrollTo({
        left: colIndex * colWidth,
        behavior: 'smooth'
      });
    }
  };

  // Se não autenticado, exibe tela de login / PIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#08090C]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm glass-modal rounded-3xl p-7 text-center border border-white/15 shadow-2xl"
        >
          <div className="inline-flex p-3 rounded-2xl bg-brand-500/10 text-brand-400 mb-4 border border-brand-500/30">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-white">Painel do Treinador</h2>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            Acesso exclusivo ao Mini-CRM e gestão de renovação.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 text-left mb-1.5">
                Digite o PIN de Acesso (Padrão: 1234)
              </label>
              <input
                type="password"
                maxLength={8}
                autoFocus
                placeholder="••••"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                className="w-full text-center text-xl tracking-widest px-4 py-3 rounded-xl glass-input font-mono"
              />
              {pinError && (
                <p className="text-rose-400 text-xs mt-1.5 font-medium">
                  PIN incorreto. Tente "1234" ou configure VITE_ADMIN_PIN.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-md shadow-brand-500/30 cursor-pointer"
            >
              Acessar Painel
            </button>
          </form>

          <button
            onClick={onExit}
            className="mt-4 min-h-[44px] text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 w-full"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Biosite</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090C] text-slate-100 p-3 sm:p-6 lg:p-8 selection:bg-brand-500 selection:text-white pb-20">
      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
            title="Voltar ao Biosite"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-white">
                Mini-CRM de Agendamentos & Alunos
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                PRO FIT
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Profissional: <strong className="text-slate-200">{profile.name}</strong> • {profile.cref}
            </p>
          </div>
        </div>

        {/* Status Supabase & Ações Rápidas do Cabeçalho */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              supabaseActive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{supabaseActive ? 'Supabase Conectado' : 'Modo Standalone (Local)'}</span>
            <span className="sm:hidden">{supabaseActive ? 'Nuvem' : 'Local'}</span>
          </div>

          <button
            onClick={loadLeads}
            disabled={isLoading}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            title="Recarregar dados"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-brand-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Novo Lead</span>
          </button>
        </div>
      </header>

      {/* 4. MINI METRO DE FATURAMENTO & CARDS DE ESTATÍSTICAS */}
      <section className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 my-5">
        {/* Card 1: Mini Metro de Faturamento & Meta Mensal */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-2 p-4 rounded-2xl glass-card border border-brand-500/30 shadow-[0_0_25px_rgba(255,122,0,0.12)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-brand-400" />
                Faturamento & Meta Mensal
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  R$ {currentBilled.toLocaleString('pt-BR')}
                </span>
                <span className="text-xs text-slate-400">
                  / R$ {monthlyGoal.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isEditingGoal ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    className="w-20 px-2 py-1 rounded bg-black/60 border border-brand-500 text-xs text-white"
                  />
                  <button
                    onClick={handleSaveGoal}
                    className="p-1 rounded bg-brand-500 text-slate-950 text-xs font-bold"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingGoal(true)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  title="Editar Meta"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Barra de Progresso do Mini Metro */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-[11px] font-bold mb-1">
              <span className="text-slate-400">Progresso da Meta:</span>
              <span className="text-brand-400">{percentageOfGoal}% Atingido</span>
            </div>
            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentageOfGoal}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-brand-500 to-brand-400 shadow-[0_0_12px_rgba(255,122,0,0.6)]"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Novos Leads & Alertas */}
        <div className="p-4 rounded-2xl glass-card border border-white/10 flex flex-col justify-between">
          <div className="text-xs font-semibold text-sky-400 flex items-center justify-between">
            <span>Aguardando Contato</span>
            <Users className="w-4 h-4 text-sky-400/80" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">{countNovos}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {leads.filter(l => Boolean(getForgottenLeadAlert(l))).length > 0 ? (
              <span className="text-rose-400 font-bold">
                ⚠️ {leads.filter(l => Boolean(getForgottenLeadAlert(l))).length} esquecidos (&gt;48h)
              </span>
            ) : (
              'Todos respondidos em dia'
            )}
          </div>
        </div>

        {/* Card 3: Alunos Ativos & Renovações */}
        <div className="p-4 rounded-2xl glass-card border border-white/10 flex flex-col justify-between">
          <div className="text-xs font-semibold text-emerald-400 flex items-center justify-between">
            <span>Alunos Ativos</span>
            <CreditCard className="w-4 h-4 text-emerald-400/80" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-1">{countConvertidos}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {leads.filter(l => {
              const ren = getRenewalAlert(l);
              return ren && ren.isNearExpiration;
            }).length > 0 ? (
              <span className="text-amber-400 font-bold">
                ⚡ {leads.filter(l => {
                  const ren = getRenewalAlert(l);
                  return ren && ren.isNearExpiration;
                }).length} vencendo nesta semana
              </span>
            ) : (
              'Planos em dia'
            )}
          </div>
        </div>
      </section>

      {/* 3. BARRA DE AÇÕES RÁPIDAS & SEGMENTAÇÃO PARA LISTA DE TRANSMISSÃO */}
      <section className="max-w-7xl mx-auto glass-card rounded-2xl p-3 sm:p-4 mb-5 border border-white/10 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Campo de Busca & Filtro de Segmentação */}
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome, whats, objetivo ou plano..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>

            {/* Segmentar por Objetivo */}
            <select
              value={filterGoal}
              onChange={(e) => setFilterGoal(e.target.value)}
              className="px-3 py-2.5 rounded-xl glass-input text-xs font-semibold text-slate-200"
            >
              <option value="all" className="bg-slate-900">Todos os Objetivos</option>
              <option value="Emagrecimento" className="bg-slate-900">🔥 Emagrecimento</option>
              <option value="Hipertrofia" className="bg-slate-900">💪 Hipertrofia</option>
              <option value="Saúde & Longevidade" className="bg-slate-900">🌱 Saúde & Postura</option>
              <option value="Condicionamento Físico" className="bg-slate-900">⚡ Condicionamento</option>
            </select>

            {/* Toggle de Alertas Urgentes */}
            <button
              onClick={() => setFilterOnlyUrgent(!filterOnlyUrgent)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                filterOnlyUrgent
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md shadow-rose-950'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${filterOnlyUrgent ? 'text-rose-400' : 'text-amber-400'}`} />
              <span>Apenas Urgentes / Alertas</span>
            </button>
          </div>

          {/* Botões de Ação para Transmissão & Exportação */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            {/* Botão Copiar Mensagem de Reativação */}
            <button
              onClick={() => {
                setSelectedLeadForTemplates(null);
                setShowTemplatesModal(true);
              }}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copiar mensagens de reativação para WhatsApp"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scripts de Reativação</span>
            </button>

            {/* Dropdown / Botão Exportar Contatos */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar ({filteredLeads.length})</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 top-12 w-64 glass-modal rounded-2xl p-2 z-30 shadow-2xl border border-white/15 text-xs space-y-1">
                  <button
                    onClick={() => {
                      exportLeadsToVCard(filteredLeads);
                      setShowExportMenu(false);
                      onShowToast('Arquivo vCard (.vcf) gerado com tags de Lista de Transmissão!');
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <Contact className="w-4 h-4 text-brand-400" />
                    <div>
                      <div className="font-bold text-white">vCard para Celular (.vcf)</div>
                      <div className="text-[10px] text-slate-400">Salva com tag [Lead - 2026] no WhatsApp</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      exportLeadsToCSV(filteredLeads);
                      setShowExportMenu(false);
                      onShowToast('Planilha CSV gerada com sucesso!');
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold text-white">Planilha Excel / CSV</div>
                      <div className="text-[10px] text-slate-400">Exporta todos os dados e datas</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Alternador Kanban / Tabela / Agenda */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => setViewMode('kanban')}
                className={`min-h-[38px] px-2.5 sm:px-3 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold ${
                  viewMode === 'kanban' ? 'bg-brand-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
                title="Modo Kanban"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`min-h-[38px] px-2.5 sm:px-3 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold ${
                  viewMode === 'table' ? 'bg-brand-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
                title="Modo Tabela"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Tabela</span>
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`min-h-[38px] px-2.5 sm:px-3 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold ${
                  viewMode === 'agenda' ? 'bg-brand-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
                title="Agenda de Atendimentos"
              >
                <CalendarDays className="w-4 h-4" />
                <span className="hidden sm:inline">Agenda</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. OTIMIZAÇÃO MOBILE-FIRST: ABAS SUPERIORES DESLIZANTES (Apenas no Kanban) */}
      {viewMode === 'kanban' && (
        <div className="md:hidden max-w-7xl mx-auto mb-4 overflow-x-auto">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 min-w-max">
            {STATUS_COLUMNS.map((col) => {
              const count = filteredLeads.filter(l => l.status === col.id).length;
              const isSelected = activeMobileTab === col.id;

              return (
                <button
                  key={col.id}
                  onClick={() => handleMobileTabClick(col.id)}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-brand-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{col.shortLabel}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-slate-950 text-white' : 'bg-white/10 text-slate-300'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* QUADRO KANBAN, TABELA OU AGENDA */}
      <main className="max-w-7xl mx-auto">
        {viewMode === 'agenda' ? (
          <ScheduleView
            leads={leads}
            profile={profile}
            onOpenNewBookingWithDate={(date, hour) => {
              setNewData(date);
              if (hour) setNewHorario(hour);
              setShowAddModal(true);
            }}
            onShowToast={onShowToast}
          />
        ) : viewMode === 'kanban' ? (
          /* Container Kanban: Flex horizontal snap no mobile & Grid 4 colunas no Desktop */
          <div
            ref={kanbanScrollRef}
            className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 pr-4"
          >
            {STATUS_COLUMNS.map((col) => {
              const columnLeads = filteredLeads.filter(l => l.status === col.id);

              return (
                <div
                  key={col.id}
                  className="w-[88vw] sm:w-[340px] md:w-auto shrink-0 md:shrink rounded-2xl glass-card p-3 sm:p-4 border border-white/10 flex flex-col min-h-[500px] snap-center"
                >
                  {/* Cabeçalho da Coluna */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-white">{col.label}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
                        {columnLeads.length}
                      </span>
                    </div>
                  </div>

                  {/* Lista de Cards da Coluna */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[72vh] pr-1">
                    {columnLeads.length === 0 ? (
                      <div className="h-36 flex flex-col items-center justify-center text-xs text-slate-500 border border-dashed border-white/10 rounded-2xl p-4 text-center">
                        <Users className="w-5 h-5 text-slate-600 mb-1" />
                        <span>Nenhum contato nesta etapa</span>
                      </div>
                    ) : (
                      columnLeads.map((lead) => {
                        const forgottenAlert = getForgottenLeadAlert(lead);
                        const renewalAlert = getRenewalAlert(lead);

                        return (
                          <div
                            key={lead.id}
                            className={`p-3.5 rounded-2xl bg-white/5 border transition-all shadow-md group relative ${
                              forgottenAlert
                                ? 'border-rose-500/40 hover:border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                                : renewalAlert && renewalAlert.isNearExpiration
                                ? 'border-amber-500/40 hover:border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                                : 'border-white/10 hover:border-brand-500/40'
                            }`}
                          >
                            {/* Badges de Alerta no Topo do Card */}
                            {forgottenAlert && (
                              <div className="mb-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold animate-pulse">
                                <span>{forgottenAlert.label}</span>
                              </div>
                            )}

                            {renewalAlert && (
                              <div
                                className={`mb-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  renewalAlert.isExpired
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                                    : renewalAlert.isNearExpiration
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                }`}
                              >
                                <span>{renewalAlert.label}</span>
                              </div>
                            )}

                            {/* Nome e Ações Rápidas */}
                            <div className="flex items-start justify-between gap-1 mb-2">
                              <div>
                                <h4 className="font-bold text-sm text-white group-hover:text-brand-400 transition-colors">
                                  {lead.nome}
                                </h4>
                                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                                  {lead.whatsapp}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                {lead.status === 'Convertido' && (
                                  <button
                                    onClick={() => setLeadForPlanEdit(lead)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-white/10 transition-colors"
                                    title="Editar Plano / Vencimento"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(lead.id)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/10 transition-colors"
                                  title="Excluir Lead"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Tags de Objetivo e Plano */}
                            <div className="flex flex-wrap gap-1 mb-2.5">
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300">
                                {lead.objetivo}
                              </span>
                              {lead.plano_interesse && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/10 text-slate-300">
                                  {lead.plano_interesse}
                                </span>
                              )}
                              {lead.plano_tipo && lead.status === 'Convertido' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                                  {lead.plano_tipo} (R$ {lead.plano_valor || 0})
                                </span>
                              )}
                            </div>

                            {/* Detalhes de Data / Vencimento */}
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mb-3">
                              {lead.status === 'Convertido' && lead.data_vencimento ? (
                                <span className="flex items-center gap-1 font-semibold text-slate-300">
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  Venc: {lead.data_vencimento.split('-').reverse().join('/')}
                                </span>
                              ) : (
                                <>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-slate-500" />
                                    {lead.data_preferencia ? lead.data_preferencia.split('-').reverse().join('/') : 'A definir'}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-500" />
                                    {lead.turno_preferencia}
                                  </span>
                                </>
                              )}
                            </div>

                            {lead.observacoes && (
                              <p className="text-[10px] text-slate-400 italic bg-black/30 p-2 rounded-lg mb-3 line-clamp-2">
                                "{lead.observacoes}"
                              </p>
                            )}

                            {/* 1. BOTÃO INTELIGENTE DE WHATSAPP (com mensagem pré-formatada específica para o estágio) */}
                            <div className="space-y-1.5 mb-2">
                              <a
                                href={buildSmartWhatsAppLink(lead)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-full min-h-[44px] px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                  lead.status === 'Convertido' && renewalAlert && renewalAlert.isNearExpiration
                                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/25'
                                    : 'bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40'
                                }`}
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span>
                                  {lead.status === 'Convertido' && renewalAlert && renewalAlert.isNearExpiration
                                    ? 'Cobrar Renovação no Whats'
                                    : 'Chamar no WhatsApp'}
                                </span>
                              </a>

                              {/* Ação rápida para abrir modal de scripts com esse lead pré-selecionado */}
                              <button
                                onClick={() => {
                                  setSelectedLeadForTemplates(lead);
                                  setShowTemplatesModal(true);
                                }}
                                className="w-full py-1 text-[10px] text-slate-400 hover:text-brand-400 transition-colors flex items-center justify-center gap-1"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Outros Scripts de Conversão</span>
                              </button>
                            </div>

                            {/* Seletor rápido de Status */}
                            <div className="flex items-center justify-between pt-2 border-t border-white/10">
                              <span className="text-[10px] text-slate-500">Mover para:</span>
                              <select
                                value={lead.status}
                                onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                                className="text-[10px] font-bold bg-white/10 text-slate-200 rounded px-2 py-1 border border-white/10 focus:outline-none"
                              >
                                {STATUS_COLUMNS.map(s => (
                                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* MODO TABELA */
          <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Lead / Aluno</th>
                    <th className="p-3.5">WhatsApp</th>
                    <th className="p-3.5">Objetivo</th>
                    <th className="p-3.5">Plano / Valor</th>
                    <th className="p-3.5">Data / Vencimento</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Ação Direta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLeads.map((lead) => {
                    const renewal = getRenewalAlert(lead);
                    return (
                      <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-white text-sm">{lead.nome}</div>
                          <div className="text-[10px] text-slate-500">
                            Cadastrado em {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-300">{lead.whatsapp}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-semibold text-[11px]">
                            {lead.objetivo}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-white">{lead.plano_interesse || '-'}</div>
                          {lead.plano_valor ? (
                            <div className="text-[10px] text-emerald-400 font-bold">R$ {lead.plano_valor}</div>
                          ) : null}
                        </td>
                        <td className="p-3.5">
                          {lead.status === 'Convertido' && lead.data_vencimento ? (
                            <div>
                              <div className="font-bold text-slate-200">
                                {lead.data_vencimento.split('-').reverse().join('/')}
                              </div>
                              {renewal && (
                                <div className={`text-[10px] font-bold ${renewal.isNearExpiration ? 'text-amber-400' : 'text-slate-400'}`}>
                                  {renewal.label}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-slate-300">
                              {lead.data_preferencia ? lead.data_preferencia.split('-').reverse().join('/') : '-'} ({lead.turno_preferencia})
                            </div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                            className="text-xs font-semibold bg-white/10 text-slate-200 rounded px-2 py-1 border border-white/10"
                          >
                            {STATUS_COLUMNS.map(s => (
                              <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {lead.status === 'Convertido' && (
                              <button
                                onClick={() => setLeadForPlanEdit(lead)}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                                title="Editar Plano"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <a
                              href={buildSmartWhatsAppLink(lead)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-1.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-xs transition-colors flex items-center gap-1"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                            <button
                              onClick={() => handleDelete(lead.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Adicionar Lead Manualmente */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-modal rounded-3xl p-6 border border-white/15">
            <h3 className="text-lg font-black text-white mb-4">Adicionar Lead Manualmente</h3>
            <form onSubmit={handleCreateLead} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do aluno"
                  value={newNome}
                  onChange={(e) => setNewNome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  required
                  placeholder="11999998888"
                  value={newWhatsapp}
                  onChange={(e) => setNewWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Objetivo</label>
                <select
                  value={newObjetivo}
                  onChange={(e) => setNewObjetivo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                >
                  <option value="Emagrecimento" className="bg-slate-900">Emagrecimento</option>
                  <option value="Hipertrofia" className="bg-slate-900">Hipertrofia</option>
                  <option value="Saúde & Longevidade" className="bg-slate-900">Saúde & Longevidade</option>
                  <option value="Condicionamento Físico" className="bg-slate-900">Condicionamento Físico</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Sessão</label>
                  <select
                    value={newTipoAtendimento}
                    onChange={(e) => setNewTipoAtendimento(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    <option value="Presencial" className="bg-slate-900">🏋️‍♂️ Presencial</option>
                    <option value="Online" className="bg-slate-900">💻 Online</option>
                    <option value="Avaliação" className="bg-slate-900">📋 Avaliação</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Horário Marcado</label>
                  <select
                    value={newHorario}
                    onChange={(e) => setNewHorario(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono font-bold text-brand-400"
                  >
                    {['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map(h => (
                      <option key={h} value={h} className="bg-slate-900 text-white font-mono">{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Data</label>
                  <input
                    type="date"
                    value={newData}
                    onChange={(e) => setNewData(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Turno</label>
                  <select
                    value={newTurno}
                    onChange={(e) => setNewTurno(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    <option value="Manhã" className="bg-slate-900">Manhã</option>
                    <option value="Tarde" className="bg-slate-900">Tarde</option>
                    <option value="Noite" className="bg-slate-900">Noite</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Observações</label>
                <textarea
                  rows={2}
                  placeholder="Informações adicionais..."
                  value={newObs}
                  onChange={(e) => setNewObs(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="min-h-[44px] flex-1 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] flex-1 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-black text-xs uppercase tracking-wider"
                >
                  Salvar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Scripts de Reativação */}
      <ReactivationTemplatesModal
        isOpen={showTemplatesModal}
        onClose={() => {
          setShowTemplatesModal(false);
          setSelectedLeadForTemplates(null);
        }}
        profile={profile}
        selectedLead={selectedLeadForTemplates}
        onShowToast={onShowToast}
      />

      {/* Modal: Editar Plano e Vencimento de Aluno */}
      <StudentPlanEditModal
        isOpen={Boolean(leadForPlanEdit)}
        onClose={() => setLeadForPlanEdit(null)}
        lead={leadForPlanEdit}
        onSave={handleSavePlanUpdates}
        onShowToast={onShowToast}
      />
    </div>
  );
};
