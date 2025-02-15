
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Bot, Upload, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const AICapsuleWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [eventName, setEventName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-neon-blue to-neon-pink border border-white/20 backdrop-blur-lg shadow-lg hover:scale-110 transition-all duration-300 group animate-float z-50"
      >
        <Bot className="w-8 h-8 mx-auto text-white group-hover:animate-pulse" />
      </button>

      {/* AI Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-space-dark/95 backdrop-blur-xl border border-neon-blue/20 rounded-xl w-full max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-white">
              CREATE NEW TIME CAPSULE
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
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
                {selectedImage ? (
                  <div className="relative h-full">
                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setSelectedImage(null)}
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

            {/* Create Button */}
            <Button
              className="w-full bg-gradient-to-r from-neon-blue to-neon-pink text-white hover:opacity-90 transition-opacity"
              onClick={() => {
                // Handle capsule creation
                console.log("Creating capsule:", { eventName, message, selectedDate, selectedImage });
                setIsOpen(false);
              }}
            >
              CREATE CAPSULE
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AICapsuleWidget;
