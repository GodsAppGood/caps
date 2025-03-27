
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAccount } from "wagmi";
import { CapsuleCreationProvider, useCapsuleCreation } from "@/contexts/CapsuleCreationContext";
import CapsuleCreationForm from "./capsule/CapsuleCreationForm";
import CreateCapsuleButton from "./capsule/CreateCapsuleButton";
import { validateCapsuleData, createCapsuleInDatabase } from "@/utils/capsuleCreationUtils";
import { TwitterShareButton, TwitterIcon } from "react-share";

interface CreateCapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapsuleCreated?: () => void;
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuccessModal = ({ isOpen, onClose }: SuccessModalProps) => {
  const shareUrl = window.location.origin;
  const shareText = "🚀 I just created a digital time capsule on blockchain! Store memories and unlock them later! Check it out: ";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-space-dark/95 backdrop-blur-xl border border-neon-blue/20 rounded-xl w-full max-w-md text-center">
        <div className="space-y-6 py-6">
          <div className="text-5xl flex justify-center">✅</div>
          <DialogTitle className="text-2xl font-bold text-white">
            Thank you! Your capsule has been successfully created!
          </DialogTitle>
          
          <div className="pt-4">
            <TwitterShareButton url={shareUrl} title={shareText} className="py-2 px-4 bg-[#1DA1F2] text-white rounded-full flex items-center justify-center hover:bg-[#1a91da] transition-colors mx-auto">
              <TwitterIcon size={24} round className="mr-2" />
              Share on Twitter
            </TwitterShareButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CreateCapsuleModalContent = ({ onClose, onCapsuleCreated }: Omit<CreateCapsuleModalProps, 'isOpen'>) => {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const { isConnected } = useAccount();
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const {
    capsuleName,
    message,
    selectedDate,
    selectedImage,
    auctionEnabled,
    paymentMethod,
    isLoading,
    setIsLoading,
    resetForm
  } = useCapsuleCreation();

  const getPaymentAmountDisplay = () => {
    return paymentMethod === 0 ? "0.01 BNB" : "0.005 ETH";
  };

  const handlePaymentComplete = async (success: boolean, txHash?: string) => {
    console.log("Payment completed with success:", success, "Transaction hash:", txHash);
    
    if (!success) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);  // Ensure we're still in loading state during capsule creation
      console.log("Starting to create capsule in database with txHash:", txHash);
      
      if (!userProfile || !userProfile.id || !selectedDate) {
        throw new Error("Missing required data for capsule creation");
      }
      
      // Create the capsule in the database after successful payment
      const capsule = await createCapsuleInDatabase(
        capsuleName,
        message,
        selectedDate,
        selectedImage,
        auctionEnabled,
        userProfile.id,
        txHash
      );
      
      console.log("Capsule created successfully:", capsule);
      
      // Show success modal instead of toast
      setShowSuccessModal(true);
      
      resetForm();
      
      // Call the callback to refresh the capsules list
      if (onCapsuleCreated) {
        onCapsuleCreated();
      }
      
      // Close the modal after successful creation
      onClose();
    } catch (error: any) {
      console.error("Error creating capsule:", error);
      toast({
        title: "Error",
        description: error.message || "Capsule creation failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-center text-white">
          CREATE NEW TIME CAPSULE
        </DialogTitle>
      </DialogHeader>

      <CapsuleCreationForm />

      <CreateCapsuleButton 
        isLoading={isLoading} 
        onClick={handlePaymentComplete} 
        paymentAmount={getPaymentAmountDisplay()}
        paymentMethod={paymentMethod}
        onValidate={() => validateCapsuleData(userProfile, isConnected, capsuleName, selectedDate)}
      />
      
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={handleSuccessModalClose} 
      />
    </>
  );
};

const CreateCapsuleModal = ({ isOpen, onClose, onCapsuleCreated }: CreateCapsuleModalProps) => {
  const ModalWrapper = () => {
    const { isLoading } = useCapsuleCreation();
    
    return (
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open && !isLoading) {
          onClose();
        }
      }}>
        <DialogContent className="bg-space-dark/95 backdrop-blur-xl border border-neon-blue/20 rounded-xl w-full max-w-lg">
          <CreateCapsuleModalContent onClose={onClose} onCapsuleCreated={onCapsuleCreated} />
        </DialogContent>
      </Dialog>
    );
  };

  // Wrap the entire modal in the context provider
  return (
    <CapsuleCreationProvider>
      <ModalWrapper />
    </CapsuleCreationProvider>
  );
};

export default CreateCapsuleModal;
