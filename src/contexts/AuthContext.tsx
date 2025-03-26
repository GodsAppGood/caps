
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { useAccount } from 'wagmi';
import { AuthContextType, UserProfile } from '@/types/auth';
import { fetchUserProfile, updateWalletAddress, uploadAvatar as uploadAvatarService } from '@/services/profileService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();
  const { address } = useAccount();

  // Refresh user profile data
  const refreshUserProfile = async () => {
    if (user?.id) {
      const profile = await fetchUserProfile(user.id);
      if (profile) {
        setUserProfile(profile);
      }
    }
  };

  // Upload avatar image
  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    const url = await uploadAvatarService(file, user.id, toast);
    
    // Refresh the profile to get updated data
    if (url) {
      await refreshUserProfile();
    }
    
    return url;
  };

  // Update wallet address if needed
  useEffect(() => {
    const updateUserWalletAddress = async () => {
      if (user && address && userProfile && userProfile.wallet_address !== address) {
        await updateWalletAddress(user.id, address);
        
        // Refresh user profile
        await refreshUserProfile();
      }
    };
    
    updateUserWalletAddress();
  }, [user, address, userProfile]);

  useEffect(() => {
    // First, set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchUserProfile(session.user.id).then(profile => {
            if (profile) {
              setUserProfile(profile);
            }
          });
        } else {
          setUserProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id).then(profile => {
          if (profile) {
            setUserProfile(profile);
          }
        });
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "An error occurred while signing out",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    userProfile,
    signOut,
    refreshUserProfile,
    uploadAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
