import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Star, ArrowRight, Quote, Flame, Sparkles } from 'lucide-react';
import { ProfileConfig } from '../types';

interface SocialProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileConfig;
  onOpenBooking: () => void;
}

export const SocialProofModal: React.FC<SocialProofModalProps> = ({
  isOpen,
  onClose,
  profile,
  onOpenBooking
}) => {
  const { socialProof } = profile;
  const [activeTab, setActiveTab] = useState<'transformacoes' | 'depoimentos'>('transformacoes');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
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
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Histórias de Sucesso
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                {socialProof.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {socialProof.subtitle}
              </p>
            </div>

            {/* Grid de Estatísticas Vitrificadas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              {socialProof.stats.map((st, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className="text-lg sm:text-xl font-black text-brand-400">{st.value}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">{st.label}</div>
                </div>
              ))}
            </div>

            {/* Alternador de Abas */}
            <div className="flex rounded-xl bg-white/5 p-1 mb-5 border border-white/10">
              <button
                onClick={() => setActiveTab('transformacoes')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'transformacoes'
                    ? 'bg-brand-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Fotos de Transformação
              </button>
              <button
                onClick={() => setActiveTab('depoimentos')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'depoimentos'
                    ? 'bg-brand-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Depoimentos dos Alunos
              </button>
            </div>

            {/* Conteúdo da Aba */}
            {activeTab === 'transformacoes' ? (
              <div className="space-y-4">
                {socialProof.transformations.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-500/30 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-white">{item.name}</h4>
                        <span className="text-[11px] text-brand-400 font-semibold">{item.timeFrame}</span>
                      </div>

                      {/* Tag de resultado tangível */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.tag && (
                          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40">
                            {item.tag}
                          </span>
                        )}
                        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {item.result}
                        </span>
                      </div>
                    </div>

                    {/* Comparativo de Fotos Antes/Depois */}
                    <div className="grid grid-cols-2 gap-2.5 my-3">
                      <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-[4/3] bg-black/40 shadow-inner">
                        <img
                          src={item.beforeImg}
                          alt={`${item.name} antes`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-bold text-slate-300 border border-white/10">
                          Antes
                        </span>
                      </div>
                      <div className="relative rounded-xl overflow-hidden border border-brand-500/40 aspect-[4/3] bg-black/40 shadow-inner">
                        <img
                          src={item.afterImg}
                          alt={`${item.name} depois`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-brand-500 to-amber-500 text-[10px] font-black text-slate-950 shadow-md">
                          Depois
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Pequeno depoimento real do aluno */}
                    {item.quote && (
                      <div className="mt-3 p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-start gap-2.5 text-xs text-slate-200 italic leading-relaxed">
                        <Quote className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                        <span>"{item.quote}"</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {socialProof.testimonials.map((dep) => (
                  <div
                    key={dep.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-1 text-amber-400 mb-2">
                      {[...Array(dep.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed mb-4">
                      "{dep.quote}"
                    </p>

                    <div className="flex items-center gap-3 pt-2.5 border-t border-white/10">
                      <img
                        src={dep.avatar}
                        alt={dep.name}
                        className="w-9 h-9 rounded-full object-cover border border-white/20"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">{dep.name}</div>
                        <div className="text-[10px] text-slate-400">{dep.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Botão no final do modal: "Quero resultados como esse" */}
            <div className="mt-6 pt-4 border-t border-white/10 sticky bottom-0 bg-[#0c0e12]/95 backdrop-blur-md pb-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenBooking();
                }}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-500 via-amber-500 to-brand-600 hover:from-brand-600 hover:to-amber-600 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-brand-500/30 transition-all cursor-pointer min-h-[52px]"
              >
                <Flame className="w-4 h-4 fill-slate-950" />
                <span>Quero resultados como esse</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
