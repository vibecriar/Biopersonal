import React from 'react';
import { motion } from 'framer-motion';
import { 
  Dumbbell, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  Lock,
  CalendarCheck,
  CreditCard,
  ExternalLink
} from 'lucide-react';

interface InstitutionalLandingProps {
  onGoToLogin: () => void;
  onViewDemo: () => void;
}

export const InstitutionalLanding: React.FC<InstitutionalLandingProps> = ({
  onGoToLogin,
  onViewDemo
}) => {
  return (
    <div className="min-h-screen bg-[#08090C] text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Background Decorativo com Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 py-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-500 text-slate-950 shadow-lg shadow-brand-500/30">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-black tracking-tight text-white block leading-none">
              BIOPERSONAL <span className="text-brand-500">PRO</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              SaaS Multi-Tenant para Personal Trainers
            </span>
          </div>
        </div>

        <button
          onClick={onGoToLogin}
          className="min-h-[40px] px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <Lock className="w-3.5 h-3.5 text-brand-400" />
          <span>Área do Personal</span>
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 py-12 sm:py-16 flex-1 flex flex-col items-center text-center justify-center">
        {/* Badge Flutuante */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold mb-6 shadow-sm shadow-brand-950/40"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Plataforma Oficial de Biosite + Mini-CRM</span>
        </motion.div>

        {/* Título Principal de Alto Impacto */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15] max-w-3xl"
        >
          Seu Biosite de <span className="text-gradient">Alta Conversão</span> e Gestão Completa de Alunos
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-5 text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed font-medium"
        >
          Transforme seguidores do Instagram em alunos presenciais e consultorias fechadas. Tenha seu próprio link profissional na bio com agendamento direto e controle de renovações.
        </motion.p>

        {/* Botões de Ação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto"
        >
          <button
            onClick={onGoToLogin}
            className="w-full sm:w-auto min-h-[48px] px-7 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 transition-all cursor-pointer transform hover:scale-[1.02]"
          >
            <span>Acessar Painel do Treinador</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          <button
            onClick={onViewDemo}
            className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 hover:text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-slate-400" />
            <span>Ver Biosite Demonstrativo</span>
          </button>
        </motion.div>

        {/* Grid de Benefícios do SaaS */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 w-full text-left"
        >
          <div className="p-5 rounded-2xl glass-card border border-white/10">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 w-fit mb-3 border border-brand-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Biosite Ultra Rápido</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Carregamento instantâneo no celular. Perfeito para link na bio e fechamento de vendas no WhatsApp.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-white/10">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-3 border border-emerald-500/20">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Grade de Horários</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O aluno escolhe turno e horário preferido. Acaba com a troca interminável de mensagens de agenda.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-white/10">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 w-fit mb-3 border border-amber-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Alertas de Vencimento</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Saiba exatamente quem vence na semana e cobre renovações no WhatsApp com 1 clique.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-white/10">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 w-fit mb-3 border border-sky-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Segurança Multi-Tenant</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cada personal possui login próprio, banco isolado via Supabase RLS e fotos em alta velocidade.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-4 py-6 border-t border-white/10 text-center">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} Biopersonal Pro • Plataforma Multi-Tenant para Personal Trainers. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};
