import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

// Fetch user profile
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

// Upload avatar
export const uploadAvatar = async (file: File, userId: string, toast: ReturnType<typeof useToast>): Promise<string | null> => {
  try {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please choose an image to upload",
        variant: "destructive"
      });
      return null;
    }

    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl }, error: urlError } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (urlError) throw urlError;

    // Update profile with new avatar URL
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (profileUpdateError) throw profileUpdateError;

    toast({
      title: "Avatar Updated",
      description: "Your profile picture has been successfully updated"
    });

    return publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    toast({
      title: "Upload Failed",
      description: "There was an error uploading your avatar",
      variant: "destructive"
    });
    return null;
  }
};

// Keep existing wallet address update function
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
