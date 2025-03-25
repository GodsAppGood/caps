
import { supabase } from "@/integrations/supabase/client";

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
        ...capsuleData,
        created_at: new Date().toISOString(),
        status: 'open',
        highest_bid: 0,
        highest_bidder: null
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
        highest_bid: bidAmount, 
        highest_bidder: user.id 
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
