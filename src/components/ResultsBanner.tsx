import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Star, Sparkles } from 'lucide-react';
import { ProfileConfig } from '../types';

interface ResultsBannerProps {
  profile: ProfileConfig;
  onOpenSocialProof: () => void;
}

export const ResultsBanner: React.FC<ResultsBannerProps> = ({
  profile,
  onOpenSocialProof
}) => {
  const { socialProof } = profile;

  return (
    <section className="w-full max-w-md mx-auto px-4 mt-2 mb-4">
      <motion.div
        onClick={onOpenSocialProof}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        className="group relative overflow-hidden rounded-2xl glass-card p-4 sm:p-4.5 border border-white/15 hover:border-brand-500/60 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_0_35px_rgba(255,122,0,0.25)] min-h-[82px] flex items-center justify-between"
      >
        {/* Efeito sutil de iluminação ambiente */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-brand-500/15 rounded-full blur-2xl group-hover:bg-brand-500/25 transition-all pointer-events-none" />

        <div className="flex items-center justify-between gap-3 w-full">
          {/* Lado Esquerdo: Avatares Sobrepostos + Informações */}
          <div className="flex items-center gap-3">
            {/* Avatares em pilha com badge de +350 */}
            <div className="flex -space-x-2.5 overflow-hidden p-0.5 flex-shrink-0">
              {socialProof.transformations.map((item) => (
                <img
                  key={item.id}
                  src={item.afterImg}
                  alt={item.name}
                  className="inline-block h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover ring-2 ring-[#08090C] border border-white/20"
                />
              ))}
              <div 
                className="flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-brand-500 text-slate-950 font-black text-[11px] sm:text-xs ring-2 ring-[#08090C]"
                title="+350 Alunos Satisfeitos"
              >
                +350
              </div>
            </div>

            {/* Textos de Prova Social */}
            <div>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-black text-white">4.9/5</span>
                <span className="text-[10px] text-brand-400 font-bold bg-brand-500/15 px-1.5 py-0.5 rounded-full border border-brand-500/25 hidden xs:inline">
                  +350 Alunos Satisfeitos
                </span>
              </div>

              <h3 className="text-sm sm:text-[15px] font-black text-white mt-0.5 group-hover:text-brand-400 transition-colors flex items-center gap-1">
                <span>Resultados de Alunos</span>
              </h3>
              <p className="text-[11px] text-slate-400 line-clamp-1 group-hover:text-slate-300">
                Veja evolução real com fotos de antes e depois
              </p>
            </div>
          </div>

          {/* Botão de ação explícito: "Ver Transformações Reais" */}
          <div className="flex items-center gap-1.5 bg-brand-500/15 border border-brand-500/30 group-hover:bg-brand-500 group-hover:text-slate-950 text-brand-400 px-3 py-2 sm:py-2.5 rounded-xl transition-all duration-300 flex-shrink-0 shadow-sm min-h-[44px]">
            <span className="text-[11px] sm:text-xs font-black whitespace-nowrap">
              Ver Transformações Reais
            </span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform stroke-[2.5]" />
          </div>
        </div>
      </motion.div>
    </section>
  );
};
