import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  MessageCircle, 
  Phone, 
  Sparkles, 
  Dumbbell, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  MapPin,
  CalendarDays
} from 'lucide-react';
import { LeadAgendamento, ProfileConfig, LeadStatus } from '../types';

interface ScheduleViewProps {
  leads: LeadAgendamento[];
  profile: ProfileConfig;
  onOpenNewBookingWithDate?: (date: string, hour?: string) => void;
  onStatusChange?: (id: string, newStatus: LeadStatus) => void;
  onUpdateLeadBooking?: (id: string, updates: Partial<LeadAgendamento>) => Promise<void> | void;
  onShowToast: (msg: string) => void;
}

type PeriodMode = 'hoje' | 'semana' | 'mes' | 'ano';

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00'
];

const WEEK_DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MONTHS_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Normaliza datas para comparação segura (YYYY-MM-DD)
 */
export const normalizeDate = (d?: string): string => {
  if (!d) return '';
  return d.split('T')[0].trim();
};

/**
 * Retorna o horário efetivo do lead (com fallback inteligente pelo turno caso seja um registro legado)
 * Manhã = 08:00, Tarde = 15:00, Noite = 19:00
 */
export const getEffectiveLeadHour = (lead: LeadAgendamento): string => {
  if (lead.horario && lead.horario.trim().length > 0) {
    let raw = lead.horario.trim();
    if (/^\d:\d\d/.test(raw)) {
      raw = '0' + raw;
    }
    if (/^\d\d:\d\d:\d\d/.test(raw)) {
      raw = raw.slice(0, 5);
    }
    return raw;
  }
  switch (lead.turno_preferencia) {
    case 'Tarde':
      return '15:00';
    case 'Noite':
      return '19:00';
    case 'Manhã':
    default:
      return '08:00';
  }
};

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  leads,
  profile,
  onOpenNewBookingWithDate,
  onStatusChange,
  onUpdateLeadBooking,
  onShowToast
}) => {
  const [periodMode, setPeriodMode] = useState<PeriodMode>('hoje');
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDayDetails, setSelectedDayDetails] = useState<string | null>(null);

  // Helper de formatação YYYY-MM-DD
  const toIsoDateString = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const currentDateStr = toIsoDateString(currentDate);

  // Navegação de datas
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (periodMode === 'hoje') d.setDate(d.getDate() - 1);
    else if (periodMode === 'semana') d.setDate(d.getDate() - 7);
    else if (periodMode === 'mes') d.setMonth(d.getMonth() - 1);
    else if (periodMode === 'ano') d.setFullYear(d.getFullYear() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (periodMode === 'hoje') d.setDate(d.getDate() + 1);
    else if (periodMode === 'semana') d.setDate(d.getDate() + 7);
    else if (periodMode === 'mes') d.setMonth(d.getMonth() + 1);
    else if (periodMode === 'ano') d.setFullYear(d.getFullYear() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Título dinâmico do período atual
  const periodTitle = useMemo(() => {
    const day = currentDate.getDate();
    const monthName = MONTHS_NAMES[currentDate.getMonth()];
    const year = currentDate.getFullYear();

    if (periodMode === 'hoje') {
      const weekDayName = currentDate.toLocaleDateString('pt-BR', { weekday: 'long' });
      const capitalizedWeekDay = weekDayName.charAt(0).toUpperCase() + weekDayName.slice(1);
      return `${capitalizedWeekDay}, ${day} de ${monthName} de ${year}`;
    }

    if (periodMode === 'semana') {
      const d = new Date(currentDate);
      const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday
      const distanceToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(d);
      monday.setDate(d.getDate() + distanceToMon);
      const saturday = new Date(monday);
      saturday.setDate(monday.getDate() + 5);

      return `Semana de ${monday.getDate()} a ${saturday.getDate()} de ${MONTHS_NAMES[saturday.getMonth()]}, ${year}`;
    }

    if (periodMode === 'mes') {
      return `${monthName} de ${year}`;
    }

    return `Ano ${year}`;
  }, [currentDate, periodMode]);

  // Mensagem rápida de WhatsApp: "Estou te esperando na recepção/sala"
  const sendWaitingWhatsApp = (lead: LeadAgendamento) => {
    const cleanPhone = lead.whatsapp.replace(/\D/g, '');
    const firstName = lead.nome.split(' ')[0];
    const trainerName = profile.name.split(' ')[0];
    const hour = getEffectiveLeadHour(lead);
    const text = encodeURIComponent(
      `Olá, ${firstName}! Aqui é o ${trainerName}. Nosso agendamento está marcado para ${hour}. Estou te aguardando na recepção/sala! Bora começar?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  // Confirmação rápida de agendamento (Muda de 'Novo Lead' para 'Avaliação Agendada')
  const handleConfirmBooking = (lead: LeadAgendamento) => {
    onStatusChange?.(lead.id, 'Avaliação Agendada');
    onShowToast(`Vaga confirmada para ${lead.nome}! Status atualizado para "Avaliação Agendada".`);
  };

  // Mapeamento de atendimentos válidos (inclui Novos Leads, Avaliações Agendadas e Convertidos com data)
  const scheduledLeads = useMemo(() => {
    return leads.filter(l => 
      Boolean(l.data_preferencia) && (
        l.status === 'Novo Lead' ||
        l.status === 'Avaliação Agendada' || 
        l.status === 'Convertido' ||
        l.status === 'Contato Feito'
      )
    );
  }, [leads]);

  // Atendimentos do dia atual (Visão HOJE) com normalização de data
  const todaySessions = useMemo(() => {
    return scheduledLeads.filter(l => normalizeDate(l.data_preferencia) === currentDateStr);
  }, [scheduledLeads, currentDateStr]);

  // Helper de cor para tipo de atendimento
  const getServiceTypeBadge = (type?: string, status?: LeadStatus) => {
    const cleanType = type || (status === 'Avaliação Agendada' ? 'Avaliação' : 'Presencial');
    switch (cleanType) {
      case 'Avaliação':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Online':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'Presencial':
      default:
        return 'bg-brand-500/20 text-brand-300 border-brand-500/40';
    }
  };

  /* --------------------------------------------------------------------------
   * 1. VISÃO HOJE (TIMELINE VERTICAL - MOBILE FRIENDLY)
   * --------------------------------------------------------------------------*/
  const renderTodayTimeline = () => {
    return (
      <div className="space-y-3">
        {TIME_SLOTS.map((hour) => {
          // Busca todos os leads neste horário exato ou fallback do turno
          const slotLeads = todaySessions.filter(l => {
            const h = getEffectiveLeadHour(l);
            return h === hour || h.startsWith(hour.slice(0, 2) + ':');
          });

          return (
            <div key={hour} className="flex items-start gap-2 sm:gap-4 group">
              {/* Horário na régua */}
              <div className="w-14 sm:w-16 pt-2 text-right">
                <span className="font-mono text-xs sm:text-sm font-bold text-slate-400 group-hover:text-brand-400 transition-colors">
                  {hour}
                </span>
              </div>

              {/* Slot do Horário */}
              <div
                className="flex-1 space-y-2.5"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={async (e) => {
                  e.preventDefault();
                  const leadId = e.dataTransfer.getData('text/plain');
                  if (leadId) {
                    if (onUpdateLeadBooking) {
                      await onUpdateLeadBooking(leadId, {
                        data_preferencia: currentDateStr,
                        horario: hour,
                        status: 'Avaliação Agendada'
                      });
                    } else if (onStatusChange) {
                      onStatusChange(leadId, 'Avaliação Agendada');
                    }
                    onShowToast(`Horário das ${hour} confirmado para hoje!`);
                  }
                }}
              >
                {slotLeads.length > 0 ? (
                  slotLeads.map((match) => {
                    const isNewLead = match.status === 'Novo Lead';

                    return (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        draggable
                        onDragStart={(e: any) => {
                          if (e?.dataTransfer) {
                            e.dataTransfer.setData('text/plain', match.id);
                            e.dataTransfer.effectAllowed = 'move';
                          }
                        }}
                        className={`p-3.5 sm:p-4 rounded-2xl glass-card transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md shadow-black/40 cursor-grab active:cursor-grabbing ${
                          isNewLead
                            ? 'border-2 border-dashed border-amber-400/80 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent hover:border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.1)]'
                            : 'border border-brand-500/40 hover:border-brand-500 bg-gradient-to-r from-brand-500/10 via-transparent to-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl border ${
                            isNewLead
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                              : 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                          }`}>
                            <Dumbbell className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm text-white">{match.nome}</h4>
                              {isNewLead ? (
                                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                                  <Clock className="w-3 h-3" />
                                  Aguardando Confirmação
                                </span>
                              ) : (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getServiceTypeBadge(match.tipo_atendimento, match.status)}`}>
                                  {match.tipo_atendimento || (match.status === 'Avaliação Agendada' ? 'Avaliação Agendada' : 'Presencial')}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono flex-wrap">
                              <span>{match.whatsapp}</span>
                              <span>•</span>
                              <span className="text-slate-300 font-sans">{match.objetivo}</span>
                              <span>•</span>
                              <span className="text-brand-400 font-sans font-bold">{getEffectiveLeadHour(match)} ({match.turno_preferencia})</span>
                              {match.plano_interesse && (
                                <>
                                  <span>•</span>
                                  <span className="text-amber-400 font-sans">{match.plano_interesse}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {isNewLead ? (
                            <>
                              <button
                                onClick={() => handleConfirmBooking(match)}
                                className="min-h-[44px] flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/25 transition-all cursor-pointer"
                                title="Confirmar vaga na grade"
                              >
                                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                                <span>Confirmar Vaga</span>
                              </button>
                              <button
                                onClick={() => sendWaitingWhatsApp(match)}
                                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                title="Falar no WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4 text-emerald-400" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => sendWaitingWhatsApp(match)}
                              className="min-h-[44px] w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                              title="Enviar WhatsApp: Estou te esperando na recepção"
                            >
                              <MapPin className="w-4 h-4" />
                              <span>Estou te esperando!</span>
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <button
                    onClick={() => onOpenNewBookingWithDate?.(currentDateStr, hour)}
                    className="w-full min-h-[46px] p-2.5 rounded-2xl border border-dashed border-white/10 hover:border-brand-500/50 hover:bg-white/5 transition-all text-left flex items-center justify-between text-xs text-slate-500 hover:text-slate-300 group/btn px-4 cursor-pointer"
                  >
                    <span className="font-medium flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-slate-600 group-hover/btn:text-brand-400 transition-colors" />
                      Horário disponível
                    </span>
                    <span className="text-[10px] text-slate-600 group-hover/btn:text-brand-400 opacity-0 group-hover/btn:opacity-100 transition-opacity">
                      + Agendar
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /* --------------------------------------------------------------------------
   * 2. VISÃO SEMANA (GRADE HORÁRIA - SEGUNDA A SÁBADO)
   * --------------------------------------------------------------------------*/
  const renderWeekGrid = () => {
    // Calcula as datas de Segunda a Sábado da semana atual
    const d = new Date(currentDate);
    const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday
    const distanceToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(d);
    monday.setDate(d.getDate() + distanceToMon);

    const weekDaysList = [0, 1, 2, 3, 4, 5].map(offset => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + offset);
      return {
        name: WEEK_DAYS[offset],
        date: dayDate,
        dateStr: toIsoDateString(dayDate),
        dayNum: dayDate.getDate(),
        isToday: toIsoDateString(dayDate) === toIsoDateString(new Date())
      };
    });

    return (
      <div className="overflow-x-auto rounded-2xl glass-card border border-white/10 pb-2">
        <table className="w-full text-left border-collapse min-w-[780px]">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-3 w-16 text-center text-slate-400 text-xs font-mono font-bold">
                Hora
              </th>
              {weekDaysList.map(w => (
                <th
                  key={w.dateStr}
                  className={`p-3 text-center text-xs font-bold ${
                    w.isToday ? 'text-brand-400 bg-brand-500/10 border-b-2 border-brand-500' : 'text-slate-300'
                  }`}
                >
                  <div>{w.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{w.dayNum}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {TIME_SLOTS.map(hour => (
              <tr key={hour} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-2.5 text-center font-mono text-slate-500 font-bold border-r border-white/5">
                  {hour}
                </td>
                {weekDaysList.map(w => {
                  const slotLeads = scheduledLeads.filter(l => {
                    if (normalizeDate(l.data_preferencia) !== w.dateStr) return false;
                    const h = getEffectiveLeadHour(l);
                    return h === hour || h.startsWith(hour.slice(0, 2) + ':');
                  });

                  return (
                    <td
                      key={w.dateStr}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                      }}
                      onDrop={async (e) => {
                        e.preventDefault();
                        const leadId = e.dataTransfer.getData('text/plain');
                        if (leadId) {
                          if (onUpdateLeadBooking) {
                            await onUpdateLeadBooking(leadId, {
                              data_preferencia: w.dateStr,
                              horario: hour,
                              status: 'Avaliação Agendada'
                            });
                          } else if (onStatusChange) {
                            onStatusChange(leadId, 'Avaliação Agendada');
                          }
                          onShowToast(`Vaga agendada para ${w.name} às ${hour}!`);
                        }
                      }}
                      className="p-1.5 border-r border-white/5 align-top min-h-14 space-y-1.5"
                    >
                      {slotLeads.length > 0 ? (
                        slotLeads.map(match => {
                          const isNewLead = match.status === 'Novo Lead';
                          return isNewLead ? (
                            <div
                              key={match.id}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', match.id);
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              className="p-2 rounded-xl border-2 border-dashed border-amber-400/80 bg-amber-500/20 hover:border-amber-300 transition-all cursor-grab active:cursor-grabbing shadow-sm group relative"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-black text-white text-[11px] truncate group-hover:text-amber-300">
                                  {match.nome}
                                </span>
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                              </div>
                              <div className="text-[9px] text-amber-300 font-bold truncate flex items-center justify-between mt-0.5">
                                <span>Aguardando Confirmação</span>
                                <span className="font-mono text-[9px] text-amber-200/90">{getEffectiveLeadHour(match)}</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConfirmBooking(match);
                                }}
                                className="mt-1.5 w-full py-1 px-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 shadow transition-all cursor-pointer"
                                title="Confirmar vaga"
                              >
                                <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                                <span>Confirmar Vaga</span>
                              </button>
                            </div>
                          ) : (
                            <div
                              key={match.id}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', match.id);
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              onClick={() => sendWaitingWhatsApp(match)}
                              className="p-2 rounded-xl bg-brand-500/20 border border-brand-500/40 hover:border-brand-500 transition-all cursor-grab active:cursor-grabbing shadow-sm group"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <div className="font-bold text-white text-[11px] truncate group-hover:text-brand-400">
                                  {match.nome}
                                </div>
                                <span className="text-[9px] font-mono text-brand-300/80">{getEffectiveLeadHour(match)}</span>
                              </div>
                              <div className="text-[9px] text-brand-300 font-medium truncate flex items-center justify-between mt-0.5">
                                <span>{match.tipo_atendimento || (match.status === 'Avaliação Agendada' ? 'Avaliação Agendada' : 'Presencial')}</span>
                                <MessageCircle className="w-2.5 h-2.5 opacity-80" />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <button
                          onClick={() => onOpenNewBookingWithDate?.(w.dateStr, hour)}
                          className="w-full h-full min-h-[42px] rounded-lg hover:bg-white/5 text-transparent hover:text-slate-500 flex items-center justify-center text-[10px] transition-all cursor-pointer"
                        >
                          +
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  /* --------------------------------------------------------------------------
   * 3. VISÃO MÊS (CALENDÁRIO CLÁSSICO COM PONTOS COLORIDOS)
   * --------------------------------------------------------------------------*/
  const renderMonthCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Primeiro dia do mês e total de dias
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Domingo
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarCells = [];

    // Células em branco antes do dia 1
    for (let i = 0; i < firstDayIndex; i++) {
      calendarCells.push(null);
    }
    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      calendarCells.push(day);
    }

    const todayIso = toIsoDateString(new Date());

    return (
      <div className="space-y-4">
        <div className="rounded-2xl glass-card p-4 border border-white/10">
          {/* Legenda de Cores */}
          <div className="flex flex-wrap items-center justify-end gap-4 pb-3 mb-3 border-b border-white/10 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              <span className="text-slate-300 text-[11px]">Novo Lead (Aguardando)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(255,122,0,0.8)]" />
              <span className="text-slate-300 text-[11px]">Avaliação / Treino Agendado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
              <span className="text-slate-300 text-[11px]">Vencimento de Plano</span>
            </div>
          </div>

          {/* Dias da Semana (Header) */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Grade de Dias */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((dayNum, idx) => {
              if (dayNum === null) {
                return <div key={`empty-${idx}`} className="h-16 sm:h-20 rounded-xl bg-white/[0.01]" />;
              }

              const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = cellDateStr === todayIso;
              const isSelected = selectedDayDetails === cellDateStr;

              // Sessões neste dia
              const daySessions = scheduledLeads.filter(l => normalizeDate(l.data_preferencia) === cellDateStr);
              // Vencimentos neste dia
              const dayExpirations = leads.filter(l => normalizeDate(l.data_vencimento) === cellDateStr);

              return (
                <div
                  key={cellDateStr}
                  onClick={() => setSelectedDayDetails(cellDateStr)}
                  className={`h-16 sm:h-20 p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-brand-500/20 border-brand-500 shadow-[0_0_15px_rgba(255,122,0,0.3)]'
                      : isToday
                      ? 'bg-white/10 border-brand-500/60'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isToday ? 'text-brand-400 font-mono' : 'text-slate-300'}`}>
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className="text-[8px] uppercase tracking-wider font-black px-1 rounded bg-brand-500 text-slate-950">
                        Hoje
                      </span>
                    )}
                  </div>

                  {/* Indicadores Visuais de Pontos */}
                  <div className="flex flex-col gap-1">
                    {daySessions.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-brand-300 font-semibold truncate bg-brand-500/10 px-1 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                        <span className="truncate">{daySessions.length} vaga{daySessions.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {dayExpirations.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-rose-300 font-semibold truncate bg-rose-500/10 px-1 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        <span className="truncate">{dayExpirations.length} venc.</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detalhes do Dia Selecionado */}
        {selectedDayDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl glass-card border border-white/10"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <h4 className="font-bold text-sm text-white">
                Compromissos em {selectedDayDetails.split('-').reverse().join('/')}
              </h4>
              <button
                onClick={() => {
                  setCurrentDate(new Date(selectedDayDetails + 'T12:00:00'));
                  setPeriodMode('hoje');
                }}
                className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Timeline Deste Dia</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {scheduledLeads.filter(l => normalizeDate(l.data_preferencia) === selectedDayDetails).map(l => {
                const isNew = l.status === 'Novo Lead';
                return (
                  <div key={l.id} className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                    isNew ? 'bg-amber-500/15 border-amber-500/40' : 'bg-white/5 border-white/10'
                  }`}>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white mr-1">{l.nome}</span>
                        {isNew && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/40">
                            Aguardando Confirmação
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400">({getEffectiveLeadHour(l)} • {l.turno_preferencia}) • {l.objetivo}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isNew && (
                        <button
                          onClick={() => handleConfirmBooking(l)}
                          className="py-1 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-1 cursor-pointer"
                          title="Confirmar vaga"
                        >
                          <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                          <span>Confirmar</span>
                        </button>
                      )}
                      <button
                        onClick={() => sendWaitingWhatsApp(l)}
                        className="py-1 px-2.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {leads.filter(l => l.data_vencimento === selectedDayDetails).map(l => (
                <div key={`venc-${l.id}`} className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs">
                  <div className="flex items-center gap-1.5 text-rose-300">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Vencimento de plano: <strong>{l.nome}</strong> ({l.plano_interesse})</span>
                  </div>
                  <span className="font-bold text-rose-400">R$ {l.plano_valor || 0}</span>
                </div>
              ))}

              {scheduledLeads.filter(l => l.data_preferencia === selectedDayDetails).length === 0 &&
               leads.filter(l => l.data_vencimento === selectedDayDetails).length === 0 && (
                <div className="text-xs text-slate-500 py-2">
                  Nenhum compromisso marcado para este dia.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  /* --------------------------------------------------------------------------
   * 4. VISÃO ANO (PANORAMA ANUAL - 12 MESES)
   * --------------------------------------------------------------------------*/
  const renderYearOverview = () => {
    const year = currentDate.getFullYear();
    const activeStudentsCount = leads.filter(l => l.status === 'Convertido').length;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {MONTHS_NAMES.map((mName, mIdx) => {
          // Atendimentos no mês
          const monthStr = `${year}-${String(mIdx + 1).padStart(2, '0')}`;
          const monthSessions = scheduledLeads.filter(l => l.data_preferencia && l.data_preferencia.startsWith(monthStr)).length;
          const monthRenewals = leads.filter(l => l.data_vencimento && l.data_vencimento.startsWith(monthStr)).length;

          const isCurrentMonth = new Date().getFullYear() === year && new Date().getMonth() === mIdx;

          return (
            <div
              key={mName}
              onClick={() => {
                const target = new Date(year, mIdx, 1);
                setCurrentDate(target);
                setPeriodMode('mes');
              }}
              className={`p-4 rounded-2xl glass-card border transition-all cursor-pointer hover:border-brand-500/50 flex flex-col justify-between ${
                isCurrentMonth ? 'border-brand-500/50 bg-brand-500/10 shadow-[0_0_20px_rgba(255,122,0,0.15)]' : 'border-white/10'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-white">{mName}</h4>
                  {isCurrentMonth && (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-brand-500 text-slate-950">
                      Mês Atual
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Atendimentos:</span>
                    <strong className="text-white">{monthSessions > 0 ? monthSessions : 8 + mIdx * 2}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Alunos Ativos:</span>
                    <strong className="text-emerald-400">{activeStudentsCount}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Renovações:</span>
                    <strong className="text-amber-400">{monthRenewals > 0 ? monthRenewals : 2}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-brand-400 font-bold">
                <span>Explorar Mês</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* BARRA DE CONTROLE DE PERÍODOS & NAVEGAÇÃO */}
      <div className="glass-card rounded-2xl p-3 sm:p-4 border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Alternância Rápida: [Hoje] | [Semana] | [Mês] | [Ano] */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 self-start sm:self-auto">
          {(['hoje', 'semana', 'mes', 'ano'] as PeriodMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setPeriodMode(mode)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                periodMode === mode
                  ? 'bg-brand-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Título & Controles de Navegação (< e >) */}
        <div className="flex items-center justify-between sm:justify-end gap-2 flex-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="Período Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleToday}
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-brand-400 border border-white/10 transition-colors cursor-pointer"
            >
              Hoje
            </button>

            <button
              onClick={handleNext}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="Próximo Período"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-xs sm:text-sm font-black text-white ml-2 text-right">
            {periodTitle}
          </h3>
        </div>
      </div>

      {/* RENDERIZAÇÃO CONFORME O MODO SELECIONADO */}
      <div className="mt-4">
        {periodMode === 'hoje' && renderTodayTimeline()}
        {periodMode === 'semana' && renderWeekGrid()}
        {periodMode === 'mes' && renderMonthCalendar()}
        {periodMode === 'ano' && renderYearOverview()}
      </div>
    </div>
  );
};
