
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CapsuleNameInputProps {
  capsuleName: string;
  setCapsuleName: (name: string) => void;
}

const CapsuleNameInput = ({ capsuleName, setCapsuleName }: CapsuleNameInputProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-neon-blue font-medium">CAPSULE NAME</Label>
      <Input
        placeholder="Enter capsule name..."
        value={capsuleName}
        onChange={(e) => setCapsuleName(e.target.value)}
        className="bg-space-light/30 border-neon-blue/20 text-white placeholder:text-white/50 focus:border-neon-blue"
      />
      <p className="text-xs text-white/70">This name will be visible to everyone immediately</p>
    </div>
  );
};

export default CapsuleNameInput;
