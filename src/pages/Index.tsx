import { useState, useEffect } from "react";
import { Timer, Star, Lock, DollarSign, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import AICapsuleWidget from "@/components/AICapsuleWidget";
import { WalletConnect } from "@/components/WalletConnect";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getAllCapsules, getTodayCapsules, Capsule, placeBid } from "@/services/capsuleService";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [selectedCapsule, setSelectedCapsule] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState("");
  const [todayCapsules, setTodayCapsules] = useState<any[]>([]);
  const [allCapsules, setAllCapsules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchCapsules = async () => {
      try {
        setIsLoading(true);
        
        // Fetch today's capsules and all capsules
        const todayData = await getTodayCapsules();
        const allData = await getAllCapsules();
        
        // Format the data for display
        const formattedTodayCapsules = todayData.map((capsule) => ({
          id: capsule.id,
          name: capsule.name,
          openTime: new Date(capsule.open_date).toLocaleTimeString(),
          creator: { 
            name: capsule.creator?.username || "ANONYMOUS", 
            avatar: capsule.creator?.avatar_url || "", 
            verified: true 
          },
          highestBid: capsule.initial_bid,
          current_bid: capsule.current_bid || capsule.initial_bid
        }));
        
        const formattedAllCapsules = allData.map((capsule) => ({
          id: capsule.id,
          name: capsule.name,
          openDate: new Date(capsule.open_date).toLocaleDateString(),
          creator: { 
            name: capsule.creator?.username || "ANONYMOUS", 
            avatar: capsule.creator?.avatar_url || "", 
            verified: true 
          },
          highestBid: capsule.current_bid || capsule.initial_bid
        }));
        
        setTodayCapsules(formattedTodayCapsules);
        setAllCapsules(formattedAllCapsules);
      } catch (error) {
        console.error("Error fetching capsules:", error);
        toast({
          title: "Error",
          description: "Failed to load capsules",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCapsules();
  }, [toast]);

  const handlePlaceBid = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to place a bid",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCapsule || !betAmount || parseFloat(betAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid bid amount",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get the capsule that's being bid on
      const capsule = [...todayCapsules, ...allCapsules].find(c => c.id === selectedCapsule);
      
      if (!capsule) {
        throw new Error("Capsule not found");
      }

      const currentHighestBid = parseFloat(capsule.highestBid);
      const minimumBid = currentHighestBid * 1.1; // 10% higher than current bid
      const bidAmount = parseFloat(betAmount);

      // Check if bid is at least 10% higher than current highest bid
      if (bidAmount < minimumBid) {
        toast({
          title: "Bid too low",
          description: `Your bid must be at least ${minimumBid.toFixed(2)} BNB (10% higher than current bid)`,
          variant: "destructive",
        });
        return;
      }

      // Place bid
      await placeBid(selectedCapsule, bidAmount, user.id);
      
      toast({
        title: "Bid placed",
        description: `Your bid of ${betAmount} BNB on capsule #${selectedCapsule.toString().padStart(3, '0')} has been successfully placed`,
      });
      
      // Refresh capsules to show updated bids
      const todayData = await getTodayCapsules();
      const allData = await getAllCapsules();
      
      // Update state with fresh data
      setTodayCapsules(todayData.map(capsule => ({
        id: capsule.id,
        name: capsule.name,
        openTime: new Date(capsule.open_date).toLocaleTimeString(),
        creator: { 
          name: capsule.creator?.username || "ANONYMOUS", 
          avatar: capsule.creator?.avatar_url || "", 
          verified: true 
        },
        highestBid: capsule.current_bid || capsule.initial_bid
      })));
      
      setAllCapsules(allData.map(capsule => ({
        id: capsule.id,
        name: capsule.name,
        openDate: new Date(capsule.open_date).toLocaleDateString(),
        creator: { 
          name: capsule.creator?.username || "ANONYMOUS", 
          avatar: capsule.creator?.avatar_url || "", 
          verified: true 
        },
        highestBid: capsule.current_bid || capsule.initial_bid
      })));
      
      setBetAmount("");
      setSelectedCapsule(null);
    } catch (error: any) {
      console.error("Error placing bid:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to place bid",
        variant: "destructive",
      });
    }
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
                      <DollarSign className="w-4 h-4 mr-1" /> TOP BID: {capsule.highestBid} BNB
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
                      <DollarSign className="w-4 h-4 mr-1" /> TOP BID: {capsule.highestBid} BNB
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
            {/* Current

