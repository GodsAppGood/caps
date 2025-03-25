
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CapsuleAuctionToggleProps {
  auctionEnabled: boolean;
  setAuctionEnabled: (enabled: boolean) => void;
}

const CapsuleAuctionToggle = ({ auctionEnabled, setAuctionEnabled }: CapsuleAuctionToggleProps) => {
  return (
    <div className="flex items-center justify-between border-t border-neon-blue/20 pt-4">
      <div className="space-y-1">
        <Label htmlFor="auction-enable" className="text-sm text-neon-blue font-medium">ENABLE AUCTION</Label>
        <p className="text-xs text-white/70">Let others bid to open your capsule early</p>
      </div>
      <Switch 
        id="auction-enable" 
        checked={auctionEnabled} 
        onCheckedChange={setAuctionEnabled} 
        className="data-[state=checked]:bg-neon-blue"
      />
    </div>
  );
};

export default CapsuleAuctionToggle;
