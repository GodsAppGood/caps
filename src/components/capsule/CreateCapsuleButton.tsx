
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface CreateCapsuleButtonProps {
  isLoading: boolean;
  onClick: () => void;
}

const CreateCapsuleButton = ({ isLoading, onClick }: CreateCapsuleButtonProps) => {
  return (
    <Button
      className="w-full bg-gradient-to-r from-neon-blue to-neon-pink text-white hover:opacity-90 transition-opacity"
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center">
          <span className="animate-spin mr-2">⟳</span> CREATING...
        </span>
      ) : (
        <span className="flex items-center">
          <Check className="mr-2 h-5 w-5" /> CREATE CAPSULE
        </span>
      )}
    </Button>
  );
};

export default CreateCapsuleButton;
