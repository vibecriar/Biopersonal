import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, Dumbbell, Clock, Check, Sparkles } from 'lucide-react';
import { LeadAgendamento, PlanDuration } from '../types';

interface StudentPlanEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadAgendamento | null;
  onSave: (id: string, updates: Partial<LeadAgendamento>) => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const StudentPlanEditModal: React.FC<StudentPlanEditModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSave,
  onShowToast
}) => {
  if (!lead) return null;

  const [planoInteresse, setPlanoInteresse] = useState(lead.plano_interesse || 'Consultoria Online Black');
  const [planoTipo, setPlanoTipo] = useState<PlanDuration>(lead.plano_tipo || 'Mensal');
  const [planoValor, setPlanoValor] = useState<number>(lead.plano_valor || 197);
  const [dataInicio, setDataInicio] = useState(
    lead.data_inicio || lead.data_preferencia || new Date().toISOString().split('T')[0]
  );
  const [dataVencimento, setDataVencimento] = useState(() => {
    if (lead.data_vencimento) return lead.data_vencimento;
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [isSaving, setIsSaving] = useState(false);

  // Recalcula vencimento automático de acordo com a periodicidade
  const handleDurationChange = (type: PlanDuration) => {
    setPlanoTipo(type);
    const start = new Date(dataInicio || Date.now());
    if (type === 'Mensal') {
      start.setDate(start.getDate() + 30);
    } else if (type === 'Trimestral') {
      start.setDate(start.getDate() + 90);
    } else if (type === 'Semestral') {
      start.setDate(start.getDate() + 180);
    }
    setDataVencimento(start.toISOString().split('T')[0]);
  };

  const handleStartDateChange = (val: string) => {
    setDataInicio(val);
    const start = new Date(val);
    if (!isNaN(start.getTime())) {
      if (planoTipo === 'Mensal') start.setDate(start.getDate() + 30);
      else if (planoTipo === 'Trimestral') start.setDate(start.getDate() + 90);
      else if (planoTipo === 'Semestral') start.setDate(start.getDate() + 180);
      setDataVencimento(start.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(lead.id, {
        plano_interesse: planoInteresse,
        plano_tipo: planoTipo,
        plano_valor: Number(planoValor) || 0,
        data_inicio: dataInicio,
        data_vencimento: dataVencimento
      });
      onShowToast(`Plano de ${lead.nome} atualizado com sucesso!`);
      onClose();
    } catch {
      alert('Erro ao atualizar plano.');
    } finally {
      setIsSaving(false);
    }
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
            className="relative w-full max-w-md glass-modal rounded-3xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto z-10 border border-white/15"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5" />
                Gestão de Aluno & Renovação
              </span>
              <h2 className="text-xl font-black text-white tracking-tight mt-1">
                {lead.nome}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Defina o plano contratado, ciclo de cobrança e datas de vencimento.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome do Plano
                </label>
                <input
                  type="text"
                  required
                  value={planoInteresse}
                  onChange={(e) => setPlanoInteresse(e.target.value)}
                  placeholder="Ex: Consultoria Online Black"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Periodicidade do Plano
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Mensal', 'Trimestral', 'Semestral'] as PlanDuration[]).map((dur) => (
                    <button
                      type="button"
                      key={dur}
                      onClick={() => handleDurationChange(dur)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        planoTipo === dur
                          ? 'bg-brand-500 text-slate-950 border-brand-500'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-brand-400" />
                  Valor do Plano (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={planoValor}
                  onChange={(e) => setPlanoValor(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-bold text-brand-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Data de Início
                  </label>
                  <input
                    type="date"
                    required
                    value={dataInicio}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    required
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs border-amber-500/40 text-amber-300 font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/25 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Salvar Dados</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
