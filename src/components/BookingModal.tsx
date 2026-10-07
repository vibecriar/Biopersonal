import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Target, Phone, User, CheckCircle2, ArrowRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProfileConfig, LeadAgendamento } from '../types';
import { createAgendamento } from '../lib/supabase';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileConfig;
  initialService?: string;
  onShowToast: (msg: string) => void;
}

const OBJECTIVES = [
  { id: 'Emagrecimento', label: '🔥 Emagrecimento', desc: 'Perder gordura & secar' },
  { id: 'Hipertrofia', label: '💪 Hipertrofia', desc: 'Ganho de massa muscular' },
  { id: 'Saúde & Longevidade', label: '🌱 Saúde & Postura', desc: 'Qualidade de vida & sem dores' },
  { id: 'Condicionamento Físico', label: '⚡ Condicionamento', desc: 'Resistência & performance' },
];

const SHIFTS: Array<'Manhã' | 'Tarde' | 'Noite'> = ['Manhã', 'Tarde', 'Noite'];

const DEFAULT_SHIFT_HOURS: Record<'Manhã' | 'Tarde' | 'Noite', string[]> = {
  'Manhã': ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
  'Tarde': ['14:00', '15:00', '16:00', '17:00'],
  'Noite': ['18:00', '19:00', '20:00', '21:00']
};

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  profile,
  initialService,
  onShowToast
}) => {
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [objetivo, setObjetivo] = useState(OBJECTIVES[0].id);
  const [dataPreferencia, setDataPreferencia] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [turnoPreferencia, setTurnoPreferencia] = useState<'Manhã' | 'Tarde' | 'Noite'>('Manhã');
  const [horario, setHorario] = useState<string>('');
  const [observacoes, setObservacoes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<LeadAgendamento | null>(null);
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Obtém a grade dinâmica de horários configurada no Supabase do treinador
  const availableHoursConfig = profile.availableHours || DEFAULT_SHIFT_HOURS;
  const currentShiftHours = availableHoursConfig[turnoPreferencia] || DEFAULT_SHIFT_HOURS[turnoPreferencia] || [];

  // Reseta seleção ao abrir ou trocar de turno
  React.useEffect(() => {
    if (isOpen) {
      setHorario('');
      setSubmittedLead(null);
      setLgpdConsent(false);
    }
  }, [isOpen]);

  const handleSelectShift = (shift: 'Manhã' | 'Tarde' | 'Noite') => {
    setTurnoPreferencia(shift);
    setHorario('');
  };

  // Formatação de telefone brasileiro
  const formatPhone = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    if (raw.length <= 2) return raw;
    if (raw.length <= 7) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(formatPhone(e.target.value));
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF7A00', '#F97316', '#FBBF24', '#FFFFFF']
      });
    } catch {
      // Ignora se indisponível
    }
  };

  const getFormattedWhatsappUrl = (leadData: {
    nome: string;
    whatsapp: string;
    objetivo: string;
    data_preferencia: string;
    turno_preferencia: string;
    horario?: string;
    observacoes?: string;
  }) => {
    const trainerPhone = profile.socialLinks.whatsapp.replace(/\D/g, '');
    const dateFormatted = leadData.data_preferencia.split('-').reverse().join('/');

    const msg = [
      `🏋️‍♂️ *SOLICITAÇÃO DE AGENDAMENTO DE AVALIAÇÃO*`,
      `Olá ${profile.name}! Gostaria de agendar minha avaliação:`,
      ``,
      `👤 *Nome:* ${leadData.nome}`,
      `📱 *WhatsApp:* ${leadData.whatsapp}`,
      `🎯 *Objetivo:* ${leadData.objetivo}`,
      `📅 *Data Sugerida:* ${dateFormatted}`,
      leadData.horario ? `⏰ *Horário:* ${leadData.horario} (${leadData.turno_preferencia})` : `⏰ *Turno:* ${leadData.turno_preferencia}`,
      initialService ? `📦 *Plano de Interesse:* ${initialService}` : '',
      leadData.observacoes ? `📝 *Observação:* ${leadData.observacoes}` : '',
      ``,
      `Podemos confirmar a disponibilidade desta vaga?`
    ]
      .filter(Boolean)
      .join('\n');

    return `https://wa.me/${trainerPhone}?text=${encodeURIComponent(msg)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      alert('Por favor, informe seu nome completo.');
      return;
    }
    const cleanPhone = whatsapp.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      alert('Por favor, informe um WhatsApp válido com DDD.');
      return;
    }
    if (!horario) {
      alert('Por favor, selecione um horário disponível.');
      return;
    }
    if (!lgpdConsent) {
      alert('Por favor, confirme seu consentimento nos termos da LGPD e Política de Privacidade para prosseguir.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await createAgendamento({
        trainer_id: profile.id || undefined,
        nome: nome.trim(),
        whatsapp: cleanPhone,
        objetivo,
        data_preferencia: dataPreferencia,
        turno_preferencia: turnoPreferencia,
        horario: horario,
        observacoes: observacoes.trim(),
        plano_interesse: initialService || 'Avaliação Inicial',
        consentimento_lgpd: true
      });

      triggerConfetti();
      onShowToast('Agendamento recebido com sucesso!');

      if (result.data) {
        setSubmittedLead(result.data);
      } else {
        setSubmittedLead({
          id: 'temp',
          created_at: new Date().toISOString(),
          nome,
          whatsapp: cleanPhone,
          objetivo,
          data_preferencia: dataPreferencia,
          turno_preferencia: turnoPreferencia,
          horario: horario,
          observacoes,
          status: 'Novo Lead'
        });
      }

      // Redirecionamento automático para o WhatsApp após 1.5s
      setTimeout(() => {
        const url = getFormattedWhatsappUrl({
          nome,
          whatsapp: cleanPhone,
          objetivo,
          data_preferencia: dataPreferencia,
          turno_preferencia: turnoPreferencia,
          horario: horario,
          observacoes
        });
        window.open(url, '_blank', 'noopener,noreferrer');
      }, 1500);

    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao processar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRedirect = () => {
    if (!submittedLead) return;
    const url = getFormattedWhatsappUrl({
      nome: submittedLead.nome,
      whatsapp: submittedLead.whatsapp,
      objetivo: submittedLead.objetivo,
      data_preferencia: submittedLead.data_preferencia,
      turno_preferencia: submittedLead.turno_preferencia,
      horario: submittedLead.horario,
      observacoes: submittedLead.observacoes
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleClose = () => {
    setSubmittedLead(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay de fundo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Conteúdo do Modal Vitrificado */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg glass-modal rounded-3xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto z-10 border border-white/15"
          >
            {/* Botão Fechar */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {submittedLead ? (
              /* Tela de Sucesso & Redirecionamento */
              <div className="text-center py-6">
                <div className="inline-flex p-4 rounded-full bg-emerald-500/20 text-emerald-400 mb-4 border border-emerald-500/30">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-white">
                  Agendamento Enviado!
                </h3>
                <p className="text-slate-300 text-sm mt-2 max-w-sm mx-auto">
                  Os dados foram salvos no sistema. Estamos abrindo seu WhatsApp com a mensagem pronta para confirmar com o treinador.
                </p>

                <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 text-left text-xs space-y-1.5 text-slate-300">
                  <div><strong className="text-white">Aluno(a):</strong> {submittedLead.nome}</div>
                  <div><strong className="text-white">Objetivo:</strong> {submittedLead.objetivo}</div>
                  <div>
                    <strong className="text-white">Agendamento:</strong> {submittedLead.data_preferencia.split('-').reverse().join('/')} às <span className="text-brand-400 font-bold font-mono">{submittedLead.horario || '08:00'}</span> ({submittedLead.turno_preferencia})
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={handleManualRedirect}
                    className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
                  >
                    <span>Abrir WhatsApp Agora</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleClose}
                    className="text-xs text-slate-400 hover:text-white transition-colors py-2"
                  >
                    Fechar janela
                  </button>
                </div>
              </div>
            ) : (
              /* Formulário de Agendamento */
              <div>
                <div className="mb-5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Avaliação Presencial ou Online
                  </span>
                  <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                    Agendar Aula / Avaliação
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Preencha os campos abaixo para reservar seu horário diretamente com {profile.name}.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nome Completo */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-brand-500" />
                      Seu Nome Completo
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Oliveira"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-brand-500" />
                      WhatsApp (com DDD)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(11) 99999-9999"
                      value={whatsapp}
                      onChange={handlePhoneChange}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500"
                    />
                  </div>

                  {/* Objetivo Principal */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-brand-500" />
                      Qual é o seu principal objetivo?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {OBJECTIVES.map((obj) => {
                        const isSelected = objetivo === obj.id;
                        return (
                          <button
                            type="button"
                            key={obj.id}
                            onClick={() => setObjetivo(obj.id)}
                            className={`p-2.5 rounded-xl text-left border transition-all ${
                              isSelected
                                ? 'bg-brand-500/20 border-brand-500 text-white shadow-[0_0_15px_rgba(255,122,0,0.25)]'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            <div className="text-xs font-bold">{obj.label}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{obj.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Data e Turno */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-500" />
                        Data de Preferência
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={dataPreferencia}
                        onChange={(e) => setDataPreferencia(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl glass-input text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-500" />
                        Turno Preferido
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {SHIFTS.map((shift) => (
                          <button
                            type="button"
                            key={shift}
                            onClick={() => handleSelectShift(shift)}
                            className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              turnoPreferencia === shift
                                ? 'bg-brand-500 text-slate-950 border-brand-500 shadow-[0_0_12px_rgba(255,122,0,0.3)]'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            {shift}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Seleção Obrigatória de Horário Específico por Turno */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-500" />
                        Horários Disponíveis no Turno ({turnoPreferencia})
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border transition-all ${
                        horario
                          ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
                          : 'text-brand-400 bg-brand-500/10 border-brand-500/30 animate-pulse'
                      }`}>
                        {horario ? `Horário: ${horario}` : 'Obrigatório'}
                      </span>
                    </label>

                    <div className={`grid gap-1.5 ${
                      currentShiftHours.length === 6 
                        ? 'grid-cols-3 sm:grid-cols-6' 
                        : 'grid-cols-2 sm:grid-cols-4'
                    }`}>
                      {currentShiftHours.map((h) => {
                        const isSelected = horario === h;
                        return (
                          <button
                            type="button"
                            key={h}
                            onClick={() => setHorario(h)}
                            className={`py-2.5 px-1.5 text-center rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-brand-500 text-slate-950 border-brand-400 shadow-[0_0_15px_rgba(255,122,0,0.45)] scale-[1.03] ring-2 ring-brand-400/50 font-black'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20 hover:text-white'
                            }`}
                          >
                            {h}
                          </button>
                        );
                      })}
                    </div>

                    {!horario && (
                      <p className="text-[11px] text-amber-400/90 mt-1.5 flex items-center gap-1 font-medium">
                        <span>⚠️ Selecione um dos horários acima para reservar.</span>
                      </p>
                    )}
                  </div>

                  {/* Observações Opcionais */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Alguma lesão, condição ou observação? (Opcional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Tenho condromalácia patelar no joelho direito..."
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs placeholder:text-slate-500 resize-none"
                    />
                  </div>

                  {/* Conformidade Obrigatória com a LGPD */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-brand-500/40 transition-colors cursor-pointer group">
                      <input
                        type="checkbox"
                        required
                        checked={lgpdConsent}
                        onChange={(e) => setLgpdConsent(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-white/20 text-brand-500 focus:ring-brand-500 bg-white/5 cursor-pointer accent-[#FF7A00]"
                      />
                      <span className="text-[11px] text-slate-300 leading-snug">
                        Concordo em compartilhar meus dados de contato e objetivos físicos exclusivamente para atendimento e agendamento com o treinador, nos termos da{' '}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowPrivacyModal(true);
                          }}
                          className="text-brand-400 hover:text-brand-300 underline font-semibold transition-colors inline"
                        >
                          Política de Privacidade
                        </button>
                        .
                      </span>
                    </label>
                  </div>

                  {/* Botão de Envio de Alta Conversão */}
                  <button
                    type="submit"
                    disabled={isLoading || !horario || !lgpdConsent}
                    className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(255,122,0,0.35)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Salvando Agendamento...</span>
                      </>
                    ) : !horario ? (
                      <span>Selecione um Horário Acima</span>
                    ) : !lgpdConsent ? (
                      <span>Aceite os Termos da LGPD para Continuar</span>
                    ) : (
                      <>
                        <span>Confirmar & Abrir no WhatsApp</span>
                        <ArrowRight className="w-4 h-4 stroke-[3]" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Modal Secundário de Política de Privacidade (LGPD) */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        profile={profile}
      />
    </AnimatePresence>
  );
};
