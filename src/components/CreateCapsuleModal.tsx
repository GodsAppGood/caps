import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { createCapsule } from "@/services/capsuleService";
import { createCapsuleWithPayment } from "@/lib/contractHelpers";
import { useAccount } from "wagmi";

// Import sub-components
import CapsuleNameInput from "./capsule/CapsuleNameInput";
import CapsuleMessageInput from "./capsule/CapsuleMessageInput";
import CapsuleImageUpload from "./capsule/CapsuleImageUpload";
import CapsuleDatePicker from "./capsule/CapsuleDatePicker";
import CapsulePaymentMethod from "./capsule/CapsulePaymentMethod";
import CapsuleAuctionToggle from "./capsule/CapsuleAuctionToggle";
import CreateCapsuleButton from "./capsule/CreateCapsuleButton";

interface CreateCapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateCapsuleModal = ({ isOpen, onClose }: CreateCapsuleModalProps) => {
  const [capsuleName, setCapsuleName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [auctionEnabled, setAuctionEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(0); // 0 = BNB, 1 = ETH
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const { isConnected } = useAccount();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const resetForm = () => {
    setCapsuleName("");
    setMessage("");
    setSelectedDate(undefined);
    setSelectedImage(null);
    setPreviewUrl(null);
    setAuctionEnabled(false);
    setPaymentMethod(0);
  };

  const getPaymentAmountDisplay = () => {
    return paymentMethod === 0 ? "0.01 BNB" : "0.005 ETH";
  };

  const handleCreateCapsule = async () => {
    if (!userProfile) {
      toast({
        title: "Error",
        description: "You must be logged in to create a time capsule",
        variant: "destructive",
      });
      return;
    }

    if (!isConnected) {
      toast({
        title: "Error",
        description: "Please connect your wallet to pay for the capsule creation",
        variant: "destructive",
      });
      return;
    }

    if (!capsuleName) {
      toast({
        title: "Error",
        description: "Please enter a name for your time capsule",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Please select an unlock date for your time capsule",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const content = message || "Empty time capsule";
      const unlockTime = Math.floor(selectedDate.getTime() / 1000); // Convert to unix timestamp
      
      const blockchainResult = await createCapsuleWithPayment(
        capsuleName,
        selectedImage || content,
        unlockTime,
        paymentMethod === 0 ? 'BNB' : 'ETH'
      );
      
      if (!blockchainResult) {
        throw new Error("Payment failed. The capsule wasn't created. Please try again.");
      }
      
      let imageUrl: string | null = null;
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('capsule_images')
          .upload(filePath, selectedImage);

        if (uploadError) {
          throw uploadError;
        }

        imageUrl = supabase.storage.from('capsule_images').getPublicUrl(filePath).data.publicUrl;
      }
      
      const capsuleData = {
        name: capsuleName,
        creator_id: userProfile.id,
        image_url: imageUrl,
        message: message,
        open_date: selectedDate.toISOString(),
        auction_enabled: auctionEnabled,
        status: 'closed' as 'closed'
      };
      
      await createCapsule(capsuleData);

      toast({
        title: "Success",
        description: "Payment successful! Your time capsule has been created.",
      });

      resetForm();
      onClose();
    } catch (error: any) {
      console.error("Error in payment or creating capsule:", error);
      toast({
        title: "Error",
        description: error.message || "Payment or capsule creation failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-space-dark/95 backdrop-blur-xl border border-neon-blue/20 rounded-xl w-full max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-white">
            CREATE NEW TIME CAPSULE
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <CapsuleNameInput capsuleName={capsuleName} setCapsuleName={setCapsuleName} />
          <CapsuleMessageInput message={message} setMessage={setMessage} />
          <CapsuleImageUpload 
            previewUrl={previewUrl} 
            handleImageUpload={handleImageUpload} 
            resetImage={resetImage}
          />
          <CapsuleDatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

          <div className="space-y-4 pt-4 border-t border-neon-blue/20">
            <CapsulePaymentMethod paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
            <CapsuleAuctionToggle auctionEnabled={auctionEnabled} setAuctionEnabled={setAuctionEnabled} />
          </div>
        </div>

        <CreateCapsuleButton 
          isLoading={isLoading} 
          onClick={handleCreateCapsule} 
          paymentAmount={getPaymentAmountDisplay()}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateCapsuleModal;
