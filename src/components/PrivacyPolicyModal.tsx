import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Lock, UserCheck, Trash2, FileText } from 'lucide-react';
import { ProfileConfig } from '../types';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileConfig;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  profile
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay Escuro com Desfoque */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg glass-modal rounded-3xl p-6 sm:p-7 max-h-[85vh] overflow-y-auto z-10 border border-white/15 text-slate-200 text-xs shadow-2xl"
          >
            {/* Botão Fechar */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Fechar Política de Privacidade"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
              <div className="p-3 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-400">
                  Segurança & Transparência
                </span>
                <h3 className="text-lg font-black text-white">
                  Política de Privacidade & LGPD
                </h3>
              </div>
            </div>

            {/* Conteúdo Explicativo Conforme a LGPD (Lei 13.709/2018) */}
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[11px] text-slate-300">
                  Esta política esclarece como tratamos seus dados pessoais em conformidade com a 
                  <strong className="text-white"> Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>.
                </p>
              </div>

              {/* 1. Controlador e Operador */}
              <div>
                <h4 className="font-bold text-white flex items-center gap-1.5 mb-1 text-[13px]">
                  <UserCheck className="w-4 h-4 text-brand-400" />
                  1. Controlador dos Dados
                </h4>
                <p>
                  O controlador responsável pelas decisões e atendimento de seus dados é o profissional{' '}
                  <strong className="text-white">{profile.name}</strong> ({profile.cref}), que utiliza este biosite como canal direto e seguro de contato e agendamento.
                </p>
              </div>

              {/* 2. Finalidade da Coleta */}
              <div>
                <h4 className="font-bold text-white flex items-center gap-1.5 mb-1 text-[13px]">
                  <FileText className="w-4 h-4 text-brand-400" />
                  2. Dados Coletados & Finalidade
                </h4>
                <p className="mb-1.5">
                  Coletamos exclusivamente as seguintes informações fornecidas voluntariamente por você:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li><strong className="text-slate-200">Nome completo:</strong> Para identificação e personalização do atendimento.</li>
                  <li><strong className="text-slate-200">WhatsApp / Telefone:</strong> Para retorno ágil, confirmação de horários e envio de orientações sobre os treinos.</li>
                  <li><strong className="text-slate-200">Objetivo Físico e Observações:</strong> Para triagem preliminar da metodologia de treinamento.</li>
                  <li><strong className="text-slate-200">Preferência de Data e Horário:</strong> Para reserva de vaga na grade de atendimentos.</li>
                </ul>
              </div>

              {/* 3. Base Legal e Não Compartilhamento */}
              <div>
                <h4 className="font-bold text-white flex items-center gap-1.5 mb-1 text-[13px]">
                  <Lock className="w-4 h-4 text-brand-400" />
                  3. Base Legal e Segurança
                </h4>
                <p>
                  O tratamento é realizado com base no seu <strong className="text-white">Consentimento Expresso (Art. 7º, I da LGPD)</strong>.
                  Seus dados são armazenados de forma criptografada e segura, <strong className="text-white">nunca sendo vendidos, cedidos ou compartilhados</strong> com terceiros para fins de marketing não autorizados.
                </p>
              </div>

              {/* 4. Direitos do Titular & Exclusão */}
              <div>
                <h4 className="font-bold text-white flex items-center gap-1.5 mb-1 text-[13px]">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  4. Seus Direitos (Revogação e Exclusão)
                </h4>
                <p>
                  Conforme o Art. 18 da LGPD, você possui o direito de solicitar a confirmação, correção ou a 
                  <strong className="text-rose-300"> exclusão definitiva</strong> de seus dados cadastrados a qualquer momento, bastando enviar uma mensagem direta para o WhatsApp oficial do profissional ({profile.socialLinks.whatsapp}).
                </p>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">
                LGPD Compliance • Versão 2026.1
              </span>
              <button
                onClick={onClose}
                className="py-2 px-5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Entendi e Concordo
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
