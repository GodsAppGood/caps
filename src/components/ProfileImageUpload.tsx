import React, { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
interface ProfileImageUploadProps {
  size?: "sm" | "md" | "lg" | "xl";
  onImageUpdate?: (url: string) => void;
  className?: string;
  showUploadOverlay?: boolean;
}
export const ProfileImageUpload = ({
  size = "lg",
  onImageUpdate,
  className = "",
  showUploadOverlay = true
}: ProfileImageUploadProps) => {
  const {
    userProfile,
    uploadAvatar
  } = useAuth();
  const {
    toast
  } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine size class
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-32 h-32",
    xl: "w-40 h-40"
  };

  // Get initials for avatar fallback
  const getAvatarText = () => {
    if (userProfile?.wallet_address) {
      return `${userProfile.wallet_address.slice(0, 2)}`;
    }
    return "UN";
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }
    try {
      setIsUploading(true);
      const url = await uploadAvatar(file);
      if (url && onImageUpdate) {
        onImageUpdate(url);
      }
      toast({
        title: "Success",
        description: "Profile image updated successfully"
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  return <div className={`relative ${className}`}>
      <Avatar className={`${sizeClasses[size]} border-3 border-neon-blue cursor-pointer group`}>
        {userProfile?.avatar_url ? <AvatarImage src={userProfile.avatar_url} alt="Profile" className="object-cover" /> : null}
        <AvatarFallback className="bg-space-dark text-neon-blue text-lg mx-0 py-0 px-0">
          {getAvatarText()}
        </AvatarFallback>
      </Avatar>

      {/* Upload overlay */}
      {showUploadOverlay && <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer" onClick={triggerFileInput}>
          {isUploading ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : <Camera className="w-8 h-8 text-white" />}
        </div>}

      {/* Hidden file input */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
    </div>;
};