
import { supabase } from "@/integrations/supabase/client";

export type Capsule = {
  id: string;
  name: string;
  creator_id: string;
  image_url?: string | null;
  message?: string | null;
  unlock_date: string;
  auction_enabled: boolean;
  status: 'open' | 'closed';
  highest_bid: number;
  highest_bidder?: string | null;
  created_at: string;
  updated_at: string;
  creator?: {
    username?: string;
  };
};

export type CapsuleCreate = {
  name: string;
  creator_id: string;
  image_url?: string | null;
  message?: string | null;
  unlock_date: string;
  auction_enabled: boolean;
  status?: 'open' | 'closed';
  highest_bid?: number;
  highest_bidder?: string | null;
};

export const createCapsule = async (capsuleData: CapsuleCreate) => {
  try {
    const { data, error } = await supabase
      .from('capsules')
      .insert({
        name: capsuleData.name,
        creator_id: capsuleData.creator_id,
        image_url: capsuleData.image_url,
        message: capsuleData.message,
        unlock_date: capsuleData.unlock_date,
        auction_enabled: capsuleData.auction_enabled,
        created_at: new Date().toISOString(),
        status: 'open',
        current_bid: 0,
        highest_bidder_id: null
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating capsule:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error in createCapsule:", error);
    throw error;
  }
};

// Add a function to place a bid
export const placeBid = async (capsuleId: string, bidAmount: number) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to place a bid');
    }

    // Insert bid into capsule_bids table
    const { data: bidData, error: bidError } = await supabase
      .from('capsule_bids')
      .insert({
        capsule_id: capsuleId,
        bidder_id: user.id,
        bid_amount: bidAmount,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (bidError) {
      console.error("Error inserting bid:", bidError);
      throw bidError;
    }

    // Update capsule with highest bid
    const { data: capsuleData, error: capsuleError } = await supabase
      .from('capsules')
      .update({ 
        current_bid: bidAmount, 
        highest_bidder_id: user.id 
      })
      .eq('id', capsuleId)
      .select()
      .single();

    if (capsuleError) {
      console.error("Error updating capsule bid:", capsuleError);
      throw capsuleError;
    }

    return { bid: bidData, capsule: capsuleData };
  } catch (error) {
    console.error("Unexpected error in placeBid:", error);
    throw error;
  }
};

// Get all capsules
export const getAllCapsules = async (): Promise<Capsule[]> => {
  try {
    const { data, error } = await supabase
      .from('capsules')
      .select(`
        *,
        creator:creator_id (
          username
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching capsules:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error in getAllCapsules:", error);
    throw error;
  }
};

// Get capsules created by a specific user
export const getUserCapsules = async (userId: string): Promise<Capsule[]> => {
  try {
    const { data, error } = await supabase
      .from('capsules')
      .select(`
        *,
        creator:creator_id (
          username
        )
      `)
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching user capsules:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error in getUserCapsules:", error);
    throw error;
  }
};

// Get bids for a specific capsule
export const getCapsuleBids = async (capsuleId: string) => {
  try {
    const { data, error } = await supabase
      .from('capsule_bids')
      .select(`
        *,
        bidder:bidder_id (
          username
        )
      `)
      .eq('capsule_id', capsuleId)
      .order('bid_amount', { ascending: false });

    if (error) {
      console.error("Error fetching capsule bids:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error in getCapsuleBids:", error);
    throw error;
  }
};

// Accept a bid for a capsule
export const acceptBid = async (capsuleId: string, bidId: string) => {
  try {
    // Update the bid to mark it as accepted
    const { error: bidError } = await supabase
      .from('capsule_bids')
      .update({ is_accepted: true })
      .eq('id', bidId)
      .eq('capsule_id', capsuleId);

    if (bidError) {
      console.error("Error accepting bid:", bidError);
      throw bidError;
    }

    // Update capsule status to closed
    const { data: capsuleData, error: capsuleError } = await supabase
      .from('capsules')
      .update({ 
        status: 'closed',
        unlock_date: new Date().toISOString() // Immediately unlock the capsule
      })
      .eq('id', capsuleId)
      .select()
      .single();

    if (capsuleError) {
      console.error("Error updating capsule status:", capsuleError);
      throw capsuleError;
    }

    return capsuleData;
  } catch (error) {
    console.error("Unexpected error in acceptBid:", error);
    throw error;
  }
};
