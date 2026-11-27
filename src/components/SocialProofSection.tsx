import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, Sparkles, X, ChevronRight, ChevronLeft, Quote } from 'lucide-react';
import { ProfileConfig, SocialProofResultItem } from '../types';

interface SocialProofSectionProps {
  profile: ProfileConfig;
}

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
  </svg>
);

export const SocialProofSection: React.FC<SocialProofSectionProps> = ({ profile }) => {
  const socialProof = profile.socialProof;
  const [selectedPhoto, setSelectedPhoto] = useState<SocialProofResultItem | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Regra: Se o personal ainda não cadastrou nenhum resultado ou desativou no CRM, oculta
  const isAtivo = socialProof?.ativo !== false;
  const results: SocialProofResultItem[] = socialProof?.results && socialProof.results.length > 0
    ? socialProof.results
    : (socialProof?.transformations && socialProof.transformations.length > 0
        ? socialProof.transformations.map(t => ({
            id: t.id,
            name: t.name,
            result: t.result || t.description,
            photoUrl: t.afterImg || t.beforeImg
          }))
        : []);

  // Agrupa os resultados em páginas de 2 cards cada (2 visíveis lado a lado)
  const chunkedResults = useMemo(() => {
    const chunks: SocialProofResultItem[][] = [];
    for (let i = 0; i < results.length; i += 2) {
      chunks.push(results.slice(i, i + 2));
    }
    return chunks;
  }, [results]);

  const totalPages = chunkedResults.length;

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const scrollToPage = (pageIndex: number) => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const slideWidth = container.clientWidth;
    container.scrollTo({
      left: pageIndex * slideWidth,
      behavior: 'smooth'
    });
    setCurrentPage(pageIndex);
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      scrollToPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      scrollToPage(currentPage + 1);
    }
  };

  const handleScroll = () => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const scrollLeft = container.scrollLeft;
    const slideWidth = container.clientWidth;
    if (slideWidth > 0) {
      const page = Math.round(scrollLeft / slideWidth);
      if (page !== currentPage && page >= 0 && page < totalPages) {
        setCurrentPage(page);
      }
    }
  };

  if (!isAtivo || results.length === 0) {
    return null;
  }

  const rating = String(socialProof?.rating || '5.0');
  const ratingText = socialProof?.ratingText || 'Avaliação 5.0 no Google';
  const totalStudents = socialProof?.totalStudents || '+ de 300 alunos transformados';

  const renderCard = (item: SocialProofResultItem, index: number) => (
    <motion.div
      key={item.id || index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.015 }}
      onClick={() => setSelectedPhoto(item)}
      className="group rounded-2xl glass-card overflow-hidden border border-white/15 hover:border-brand-500/60 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(var(--brand-500-rgb,249_115_22),0.2)] flex flex-col justify-between h-full bg-slate-900/60"
    >
      {/* Foto do Resultado: aspect-[4/3] com object-cover uniforme */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
        <img
          src={item.photoUrl}
          alt={`Resultado de ${item.name}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

        {/* Badges sobre a foto: Nome do Aluno e Botão Ver Foto */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
          <span className="text-[11px] sm:text-xs font-black text-white px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/20 shadow-md truncate max-w-[62%]">
            {item.name}
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-brand-500/30 text-brand-300 border border-brand-500/40 shrink-0">
            Ver foto
          </span>
        </div>
      </div>

      {/* Depoimento limitado a no máximo 2 linhas (line-clamp-2) com altura fixa */}
      <div className="p-2.5 sm:p-3 flex items-start gap-1.5 flex-1 bg-white/[0.02]">
        <Quote className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5 rotate-180" />
        <p className="text-[11px] sm:text-xs text-slate-200 font-medium leading-snug italic line-clamp-2 h-[2.25rem] sm:h-[2.5rem] overflow-hidden">
          "{item.result}"
        </p>
      </div>
    </motion.div>
  );

  return (
    <section className="w-full max-w-md sm:max-w-xl md:max-w-2xl mx-auto px-4 mt-2 mb-4">
      {/* 1. SELO ESTILO GOOGLE MEU NEGÓCIO NO TOPO */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-3 p-3 sm:p-3.5 rounded-2xl glass-card border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-lg relative overflow-hidden group hover:border-brand-500/50 transition-all"
      >
        {/* Glow sutil da cor primária */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-brand-500/15 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
          <div className="p-1.5 rounded-xl bg-white/10 border border-white/15 shadow-sm">
            <GoogleIcon />
          </div>

          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-white">{rating}</span>
            <span className="text-white/25 text-xs">•</span>
            <span className="text-xs font-semibold text-slate-300">{ratingText}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40 shadow-sm">
            {totalStudents}
          </span>
        </div>
      </motion.div>

      {/* 2. CABEÇALHO DA SEÇÃO DE RESULTADOS COM SETAS DE NAVEGAÇÃO */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <Trophy className="w-3.5 h-3.5 text-brand-400 shrink-0" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 truncate">
            Resultados Reais & Transformações
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-400 font-medium">
            {results.length} {results.length === 1 ? 'aluno' : 'alunos'}
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentPage === 0}
                aria-label="Slide anterior"
                className="p-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentPage >= totalPages - 1}
                aria-label="Próximo slide"
                className="p-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. CARROSSEL DE CARDS DOS ALUNOS (2 LADO A LADO) OU CARD ÚNICO */}
      {results.length === 1 ? (
        <div className="max-w-xs sm:max-w-sm mx-auto">
          {renderCard(results[0], 0)}
        </div>
      ) : (
        <div className="relative">
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth gap-0 scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {chunkedResults.map((chunk, pageIndex) => (
              <div
                key={pageIndex}
                className="w-full shrink-0 snap-center snap-always px-0.5"
              >
                <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
                  {chunk.map((item, itemIdx) => renderCard(item, pageIndex * 2 + itemIdx))}
                  {chunk.length === 1 && (
                    <div className="opacity-0 pointer-events-none" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 4. INDICADORES / BOLINHAS DE PAGINAÇÃO */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-2.5">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToPage(idx)}
                  aria-label={`Ir para página ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    currentPage === idx
                      ? 'w-5 h-1.5 bg-brand-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]'
                      : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL DE ZOOM / VISUALIZAÇÃO AMPLIADA DA FOTO */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPhoto(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg glass-modal rounded-3xl p-4 sm:p-5 z-10 border border-white/20 shadow-2xl"
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="rounded-2xl overflow-hidden border border-white/10 mb-3 bg-black">
                <img
                  src={selectedPhoto.photoUrl}
                  alt={selectedPhoto.name}
                  className="w-full max-h-[70vh] object-contain mx-auto"
                />
              </div>

              <div className="px-1">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <h3 className="font-black text-base text-white">{selectedPhoto.name}</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{selectedPhoto.result}"
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
