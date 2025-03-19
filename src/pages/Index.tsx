
import { useState } from "react";
import { DollarSign, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { WalletConnect } from "@/components/WalletConnect";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [betAmount, setBetAmount] = useState("");
  const { toast } = useToast();

  const handleConnect = () => {
    // Handle wallet connection
    toast({
      title: "Connecting wallet",
      description: "Please approve the connection in your wallet",
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col">
      {/* Header */}
      <header className="z-10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center">
            <span className="text-neon-blue text-xl">⚡</span>
          </div>
          <div className="hidden md:flex space-x-6 text-white/70">
            <a href="#" className="hover:text-neon-blue transition-colors">EXPLORE</a>
            <a href="#" className="hover:text-neon-blue transition-colors">ABOUT</a>
            <a href="#" className="hover:text-neon-blue transition-colors">FAQS</a>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="bg-space-dark/50 text-neon-blue border-neon-blue/50 hover:bg-neon-blue/20">
            SEARCH
          </Button>
          <Button className="bg-gradient-to-r from-neon-blue to-neon-pink border-none text-white hover:opacity-90">
            SUBMIT FILES
          </Button>
          <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center">
            <span className="text-neon-blue text-xl">?</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center z-10 py-12 mt-20">
        {/* Floating Planets */}
        <div className="absolute top-20 left-1/4 float" style={{ animationDelay: "0s" }}>
          <div className="planet">
            <div className="planet-ring"></div>
          </div>
        </div>
        
        <div className="absolute top-40 right-1/4 float" style={{ animationDelay: "2s" }}>
          <div className="planet">
            <div className="planet-ring"></div>
          </div>
        </div>
        
        <div className="absolute bottom-40 left-1/5 float" style={{ animationDelay: "4s", opacity: 0.7 }}>
          <div className="planet" style={{ width: "80px", height: "80px" }}>
            <div className="planet-ring" style={{ width: "120px", height: "20px", top: "30px", left: "-20px" }}></div>
          </div>
        </div>
        
        {/* Title */}
        <div className="mb-4 relative">
          <h1 className="text-6xl md:text-8xl font-bold text-white glow text-glow">
            TIME CAPSULE
          </h1>
          <p className="text-2xl md:text-3xl text-neon-blue mt-4 tracking-widest">
            WEB 3
          </p>
          <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-40 bg-neon-blue/10 blur-3xl rounded-full"></div>
        </div>
        
        {/* Description */}
        <div className="max-w-2xl mx-auto text-white/60 mb-8 tracking-wide">
          <p className="text-xs">
            0101010101010101010101010101010101010101010101010101010101010101010101010101
            010101010101010101010101010101010101010101010101010101010101010101010101
          </p>
        </div>
        
        <Button className="glowing-btn mb-24 px-10 py-6 text-xl">
          EXPLORE
        </Button>
        
        {/* Main Capsule */}
        <div className="relative mb-20">
          <div className="main-capsule-container">
            <div className="capsule mx-auto" style={{ width: "120px", height: "220px", borderRadius: "60px" }}>
              <div className="capsule-top"></div>
              <div className="capsule-particles"></div>
            </div>
            
            <div className="capsule-platform">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="platform-circle" 
                  style={{ 
                    width: `${(i+1) * 80}px`, 
                    height: `${(i+1) * 80}px`,
                    opacity: 1 - (i * 0.15)
                  }}
                ></div>
              ))}
            </div>
          </div>
          
          {/* Tech Circles */}
          <div className="tech-circle absolute -left-20 bottom-10 text-xl">
            99
          </div>
          <div className="tech-circle absolute -right-20 bottom-10 text-xl">
            AI
          </div>
        </div>
        
        {/* Connect Buttons */}
        <div className="flex space-x-6 mb-24">
          <button onClick={handleConnect} className="glowing-btn px-10 py-4 text-xl">
            CONNECT
          </button>
          <WalletConnect />
        </div>
        
        {/* Featured Capsules */}
        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 md:col-span-1 bg-space-dark/50 backdrop-blur-md rounded-3xl p-6 border border-neon-pink/30">
              <h3 className="text-neon-pink mb-4">ACTIVE CAPSULE</h3>
              <div className="flex justify-center mb-6">
                <div className="capsule mx-auto" style={{ width: "100px", height: "180px" }}>
                  <div className="capsule-top"></div>
                  <div className="capsule-particles"></div>
                </div>
              </div>
              <button className="glowing-btn w-full bg-gradient-to-r from-neon-pink to-neon-blue">
                PARTICIPATE
              </button>
            </div>
            
            <div className="col-span-1 md:col-span-1 bg-space-dark/50 backdrop-blur-md rounded-3xl p-6 border border-neon-blue/30">
              <h2 className="text-2xl font-bold text-white mb-4">Create a Capsule</h2>
              <p className="text-white/60 text-xs mb-8">
                010101010101010101010101010101010101010101
                010101010101010101010101010101010101010101
              </p>
              <button className="glowing-btn w-full">
                CONTRIBUTE
              </button>
            </div>
            
            <div className="col-span-1 md:col-span-1 bg-space-dark/50 backdrop-blur-md rounded-3xl p-6 border border-neon-pink/30">
              <h3 className="text-neon-pink mb-4">UPCOMING CAPSULE</h3>
              <div className="flex justify-center mb-6">
                <div className="capsule mx-auto" style={{ width: "100px", height: "180px" }}>
                  <div className="capsule-top"></div>
                  <div className="capsule-particles"></div>
                </div>
              </div>
              <p className="text-white/60 text-xs mb-4">
                THE NEXT GREAT REVELATION WILL HAPPEN IN
                010101 DAYS AND 12 HOURS. BE SURE TO CHECK IT OUT.
              </p>
              <button className="glowing-btn w-full bg-gradient-to-r from-neon-blue to-neon-pink">
                PARTICIPATE
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-white/60 z-10">
        <div className="flex justify-center space-x-6 mb-4">
          <a href="#" className="text-sm hover:text-neon-blue transition-colors">TWITTER</a>
          <a href="#" className="text-sm hover:text-neon-blue transition-colors">DISCORD</a>
          <a href="#" className="text-sm hover:text-neon-blue transition-colors">TELEGRAM</a>
        </div>
        <p className="text-xs">© 2024 TIME CAPSULE. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
};

export default Index;
