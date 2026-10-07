import React, { useState } from 'react';
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
  CreditCard
} from 'lucide-react';
import { InstagramIcon } from './icons/InstagramIcon';
import { ProfileConfig, ServicePlan } from '../types';

interface TrainerProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileConfig;
  onSaveProfile: (updates: Partial<ProfileConfig>) => Promise<boolean>;
  onShowToast: (msg: string) => void;
}

type TabKey = 'geral' | 'midias' | 'planos' | 'horarios';

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
  const [tagline, setTagline] = useState(profile.tagline);
  const [whatsapp, setWhatsapp] = useState(profile.socialLinks.whatsapp);
  const [instagram, setInstagram] = useState(profile.socialLinks.instagram);

  // Mídias
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [bgImageUrl, setBgImageUrl] = useState(profile.bgImageUrl);

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
      const updates: Partial<ProfileConfig> = {
        name: name.trim(),
        role: role.trim(),
        cref: cref.trim(),
        tagline: tagline.trim(),
        avatarUrl: avatarUrl.trim(),
        bgImageUrl: bgImageUrl.trim(),
        socialLinks: {
          ...profile.socialLinks,
          whatsapp: whatsapp.replace(/\D/g, ''),
          instagram: instagram.trim()
        },
        services,
        availableHours
      };

      const success = await onSaveProfile(updates);

      if (success) {
        onShowToast('Perfil atualizado com sucesso no Supabase! As alterações já estão ao vivo no Biosite.');
        onClose();
      } else {
        alert('Não foi possível salvar no Supabase. Verifique sua conexão e tente novamente.');
      }
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
                className={`flex-1 min-h-[38px] px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'geral' ? 'bg-brand-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Dados & Bio</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('midias')}
                className={`flex-1 min-h-[38px] px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'midias' ? 'bg-brand-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Foto & Fundo</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('planos')}
                className={`flex-1 min-h-[38px] px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'planos' ? 'bg-brand-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Planos ({services.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('horarios')}
                className={`flex-1 min-h-[38px] px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'horarios' ? 'bg-brand-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
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

              {/* ABA 2: MÍDIAS (FOTO DE PERFIL E FUNDO) */}
              {activeTab === 'midias' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      URL da Foto de Perfil (Avatar com anel pulsante)
                    </label>
                    <input
                      type="url"
                      required
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                    />
                    {avatarUrl && (
                      <div className="mt-3 flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                        <img
                          src={avatarUrl}
                          alt="Prévia do Avatar"
                          className="w-14 h-14 rounded-full object-cover border-2 border-brand-500 shadow-lg"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="text-xs">
                          <span className="font-bold text-white block">Prévia da Foto de Perfil</span>
                          <span className="text-[11px] text-slate-400">Formato ideal: quadrado (proporção 1:1)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      URL da Imagem de Fundo (Atmosphere Gym)
                    </label>
                    <input
                      type="url"
                      required
                      value={bgImageUrl}
                      onChange={(e) => setBgImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                    />
                    {bgImageUrl && (
                      <div className="mt-3 relative h-28 rounded-2xl overflow-hidden border border-white/10">
                        <img
                          src={bgImageUrl}
                          alt="Prévia do Fundo"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-xs font-bold text-white bg-black/70 px-3 py-1.5 rounded-xl border border-white/20">
                            Prévia com Overlay Dark
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
