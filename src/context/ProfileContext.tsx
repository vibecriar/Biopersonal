import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProfileConfig } from '../types';
import { profileConfig as fallbackProfile } from '../config/profile';
import { getTrainer, getTrainerBySlug, updateTrainer } from '../lib/supabase';

export const getSlugFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  const searchParams = new URLSearchParams(window.location.search);
  const paramSlug = searchParams.get('p') || searchParams.get('trainer');
  if (paramSlug && paramSlug.trim()) {
    return paramSlug.trim().toLowerCase();
  }
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').trim().toLowerCase();
  // Ignora rotas administrativas e arquivos estáticos
  if (path && path !== 'admin' && path !== 'login' && path !== 'index.html' && !path.includes('.')) {
    return path;
  }
  return null;
};

interface ProfileContextType {
  profile: ProfileConfig;
  setProfile: React.Dispatch<React.SetStateAction<ProfileConfig>>;
  isLoading: boolean;
  error: string | null;
  slugNotFound: boolean;
  hasSlugInUrl: boolean;
  currentSlug: string | null;
  refreshProfile: () => Promise<void>;
  updateProfileData: (updates: Partial<ProfileConfig>) => Promise<boolean>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<ProfileConfig>(fallbackProfile);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [slugNotFound, setSlugNotFound] = useState<boolean>(false);

  const slug = getSlugFromUrl();
  const hasSlugInUrl = Boolean(slug);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    setSlugNotFound(false);

    try {
      if (slug) {
        // Carregamento dinâmico pelo slug na URL
        const trainerBySlug = await getTrainerBySlug(slug);
        if (trainerBySlug) {
          setProfile(trainerBySlug);
          setSlugNotFound(false);
        } else {
          setSlugNotFound(true);
          setError(`Personal Trainer "${slug}" não encontrado.`);
        }
      } else {
        // Sem slug na URL (acesso à home geral)
        const data = await getTrainer();
        setProfile(data);
      }
    } catch (err: any) {
      console.warn('Erro ao obter perfil do treinador:', err);
      setError(err?.message || 'Erro ao carregar dados do treinador');
      setProfile(fallbackProfile);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateProfileData = async (updates: Partial<ProfileConfig>): Promise<boolean> => {
    try {
      const trainerId = profile.id || fallbackProfile.id || 'default';
      const result = await updateTrainer(trainerId, updates);
      if (result.success && result.data) {
        setProfile(result.data);
        return true;
      }
      if (result.success) {
        setProfile(prev => ({
          ...prev,
          ...updates,
          socialLinks: {
            ...prev.socialLinks,
            ...(updates.socialLinks || {})
          },
          services: updates.services || prev.services,
          availableHours: updates.availableHours || prev.availableHours
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao atualizar perfil no contexto:', err);
      return false;
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile,
        isLoading,
        error,
        slugNotFound,
        hasSlugInUrl,
        currentSlug: slug,
        refreshProfile: fetchProfile,
        updateProfileData
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile deve ser utilizado dentro de um ProfileProvider');
  }
  return context;
};
