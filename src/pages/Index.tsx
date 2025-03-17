
import { useState } from "react";
import { Timer, Star, Lock, DollarSign, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import AICapsuleWidget from "@/components/AICapsuleWidget";
import { WalletConnect } from "@/components/WalletConnect";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedCapsule, setSelectedCapsule] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState("");
  const { toast } = useToast();

  // Sample data for capsules
  const todayCapsules = [
    { 
      id: 1, 
      name: "STELLAR MEMORIES", 
      openTime: "12:00:00", 
      creator: { name: "ALEX", avatar: "", verified: true },
      highestBid: 1.5
    },
    { 
      id: 2, 
      name: "COSMIC THOUGHTS", 
      openTime: "08:22:15", 
      creator: { name: "MARIA", avatar: "", verified: true },
      highestBid: 2.8
    },
    { 
      id: 3, 
      name: "SPACE DREAMS", 
      openTime: "16:45:30", 
      creator: { name: "JOHN", avatar: "", verified: false },
      highestBid: 0.75
    },
    { 
      id: 4, 
      name: "QUANTUM VAULT", 
      openTime: "22:10:45", 
      creator: { name: "SARA", avatar: "", verified: true },
      highestBid: 3.2
    },
    { 
      id: 5, 
      name: "NEBULA NOTES", 
      openTime: "04:30:20", 
      creator: { name: "DAVID", avatar: "", verified: false },
      highestBid: 1.0
    },
    { 
      id: 6, 
      name: "GALACTIC WHISPERS", 
      openTime: "14:15:00", 
      creator: { name: "EMMA", avatar: "", verified: true },
      highestBid: 5.5
    },
  ];

  const allCapsules = [
    { id: 1, name: "STELLAR MEMORIES", openDate: "2024-12-31", creator: { name: "ALEX", avatar: "", verified: true }, highestBid: 1.5 },
    { id: 2, name: "COSMIC THOUGHTS", openDate: "2024-10-15", creator: { name: "MARIA", avatar: "", verified: true }, highestBid: 2.8 },
    { id: 3, name: "SPACE DREAMS", openDate: "2024-11-20", creator: { name: "JOHN", avatar: "", verified: false }, highestBid: 0.75 },
    { id: 4, name: "QUANTUM VAULT", openDate: "2025-01-15", creator: { name: "SARA", avatar: "", verified: true }, highestBid: 3.2 },
    { id: 5, name: "NEBULA NOTES", openDate: "2024-09-22", creator: { name: "DAVID", avatar: "", verified: false }, highestBid: 1.0 },
    { id: 6, name: "GALACTIC WHISPERS", openDate: "2024-08-30", creator: { name: "EMMA", avatar: "", verified: true }, highestBid: 5.5 },
  ];

  const handlePlaceBid = () => {
    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите корректную сумму ставки",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Ставка размещена",
      description: `Ваша ставка ${betAmount} SOL на капсулу #${selectedCapsule?.toString().padStart(3, '0')} успешно размещена`,
    });
    
    setBetAmount("");
    setSelectedCapsule(null);
  };

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
        <div className="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory">
          {todayCapsules.map((capsule) => (
            <div
              key={capsule.id}
              className="relative min-w-[300px] h-[400px] group perspective-1000 snap-center"
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

              {/* Creator Avatar */}
              <Avatar className="absolute top-4 right-4 w-8 h-8 border-2 border-neon-blue z-10">
                <AvatarFallback className="bg-space-dark text-neon-blue text-xs">
                  {capsule.creator.name.slice(0, 2)}
                </AvatarFallback>
                {capsule.creator.verified && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-neon-blue rounded-full flex items-center justify-center">
                    <span className="text-space-dark text-[8px]">✓</span>
                  </div>
                )}
              </Avatar>

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center gap-6 p-8">
                <Timer className="w-12 h-12 text-neon-blue animate-glow" />
                <div className="text-center z-10">
                  <p className="text-neon-blue text-lg mb-2">{capsule.name}</p>
                  <p className="text-3xl font-bold text-white">{capsule.openTime}</p>
                </div>

                {/* Highest Bid */}
                <div className="absolute bottom-24 left-0 right-0 flex justify-center">
                  <div className="px-4 py-2 bg-space-dark/50 rounded-full border border-neon-pink/30">
                    <span className="text-neon-pink text-sm flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" /> TOP BID: {capsule.highestBid} SOL
                    </span>
                  </div>
                </div>

                {/* Place Bid Button */}
                <button 
                  onClick={() => setSelectedCapsule(capsule.id)}
                  className="absolute bottom-12 left-0 right-0 mx-auto w-3/4 px-4 py-2 bg-neon-pink/20 rounded-full border border-neon-pink hover:bg-neon-pink/40 transition-colors flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-2 text-neon-pink" />
                  <span className="text-neon-pink text-sm">PLACE BID</span>
                </button>

                {/* Bottom Technical Details */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <div className="px-4 py-2 bg-space-dark/50 rounded-full border border-neon-blue/30">
                    <span className="text-neon-blue text-sm">CAPSULE ID: #00{capsule.id}</span>
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
          {allCapsules.map((capsule) => (
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

              {/* Creator Avatar */}
              <Avatar className="absolute top-4 right-4 w-8 h-8 border-2 border-neon-pink z-10">
                <AvatarFallback className="bg-space-dark text-neon-pink text-xs">
                  {capsule.creator.name.slice(0, 2)}
                </AvatarFallback>
                {capsule.creator.verified && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-neon-pink rounded-full flex items-center justify-center">
                    <span className="text-space-dark text-[8px]">✓</span>
                  </div>
                )}
              </Avatar>

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center gap-6 p-8">
                <Lock className="w-12 h-12 text-neon-pink group-hover:scale-110 transition-transform duration-300" />
                <div className="text-center z-10">
                  <h3 className="text-2xl font-bold mb-2">{capsule.name}</h3>
                  <p className="text-neon-pink">OPENS {capsule.openDate}</p>
                </div>

                {/* Highest Bid */}
                <div className="absolute bottom-24 left-0 right-0 flex justify-center">
                  <div className="px-4 py-2 bg-space-dark/50 rounded-full border border-neon-pink/30">
                    <span className="text-neon-pink text-sm flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" /> TOP BID: {capsule.highestBid} SOL
                    </span>
                  </div>
                </div>

                {/* Place Bid Button */}
                <button 
                  onClick={() => setSelectedCapsule(capsule.id)}
                  className="absolute bottom-12 left-0 right-0 mx-auto w-3/4 px-4 py-2 bg-neon-pink/20 rounded-full border border-neon-pink hover:bg-neon-pink/40 transition-colors flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-2 text-neon-pink" />
                  <span className="text-neon-pink text-sm">PLACE BID</span>
                </button>

                {/* Bottom Technical Details */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <div className="px-4 py-2 bg-space-dark/50 rounded-full border border-neon-pink/30">
                    <span className="text-neon-pink text-sm">CAPSULE ID: #{capsule.id.toString().padStart(3, '0')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Betting Modal */}
      <Dialog open={selectedCapsule !== null} onOpenChange={() => setSelectedCapsule(null)}>
        <DialogContent className="bg-space-dark/95 backdrop-blur-xl border border-neon-pink/20 rounded-xl w-full max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-white">
              PLACE A BID
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8 py-6">
            {/* Bid Input */}
            <div className="space-y-4">
              <label className="text-sm text-neon-pink font-medium">BID AMOUNT (SOL)</label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="100"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="bg-space-light/30 border-neon-pink/20 text-white placeholder:text-white/50 focus:border-neon-pink pl-12"
                />
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-pink" />
              </div>
            </div>

            {/* Commission Info */}
            <div className="text-center space-y-2 p-4 bg-space-light/20 rounded-lg border border-neon-blue/20">
              <p className="text-sm text-neon-blue">
                ONCE ACCEPTED, THE CAPSULE CREATOR WILL RECEIVE 98% OF THE BID.
                <br/>PLATFORM FEE IS 2%.
              </p>
            </div>

            {/* Place Bid Button */}
            <Button
              className="w-full py-4 rounded-lg bg-gradient-to-r from-neon-pink to-neon-blue text-white font-bold hover:opacity-90 transition-opacity"
              onClick={handlePlaceBid}
            >
              PLACE BID
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
