import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProfileConfig } from '../types';
import { emptyProfile } from '../config/profile';
import { getTrainer, getTrainerBySlug, updateTrainer } from '../lib/supabase';
import { applyTheme } from '../lib/theme';

export const getSlugFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;

  // 1. Query Param: ?p=slug ou ?trainer=slug
  const searchParams = new URLSearchParams(window.location.search);
  const paramSlug = searchParams.get('p') || searchParams.get('trainer');
  if (paramSlug && paramSlug.trim()) {
    return paramSlug.trim().toLowerCase();
  }

  // 2. Hash: #slug ou #/slug ou #/p/slug (exclui admin e login)
  const rawHash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  if (rawHash && !rawHash.startsWith('access_token')) {
    if (rawHash === 'admin' || rawHash === 'login') {
      return null;
    }
    if (rawHash.startsWith('p/')) {
      const part = rawHash.substring(2).trim();
      if (part) return part;
    }
    // Não considera hashes vazios
    if (rawHash.length > 0 && !rawHash.includes('=')) {
      return rawHash;
    }
  }

  // 3. Pathname: /p/:slug ou /:slug
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').trim().toLowerCase();
  if (path && path !== 'admin' && path !== 'login' && path !== 'index.html' && !path.includes('.')) {
    if (path.startsWith('p/')) {
      const part = path.substring(2).trim();
      if (part) return part;
    }
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
  const [profile, setProfile] = useState<ProfileConfig>(emptyProfile);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [slugNotFound, setSlugNotFound] = useState<boolean>(false);
  const [currentSlug, setCurrentSlug] = useState<string | null>(() => getSlugFromUrl());

  const hasSlugInUrl = Boolean(currentSlug);

  useEffect(() => {
    const handleUrlChange = () => {
      const detected = getSlugFromUrl();
      setCurrentSlug(detected);
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    setSlugNotFound(false);

    try {
      if (currentSlug) {
        // Carregamento dinâmico pelo slug na URL consultando o Supabase
        const trainerBySlug = await getTrainerBySlug(currentSlug);
        if (trainerBySlug) {
          setProfile(trainerBySlug);
          setSlugNotFound(false);
        } else {
          setProfile(emptyProfile);
          setSlugNotFound(true);
          setError('Perfil não encontrado.');
        }
      } else {
        // Sem slug na URL (acesso à home geral / Login do CRM)
        setProfile(emptyProfile);
        setSlugNotFound(false);
      }
    } catch (err: any) {
      console.warn('Erro ao obter perfil do treinador:', err);
      setError(err?.message || 'Erro ao carregar dados do treinador');
      setProfile(emptyProfile);
      setSlugNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [currentSlug]);

  // Aplica as cores dinâmicas no documento sempre que o perfil mudar
  useEffect(() => {
    if (profile && profile.id) {
      applyTheme({
        cor_primaria: profile.cor_primaria,
        cor_fundo: profile.cor_fundo,
        cor_texto: profile.cor_texto
      });
    }
  }, [profile?.cor_primaria, profile?.cor_fundo, profile?.cor_texto, profile?.id]);

  const updateProfileData = async (updates: Partial<ProfileConfig>): Promise<boolean> => {
    try {
      const trainerId = profile.id;
      if (!trainerId) return false;
      const result = await updateTrainer(trainerId, updates);
      if (result.success && result.data) {
        setProfile(result.data);
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
        currentSlug,
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
