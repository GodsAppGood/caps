
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";

interface CapsuleMessageInputProps {
  message: string;
  setMessage: (message: string) => void;
}

const CapsuleMessageInput = ({ message, setMessage }: CapsuleMessageInputProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-neon-blue font-medium">MESSAGE</Label>
      <Textarea
        placeholder="Write your message... (hidden until unlock)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="min-h-[100px] bg-space-light/30 border-neon-blue/20 text-white placeholder:text-white/50 focus:border-neon-blue resize-none"
      />
      <div className="flex items-center gap-2 text-white/70">
        <MessageSquare className="w-4 h-4 text-neon-blue" />
        <span className="text-xs">This message will be hidden until the capsule is unlocked</span>
      </div>
    </div>
  );
};

export default CapsuleMessageInput;
