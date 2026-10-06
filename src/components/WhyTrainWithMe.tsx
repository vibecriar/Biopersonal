import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, ShieldCheck, Flame, ArrowRight, CheckCircle2 } from 'lucide-react';

interface WhyTrainWithMeProps {
  onOpenBooking: () => void;
}

const PILLARS = [
  {
    icon: Target,
    title: 'Treino Individualizado',
    description: 'Nada de ficha pronta. Treinos desenhados para a sua rotina e limitações.',
    badge: '100% Personalizado'
  },
  {
    icon: TrendingUp,
    title: 'Acompanhamento Contínuo',
    description: 'Ajustes semanais de carga e técnica para você nunca estagnar.',
    badge: 'Evolução Constante'
  },
  {
    icon: ShieldCheck,
    title: 'Segurança & Postura',
    description: 'Metodologia científica para prevenir lesões e fortalecer articulações.',
    badge: 'Base Científica'
  }
];

export const WhyTrainWithMe: React.FC<WhyTrainWithMeProps> = ({ onOpenBooking }) => {
  return (
    <section className="w-full max-w-md mx-auto px-4 mt-5 mb-6">
      {/* Container Principal Vitrificado */}
      <div className="relative rounded-3xl glass-card p-5 sm:p-6 border border-white/15 overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cabeçalho da Seção */}
        <div className="text-center mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-[11px] font-bold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
            Método Comprovado
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Por que treinar comigo?
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Elimine as dúvidas e alcance resultados sem perder tempo com o que não funciona.
          </p>
        </div>

        {/* 3 Pilares em Cartões Vitrificados */}
        <div className="space-y-3">
          {PILLARS.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="relative p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-brand-500/40 transition-all duration-300 flex items-start gap-3.5 group"
              >
                <div className="p-2.5 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-400 group-hover:scale-110 transition-transform shrink-0">
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className="text-sm font-black text-white group-hover:text-brand-400 transition-colors">
                      {pillar.title}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 shrink-0">
                      {pillar.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Final de Fechamento de Objeções */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <motion.button
            onClick={onOpenBooking}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full relative overflow-hidden py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-500 via-amber-500 to-brand-600 hover:from-brand-600 hover:to-amber-600 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[0_10px_30px_rgba(255,122,0,0.35)] hover:shadow-[0_12px_40px_rgba(255,122,0,0.5)] transition-all cursor-pointer min-h-[52px] border border-amber-300/40"
          >
            {/* Shimmer de reflexo */}
            <div className="absolute inset-0 -translate-x-full hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

            <Flame className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span className="truncate">Começar Minha Transformação Agora</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </motion.button>
          <p className="text-center text-[11px] text-slate-400 mt-2 font-medium">
            Agendamento rápido • Resposta garantida em poucos minutos
          </p>
        </div>
      </div>
    </section>
  );
};
