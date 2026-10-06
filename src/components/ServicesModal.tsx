import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Dumbbell, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { ProfileConfig, ServicePlan } from '../types';

interface ServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileConfig;
  onSelectServiceForBooking: (serviceName: string) => void;
}

export const ServicesModal: React.FC<ServicesModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSelectServiceForBooking
}) => {
  const handleHirePlan = (plan: ServicePlan) => {
    const phone = profile.socialLinks.whatsapp.replace(/\D/g, '');
    const message = encodeURIComponent(plan.whatsappMessage);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener,noreferrer');
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
            className="relative w-full max-w-xl glass-modal rounded-3xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto z-10 border border-white/15"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5" />
                Planos & Programas de Treino
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                Escolha o seu Programa
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Metodologia personalizada para o seu biotipo, rotina e objetivos físicos.
              </p>
            </div>

            <div className="space-y-4">
              {profile.services.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative p-5 rounded-2xl border transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-b from-brand-500/15 via-white/5 to-white/5 border-brand-500/50 shadow-[0_0_30px_rgba(255,122,0,0.15)]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-5 bg-gradient-to-r from-brand-500 to-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {plan.tag}
                    </span>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-lg font-black text-white">{plan.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 max-w-sm">{plan.description}</p>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-xl sm:text-2xl font-black text-brand-400 tracking-tight">
                        {plan.price}
                        <span className="text-xs font-normal text-slate-400 ml-1">{plan.period}</span>
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-2 my-4 border-t border-white/10 pt-3">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-3">
                    <button
                      onClick={() => {
                        onClose();
                        onSelectServiceForBooking(plan.name);
                      }}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-brand-500/25 transition-all cursor-pointer min-h-[48px]"
                    >
                      <Sparkles className="w-4 h-4 fill-slate-950" />
                      <span>Quero esta vaga</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                    <button
                      onClick={() => handleHirePlan(plan)}
                      className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[48px]"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                      <span>Dúvidas no Whats</span>
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
