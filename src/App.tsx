import { useState, useEffect } from 'react';
import { 
  Lock, 
  MessageCircle
} from 'lucide-react';
import { InstagramIcon } from './components/icons/InstagramIcon';
import { profileConfig } from './config/profile';
import { HeaderHero } from './components/HeaderHero';
import { HeroCTA } from './components/HeroCTA';
import { QuickLinksGrid } from './components/QuickLinksGrid';
import { ResultsBanner } from './components/ResultsBanner';
import { WhyTrainWithMe } from './components/WhyTrainWithMe';
import { BookingModal } from './components/BookingModal';
import { ServicesModal } from './components/ServicesModal';
import { SocialProofModal } from './components/SocialProofModal';
import { AdminCRM } from './components/AdminCRM';
import { Toast } from './components/Toast';

export function App() {
  const [isAdminView, setIsAdminView] = useState(() => {
    // Permite acessar direto via URL: ?admin=true ou #admin ou /admin
    return (
      window.location.hash === '#admin' ||
      window.location.search.includes('admin=true') ||
      window.location.pathname === '/admin'
    );
  });

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isSocialProofOpen, setIsSocialProofOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | undefined>();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Escuta mudanças de hash para navegação fácil
  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminView(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenBookingWithService = (serviceName: string) => {
    setSelectedService(serviceName);
    setIsBookingOpen(true);
  };

  // Se o usuário estiver no painel administrativo
  if (isAdminView) {
    return (
      <AdminCRM
        profile={profileConfig}
        onExit={() => {
          setIsAdminView(false);
          window.location.hash = '';
        }}
        onShowToast={showToast}
      />
    );
  }

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Background Escuro com Foto de Academia e Overlay Vitrificado */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0 transform scale-105"
        style={{
          backgroundImage: `url(${profileConfig.bgImageUrl})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#08090C]/85 via-[#08090C]/90 to-[#08090C] backdrop-blur-[6px]" />
      </div>

      {/* Container Centralizado para Mobile First & Conversão Máxima */}
      <div className="relative z-10 w-full max-w-lg mx-auto flex-1 flex flex-col justify-between pb-8">
        <div>
          {/* 1. Header Hero com foto, anel pulsante e bio */}
          <HeaderHero profile={profileConfig} />

          {/* 2. Hero CTA Full Width de Alta Conversão */}
          <HeroCTA 
            onOpenBooking={() => {
              setSelectedService(undefined);
              setIsBookingOpen(true);
            }} 
          />

          {/* 3. Grade Estratégica de Ações Rápidas (WhatsApp Direto & Planos/Consultoria) */}
          <QuickLinksGrid
            profile={profileConfig}
            onOpenBooking={() => {
              setSelectedService(undefined);
              setIsBookingOpen(true);
            }}
            onOpenServices={() => setIsServicesOpen(true)}
          />

          {/* 4. Banner Prova Social com "Ver Transformações Reais" */}
          <ResultsBanner
            profile={profileConfig}
            onOpenSocialProof={() => setIsSocialProofOpen(true)}
          />

          {/* 5. Seção "Por Que Treinar Comigo?" (3 Pilares + CTA de Fechamento de Objeções) */}
          <WhyTrainWithMe
            onOpenBooking={() => {
              setSelectedService(undefined);
              setIsBookingOpen(true);
            }}
          />
        </div>

        {/* Rodapé / Footer com Links Sociais Sutis (sem vazamento de tráfego) e Acesso Administrativo */}
        <footer className="w-full max-w-md mx-auto px-4 mt-6 pt-6 border-t border-white/10 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <a
              href={profileConfig.socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-pink-400 transition-colors"
              title="Instagram do Personal"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a
              href={`https://wa.me/${profileConfig.socialLinks.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(profileConfig.socialLinks.whatsappDefaultMessage || 'Olá!')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-emerald-400 transition-colors"
              title="WhatsApp do Personal"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>

          <p className="text-[11px] text-slate-500 font-medium">
            © {new Date().getFullYear()} {profileConfig.name} • Todos os direitos reservados.
          </p>
          <p className="text-[10px] text-slate-600 font-mono mt-0.5">
            Registro Profissional: {profileConfig.cref}
          </p>

          {/* Botão de Acesso ao Mini-CRM Administrativo */}
          <div className="mt-4">
            <button
              onClick={() => {
                setIsAdminView(true);
                window.location.hash = '#admin';
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-slate-400 hover:text-brand-400 border border-white/10 transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>Painel do Personal (Mini-CRM)</span>
            </button>
          </div>
        </footer>
      </div>

      {/* Modais do Sistema */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        profile={profileConfig}
        initialService={selectedService}
        onShowToast={showToast}
      />

      <ServicesModal
        isOpen={isServicesOpen}
        onClose={() => setIsServicesOpen(false)}
        profile={profileConfig}
        onSelectServiceForBooking={handleOpenBookingWithService}
      />

      <SocialProofModal
        isOpen={isSocialProofOpen}
        onClose={() => setIsSocialProofOpen(false)}
        profile={profileConfig}
        onOpenBooking={() => {
          setSelectedService(undefined);
          setIsBookingOpen(true);
        }}
      />

      {/* Toast Flutuante */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}

export default App;
