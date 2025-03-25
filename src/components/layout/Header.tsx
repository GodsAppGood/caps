
import React from "react";
import { Package } from "lucide-react";
import { WalletConnect } from "@/components/WalletConnect";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAccount } from "wagmi";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";

const Header = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { address } = useAccount();
  
  const handleProfileClick = () => {
    navigate("/profile");
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
          <div onClick={handleProfileClick}>
            <ProfileImageUpload 
              size="sm" 
              className="w-10 h-10 transition-all hover:scale-105"
              showUploadOverlay={false}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
