import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, MessageSquareText, Sparkles, Send } from 'lucide-react';
import { ProfileConfig, LeadAgendamento } from '../types';

interface ReactivationTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileConfig;
  selectedLead?: LeadAgendamento | null;
  onShowToast: (msg: string) => void;
}

export const ReactivationTemplatesModal: React.FC<ReactivationTemplatesModalProps> = ({
  isOpen,
  onClose,
  profile,
  selectedLead,
  onShowToast
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const leadName = selectedLead ? selectedLead.nome.split(' ')[0] : '{nome}';
  const leadGoal = selectedLead ? selectedLead.objetivo : '{objetivo}';

  const templates = [
    {
      id: 'vagas-mes',
      tag: '🔥 Início de Mês / Vagas Abertas',
      title: 'Abertura de Novas Vagas (Escassez Real)',
      desc: 'Ideal para enviar na virada do mês para todos os leads que não fecharam de primeira.',
      text: `Fala, ${leadName}! Tudo bem? Aqui é o ${profile.name}. Estou abrindo apenas 3 novas vagas para a minha consultoria personalizada este mês. Como você me procurou recentemente querendo focar em ${leadGoal}, lembrei de você primeiro antes de divulgar no Instagram. Bora garantir sua vaga com condição especial?`
    },
    {
      id: 'checkin-frio',
      tag: '❄️ Reativação de Lead Esfriado',
      title: 'Check-in Semanal Descontraído',
      desc: 'Abordagem leve e consultiva para retomar contato sem parecer vendedor chato.',
      text: `Olá, ${leadName}! Tudo em paz por aí? Passando para saber como está sua rotina de treinos essa semana. Conseguiu dar andamento no seu objetivo de ${leadGoal} ou ainda está precisando daquele empurrão profissional?`
    },
    {
      id: 'avaliacao-cortesia',
      tag: '🎯 Oferta Irresistível',
      title: 'Convite para Avaliação Experimental',
      desc: 'Perfeito para convidar leads em dúvida para uma primeira experiência na academia.',
      text: `Opa, ${leadName}! Tudo bem? Estou liberando essa semana algumas sessões experimentais de avaliação biomecânica para quem demonstrou interesse em ${leadGoal}. Me confirma seu dia de preferência que reservo seu horário sem compromisso!`
    },
    {
      id: 'renovacao-aluno',
      tag: '⚡ Retenção de Alunos',
      title: 'Lembrete Amigável de Renovação',
      desc: 'Para alunos com plano prestes a vencer para manter a constância e os resultados.',
      text: `Fala, ${leadName}! Seu ciclo atual de consultoria está chegando ao fim. Para mantermos sua periodização sem nenhuma quebra e continuarmos acelerando seus resultados, já vamos deixar o próximo mês alinhado?`
    }
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onShowToast('Mensagem copiada para a área de transferência!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSendToLead = (text: string) => {
    if (!selectedLead) return;
    const cleanPhone = selectedLead.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl glass-modal rounded-3xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto z-10 border border-white/15"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Scripts de Alta Conversão
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                Mensagens Prontas de Reativação
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Copie e dispare para suas Listas de Transmissão no WhatsApp ou envie diretamente para um lead selecionado.
              </p>
              {selectedLead && (
                <div className="mt-2 text-xs font-semibold text-brand-300 bg-brand-500/10 border border-brand-500/30 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5">
                  <span>Lead selecionado: <strong>{selectedLead.nome}</strong> ({selectedLead.objetivo})</span>
                </div>
              )}
            </div>

            <div className="space-y-3.5">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-brand-300 border border-white/10">
                        {tpl.tag}
                      </span>
                      <h3 className="font-bold text-sm text-white mt-1.5">{tpl.title}</h3>
                      <p className="text-[11px] text-slate-400">{tpl.desc}</p>
                    </div>
                  </div>

                  {/* Caixa de Texto do Script */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-200 font-sans leading-relaxed my-2 select-all">
                    {tpl.text}
                  </div>

                  {/* Ações */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {selectedLead && (
                      <button
                        onClick={() => handleSendToLead(tpl.text)}
                        className="py-1.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar no WhatsApp</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(tpl.id, tpl.text)}
                      className={`py-1.5 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        copiedId === tpl.id
                          ? 'bg-brand-500 text-slate-950 shadow-md'
                          : 'bg-white/10 hover:bg-white/15 text-white'
                      }`}
                    >
                      {copiedId === tpl.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Mensagem</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
