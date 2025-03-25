
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Capsule = {
  id: string;
  name: string;
  open_date: string;
  initial_bid: number;
  status: 'opened' | 'closed';
  creator_id: string;
  winner_id?: string;
  message?: string;
  image_url?: string;
  encryption_level: 'standard' | 'enhanced' | 'quantum';
  created_at: string;
  updated_at: string;
};

export type CapsuleCreate = Omit<Capsule, 'id' | 'creator_id' | 'status' | 'created_at' | 'updated_at'>;

// Create a new capsule
export const createCapsule = async (capsuleData: CapsuleCreate) => {
  const { user } = useAuth();
  
  if (!user) {
    throw new Error("User must be authenticated to create a capsule");
  }
  
  const { data, error } = await supabase
    .from('capsules')
    .insert({
      ...capsuleData,
      creator_id: user.id,
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating capsule:", error);
    throw error;
  }
  
  return data;
};

// Get all capsules
export const getAllCapsules = async () => {
  const { data, error } = await supabase
    .from('capsules')
    .select(`
      *,
      creator:creator_id(
        id,
        avatar_url,
        username
      ),
      winner:winner_id(
        id,
        avatar_url,
        username
      )
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching capsules:", error);
    throw error;
  }
  
  return data;
};

// Get today's capsules (capsules that will open today)
export const getTodayCapsules = async () => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
  
  const { data, error } = await supabase
    .from('capsules')
    .select(`
      *,
      creator:creator_id(
        id,
        avatar_url,
        username
      ),
      winner:winner_id(
        id,
        avatar_url,
        username
      )
    `)
    .gte('open_date', startOfDay)
    .lte('open_date', endOfDay)
    .order('open_date', { ascending: true });
  
  if (error) {
    console.error("Error fetching today's capsules:", error);
    throw error;
  }
  
  return data;
};

// Get capsules created by a specific user
export const getUserCapsules = async (userId: string) => {
  const { data, error } = await supabase
    .from('capsules')
    .select(`
      *,
      creator:creator_id(
        id,
        avatar_url,
        username
      ),
      winner:winner_id(
        id,
        avatar_url,
        username
      )
    `)
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching user capsules:", error);
    throw error;
  }
  
  return data;
};

// Get a specific capsule by ID
export const getCapsuleById = async (id: string) => {
  const { data, error } = await supabase
    .from('capsules')
    .select(`
      *,
      creator:creator_id(
        id,
        avatar_url,
        username
      ),
      winner:winner_id(
        id,
        avatar_url,
        username
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error("Error fetching capsule:", error);
    throw error;
  }
  
  return data;
};
