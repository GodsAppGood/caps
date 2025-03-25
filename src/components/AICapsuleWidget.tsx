import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Bot, Upload, Calendar as CalendarIcon, Lock, DollarSign, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createCapsule } from "@/services/capsuleService";
import { supabase } from "@/integrations/supabase/client";

const AICapsuleWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [eventName, setEventName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [allowBidding, setAllowBidding] = useState(false);
  const [minimumBid, setMinimumBid] = useState("0.1");
  const [encryptionLevel, setEncryptionLevel] = useState<"standard" | "enhanced" | "quantum">("standard");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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

  const handleCreateCapsule = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a time capsule",
        variant: "destructive",
      });
      return;
    }

    if (!eventName) {
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
        description: "Please select an opening date for your time capsule",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Upload image to Supabase storage if an image is selected
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
      
      // Create the capsule in Supabase
      await createCapsule({
        name: eventName,
        creator_id: user.id,
        image_url: imageUrl,
        message: message,
        unlock_date: selectedDate.toISOString(),
        auction_enabled: allowBidding,
      });

      toast({
        title: "Success",
        description: "Your time capsule has been created successfully!",
      });

      // Reset form
      setEventName("");
      setMessage("");
      setSelectedDate(undefined);
      setSelectedImage(null);
      setPreviewUrl(null);
      setAllowBidding(false);
      setIsOpen(false);
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
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-neon-blue to-neon-pink border border-white/20 backdrop-blur-lg shadow-lg hover:scale-110 transition-all duration-300 group z-50"
      >
        <Bot className="w-8 h-8 mx-auto text-white" />
      </button>

      {/* AI Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-space-dark/95 backdrop-blur-xl border border-neon-blue/20 rounded-xl w-full max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-white">
              CREATE NEW TIME CAPSULE
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="content">CONTENT</TabsTrigger>
              <TabsTrigger value="security">SECURITY</TabsTrigger>
              <TabsTrigger value="bidding">BIDDING</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              {/* Event Name Input */}
              <div className="space-y-2">
                <label className="text-sm text-neon-blue font-medium">EVENT NAME</label>
                <Input
                  placeholder="Enter event name..."
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="bg-space-light/30 border-neon-blue/20 text-white placeholder:text-white/50 focus:border-neon-blue"
                />
              </div>

              {/* Message Input */}
              <div className="space-y-2">
                <label className="text-sm text-neon-blue font-medium">MESSAGE</label>
                <Textarea
                  placeholder="Write your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[100px] bg-space-light/30 border-neon-blue/20 text-white placeholder:text-white/50 focus:border-neon-blue resize-none"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-sm text-neon-blue font-medium">EVENT IMAGE</label>
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
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-full cursor-pointer">
                      <Upload className="w-8 h-8 text-neon-blue mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-neon-blue text-sm">Click to upload image</span>
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

              {/* Date Selector */}
              <div className="space-y-2">
                <label className="text-sm text-neon-blue font-medium">OPENING DATE</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full bg-space-light/30 border-neon-blue/20 text-white hover:bg-space-light/50 hover:border-neon-blue"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-neon-blue" />
                      {selectedDate ? format(selectedDate, "PPP") : "Select date..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-space-dark border-neon-blue/20">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="bg-transparent"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              {/* Encryption Level */}
              <div className="space-y-4">
                <label className="text-sm text-neon-blue font-medium">ENCRYPTION LEVEL</label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    className={`p-4 rounded-lg border ${
                      encryptionLevel === "standard" 
                        ? "border-neon-blue bg-neon-blue/20" 
                        : "border-white/10 bg-space-light/30 hover:bg-space-light/50"
                    } flex flex-col items-center gap-2`}
                    onClick={() => setEncryptionLevel("standard")}
                  >
                    <Lock className="w-6 h-6 text-neon-blue" />
                    <span className="text-xs text-white">STANDARD</span>
                  </button>
                  <button
                    className={`p-4 rounded-lg border ${
                      encryptionLevel === "enhanced" 
                        ? "border-neon-pink bg-neon-pink/20" 
                        : "border-white/10 bg-space-light/30 hover:bg-space-light/50"
                    } flex flex-col items-center gap-2`}
                    onClick={() => setEncryptionLevel("enhanced")}
                  >
                    <Lock className="w-6 h-6 text-neon-pink" />
                    <span className="text-xs text-white">ENHANCED</span>
                  </button>
                  <button
                    className={`p-4 rounded-lg border ${
                      encryptionLevel === "quantum" 
                        ? "border-neon-green bg-neon-green/20" 
                        : "border-white/10 bg-space-light/30 hover:bg-space-light/50"
                    } flex flex-col items-center gap-2`}
                    onClick={() => setEncryptionLevel("quantum")}
                  >
                    <Lock className="w-6 h-6 text-neon-green" />
                    <span className="text-xs text-white">QUANTUM</span>
                  </button>
                </div>
                <p className="text-xs text-white/70 italic">
                  {encryptionLevel === "standard" && "Standard encryption provides basic protection for your time capsule."}
                  {encryptionLevel === "enhanced" && "Enhanced encryption provides stronger protection with dual-layer security."}
                  {encryptionLevel === "quantum" && "Quantum encryption provides the highest level of protection with cutting-edge cryptography."}
                </p>
              </div>

              {/* Time Lock Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm text-neon-blue font-medium">TIME LOCK MECHANISM</label>
                    <p className="text-xs text-white/70">Enable blockchain-based time lock for maximum security</p>
                  </div>
                  <Switch id="timelock" defaultChecked />
                </div>
              </div>

              {/* Access Control */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm text-neon-blue font-medium">PRIVATE CAPSULE</label>
                    <p className="text-xs text-white/70">Only you can view this capsule when opened</p>
                  </div>
                  <Switch id="private" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bidding" className="space-y-6">
              {/* Allow Bidding Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="allow-bidding" className="text-sm text-neon-blue font-medium">ALLOW BIDDING</Label>
                  <p className="text-xs text-white/70">Let others bid to open your capsule early</p>
                </div>
                <Switch 
                  id="allow-bidding" 
                  checked={allowBidding} 
                  onCheckedChange={setAllowBidding} 
                />
              </div>

              {/* Minimum Bid */}
              {allowBidding && (
                <div className="space-y-2">
                  <label className="text-sm text-neon-blue font-medium">MINIMUM BID (BNB)</label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.1"
                      value={minimumBid}
                      onChange={(e) => setMinimumBid(e.target.value)}
                      className="bg-space-light/30 border-neon-blue/20 text-white placeholder:text-white/50 focus:border-neon-blue pl-12"
                    />
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-blue" />
                  </div>
                </div>
              )}

              {/* Auto-Accept Threshold */}
              {allowBidding && (
                <div className="space-y-2">
                  <label className="text-sm text-neon-blue font-medium">AUTO-ACCEPT THRESHOLD (OPTIONAL)</label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Set amount to auto-accept bids"
                      className="bg-space-light/30 border-neon-blue/20 text-white placeholder:text-white/50 focus:border-neon-blue pl-12"
                    />
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-blue" />
                  </div>
                  <p className="text-xs text-white/70 italic">
                    Bids above this amount will be automatically accepted
                  </p>
                </div>
              )}

              {/* Time Constraints */}
              {allowBidding && (
                <div className="space-y-2">
                  <label className="text-sm text-neon-blue font-medium">BIDDING TIME WINDOW</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-neon-blue" />
                      <span className="text-xs text-white">Starts:</span>
                    </div>
                    <Input
                      type="number"
                      placeholder="0"
                      className="bg-space-light/30 border-neon-blue/20 text-white placeholder:text-white/50 focus:border-neon-blue w-20"
                    />
                    <span className="text-xs text-white">days after creation</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-neon-blue" />
                      <span className="text-xs text-white">Ends:</span>
                    </div>
                    <Input
                      type="number"
                      placeholder="7"
                      className="bg-space-light/30 border-neon-blue/20 text-white placeholder:text-white/50 focus:border-neon-blue w-20"
                    />
                    <span className="text-xs text-white">days before opening</span>
                  </div>
                </div>
              )}

              {/* Bidding Fee Info */}
              {allowBidding && (
                <div className="p-4 rounded-lg border border-neon-blue/20 bg-space-light/20">
                  <p className="text-xs text-white/70">
                    <span className="text-neon-blue">NOTE:</span> Platform fee for accepted bids is 2%. You will receive 98% of the winning bid amount.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Create Button */}
          <Button
            className="w-full bg-gradient-to-r from-neon-blue to-neon-pink text-white hover:opacity-90 transition-opacity mt-6"
            onClick={handleCreateCapsule}
            disabled={isLoading}
          >
            {isLoading ? "CREATING..." : "CREATE CAPSULE"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AICapsuleWidget;
