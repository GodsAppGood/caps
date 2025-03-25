
import React from "react";
import { Package } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WalletConnect } from "@/components/WalletConnect";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAccount } from "wagmi";

const Header = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { address } = useAccount();
  
  const handleProfileClick = () => {
    navigate("/profile");
  };

  // Get initials for avatar fallback
  const getAvatarText = () => {
    if (address) {
      return `${address.slice(0, 2)}`;
    }
    return "UN";
  };
  
  return (
    <header className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 animate-fade-in">
          <Package className="w-6 h-6 text-neon-blue" />
          <span className="text-xl font-bold text-gradient">COSMIC CAPSULES</span>
        </div>
        
        <div className="flex items-center gap-4 animate-fade-in delay-150">
          <WalletConnect />
          <Avatar 
            className="w-10 h-10 border-2 border-neon-blue transition-all hover:scale-105 cursor-pointer" 
            onClick={handleProfileClick}
          >
            {userProfile?.avatar_url ? (
              <AvatarImage src={userProfile.avatar_url} alt="Profile" />
            ) : null}
            <AvatarFallback className="bg-space-dark text-neon-blue">{getAvatarText()}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;
