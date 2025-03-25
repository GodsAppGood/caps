
import React from "react";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Testimonials = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16 text-gradient">
          WHAT USERS SAY
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-space-light/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all">
            <div className="flex items-center mb-4">
              <Avatar className="h-10 w-10 mr-4">
                <AvatarFallback className="bg-neon-blue/20 text-neon-blue">JS</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">John S.</p>
                <p className="text-white/60 text-sm">@cosmic_traveler</p>
              </div>
            </div>
            <p className="text-white/80 mb-4">
              "It was incredible to open a message from my past self after a full year. The emotion was overwhelming!"
            </p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 text-neon-pink" fill="#FF00FF" />
              ))}
            </div>
          </div>
          
          <div className="bg-space-light/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all">
            <div className="flex items-center mb-4">
              <Avatar className="h-10 w-10 mr-4">
                <AvatarFallback className="bg-neon-pink/20 text-neon-pink">AM</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">Alex M.</p>
                <p className="text-white/60 text-sm">@future_astronaut</p>
              </div>
            </div>
            <p className="text-white/80 mb-4">
              "I stored photos of my newborn son and set it to open on his 18th birthday. Can't wait for that moment!"
            </p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 text-neon-pink" fill="#FF00FF" />
              ))}
            </div>
          </div>
          
          <div className="bg-space-light/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all">
            <div className="flex items-center mb-4">
              <Avatar className="h-10 w-10 mr-4">
                <AvatarFallback className="bg-neon-green/20 text-neon-green">LT</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">Luna T.</p>
                <p className="text-white/60 text-sm">@moon_walker</p>
              </div>
            </div>
            <p className="text-white/80 mb-4">
              "The bidding system is so unique! I got early access to a fascinating capsule from 2 years ago."
            </p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 text-neon-pink" fill="#FF00FF" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
