import React from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, ArrowRight, Sparkles } from 'lucide-react';

interface HeroCTAProps {
  onOpenBooking: () => void;
}

export const HeroCTA: React.FC<HeroCTAProps> = ({ onOpenBooking }) => {
  return (
    <section className="w-full max-w-md mx-auto px-4 mt-2 mb-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative group"
      >
        {/* Glow de fundo neon laranja vibrante com pulso sutil */}
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 via-amber-400 to-brand-600 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-pulse pointer-events-none" />

        <motion.button
          onClick={onOpenBooking}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative w-full overflow-hidden flex items-center justify-between p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-[#FF7A00] via-[#FF8A1E] to-[#FF6200] text-slate-950 font-black shadow-[0_12px_36px_rgba(255,122,0,0.4)] border border-amber-200/50 cursor-pointer min-h-[64px] transition-all"
        >
          {/* Efeito Shimmer reflexivo deslizante */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          {/* Lado Esquerdo: Ícone com Badge vitrificada */}
          <div className="flex items-center gap-3.5 text-left">
            <div className="p-2.5 rounded-xl bg-slate-950/15 backdrop-blur-md border border-black/10 text-slate-950 flex-shrink-0">
              <CalendarCheck className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] sm:text-[15px] font-black uppercase tracking-tight text-slate-950 leading-tight">
                  AGENDAR AVALIAÇÃO EXPERIMENTAL
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-950/85 font-semibold mt-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-slate-950/90 inline flex-shrink-0" />
                <span>Preencha em 30 segundos • Vagas limitadas para este mês</span>
              </p>
            </div>
          </div>

          {/* Lado Direito: Seta indicativa com micro-interação */}
          <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-slate-950/15 text-slate-950 flex-shrink-0 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </div>
        </motion.button>
      </motion.div>
    </section>
  );
};
