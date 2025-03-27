
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAccount } from "wagmi";
import { CapsuleCreationProvider, useCapsuleCreation } from "@/contexts/CapsuleCreationContext";
import CapsuleCreationForm from "./capsule/CapsuleCreationForm";
import CreateCapsuleButton from "./capsule/CreateCapsuleButton";
import CapsuleSuccessModal from "./capsule/CapsuleSuccessModal";
import { validateCapsuleData, createCapsuleInDatabase } from "@/utils/capsuleCreationUtils";

interface CreateCapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapsuleCreated?: () => void;
}

const CreateCapsuleModalContent = ({ onClose, onCapsuleCreated }: Omit<CreateCapsuleModalProps, 'isOpen'>) => {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const { isConnected } = useAccount();
  const {
    capsuleName,
    message,
    selectedDate,
    selectedImage,
    auctionEnabled,
    paymentMethod,
    isLoading,
    setIsLoading,
    setShowSuccessModal,
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
      
      // Show success modal
      setShowSuccessModal(true);
      
      // Call the callback to refresh the capsules list
      if (onCapsuleCreated) {
        onCapsuleCreated();
      }
    } catch (error: any) {
      console.error("Error creating capsule:", error);
      toast({
        title: "Error",
        description: error.message || "Capsule creation failed",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    resetForm();
    setIsLoading(false);
    onClose();
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

      <CapsuleSuccessModal onClose={handleSuccessModalClose} />
    </>
  );
};

const CreateCapsuleModal = ({ isOpen, onClose, onCapsuleCreated }: CreateCapsuleModalProps) => {
  const ModalWrapper = () => {
    const { isLoading, showSuccessModal } = useCapsuleCreation();
    
    return (
      <Dialog 
        open={isOpen} 
        onOpenChange={(open) => {
          if (!open && !isLoading && !showSuccessModal) {
            onClose();
          }
        }}
      >
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
