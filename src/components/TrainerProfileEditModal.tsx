import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  User,
  Phone,
  Image as ImageIcon,
  Clock,
  Dumbbell,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Upload,
  Check,
  Globe,
  AlertCircle,
  Palette
} from 'lucide-react';
import { InstagramIcon } from './icons/InstagramIcon';
import { ProfileConfig, ServicePlan } from '../types';
import { compressImage, uploadTrainerImage } from '../lib/imageCompression';
import { PRESET_PALETTES, isValidHex } from '../lib/theme';
import { updateTrainerProfileByUserId, getCurrentAuthUser, TrainerUpdatePayload } from '../lib/supabase';

interface TrainerProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileConfig;
  onSaveProfile: (updates: Partial<ProfileConfig>) => Promise<boolean>;
  onShowToast: (msg: string) => void;
}

type TabKey = 'geral' | 'cores' | 'midias' | 'planos' | 'horarios';

export const TrainerProfileEditModal: React.FC<TrainerProfileEditModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('geral');
  const [isSaving, setIsSaving] = useState(false);

  // Estados dos campos gerais
  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState(profile.role);
  const [cref, setCref] = useState(profile.cref);
  const [slug, setSlug] = useState(profile.slug || '');
  const [tagline, setTagline] = useState(profile.tagline);
  const [whatsapp, setWhatsapp] = useState(profile.socialLinks.whatsapp);
  const [instagram, setInstagram] = useState(profile.socialLinks.instagram);

  // Mídias
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [bgImageUrl, setBgImageUrl] = useState(profile.bgImageUrl);

  // Identidade Visual & Cores
  const [corPrimaria, setCorPrimaria] = useState(profile.cor_primaria || '#F97316');
  const [corFundo, setCorFundo] = useState(profile.cor_fundo || '#08090C');
  const [corTexto, setCorTexto] = useState(profile.cor_texto || '#F8FAFC');

  // Upload e Compressão de Imagens
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadProgress, setAvatarUploadProgress] = useState<string | null>(null);
  const [avatarStats, setAvatarStats] = useState<string | null>(null);

  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [bgUploadProgress, setBgUploadProgress] = useState<string | null>(null);
  const [bgStats, setBgStats] = useState<string | null>(null);

  // Handler de upload com compressão da foto de perfil (máx 800px, WebP)
  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setAvatarUploadProgress('Comprimindo foto no dispositivo...');
    setAvatarStats(null);

    try {
      const compressed = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8,
        format: 'image/webp'
      });

      setAvatarUploadProgress(`Enviando (${compressed.formattedCompressedSize})...`);

      const trainerId = profile.id || 'default_trainer';
      const res = await uploadTrainerImage(trainerId, compressed.blob, 'perfil');

      if (res.success && res.publicUrl) {
        setAvatarUrl(res.publicUrl);
        setAvatarStats(`Otimizado: de ${compressed.formattedOriginalSize} para ${compressed.formattedCompressedSize} (${compressed.reductionPercentage}% menor)`);
        onShowToast('Foto de perfil comprimida e atualizada!');
      } else {
        alert('Erro no upload: ' + (res.error || 'Verifique se o bucket biosite-images foi criado no Supabase.'));
      }
    } catch (err: any) {
      console.error(err);
      alert('Erro ao comprimir imagem: ' + (err?.message || 'Tente novamente.'));
    } finally {
      setIsUploadingAvatar(false);
      setAvatarUploadProgress(null);
      if (avatarFileInputRef.current) avatarFileInputRef.current.value = '';
    }
  };

  // Handler de upload com compressão da imagem de fundo (máx 1200px, WebP)
  const handleBgFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBg(true);
    setBgUploadProgress('Comprimindo imagem de fundo...');
    setBgStats(null);

    try {
      const compressed = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        format: 'image/webp'
      });

      setBgUploadProgress(`Enviando (${compressed.formattedCompressedSize})...`);

      const trainerId = profile.id || 'default_trainer';
      const res = await uploadTrainerImage(trainerId, compressed.blob, 'fundo');

      if (res.success && res.publicUrl) {
        setBgImageUrl(res.publicUrl);
        setBgStats(`Otimizado: de ${compressed.formattedOriginalSize} para ${compressed.formattedCompressedSize} (${compressed.reductionPercentage}% menor)`);
        onShowToast('Imagem de fundo comprimida e atualizada!');
      } else {
        alert('Erro no upload: ' + (res.error || 'Verifique se o bucket biosite-images foi criado no Supabase.'));
      }
    } catch (err: any) {
      console.error(err);
      alert('Erro ao comprimir imagem: ' + (err?.message || 'Tente novamente.'));
    } finally {
      setIsUploadingBg(false);
      setBgUploadProgress(null);
      if (bgFileInputRef.current) bgFileInputRef.current.value = '';
    }
  };

  // Planos (Serviços)
  const [services, setServices] = useState<ServicePlan[]>(() => {
    return JSON.parse(JSON.stringify(profile.services || []));
  });

  // Grade de Horários
  const [availableHours, setAvailableHours] = useState<Record<'Manhã' | 'Tarde' | 'Noite', string[]>>(() => {
    return profile.availableHours ? JSON.parse(JSON.stringify(profile.availableHours)) : {
      'Manhã': ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
      'Tarde': ['14:00', '15:00', '16:00', '17:00'],
      'Noite': ['18:00', '19:00', '20:00', '21:00']
    };
  });

  // Sincroniza estados dos campos sempre que o modal abrir ou o perfil atualizar
  React.useEffect(() => {
    if (isOpen) {
      setName(profile.name || '');
      setRole(profile.role || '');
      setCref(profile.cref || '');
      setSlug(profile.slug || '');
      setTagline(profile.tagline || '');
      setWhatsapp(profile.socialLinks?.whatsapp || '');
      setInstagram(profile.socialLinks?.instagram || '');
      setAvatarUrl(profile.avatarUrl || '');
      setBgImageUrl(profile.bgImageUrl || '');
      setCorPrimaria(profile.cor_primaria || '#F97316');
      setCorFundo(profile.cor_fundo || '#08090C');
      setCorTexto(profile.cor_texto || '#F8FAFC');
      setServices(profile.services ? JSON.parse(JSON.stringify(profile.services)) : []);
      setAvailableHours(profile.availableHours ? JSON.parse(JSON.stringify(profile.availableHours)) : {
        'Manhã': ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
        'Tarde': ['14:00', '15:00', '16:00', '17:00'],
        'Noite': ['18:00', '19:00', '20:00', '21:00']
      });
    }
  }, [isOpen, profile]);

  // Input para adicionar novo horário
  const [newHourInput, setNewHourInput] = useState('');
  const [selectedShiftForNewHour, setSelectedShiftForNewHour] = useState<'Manhã' | 'Tarde' | 'Noite'>('Manhã');

  // Adicionar horário à grade
  const handleAddHour = () => {
    const formatted = newHourInput.trim();
    if (!formatted) return;
    if (!/^\d{2}:\d{2}$/.test(formatted)) {
      alert('Formato inválido. Use HH:MM (ex: 08:00, 15:30)');
      return;
    }
    const currentList = availableHours[selectedShiftForNewHour] || [];
    if (currentList.includes(formatted)) {
      alert('Este horário já está adicionado neste turno.');
      return;
    }
    const updated = [...currentList, formatted].sort();
    setAvailableHours(prev => ({ ...prev, [selectedShiftForNewHour]: updated }));
    setNewHourInput('');
  };

  // Remover horário
  const handleRemoveHour = (shift: 'Manhã' | 'Tarde' | 'Noite', hourToRemove: string) => {
    setAvailableHours(prev => ({
      ...prev,
      [shift]: prev[shift].filter(h => h !== hourToRemove)
    }));
  };

  // Modificar plano
  const handlePlanChange = (index: number, field: keyof ServicePlan, value: any) => {
    setServices(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Adicionar novo plano
  const handleAddPlan = () => {
    const newPlan: ServicePlan = {
      id: 'plano-' + Math.random().toString(36).substring(2, 7),
      name: 'Novo Pacote de Acompanhamento',
      tag: 'Novidade',
      price: 'R$ 297',
      period: '/mês',
      description: 'Descrição detalhada dos diferenciais deste serviço...',
      features: ['Treino personalizado', 'Suporte via WhatsApp'],
      whatsappMessage: 'Olá! Gostaria de saber mais sobre este novo plano.'
    };
    setServices(prev => [...prev, newPlan]);
  };

  // Remover plano
  const handleRemovePlan = (index: number) => {
    if (services.length <= 1) {
      alert('Você precisa ter pelo menos um plano cadastrado.');
      return;
    }
    setServices(prev => prev.filter((_, i) => i !== index));
  };

  // Salvar no Supabase
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // 1. Obtém o user.id autenticado do Supabase
      const authUser = await getCurrentAuthUser();
      const userId = authUser?.id || profile.user_id;

      if (!userId) {
        alert('Usuário não autenticado no Supabase. Faça login no CRM para salvar alterações.');
        setIsSaving(false);
        return;
      }

      // 2. Monta EXATAMENTE e APENAS as 15 colunas da tabela trainers
      const exactPayload: TrainerUpdatePayload = {
        nome: name.trim(),
        slug: slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
        cref: cref.trim(),
        whatsapp: whatsapp.replace(/\D/g, ''),
        role: role.trim(),
        tagline: tagline.trim(),
        instagram: instagram.trim(),
        avatar_url: avatarUrl.trim(),
        bg_image_url: bgImageUrl.trim(),
        plans: services,
        social_proof: profile.socialProof || {},
        available_hours: availableHours,
        cor_primaria: corPrimaria,
        cor_fundo: corFundo,
        cor_texto: corTexto
      };

      // 3. Executa o .update() enviando apenas essas colunas exatas filtrando por .eq('user_id', user.id)
      const res = await updateTrainerProfileByUserId(userId, exactPayload);

      if (!res.success || !res.data) {
        // Se der algum erro no Supabase, exibe um alert(error.message) na tela para sabermos na hora
        alert(res.error || 'Erro ao atualizar dados no Supabase.');
        setIsSaving(false);
        return;
      }

      // 4. Sucesso: propaga o perfil atualizado para o CRM e contexto
      if (onSaveProfile) {
        await onSaveProfile(res.data);
      }
      onShowToast('Perfil atualizado com sucesso no Supabase! As alterações já estão ao vivo no Biosite.');
      onClose();
    } catch (err: any) {
      console.error(err);
      alert('Erro ao salvar alterações: ' + (err?.message || 'Tente novamente.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
          {/* Overlay Escuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Vitrificado */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl glass-modal rounded-3xl p-5 sm:p-7 max-h-[90vh] overflow-y-auto z-10 border border-white/15 shadow-2xl"
          >
            {/* Botão Fechar */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho */}
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
              <div className="p-3 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                  Gerenciamento Multi-Tenant
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Configurações do Perfil no Biosite
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Edite suas informações e reflita no site em tempo real sem necessidade de novo deploy.
                </p>
              </div>
            </div>

            {/* Abas Superiores */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 mb-6 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('geral')}
                className={`flex-1 min-h-[38px] px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'geral' ? 'bg-brand-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Dados & Bio</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cores')}
                className={`flex-1 min-h-[38px] px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'cores' ? 'bg-brand-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Identidade & Cores</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('midias')}
                className={`flex-1 min-h-[38px] px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'midias' ? 'bg-brand-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Foto & Fundo</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('planos')}
                className={`flex-1 min-h-[38px] px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'planos' ? 'bg-brand-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Planos ({services.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('horarios')}
                className={`flex-1 min-h-[38px] px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'horarios' ? 'bg-brand-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Grade de Horários</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* ABA 1: DADOS GERAIS */}
              {activeTab === 'geral' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Nome do Treinador / Marca
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Registro CREF
                      </label>
                      <input
                        type="text"
                        required
                        value={cref}
                        onChange={(e) => setCref(e.target.value)}
                        placeholder="CREF 000000-G/UF"
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Subtítulo / Especialidade
                    </label>
                    <input
                      type="text"
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Ex: Personal Trainer & Especialista em Hipertrofia"
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Tagline / Bio de Conversão
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="Frase de impacto que aparece logo abaixo da sua foto..."
                      className="w-full px-3.5 py-2 rounded-xl glass-input text-xs resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-brand-400" />
                      Slug do seu Biosite (Link na Bio)
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2.5 rounded-l-xl bg-white/5 border border-r-0 border-white/10 text-xs text-slate-400 font-mono">
                        /?p=
                      </span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))}
                        placeholder="seu-nome-personal"
                        className="w-full px-3.5 py-2.5 rounded-r-xl glass-input text-xs font-mono text-brand-300"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Link público único que você usará na bio do Instagram e WhatsApp (ex: <code className="text-brand-300">/?p={slug || 'seu-nome'}</code>).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        WhatsApp Oficial (apenas números com DDD)
                      </label>
                      <input
                        type="text"
                        required
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="5511999998888"
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                        Link / Usuário do Instagram
                      </label>
                      <input
                        type="text"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="https://instagram.com/seuperfil"
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 2: IDENTIDADE VISUAL & PALETA DE CORES */}
              {activeTab === 'cores' && (
                <div className="space-y-6">
                  {/* Seção 1: 5 Paletas Pré-definidas */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Palette className="w-4 h-4 text-brand-400" />
                      <h3 className="text-sm font-bold text-white">Paletas Rápidas Pré-definidas</h3>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">
                      Selecione uma paleta pronta otimizada para nichos fitness de alta conversão:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {PRESET_PALETTES.map(p => {
                        const isSelected =
                          corPrimaria.toLowerCase() === p.cor_primaria.toLowerCase() &&
                          corFundo.toLowerCase() === p.cor_fundo.toLowerCase();
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setCorPrimaria(p.cor_primaria);
                              setCorFundo(p.cor_fundo);
                              setCorTexto(p.cor_texto);
                            }}
                            className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative flex flex-col justify-between ${isSelected
                                ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/30 shadow-lg'
                                : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'
                              }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-xs font-bold text-white">{p.name}</span>
                              {isSelected && <Check className="w-4 h-4 text-brand-400 shrink-0 stroke-[2.5]" />}
                            </div>
                            <p className="text-[11px] text-slate-400 mb-3 leading-snug">{p.description}</p>
                            <div className="flex items-center gap-2 mt-auto">
                              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-black/40 border border-white/10">
                                <div
                                  className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                                  style={{ backgroundColor: p.cor_primaria }}
                                  title={`Primária: ${p.cor_primaria}`}
                                />
                                <div
                                  className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                                  style={{ backgroundColor: p.cor_fundo }}
                                  title={`Fundo: ${p.cor_fundo}`}
                                />
                                <div
                                  className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                                  style={{ backgroundColor: p.cor_texto }}
                                  title={`Texto: ${p.cor_texto}`}
                                />
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">{p.cor_primaria}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Seção 2: Seletores de Cores Personalizadas */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <h3 className="text-sm font-bold text-white mb-1">Ajuste Fino de Cores</h3>
                    <p className="text-xs text-slate-400 mb-4">
                      Personalize qualquer detalhe visual usando o seletor ou digitando o código hexadecimal:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Cor Primária */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                          <span>Cor Primária (Destaque)</span>
                          <span className="font-mono text-[10px] text-brand-400">{corPrimaria}</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={corPrimaria}
                            onChange={e => setCorPrimaria(e.target.value)}
                            className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                          />
                          <input
                            type="text"
                            value={corPrimaria}
                            onChange={e => setCorPrimaria(e.target.value)}
                            placeholder="#F97316"
                            className="flex-1 px-3 py-2 rounded-xl glass-input text-xs font-mono text-white uppercase"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block">Botões CTA, badges, anel e ícones.</span>
                      </div>

                      {/* Cor de Fundo */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                          <span>Cor de Fundo</span>
                          <span className="font-mono text-[10px] text-slate-400">{corFundo}</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={corFundo}
                            onChange={e => setCorFundo(e.target.value)}
                            className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                          />
                          <input
                            type="text"
                            value={corFundo}
                            onChange={e => setCorFundo(e.target.value)}
                            placeholder="#08090C"
                            className="flex-1 px-3 py-2 rounded-xl glass-input text-xs font-mono text-white uppercase"
                          />
                        </div>
                        <div className="flex items-center gap-1 mt-1.5">
                          <button
                            type="button"
                            onClick={() => setCorFundo('#08090C')}
                            className="px-2 py-0.5 rounded bg-black/60 hover:bg-black text-[10px] text-slate-300 border border-white/10 cursor-pointer"
                          >
                            Escuro #08090C
                          </button>
                          <button
                            type="button"
                            onClick={() => setCorFundo('#0A0A0A')}
                            className="px-2 py-0.5 rounded bg-black/60 hover:bg-black text-[10px] text-slate-300 border border-white/10 cursor-pointer"
                          >
                            Onyx #0A0A0A
                          </button>
                        </div>
                      </div>

                      {/* Cor de Texto */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                          <span>Cor do Texto</span>
                          <span className="font-mono text-[10px] text-slate-400">{corTexto}</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={corTexto}
                            onChange={e => setCorTexto(e.target.value)}
                            className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                          />
                          <input
                            type="text"
                            value={corTexto}
                            onChange={e => setCorTexto(e.target.value)}
                            placeholder="#F8FAFC"
                            className="flex-1 px-3 py-2 rounded-xl glass-input text-xs font-mono text-white uppercase"
                          />
                        </div>
                        <div className="flex items-center gap-1 mt-1.5">
                          <button
                            type="button"
                            onClick={() => setCorTexto('#F8FAFC')}
                            className="px-2 py-0.5 rounded bg-black/60 hover:bg-black text-[10px] text-slate-300 border border-white/10 cursor-pointer"
                          >
                            Gelo #F8FAFC
                          </button>
                          <button
                            type="button"
                            onClick={() => setCorTexto('#FFFFFF')}
                            className="px-2 py-0.5 rounded bg-black/60 hover:bg-black text-[10px] text-slate-300 border border-white/10 cursor-pointer"
                          >
                            Branco #FFFFFF
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seção 3: Pré-visualização em Tempo Real (Live Preview) */}
                  <div
                    className="p-5 rounded-2xl border transition-colors duration-300 shadow-xl"
                    style={{ backgroundColor: corFundo, color: corTexto, borderColor: `${corPrimaria}40` }}
                  >
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                      <span className="text-[11px] font-bold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" style={{ color: corPrimaria }} />
                        Pré-visualização em Tempo Real do Biosite
                      </span>
                      <span
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${corPrimaria}25`,
                          color: corPrimaria,
                          border: `1px solid ${corPrimaria}50`
                        }}
                      >
                        {cref || 'CREF ATIVO'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5 mb-4">
                      <div
                        className="w-12 h-12 rounded-full p-0.5 shrink-0 shadow-lg"
                        style={{ border: `2px solid ${corPrimaria}` }}
                      >
                        <img
                          src={avatarUrl || profile.avatarUrl}
                          alt="Avatar"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-black" style={{ color: corTexto }}>
                          {name || 'Nome do Personal'}
                        </h4>
                        <p className="text-[11px] opacity-75 line-clamp-1">
                          {role || 'Personal Trainer & Consultoria'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <button
                        type="button"
                        className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        style={{
                          backgroundColor: corPrimaria,
                          color: '#08090C',
                          boxShadow: `0 6px 20px ${corPrimaria}40`
                        }}
                      >
                        <span>Agendar Aula Experimental</span>
                      </button>

                      <div
                        className="p-3 rounded-xl border flex items-center justify-between text-xs"
                        style={{
                          backgroundColor: `${corPrimaria}12`,
                          borderColor: `${corPrimaria}30`,
                          color: corTexto
                        }}
                      >
                        <span className="font-semibold">Plano Consultoria Online VIP</span>
                        <span className="font-mono font-bold" style={{ color: corPrimaria }}>
                          R$ 297/mês
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 2: MÍDIAS (FOTO DE PERFIL E FUNDO COM UPLOAD & COMPRESSÃO AUTOMÁTICA) */}
              {activeTab === 'midias' && (
                <div className="space-y-6">
                  {/* Inputs de arquivo ocultos */}
                  <input
                    type="file"
                    ref={avatarFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFileSelect}
                  />
                  <input
                    type="file"
                    ref={bgFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleBgFileSelect}
                  />

                  {/* 1. SEÇÃO: FOTO DE PERFIL / AVATAR */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className="block text-xs font-bold text-white">
                          Foto de Perfil (Avatar com anel pulsante)
                        </label>
                        <p className="text-[11px] text-slate-400">
                          Redimensionamento automático (máx 800px) e conversão para WebP de alta performance.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="min-h-[40px] px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 transition-all cursor-pointer whitespace-nowrap"
                      >
                        {isUploadingAvatar ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{avatarUploadProgress || 'Processando...'}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 stroke-[2.5]" />
                            <span>Escolher da Galeria / Celular</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Feedback de estatísticas de compressão */}
                    {avatarStats && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{avatarStats}</span>
                      </div>
                    )}

                    {/* Campo de URL alternativa / fallback */}
                    <div>
                      <span className="block text-[10px] text-slate-400 font-medium mb-1">
                        URL da Foto (preenchida automaticamente após o upload):
                      </span>
                      <input
                        type="url"
                        required
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono text-slate-300"
                      />
                    </div>

                    {/* Prévia da Foto */}
                    {avatarUrl && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10">
                        <img
                          src={avatarUrl}
                          alt="Prévia do Avatar"
                          className="w-16 h-16 rounded-full object-cover border-2 border-brand-500 shadow-lg shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="text-xs">
                          <span className="font-bold text-white block">Prévia da Foto de Perfil</span>
                          <span className="text-[11px] text-slate-400">
                            Exibida com anel sonar pulsante e badge de especialista na tela inicial do Biosite.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. SEÇÃO: IMAGEM DE FUNDO */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className="block text-xs font-bold text-white">
                          Imagem de Fundo (Atmosphere Gym / Local de Treino)
                        </label>
                        <p className="text-[11px] text-slate-400">
                          Redimensionamento automático (máx 1200px) e compressão para carregamento instantâneo.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => bgFileInputRef.current?.click()}
                        disabled={isUploadingBg}
                        className="min-h-[40px] px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 transition-all cursor-pointer whitespace-nowrap"
                      >
                        {isUploadingBg ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{bgUploadProgress || 'Processando...'}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 stroke-[2.5]" />
                            <span>Escolher da Galeria / Celular</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Feedback de estatísticas de compressão do fundo */}
                    {bgStats && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{bgStats}</span>
                      </div>
                    )}

                    {/* Campo de URL alternativa / fallback */}
                    <div>
                      <span className="block text-[10px] text-slate-400 font-medium mb-1">
                        URL da Imagem de Fundo (preenchida automaticamente após o upload):
                      </span>
                      <input
                        type="url"
                        required
                        value={bgImageUrl}
                        onChange={(e) => setBgImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono text-slate-300"
                      />
                    </div>

                    {/* Prévia com Overlay Dark */}
                    {bgImageUrl && (
                      <div className="relative h-28 rounded-xl overflow-hidden border border-white/10">
                        <img
                          src={bgImageUrl}
                          alt="Prévia do Fundo"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-xs font-bold text-white bg-black/80 px-3 py-1.5 rounded-xl border border-white/20">
                            Prévia com Overlay Dark do Biosite
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ABA 3: PLANOS E CONSULTORIAS */}
              {activeTab === 'planos' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Configure os pacotes que aparecem no modal de serviços e nas opções de compra.
                    </span>
                    <button
                      type="button"
                      onClick={handleAddPlan}
                      className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Novo Pacote</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {services.map((plan, index) => (
                      <div
                        key={plan.id || index}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-brand-400 uppercase tracking-wider">
                            Pacote #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePlan(index)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                            title="Remover este plano"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                              Nome do Plano
                            </label>
                            <input
                              type="text"
                              value={plan.name}
                              onChange={(e) => handlePlanChange(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                              Tag de Destaque
                            </label>
                            <input
                              type="text"
                              value={plan.tag}
                              onChange={(e) => handlePlanChange(index, 'tag', e.target.value)}
                              placeholder="Ex: Mais Vendido"
                              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                              Valor (Ex: R$ 197)
                            </label>
                            <input
                              type="text"
                              value={plan.price}
                              onChange={(e) => handlePlanChange(index, 'price', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-emerald-400"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                              Periodicidade (Ex: /mês, taxa única)
                            </label>
                            <input
                              type="text"
                              value={plan.period}
                              onChange={(e) => handlePlanChange(index, 'period', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Descrição Resumida
                          </label>
                          <textarea
                            rows={2}
                            value={plan.description}
                            onChange={(e) => handlePlanChange(index, 'description', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl glass-input text-xs resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ABA 4: GRADE DE HORÁRIOS DISPONÍVEIS */}
              {activeTab === 'horarios' && (
                <div className="space-y-5">
                  <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-300">
                    💡 Os horários configurados aqui aparecem instantaneamente para os alunos no formulário de agendamento do Biosite e montam a régua da sua Agenda no CRM.
                  </div>

                  {/* Adicionar novo horário */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Turno para Adicionar
                      </label>
                      <select
                        value={selectedShiftForNewHour}
                        onChange={(e) => setSelectedShiftForNewHour(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold"
                      >
                        <option value="Manhã" className="bg-slate-900">Manhã</option>
                        <option value="Tarde" className="bg-slate-900">Tarde</option>
                        <option value="Noite" className="bg-slate-900">Noite</option>
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Horário (HH:MM)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 07:30"
                        maxLength={5}
                        value={newHourInput}
                        onChange={(e) => setNewHourInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono font-bold text-brand-400"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddHour}
                      className="py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Adicionar</span>
                    </button>
                  </div>

                  {/* Listagem dos Horários por Turno */}
                  <div className="space-y-4">
                    {(['Manhã', 'Tarde', 'Noite'] as Array<'Manhã' | 'Tarde' | 'Noite'>).map((shift) => (
                      <div key={shift} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-brand-400" />
                            Turno da {shift} ({availableHours[shift]?.length || 0} horários)
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {(availableHours[shift] || []).map((h) => (
                            <div
                              key={h}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 border border-white/15 text-xs font-mono font-bold text-slate-200 group"
                            >
                              <span>{h}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveHour(shift, h)}
                                className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                                title={`Remover ${h}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botões do Rodapé */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="min-h-[44px] px-5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="min-h-[44px] px-6 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando no Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Salvar Alterações ao Vivo</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
