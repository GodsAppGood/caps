
import { supabase } from '@/integrations/supabase/client';

export const updateWalletAddress = async (userId: string, address: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ wallet_address: address })
      .eq('id', userId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating wallet address:', error);
    throw error;
  }
};
