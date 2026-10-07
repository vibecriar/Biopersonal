import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProfileConfig } from '../types';
import { profileConfig as fallbackProfile } from '../config/profile';
import { getTrainer, updateTrainer } from '../lib/supabase';

interface ProfileContextType {
  profile: ProfileConfig;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfileData: (updates: Partial<ProfileConfig>) => Promise<boolean>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<ProfileConfig>(fallbackProfile);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTrainer();
      setProfile(data);
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
        isLoading,
        error,
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
