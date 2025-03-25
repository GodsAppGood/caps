
import React from "react";
import { Label } from "@/components/ui/label";
import { Image } from "lucide-react";

interface CapsuleImageUploadProps {
  previewUrl: string | null;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  resetImage: () => void;
}

const CapsuleImageUpload = ({ previewUrl, handleImageUpload, resetImage }: CapsuleImageUploadProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-neon-blue font-medium">CAPSULE IMAGE</Label>
      <div className="relative h-40 border-2 border-dashed border-neon-blue/20 rounded-lg overflow-hidden group hover:border-neon-blue/40 transition-colors">
        {previewUrl ? (
          <div className="relative h-full">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={resetImage}
              className="absolute top-2 right-2 bg-red-500/80 text-white px-2 py-1 rounded-md text-sm hover:bg-red-600/80 transition-colors"
            >
              Remove
            </button>
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <p className="text-white text-sm px-4 py-2 bg-space-dark/80 rounded-md">Hidden until unlock</p>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-full cursor-pointer">
            <Image className="w-8 h-8 text-neon-blue mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-neon-blue text-sm">Click to upload image (hidden until unlock)</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default CapsuleImageUpload;
