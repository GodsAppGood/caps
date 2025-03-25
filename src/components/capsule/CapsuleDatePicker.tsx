
import React from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface CapsuleDatePickerProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
}

const CapsuleDatePicker = ({ selectedDate, setSelectedDate }: CapsuleDatePickerProps) => {
  return (
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
        <PopoverContent className="w-auto p-0 bg-space-dark border-neon-blue/20 z-50">
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
  );
};

export default CapsuleDatePicker;
