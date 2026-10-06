import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Check, Download, Sparkles } from 'lucide-react';
import { ProfileConfig } from '../types';
import { generateAndDownloadVCard } from '../lib/vcard';

interface StickyVCardButtonProps {
  profile: ProfileConfig;
  onShowToast: (msg: string) => void;
}

export const StickyVCardButton: React.FC<StickyVCardButtonProps> = ({
  profile,
  onShowToast
}) => {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    generateAndDownloadVCard(profile.vCardData);
    setDownloaded(true);
    onShowToast(`Contato de ${profile.name} baixado! Salve em sua agenda.`);
    setTimeout(() => setDownloaded(false), 4000);
  };

  return (
    <section className="w-full max-w-md mx-auto px-4 mt-4 mb-2">
      <motion.button
        onClick={handleDownload}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full relative overflow-hidden flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-500 via-amber-500 to-brand-600 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-[0_10px_30px_rgba(255,122,0,0.35)] hover:shadow-[0_12px_40px_rgba(255,122,0,0.5)] transition-all duration-300 border border-amber-300/40 cursor-pointer"
      >
        {/* Shimmer de reflexo passando */}
        <div className="absolute inset-0 -translate-x-full hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent"></div>

        {downloaded ? (
          <>
            <Check className="w-5 h-5 text-slate-950 stroke-[3]" />
            <span>CONTATO SALVO!</span>
          </>
        ) : (
          <>
            <UserPlus className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            <span>SALVAR NA AGENDA</span>
            <Download className="w-4 h-4 text-slate-950/70" />
          </>
        )}
      </motion.button>
      <p className="text-center text-[11px] text-slate-400 mt-1.5 flex items-center justify-center gap-1">
        <span>Guarde o número direto no seu celular para tirar dúvidas</span>
      </p>
    </section>
  );
};
