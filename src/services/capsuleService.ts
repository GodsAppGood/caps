
import { supabase } from "@/integrations/supabase/client";
import { 
  createCapsuleWithPayment, 
  placeBidOnChain, 
  acceptBidOnChain,
  isCapsuleOpenOnChain,
  getCapsuleContentFromChain,
  uploadToIPFS 
} from "@/lib/contractHelpers";

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
  auction_enabled?: boolean;
  created_at: string;
  updated_at: string;
  ipfs_hash?: string;
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

export type CapsuleCreate = Omit<Capsule, 'id' | 'creator_id' | 'status' | 'created_at' | 'updated_at' | 'creator' | 'winner' | 'ipfs_hash'> & {
  content?: string | File;
};

// Create a new capsule with blockchain payment and IPFS content
export const createCapsule = async (capsuleData: CapsuleCreate, userId: string) => {
  // First, upload content to IPFS if provided
  let ipfsHash = "";
  if (capsuleData.content) {
    ipfsHash = await uploadToIPFS(capsuleData.content);
  }
  
  // Calculate unlock time from open_date
  const unlockTime = Math.floor(new Date(capsuleData.open_date).getTime() / 1000);
  
  // Process the blockchain payment and create capsule on chain
  const paymentSuccess = await createCapsuleWithPayment(
    capsuleData.name,
    capsuleData.content || capsuleData.message || "Empty capsule",
    unlockTime
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
      current_bid: capsuleData.initial_bid,
      ipfs_hash: ipfsHash,
      status: 'closed' as 'opened' | 'closed'
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
  
  // Place the bid on blockchain
  const blockchainSuccess = await placeBidOnChain(capsuleId, bidAmount);
  
  if (!blockchainSuccess) {
    throw new Error("Failed to place bid on blockchain");
  }
  
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
  
  // Accept the bid on blockchain
  const blockchainSuccess = await acceptBidOnChain(capsuleId);
  
  if (!blockchainSuccess) {
    throw new Error("Failed to accept bid on blockchain");
  }
  
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

// Helper function to safely process creator data
const processCreator = (creator: any) => {
  if (!creator || typeof creator !== 'object') return undefined;
  
  return {
    id: creator.id || '',
    username: creator.username,
    avatar_url: creator.avatar_url
  };
};

// Get all capsules
export const getAllCapsules = async (): Promise<Capsule[]> => {
  // Using direct SQL to fetch profiles with capsules since we don't have a relation
  const { data, error } = await supabase
    .from('capsules')
    .select(`
      *,
      creator:creator_id (
        id,
        username,
        avatar_url
      )
    `);
  
  if (error) {
    console.error("Error fetching capsules:", error);
    throw error;
  }
  
  // Convert the data to conform to the Capsule type
  return (data || []).map(capsule => ({
    ...capsule,
    // Explicitly cast the status to the correct type
    status: capsule.status === 'opened' ? 'opened' : 'closed' as 'opened' | 'closed',
    creator: processCreator(capsule.creator),
    ipfs_hash: capsule.ipfs_hash || undefined
  })) as Capsule[];
};

// Get today's capsules (capsules that will open today)
export const getTodayCapsules = async (): Promise<Capsule[]> => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
  
  const { data, error } = await supabase
    .from('capsules')
    .select(`
      *,
      creator:creator_id (
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
  
  // Convert the data to conform to the Capsule type
  return (data || []).map(capsule => ({
    ...capsule,
    // Explicitly cast the status to the correct type
    status: capsule.status === 'opened' ? 'opened' : 'closed' as 'opened' | 'closed',
    creator: processCreator(capsule.creator),
    ipfs_hash: capsule.ipfs_hash || undefined
  })) as Capsule[];
};

// Get capsules created by a specific user
export const getUserCapsules = async (userId: string): Promise<Capsule[]> => {
  const { data, error } = await supabase
    .from('capsules')
    .select(`
      *,
      creator:creator_id (
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
  
  // Convert the data to conform to the Capsule type
  return (data || []).map(capsule => ({
    ...capsule,
    // Explicitly cast the status to the correct type
    status: capsule.status === 'opened' ? 'opened' : 'closed' as 'opened' | 'closed',
    creator: processCreator(capsule.creator),
    ipfs_hash: capsule.ipfs_hash || undefined
  })) as Capsule[];
};

// Get a specific capsule by ID
export const getCapsuleById = async (id: string): Promise<Capsule> => {
  const { data, error } = await supabase
    .from('capsules')
    .select(`
      *,
      creator:creator_id (
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
  
  // Check if the capsule should be open based on blockchain state
  const isOpenOnChain = await isCapsuleOpenOnChain(id);
  
  // If open on chain but not in DB, update the status
  if (isOpenOnChain && data.status === 'closed') {
    await supabase
      .from('capsules')
      .update({ 
        status: 'opened',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
      
    data.status = 'opened';
  }
  
  // If open, try to get the IPFS content from chain
  if (isOpenOnChain && !data.ipfs_hash) {
    const ipfsHash = await getCapsuleContentFromChain(id);
    if (ipfsHash) {
      await supabase
        .from('capsules')
        .update({ 
          ipfs_hash: ipfsHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      data.ipfs_hash = ipfsHash;
    }
  }
  
  // Convert the data to conform to the Capsule type
  return {
    ...data,
    // Explicitly cast the status to the correct type
    status: data.status === 'opened' ? 'opened' : 'closed' as 'opened' | 'closed',
    creator: processCreator(data.creator),
    ipfs_hash: data.ipfs_hash || undefined
  } as Capsule;
};

// Get all bids for a specific capsule
export const getCapsuleBids = async (capsuleId: string) => {
  const { data, error } = await supabase
    .from('bids')
    .select(`
      *,
      bidder:bidder_id (
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

// Check if a capsule is open
export const isCapsuleOpen = async (id: string): Promise<boolean> => {
  try {
    // First check in database
    const { data, error } = await supabase
      .from('capsules')
      .select('status, open_date')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error checking capsule status:", error);
      return false;
    }
    
    // If already marked as open in database
    if (data.status === 'opened') {
      return true;
    }
    
    // Check if current time is past open_date
    const openDate = new Date(data.open_date);
    const now = new Date();
    if (now >= openDate) {
      // Update status in database
      await supabase
        .from('capsules')
        .update({ 
          status: 'opened',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      return true;
    }
    
    // If not open in database, check on blockchain
    return await isCapsuleOpenOnChain(id);
  } catch (error) {
    console.error("Error checking if capsule is open:", error);
    return false;
  }
};
