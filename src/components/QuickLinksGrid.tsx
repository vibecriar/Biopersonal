import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Dumbbell, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { ProfileConfig } from '../types';

interface QuickLinksGridProps {
  profile: ProfileConfig;
  onOpenBooking: () => void;
  onOpenServices: () => void;
}

export const QuickLinksGrid: React.FC<QuickLinksGridProps> = ({
  profile,
  onOpenServices
}) => {
  const getWhatsAppUrl = () => {
    const phone = profile.socialLinks.whatsapp.replace(/\D/g, '');
    const message = encodeURIComponent('Olá, quero saber como funciona o acompanhamento!');
    return `https://wa.me/${phone}?text=${message}`;
  };

  const handleWhatsAppClick = () => {
    window.open(getWhatsAppUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="w-full max-w-md mx-auto px-4 mt-2 mb-3">
      {/* Título de seção sutil */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          Ações Rápidas
        </span>
        <span className="text-[11px] text-slate-500">Escolha o melhor canal</span>
      </div>

      {/* Grade 2 Colunas Glassmorphism */}
      <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
        {/* Card 1: WhatsApp Direto */}
        <motion.button
          onClick={handleWhatsAppClick}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group relative flex flex-col items-start justify-between p-4 rounded-2xl glass-card text-left transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] min-h-[140px] cursor-pointer"
        >
          {/* Badge "Online agora" com bolinha pulsante */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
              Online agora
            </span>
          </div>

          {/* Ícone */}
          <div className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md text-emerald-400 group-hover:scale-110 transition-transform">
            <MessageCircle className="w-6 h-6" />
          </div>

          {/* Textos */}
          <div className="mt-3 w-full">
            <div className="flex items-center justify-between w-full">
              <span className="font-bold text-sm sm:text-[15px] text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                Falar no WhatsApp
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 group-hover:text-slate-300">
              Tire dúvidas direto com o Personal
            </p>
          </div>
        </motion.button>

        {/* Card 2: Modalidades & Planos */}
        <motion.button
          onClick={onOpenServices}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group relative flex flex-col items-start justify-between p-4 rounded-2xl glass-card text-left transition-all duration-300 hover:border-amber-500/50 hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] min-h-[140px] cursor-pointer"
        >
          {/* Badge Vagas Abertas */}
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
              Vagas Abertas
            </span>
          </div>

          {/* Ícone */}
          <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-md text-amber-400 group-hover:scale-110 transition-transform">
            <Dumbbell className="w-6 h-6" />
          </div>

          {/* Textos */}
          <div className="mt-3 w-full">
            <div className="flex items-center justify-between w-full">
              <span className="font-bold text-sm sm:text-[15px] text-white tracking-tight group-hover:text-amber-400 transition-colors">
                Planos & Consultoria
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 group-hover:text-slate-300">
              Presencial VIP ou Online
            </p>
          </div>
        </motion.button>
      </div>
    </section>
  );
};
