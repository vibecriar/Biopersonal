import React from 'react';

export const BiositeSkeleton: React.FC = () => {
  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col justify-between overflow-hidden">
      {/* Background Vitrificado Escuro */}
      <div className="fixed inset-0 bg-[#08090C] pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#08090C]/90 via-[#08090C]/95 to-[#08090C] backdrop-blur-md" />
      </div>

      {/* Container Centralizado Skeleton */}
      <div className="relative z-10 w-full max-w-lg mx-auto flex-1 flex flex-col justify-between px-4 pb-8">
        <div>
          {/* Header Hero Skeleton */}
          <div className="flex flex-col items-center text-center pt-8 pb-6">
            {/* Status Badge */}
            <div className="w-48 h-7 rounded-full bg-white/10 animate-pulse mb-6 border border-white/10" />

            {/* Avatar Circular com Anel Pulsante */}
            <div className="relative mb-5">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white/10 animate-pulse border-2 border-brand-500/40 p-1 flex items-center justify-center shadow-[0_0_25px_rgba(255,122,0,0.2)]">
                <div className="w-full h-full rounded-full bg-white/5" />
              </div>
            </div>

            {/* Nome e CREF */}
            <div className="w-52 h-8 rounded-xl bg-white/10 animate-pulse mb-2" />
            <div className="w-36 h-4 rounded-md bg-white/10 animate-pulse mb-3" />

            {/* Tagline / Bio */}
            <div className="w-72 max-w-[85%] h-3.5 rounded-md bg-white/10 animate-pulse mb-1.5" />
            <div className="w-56 max-w-[70%] h-3.5 rounded-md bg-white/10 animate-pulse" />
          </div>

          {/* Hero CTA Skeleton */}
          <div className="w-full h-16 rounded-2xl bg-brand-500/15 border border-brand-500/30 animate-pulse mb-4 flex items-center justify-center">
            <div className="w-44 h-5 rounded-md bg-brand-500/30" />
          </div>

          {/* Quick Links Grid Skeleton */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="h-28 rounded-2xl bg-white/5 border border-white/10 animate-pulse p-4 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-white/10" />
              <div className="w-24 h-4 rounded bg-white/10" />
            </div>
            <div className="h-28 rounded-2xl bg-white/5 border border-white/10 animate-pulse p-4 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-white/10" />
              <div className="w-24 h-4 rounded bg-white/10" />
            </div>
          </div>

          {/* Results Banner Skeleton */}
          <div className="w-full h-24 rounded-2xl bg-white/5 border border-white/10 animate-pulse mb-4 p-4 flex items-center justify-between">
            <div className="space-y-2">
              <div className="w-36 h-4 rounded bg-white/10" />
              <div className="w-48 h-3 rounded bg-white/10" />
            </div>
            <div className="w-16 h-8 rounded-xl bg-white/10" />
          </div>

          {/* Why Train With Me Skeleton */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 animate-pulse space-y-3">
            <div className="w-40 h-5 rounded bg-white/10 mx-auto" />
            <div className="h-12 rounded-xl bg-white/5 border border-white/5" />
            <div className="h-12 rounded-xl bg-white/5 border border-white/5" />
            <div className="h-12 rounded-xl bg-white/5 border border-white/5" />
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="w-full max-w-md mx-auto px-4 mt-6 pt-6 border-t border-white/10 text-center flex flex-col items-center gap-2">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          </div>
          <div className="w-44 h-3 rounded bg-white/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
