import { useState, useEffect } from 'react';
import { 
  MessageCircle,
  AlertTriangle,
  ArrowLeft,
  Dumbbell
} from 'lucide-react';
import { InstagramIcon } from './components/icons/InstagramIcon';
import { HeaderHero } from './components/HeaderHero';
import { HeroCTA } from './components/HeroCTA';
import { QuickLinksGrid } from './components/QuickLinksGrid';
import { ResultsBanner } from './components/ResultsBanner';
import { WhyTrainWithMe } from './components/WhyTrainWithMe';
import { BookingModal } from './components/BookingModal';
import { ServicesModal } from './components/ServicesModal';
import { SocialProofModal } from './components/SocialProofModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { AdminCRM } from './components/AdminCRM';
import { InstitutionalLanding } from './components/InstitutionalLanding';
import { Toast } from './components/Toast';
import { BiositeSkeleton } from './components/BiositeSkeleton';
import { ProfileProvider, useProfile } from './context/ProfileContext';

function AppContent() {
  const { 
    profile, 
    setProfile, 
    isLoading, 
    slugNotFound, 
    hasSlugInUrl, 
    currentSlug, 
    updateProfileData 
  } = useProfile();

  const [isAdminView, setIsAdminView] = useState(() => {
    // Permite acessar a rota geral do CRM via /admin, /login, #admin ou ?admin=true
    const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search;
    return (
      hash === '#admin' ||
      hash === '#login' ||
      search.includes('admin=true') ||
      path === '/admin' ||
      path === '/login'
    );
  });

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isSocialProofOpen, setIsSocialProofOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | undefined>();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Escuta mudanças de hash e popstate para navegação SPA suave
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      const hash = window.location.hash.toLowerCase();
      setIsAdminView(
        hash === '#admin' ||
        hash === '#login' ||
        path === '/admin' ||
        path === '/login' ||
        window.location.search.includes('admin=true')
      );
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenBookingWithService = (serviceName: string) => {
    setSelectedService(serviceName);
    setIsBookingOpen(true);
  };

  // Enquanto os dados do perfil estiverem carregando do Supabase
  if (isLoading) {
    return <BiositeSkeleton />;
  }

  // 1. ROTA GERAL ADMINISTRATIVA DO CRM (/admin ou /login)
  if (isAdminView) {
    return (
      <AdminCRM
        profile={profile}
        onExit={() => {
          setIsAdminView(false);
          window.location.hash = '';
        }}
        onShowToast={showToast}
        onUpdateProfile={updateProfileData}
        onSetContextProfile={setProfile}
      />
    );
  }

  // 2. SE NENHUM SLUG FOI INFORMADO NA URL RAIZ: Exibe página institucional do SaaS
  if (!hasSlugInUrl) {
    return (
      <InstitutionalLanding
        onGoToLogin={() => {
          setIsAdminView(true);
          window.location.hash = '#admin';
        }}
        onViewDemo={() => {
          window.location.search = '?p=rodrigo-thor';
        }}
      />
    );
  }

  // 3. SE O SLUG INFORMADO NÃO FOR ENCONTRADO NO BANCO: Exibe tela amigável de 404
  if (slugNotFound) {
    return (
      <div className="min-h-screen bg-[#08090C] text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-modal rounded-3xl p-8 text-center border border-white/15 shadow-2xl">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-400 mb-4 border border-amber-500/30">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Biosite Não Encontrado</h2>
          <p className="text-xs text-slate-400 mt-2 mb-6 leading-relaxed">
            O endereço <code className="text-brand-300 font-mono">/{currentSlug}</code> não corresponde a um personal trainer ativo no sistema.
          </p>
          <div className="space-y-2">
            <a
              href="/"
              className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Conhecer a Plataforma</span>
            </a>
            <button
              onClick={() => {
                setIsAdminView(true);
                window.location.hash = '#admin';
              }}
              className="w-full min-h-[40px] text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Você é o treinador? Acesse o Painel</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. BIOSITE PÚBLICO DO PERSONAL (Carregado dinamicamente pelo slug)
  const bgImage = profile.bgImageUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop';
  const whatsappUrl = `https://wa.me/${(profile.socialLinks?.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(profile.socialLinks?.whatsappDefaultMessage || 'Olá!')}`;

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Background Escuro com Foto de Academia e Overlay Vitrificado */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0 transform scale-105"
        style={{
          backgroundImage: `url(${bgImage})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#08090C]/85 via-[#08090C]/90 to-[#08090C] backdrop-blur-[6px]" />
      </div>

      {/* Container Centralizado Responsivo (Mobile, Tablet & Desktop) */}
      <div className="relative z-10 w-full max-w-md sm:max-w-xl md:max-w-2xl mx-auto flex-1 flex flex-col justify-between pb-8">
        <div>
          {/* 1. Header Hero com foto, anel pulsante e bio */}
          <HeaderHero profile={profile} />

          {/* 2. Hero CTA Full Width de Alta Conversão */}
          <HeroCTA 
            onOpenBooking={() => {
              setSelectedService(undefined);
              setIsBookingOpen(true);
            }} 
          />

          {/* 3. Grade Estratégica de Ações Rápidas (WhatsApp Direto & Planos/Consultoria) */}
          <QuickLinksGrid
            profile={profile}
            onOpenBooking={() => {
              setSelectedService(undefined);
              setIsBookingOpen(true);
            }}
            onOpenServices={() => setIsServicesOpen(true)}
          />

          {/* 4. Banner Prova Social com "Ver Transformações Reais" */}
          <ResultsBanner
            profile={profile}
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

        {/* Rodapé / Footer Limpo sem acesso ao CRM para o aluno/visitante */}
        <footer className="w-full max-w-md sm:max-w-xl md:max-w-2xl mx-auto px-4 mt-6 pt-6 border-t border-white/10 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            {profile.socialLinks?.instagram && (
              <a
                href={profile.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-pink-400 transition-colors"
                title="Instagram do Personal"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            )}
            {profile.socialLinks?.whatsapp && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-emerald-400 transition-colors"
                title="WhatsApp do Personal"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
          </div>

          <p className="text-[11px] text-slate-500 font-medium">
            © {new Date().getFullYear()} {profile.name} • Todos os direitos reservados.
          </p>
          <p className="text-[10px] text-slate-600 font-mono mt-0.5">
            Registro Profissional: {profile.cref}
          </p>

          {/* Link Discreto para Política de Privacidade e Termos LGPD */}
          <div className="mt-2.5">
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="text-[11px] text-slate-400 hover:text-brand-400 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Política de Privacidade & Termos LGPD
            </button>
          </div>
        </footer>
      </div>

      {/* Modais do Sistema */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        profile={profile}
        initialService={selectedService}
        onShowToast={showToast}
      />

      <ServicesModal
        isOpen={isServicesOpen}
        onClose={() => setIsServicesOpen(false)}
        profile={profile}
        onSelectServiceForBooking={handleOpenBookingWithService}
      />

      <SocialProofModal
        isOpen={isSocialProofOpen}
        onClose={() => setIsSocialProofOpen(false)}
        profile={profile}
        onOpenBooking={() => {
          setSelectedService(undefined);
          setIsBookingOpen(true);
        }}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        profile={profile}
      />

      {/* Toast Flutuante */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}

export function App() {
  return (
    <ProfileProvider>
      <AppContent />
    </ProfileProvider>
  );
}

export default App;
