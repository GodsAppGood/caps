
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Image, MessageSquare, Clock, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface CreateCapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateCapsuleModal = ({ isOpen, onClose }: CreateCapsuleModalProps) => {
  const [capsuleName, setCapsuleName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [auctionEnabled, setAuctionEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setCapsuleName("");
    setMessage("");
    setSelectedDate(undefined);
    setSelectedImage(null);
    setPreviewUrl(null);
    setAuctionEnabled(false);
  };

  const handleCreateCapsule = async () => {
    if (!userProfile) {
      toast({
        title: "Error",
        description: "You must be logged in to create a time capsule",
        variant: "destructive",
      });
      return;
    }

    if (!capsuleName) {
      toast({
        title: "Error",
        description: "Please enter a name for your time capsule",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Please select an unlock date for your time capsule",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      let imageUrl: string | null = null;
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('capsule_images')
          .upload(filePath, selectedImage);

        if (uploadError) {
          throw uploadError;
        }

        imageUrl = supabase.storage.from('capsule_images').getPublicUrl(filePath).data.publicUrl;
      }
      
      const { data, error } = await supabase
        .from('capsules')
        .insert({
          name: capsuleName,
          creator_id: userProfile.id,
          image_url: imageUrl,
          message: message,
          unlock_date: selectedDate.toISOString(),
          auction_enabled: auctionEnabled,
          status: 'closed',
          highest_bid: 0,
          highest_bidder: null
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Your time capsule has been created successfully!",
      });

      resetForm();
      onClose();
    } catch (error: any) {
      console.error("Error creating capsule:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create time capsule",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-space-dark/95 backdrop-blur-xl border border-neon-blue/20 rounded-xl w-full max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-white">
            CREATE NEW TIME CAPSULE
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
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

          <div className="space-y-2">
            <Label className="text-sm text-neon-blue font-medium">CAPSULE IMAGE</Label>
            <div className="relative h-40 border-2 border-dashed border-neon-blue/20 rounded-lg overflow-hidden group hover:border-neon-blue/40 transition-colors">
              {previewUrl ? (
                <div className="relative h-full">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setPreviewUrl(null);
                    }}
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

          <div className="space-y-2">
            <Label className="text-sm text-neon-blue font-medium">UNLOCK DATE</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-space-light/30 border-neon-blue/20 text-white hover:bg-space-light/50 hover:border-neon-blue"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-neon-blue" />
                  {selectedDate ? format(selectedDate, "PPP") : "Select unlock date..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-space-dark border-neon-blue/20">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="bg-transparent text-white"
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="flex items-center gap-2 text-white/70">
              <Clock className="w-4 h-4 text-neon-blue" />
              <span className="text-xs">The unlock date will be visible to everyone immediately</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neon-blue/20">
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
        </div>

        <Button
          className="w-full bg-gradient-to-r from-neon-blue to-neon-pink text-white hover:opacity-90 transition-opacity"
          onClick={handleCreateCapsule}
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
      </DialogContent>
    </Dialog>
  );
};

export default CreateCapsuleModal;
