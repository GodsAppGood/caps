
import { useState } from "react";
import { Timer, Star, Lock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import AICapsuleWidget from "@/components/AICapsuleWidget";
import { WalletConnect } from "@/components/WalletConnect";

const Index = () => {
  const capsules = [
    { id: 1, name: "STELLAR MEMORIES", openDate: "2024-12-31", creator: { name: "ALEX", avatar: "" } },
    { id: 2, name: "COSMIC THOUGHTS", openDate: "2024-10-15", creator: { name: "MARIA", avatar: "" } },
    { id: 3, name: "SPACE DREAMS", openDate: "2024-11-20", creator: { name: "JOHN", avatar: "" } },
  ];

  return (
    <div className="min-h-screen bg-space-gradient text-white">
      {/* Header */}
      <header className="container mx-auto p-4">
        <nav className="flex items-center justify-between">
          <div className="text-4xl font-bold tracking-wider animate-glow">
            <span className="text-neon-blue">CAPS</span>
          </div>
          <div className="flex gap-4 items-center">
            <Link to="/profile">
              <Avatar className="w-10 h-10 border-2 border-neon-blue cursor-pointer hover:border-neon-pink transition-colors">
                <AvatarFallback className="bg-space-dark text-neon-blue">UN</AvatarFallback>
              </Avatar>
            </Link>
            <WalletConnect />
            <button className="px-6 py-3 rounded-full bg-space-light border border-neon-green text-neon-green hover:bg-neon-green hover:text-white transition-all duration-300">
              PREMIUM CAPS
            </button>
          </div>
        </nav>
      </header>

      {/* Today's Capsules */}
      <section className="container mx-auto py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">TODAY'S CAPS</h2>
        <div className="flex gap-8 overflow-x-auto pb-8">
          {[1, 2, 3].map((capsule) => (
            <div
              key={capsule}
              className="relative min-w-[300px] h-[400px] group perspective-1000"
            >
              {/* Glass Container */}
              <div className="absolute inset-0 bg-gradient-to-b from-neon-blue/10 to-transparent rounded-[30px] backdrop-blur-md border border-neon-blue/20 overflow-hidden">
                {/* Inner Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-neon-green/20 to-transparent opacity-50 animate-pulse" />
                
                {/* Technical Details - Horizontal Lines */}
                <div className="absolute inset-x-0 top-1/4 h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
                <div className="absolute inset-x-0 top-2/4 h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
                <div className="absolute inset-x-0 top-3/4 h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
                
                {/* Vertical Lines */}
                <div className="absolute inset-y-0 left-8 w-px bg-gradient-to-b from-transparent via-neon-blue/30 to-transparent" />
                <div className="absolute inset-y-0 right-8 w-px bg-gradient-to-b from-transparent via-neon-blue/30 to-transparent" />
                
                {/* Side Glows */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-32 bg-neon-pink blur-sm" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-32 bg-neon-pink blur-sm" />
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center gap-6 p-8">
                <Avatar className="absolute top-4 right-4 w-8 h-8 border-2 border-neon-blue">
                  <AvatarFallback className="bg-space-dark text-neon-blue text-xs">UN</AvatarFallback>
                </Avatar>

                <Timer className="w-12 h-12 text-neon-blue animate-glow" />
                <div className="text-center z-10">
                  <p className="text-neon-blue text-lg mb-2">OPENS IN</p>
                  <p className="text-3xl font-bold text-white">12:00:00</p>
                </div>

                {/* Bottom Technical Details */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                  <div className="px-4 py-2 bg-space-dark/50 rounded-full border border-neon-blue/30">
                    <span className="text-neon-blue text-sm">CAPSULE ID: #00{capsule}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All Capsules */}
      <section className="container mx-auto py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">ALL CAPS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {capsules.map((capsule) => (
            <div
              key={capsule.id}
              className="group relative h-[400px] perspective-1000"
            >
              {/* Glass Container */}
              <div className="absolute inset-0 bg-gradient-to-b from-neon-pink/10 to-transparent rounded-[30px] backdrop-blur-md border border-neon-pink/20 overflow-hidden">
                {/* Inner Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-neon-green/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
                
                {/* Technical Details */}
                <div className="absolute inset-x-0 top-1/4 h-px bg-gradient-to-r from-transparent via-neon-pink/30 to-transparent" />
                <div className="absolute inset-x-0 top-2/4 h-px bg-gradient-to-r from-transparent via-neon-pink/30 to-transparent" />
                <div className="absolute inset-x-0 top-3/4 h-px bg-gradient-to-r from-transparent via-neon-pink/30 to-transparent" />
                
                {/* Side Glows */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-32 bg-neon-blue blur-sm" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-32 bg-neon-blue blur-sm" />
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center gap-6 p-8">
                <Avatar className="absolute top-4 right-4 w-8 h-8 border-2 border-neon-pink">
                  <AvatarFallback className="bg-space-dark text-neon-pink text-xs">
                    {capsule.creator.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <Lock className="w-12 h-12 text-neon-pink group-hover:scale-110 transition-transform duration-300" />
                <div className="text-center z-10">
                  <h3 className="text-2xl font-bold mb-2">{capsule.name}</h3>
                  <p className="text-neon-pink">OPENS {capsule.openDate}</p>
                </div>

                {/* Bottom Technical Details */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                  <div className="px-4 py-2 bg-space-dark/50 rounded-full border border-neon-pink/30">
                    <span className="text-neon-pink text-sm">CAPSULE ID: #{capsule.id.toString().padStart(3, '0')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto py-8 mt-16 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-2xl font-bold">
            <span className="text-neon-blue">CAPS</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-neon-blue transition-colors">TWITTER</a>
            <a href="#" className="hover:text-neon-blue transition-colors">DISCORD</a>
            <a href="#" className="hover:text-neon-blue transition-colors">TELEGRAM</a>
          </div>
          <p className="text-white/60">© 2024 CAPS. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-space-gradient" />
        {[...Array(50)].map((_, i) => (
          <Star
            key={i}
            className="absolute text-white/20 animate-stars"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              width: `${Math.random() * 3}px`,
              height: `${Math.random() * 3}px`,
            }}
          />
        ))}
      </div>

      {/* AI Widget */}
      <AICapsuleWidget />
    </div>
  );
};

export default Index;
