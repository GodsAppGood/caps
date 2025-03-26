
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';
import { ToastOptions } from '@/hooks/use-toast';

// Fetch user profile data
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Upload avatar image
export const uploadAvatar = async (
  file: File, 
  userId: string, 
  showToast: (options: ToastOptions) => void
): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = fileName;
    
    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('profile_images')
      .upload(filePath, file, { upsert: true });
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data } = supabase.storage
      .from('profile_images')
      .getPublicUrl(filePath);
    
    // Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: data.publicUrl })
      .eq('id', userId);
    
    if (updateError) throw updateError;
    
    showToast({
      title: "Avatar updated",
      description: "Your profile image has been updated successfully",
    });
    
    return data.publicUrl;
  } catch (error: any) {
    console.error('Error uploading avatar:', error);
    showToast({
      title: "Upload failed",
      description: error.message || "Failed to upload profile image",
      variant: "destructive",
    });
    return null;
  }
};

// Update wallet address
export const updateWalletAddress = async (userId: string, address: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ wallet_address: address })
      .eq('id', userId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating wallet address:', error);
  }
};
