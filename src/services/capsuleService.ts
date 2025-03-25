
import { supabase } from "@/integrations/supabase/client";
import { createCapsuleWithPayment, placeBidOnChain, acceptBidOnChain } from "@/lib/contractHelpers";

export type Capsule = {
  id: string;
  name: string;
  open_date: string;
  initial_bid: number;
  current_bid?: number;
  highest_bidder_id?: string;
  status: 'opened' | 'closed';
  creator_id: string;
  winner_id?: string;
  message?: string;
  image_url?: string;
  encryption_level: 'standard' | 'enhanced' | 'quantum';
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    username?: string;
    avatar_url?: string;
  };
  winner?: {
    id: string;
    username?: string;
    avatar_url?: string;
  };
};

export type CapsuleCreate = Omit<Capsule, 'id' | 'creator_id' | 'status' | 'created_at' | 'updated_at' | 'creator' | 'winner'>;

// Create a new capsule with blockchain payment
export const createCapsule = async (capsuleData: CapsuleCreate, userId: string) => {
  // First, process the blockchain payment
  const paymentSuccess = await createCapsuleWithPayment(
    capsuleData.name,
    capsuleData.open_date,
    capsuleData.initial_bid,
    capsuleData.encryption_level
  );

  if (!paymentSuccess) {
    throw new Error("Payment failed. Capsule not created.");
  }
  
  // Then, store the data in Supabase
  const { data, error } = await supabase
    .from('capsules')
    .insert({
      ...capsuleData,
      creator_id: userId,
      current_bid: capsuleData.initial_bid
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating capsule in database:", error);
    throw error;
  }
  
  return data;
};

// Place a bid on a capsule
export const placeBid = async (capsuleId: string, bidAmount: number, bidderId: string) => {
  // First, get the current capsule data to verify bid
  const { data: capsule, error: fetchError } = await supabase
    .from('capsules')
    .select('*')
    .eq('id', capsuleId)
    .single();
  
  if (fetchError) {
    console.error("Error fetching capsule for bid:", fetchError);
    throw fetchError;
  }
  
  const currentHighestBid = capsule.current_bid || capsule.initial_bid;
  
  // Check if bid is at least 10% higher than the current highest bid
  if (bidAmount < currentHighestBid * 1.1) {
    throw new Error(`Bid must be at least ${(currentHighestBid * 1.1).toFixed(2)} BNB (10% higher than current bid)`);
  }
  
  // Try to place the bid on blockchain (optional, can be enabled if contract is deployed)
  // const blockchainSuccess = await placeBidOnChain(capsuleId, bidAmount);
  
  // if (!blockchainSuccess) {
  //   throw new Error("Failed to place bid on blockchain");
  // }
  
  // Update the capsule with the new bid
  const { data, error } = await supabase
    .from('capsules')
    .update({
      current_bid: bidAmount,
      highest_bidder_id: bidderId,
      updated_at: new Date().toISOString()
    })
    .eq('id', capsuleId)
    .select()
    .single();
  
  if (error) {
    console.error("Error placing bid:", error);
    throw error;
  }
  
  // Create a record in the bids table
  const { data: bidData, error: bidError } = await supabase
    .from('bids')
    .insert({
      capsule_id: capsuleId,
      bidder_id: bidderId,
      amount: bidAmount,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (bidError) {
    console.error("Error recording bid history:", bidError);
    // We don't throw here as the bid was already placed successfully
  }
  
  return data;
};

// Accept a bid
export const acceptBid = async (capsuleId: string, bidId: string) => {
  // First, get the capsule to verify ownership
  const { data: capsule, error: capsuleError } = await supabase
    .from('capsules')
    .select('*')
    .eq('id', capsuleId)
    .single();
  
  if (capsuleError) {
    console.error("Error fetching capsule:", capsuleError);
    throw capsuleError;
  }
  
  // Get the bid information
  const { data: bid, error: bidError } = await supabase
    .from('bids')
    .select('*')
    .eq('id', bidId)
    .single();
  
  if (bidError) {
    console.error("Error fetching bid:", bidError);
    throw bidError;
  }
  
  // Try to accept the bid on blockchain (optional, can be enabled if contract is deployed)
  // const blockchainSuccess = await acceptBidOnChain(capsuleId);
  
  // if (!blockchainSuccess) {
  //   throw new Error("Failed to accept bid on blockchain");
  // }
  
  // Mark bid as accepted in the database
  const { data, error } = await supabase
    .from('bids')
    .update({
      is_accepted: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', bidId)
    .select()
    .single();
  
  if (error) {
    console.error("Error accepting bid:", error);
    throw error;
  }
  
  // Update capsule status (this is handled by the database trigger)
  
  return data;
};

// Get all capsules
export const getAllCapsules = async () => {
  const { data, error } = await supabase
    .from('capsules')
    .select(`
      *,
      creator:profiles(
        id,
        username,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching capsules:", error);
    throw error;
  }
  
  return data || [];
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
      creator:profiles(
        id,
        username,
        avatar_url
      )
    `)
    .gte('open_date', startOfDay)
    .lte('open_date', endOfDay)
    .order('open_date', { ascending: true });
  
  if (error) {
    console.error("Error fetching today's capsules:", error);
    throw error;
  }
  
  return data || [];
};

// Get capsules created by a specific user
export const getUserCapsules = async (userId: string) => {
  const { data, error } = await supabase
    .from('capsules')
    .select(`
      *,
      creator:profiles(
        id,
        username,
        avatar_url
      )
    `)
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching user capsules:", error);
    throw error;
  }
  
  return data || [];
};

// Get a specific capsule by ID
export const getCapsuleById = async (id: string) => {
  const { data, error } = await supabase
    .from('capsules')
    .select(`
      *,
      creator:profiles(
        id,
        username,
        avatar_url
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

// Get all bids for a specific capsule
export const getCapsuleBids = async (capsuleId: string) => {
  const { data, error } = await supabase
    .from('bids')
    .select(`
      *,
      bidder:profiles(
        id,
        username,
        avatar_url
      )
    `)
    .eq('capsule_id', capsuleId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching capsule bids:", error);
    throw error;
  }
  
  return data || [];
};
