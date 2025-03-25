
import React from "react";
import { Package } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { WalletConnect } from "@/components/WalletConnect";

const Header = () => {
  return (
    <header className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="w-6 h-6 text-neon-blue" />
          <span className="text-xl font-bold text-gradient">COSMIC CAPSULES</span>
        </div>
        
        <div className="flex items-center gap-4">
          <WalletConnect />
          <Avatar className="w-10 h-10 border-2 border-neon-blue">
            <AvatarFallback className="bg-space-dark text-neon-blue">UN</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;
