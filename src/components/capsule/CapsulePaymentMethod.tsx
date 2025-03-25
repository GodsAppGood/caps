
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Coins } from "lucide-react";

interface CapsulePaymentMethodProps {
  paymentMethod: number;
  setPaymentMethod: (method: number) => void;
}

const CapsulePaymentMethod = ({ paymentMethod, setPaymentMethod }: CapsulePaymentMethodProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-neon-blue font-medium">PAYMENT METHOD</Label>
      <div className="flex gap-3">
        <Button
          type="button"
          onClick={() => setPaymentMethod(0)}
          className={`flex-1 flex justify-between items-center ${
            paymentMethod === 0 
              ? "bg-gradient-to-r from-neon-blue to-neon-blue/70 text-white" 
              : "bg-space-light/20 text-white/70 hover:bg-space-light/30"
          }`}
        >
          <span>BNB</span>
          <span className="font-medium">0.01 BNB</span>
        </Button>
        <Button
          type="button"
          onClick={() => setPaymentMethod(1)}
          className={`flex-1 flex justify-between items-center ${
            paymentMethod === 1 
              ? "bg-gradient-to-r from-neon-pink to-neon-pink/70 text-white" 
              : "bg-space-light/20 text-white/70 hover:bg-space-light/30"
          }`}
        >
          <span>ETH</span>
          <span className="font-medium">0.005 ETH</span>
        </Button>
      </div>
      <div className="flex items-center gap-2 text-white/70">
        <Coins className="w-4 h-4 text-neon-blue" />
        <span className="text-xs">Choose your preferred payment method for creating this capsule</span>
      </div>
    </div>
  );
};

export default CapsulePaymentMethod;
