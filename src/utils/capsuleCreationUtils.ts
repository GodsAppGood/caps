
import { supabase } from "@/integrations/supabase/client";
import { createCapsule } from "@/services/capsuleService";
import { toast } from "@/hooks/use-toast";
import { handleCapsuleCreationTransaction } from "@/utils/transactionUtils";

// Validate capsule creation data
export const validateCapsuleData = (
  userProfile: any,
  isConnected: boolean,
  capsuleName: string,
  selectedDate: Date | undefined
) => {
  if (!userProfile) {
    toast({
      title: "Error",
      description: "You must be logged in to create a time capsule",
      variant: "destructive",
    });
    return false;
  }

  if (!isConnected) {
    toast({
      title: "Error",
      description: "Please connect your wallet to pay for the capsule creation",
      variant: "destructive",
    });
    return false;
  }

  if (!capsuleName) {
    toast({
      title: "Error",
      description: "Please enter a name for your time capsule",
      variant: "destructive",
    });
    return false;
  }

  if (!selectedDate) {
    toast({
      title: "Error",
      description: "Please select an unlock date for your time capsule",
      variant: "destructive",
    });
    return false;
  }

  return true;
};

// Upload image to Supabase storage
export const uploadImageToSupabase = async (selectedImage: File) => {
  console.log("Uploading image...");
  const fileExt = selectedImage.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `public/${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('capsule_images')
    .upload(filePath, selectedImage);

  if (uploadError) {
    console.error("Error uploading image:", uploadError);
    throw uploadError;
  }

  return supabase.storage.from('capsule_images').getPublicUrl(filePath).data.publicUrl;
};

// Create capsule in database
export const createCapsuleInDatabase = async (
  capsuleName: string,
  message: string,
  selectedDate: Date,
  selectedImage: File | null,
  auctionEnabled: boolean,
  userProfileId: string,
  txHash?: string
) => {
  console.log("Creating capsule in database with transaction hash:", txHash);
  let imageUrl: string | null = null;
  
  try {
    if (selectedImage) {
      // Create the bucket if it doesn't exist
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('capsule_images');
      
      if (bucketError && bucketError.message.includes('does not exist')) {
        console.log("Bucket doesn't exist, creating...");
        const { error: createError } = await supabase.storage.createBucket('capsule_images', {
          public: true,
        });
        
        if (createError) {
          console.error("Error creating bucket:", createError);
          toast({
            title: "Storage Error",
            description: "Could not create storage for images. Using text-only capsule.",
            variant: "destructive",
          });
        } else {
          imageUrl = await uploadImageToSupabase(selectedImage);
          console.log("Image uploaded successfully, URL:", imageUrl);
        }
      } else {
        imageUrl = await uploadImageToSupabase(selectedImage);
        console.log("Image uploaded successfully, URL:", imageUrl);
      }
    }
    
    if (!userProfileId) {
      throw new Error("User profile ID not found");
    }
    
    const capsuleData = {
      name: capsuleName,
      creator_id: userProfileId,
      image_url: imageUrl,
      message: message,
      open_date: selectedDate.toISOString(),
      auction_enabled: auctionEnabled,
      status: 'closed' as 'closed',
      tx_hash: txHash
    };
    
    console.log("Creating capsule with data:", capsuleData);
    return await createCapsule(capsuleData);
  } catch (error) {
    console.error("Error in createCapsuleInDatabase:", error);
    
    // Log more detailed information for debugging
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    throw error;
  }
};

// Handle payment process
export const processCapsulePayment = async (
  paymentMethod: number,
  onPaymentComplete: (success: boolean, txHash?: string) => void
) => {
  const RECIPIENT_ADDRESS = "0x0AbD5b7B6DE3ceA8702dAB2827D31CDA46c6e750";
  const amount = paymentMethod === 0 ? "0.01" : "0.005";
  
  console.log(`Processing payment with method: ${paymentMethod === 0 ? "BNB" : "ETH"}, amount: ${amount}`);
  
  try {
    // Use the transaction util to handle the payment
    const success = await handleCapsuleCreationTransaction(
      RECIPIENT_ADDRESS, 
      amount,
      (txHash) => {
        console.log("Transaction successful with hash:", txHash);
        onPaymentComplete(true, txHash); // Pass the transaction hash to the callback
      }
    );
    
    if (!success) {
      console.log("Transaction process did not complete successfully");
      onPaymentComplete(false);
    }
  } catch (error: any) {
    console.error("Payment process error:", error);
    toast({
      title: "Payment Error",
      description: error.message || "An error occurred processing the payment",
      variant: "destructive",
    });
    onPaymentComplete(false);
  }
};
