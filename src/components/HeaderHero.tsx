import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Flame, Sparkles } from 'lucide-react';
import { ProfileConfig } from '../types';

interface HeaderHeroProps {
  profile: ProfileConfig;
}

export const HeaderHero: React.FC<HeaderHeroProps> = ({ profile }) => {
  return (
    <header className="relative flex flex-col items-center text-center pt-8 pb-6 px-4">
      {/* Badge de Status / Disponibilidade */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold mb-6 shadow-sm shadow-emerald-950"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>Agenda Aberta • Vagas Limitadas</span>
      </motion.div>

      {/* Foto / Logo com Anel Pulsante e Glow Laranja Neon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="relative mb-5"
      >
        {/* Anel de Pulso e Glow */}
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-brand-500 via-amber-400 to-brand-600 rounded-full blur-md opacity-75 animate-pulse"></div>
        <div className="relative p-1 rounded-full bg-[#0d0f14] border-2 border-brand-500 shadow-[0_0_30px_rgba(255,122,0,0.45)]">
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border border-white/20 shadow-inner"
            loading="eager"
          />
          {/* Badge flutuante de especialista */}
          <div className="absolute -bottom-1 -right-1 bg-brand-500 text-slate-950 p-1.5 rounded-full shadow-lg border border-white/30" title="Personal Certificado">
            <Flame className="w-4 h-4 fill-slate-950 text-slate-950" />
          </div>
        </div>
      </motion.div>

      {/* Nome e Título do Profissional */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="max-w-md"
      >
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
          <span>{profile.name}</span>
          <span title="CREF Verificado">
            <ShieldCheck className="w-5 h-5 text-brand-500 flex-shrink-0" />
          </span>
        </h1>

        <div className="flex items-center justify-center gap-2 mt-1">
          <p className="text-xs sm:text-sm font-semibold tracking-wide text-brand-400 uppercase">
            {profile.role}
          </p>
          <span className="text-white/30 text-xs">•</span>
          <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
            {profile.cref}
          </span>
        </div>

        {/* Frase de Impacto entre Aspas */}
        <p className="mt-3.5 text-sm sm:text-[15px] leading-relaxed text-slate-300 font-medium italic relative px-4">
          <span className="text-brand-500 font-serif text-xl select-none leading-none mr-1">“</span>
          {profile.tagline}
          <span className="text-brand-500 font-serif text-xl select-none leading-none ml-1">”</span>
        </p>
      </motion.div>
    </header>
  );
};
