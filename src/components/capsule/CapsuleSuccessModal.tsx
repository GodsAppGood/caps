
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Twitter } from "lucide-react";
import { useCapsuleCreation } from "@/contexts/CapsuleCreationContext";

interface CapsuleSuccessModalProps {
  onClose: () => void;
}

const CapsuleSuccessModal = ({ onClose }: CapsuleSuccessModalProps) => {
  const { showSuccessModal, setShowSuccessModal, latestTxHash } = useCapsuleCreation();

  const handleTwitterShare = () => {
    const tweetText = "🚀 I just created a digital time capsule on blockchain! Store memories and unlock them later! Check it out: https://timecapsules.xyz #DigitalCapsule #Blockchain";
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, "_blank");
  };

  return (
    <Dialog open={showSuccessModal} onOpenChange={(open) => {
      if (!open) {
        setShowSuccessModal(false);
        onClose();
      }
    }}>
      <DialogContent className="bg-space-dark/95 backdrop-blur-xl border border-neon-blue/20 rounded-xl w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center text-2xl font-bold text-white">
            <span className="bg-green-500 p-2 rounded-full mr-3">
              <Check className="h-6 w-6 text-white" />
            </span>
            Success!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <p className="text-center text-white text-lg">
            ✅ Thank you! Your capsule has been successfully created!
          </p>
          
          {latestTxHash && (
            <div className="bg-space-light/20 rounded-md p-3 text-xs text-white/80 break-all">
              <p className="font-medium text-neon-blue mb-1">Transaction Hash:</p>
              <p>{latestTxHash}</p>
            </div>
          )}
          
          <div className="flex flex-col gap-4 pt-2">
            <Button 
              onClick={handleTwitterShare}
              className="w-full bg-[#1DA1F2] hover:bg-[#1a94e1] text-white"
            >
              <Twitter className="mr-2 h-5 w-5" />
              Share on Twitter
            </Button>
            
            <Button 
              onClick={onClose}
              variant="outline" 
              className="w-full border-neon-blue/30 text-white hover:bg-neon-blue/20"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CapsuleSuccessModal;
