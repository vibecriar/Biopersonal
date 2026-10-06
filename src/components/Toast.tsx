import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl bg-gradient-to-r from-slate-900 to-black text-white text-xs font-semibold shadow-2xl border border-brand-500/40 flex items-center gap-2.5 max-w-sm w-full mx-auto"
        >
          <div className="p-1 rounded-full bg-brand-500/20 text-brand-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="flex-1 text-slate-200">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
