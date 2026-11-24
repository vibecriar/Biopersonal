import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Flame, User } from 'lucide-react';
import { ProfileConfig } from '../types';

interface HeaderHeroProps {
  profile: ProfileConfig;
}

export const HeaderHero: React.FC<HeaderHeroProps> = ({ profile }) => {
  return (
    <header className="relative flex flex-col items-center text-center pt-6 sm:pt-8 md:pt-10 pb-5 sm:pb-7 px-4">
      {/* Badge de Status / Disponibilidade */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold mb-5 sm:mb-6 shadow-sm shadow-emerald-950/50"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>Agenda Aberta • Vagas Disponíveis</span>
      </motion.div>

      {/* Foto / Logo com Círculo Central Pulsante (Ondas Sonar + Respiração + Glow Neon) */}
      <div className="relative mb-5 sm:mb-6 flex items-center justify-center">
        {/* Onda Sonar 1 (expande suavemente) */}
        <div className="absolute inset-0 rounded-full border-2 border-brand-500/60 bg-brand-500/20 sonar-wave-1 pointer-events-none" />
        
        {/* Onda Sonar 2 (fase alternada para pulso contínuo) */}
        <div className="absolute inset-0 rounded-full border-2 border-brand-400/50 bg-brand-400/15 sonar-wave-2 pointer-events-none" />

        {/* Halo de Brilho Neon Ambiente */}
        <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600 blur-xl opacity-75 animate-pulse pointer-events-none" />

        {/* Círculo Central Pulsante do Personal */}
        <motion.div
          animate={{ scale: [1, 1.035, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          className="relative p-1 sm:p-1.5 rounded-full bg-[#0d0f14] border-2 sm:border-[3px] border-brand-500 shadow-[0_0_35px_rgba(var(--brand-500-rgb,249_115_22),0.55),0_0_70px_rgba(var(--brand-500-rgb,249_115_22),0.25)] avatar-pulse-breath z-10"
        >
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name || 'Personal'}
              className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full object-cover border border-white/20 shadow-inner"
              loading="eager"
            />
          ) : (
            <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-brand-400">
              <User className="w-12 h-12" />
            </div>
          )}

          {/* Badge flutuante de especialista */}
          <motion.div 
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-1 -right-1 sm:bottom-0 sm:right-0 bg-brand-500 text-slate-950 p-1.5 sm:p-2 rounded-full shadow-lg border-2 border-[#0d0f14]" 
            title="Personal Certificado"
          >
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950 text-slate-950" />
          </motion.div>
        </motion.div>
      </div>

      {/* Nome e Título do Profissional */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="w-full max-w-md sm:max-w-xl md:max-w-2xl px-2"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2 flex-wrap">
          <span>{profile.name || 'Personal Trainer'}</span>
          <span title="Profissional Verificado" className="inline-flex items-center">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-brand-500 flex-shrink-0" />
          </span>
        </h1>

        <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
          <p className="text-xs sm:text-sm md:text-[15px] font-bold tracking-wide text-brand-400 uppercase">
            {profile.role || 'Personal Trainer'}
          </p>
          <span className="text-white/30 text-xs hidden xs:inline">•</span>
          <span className="text-[11px] sm:text-xs font-mono text-slate-300 bg-white/5 px-2.5 py-0.5 rounded-md border border-white/10">
            {profile.cref?.trim() ? profile.cref : 'CREF não informado'}
          </span>
        </div>

        {/* Frase de Impacto entre Aspas (apenas se preenchida) */}
        {profile.tagline && profile.tagline.trim().length > 0 && (
          <p className="mt-3.5 sm:mt-4 text-sm sm:text-base md:text-[17px] leading-relaxed text-slate-300 font-medium italic relative px-2 sm:px-6">
            <span className="text-brand-500 font-serif text-xl sm:text-2xl select-none leading-none mr-1">“</span>
            {profile.tagline}
            <span className="text-brand-500 font-serif text-xl sm:text-2xl select-none leading-none ml-1">”</span>
          </p>
        )}
      </motion.div>
    </header>
  );
};
