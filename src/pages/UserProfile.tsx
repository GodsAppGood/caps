import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Timer, DollarSign, ArrowLeft, Bell, Settings, LogOut, History, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "@/components/WalletConnect";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAccount } from "wagmi";
import { getUserCapsules, getCapsuleBids, placeBid, acceptBid } from "@/services/capsuleService";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";

const UserProfile = () => {
  const [selectedCapsule, setSelectedCapsule] = useState<number | null>(null);
  const [acceptBidCapsule, setAcceptBidCapsule] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState("");
  const [userCapsules, setUserCapsules] = useState<any[]>([]);
  const [bidRequests, setBidRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();
  const { user, signOut, userProfile } = useAuth();
  const { address } = useAccount();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const capsules = await getUserCapsules(user.id);
        const formattedCapsules = capsules.map((capsule) => ({
          id: capsule.id,
          name: capsule.name,
          openDate: new Date(capsule.open_date).toLocaleDateString(),
          highestBid: capsule.current_bid || capsule.initial_bid,
          bids: 0
        }));
        
        setUserCapsules(formattedCapsules);
        
        const allBidRequests: any[] = [];
        for (const capsule of capsules) {
          const bids = await getCapsuleBids(capsule.id);
          if (bids.length > 0) {
            const uniqueBidders = new Map();
            bids.forEach(bid => {
              if (!uniqueBidders.has(bid.bidder_id) || bid.bid_amount > uniqueBidders.get(bid.bidder_id).bid_amount) {
                uniqueBidders.set(bid.bidder_id, bid);
              }
            });
            
            uniqueBidders.forEach(bid => {
              allBidRequests.push({
                id: bid.id,
                capsuleId: capsule.id,
                capsuleName: capsule.name,
                bidder: bid.bidder?.username || "ANONYMOUS",
                bidderWallet: `0x${bid.bidder_id.slice(0, 4)}...${bid.bidder_id.slice(-4)}`,
                amount: bid.bid_amount,
                timestamp: new Date(bid.created_at).toLocaleDateString()
              });
            });
          }
        }
        
        setBidRequests(allBidRequests);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load your data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, toast]);

  const handleAcceptBid = async () => {
    if (!acceptBidCapsule) return;
    
    try {
      const bidRequest = bidRequests.find(request => request.capsuleId === acceptBidCapsule);
      if (!bidRequest) {
        throw new Error("Bid request not found");
      }
      
      await acceptBid(String(acceptBidCapsule), bidRequest.id);
      
      toast({
        title: "Bid Accepted",
        description: "You have accepted the bid. The capsule will be opened for the bidder.",
      });
      
      if (user) {
        const capsules = await getUserCapsules(user.id);
        setUserCapsules(capsules.map(capsule => ({
          id: capsule.id,
          name: capsule.name,
          openDate: new Date(capsule.open_date).toLocaleDateString(),
          highestBid: capsule.current_bid || capsule.initial_bid,
          bids: 0
        })));
        
        setBidRequests(bidRequests.filter(request => request.id !== bidRequest.id));
      }
      
      setAcceptBidCapsule(null);
    } catch (error: any) {
      console.error("Error accepting bid:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept bid",
        variant: "destructive",
      });
    }
  };

  const handleRejectBid = async () => {
    if (!acceptBidCapsule) return;
    
    const bidRequest = bidRequests.find(request => request.capsuleId === acceptBidCapsule);
    if (bidRequest) {
      setBidRequests(bidRequests.filter(request => request.id !== bidRequest.id));
    }
    
    toast({
      title: "Bid Rejected",
      description: "You have rejected the bid. The capsule remains locked.",
    });
    setAcceptBidCapsule(null);
  };

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
      const capsule = userCapsules.find(c => c.id === selectedCapsule);
      if (!capsule) {
        throw new Error("Capsule not found");
      }
      
      const currentHighestBid = parseFloat(capsule.highestBid);
      const minimumBid = currentHighestBid * 1.1;
      const bidAmount = parseFloat(betAmount);
      
      if (bidAmount < minimumBid) {
        toast({
          title: "Bid too low",
          description: `Bid must be at least ${minimumBid.toFixed(2)} BNB (10% higher than current bid)`,
          variant: "destructive",
        });
        return;
      }
      
      await placeBid(String(selectedCapsule), bidAmount);
      
      toast({
        title: "Bid Placed",
        description: `Your bid of ${betAmount} BNB on capsule #${selectedCapsule.toString().padStart(3, '0')} has been placed successfully`,
      });
      
      setBetAmount("");
      setSelectedCapsule(null);
      
      if (user) {
        const capsules = await getUserCapsules(user.id);
        setUserCapsules(capsules.map(capsule => ({
          id: capsule.id,
          name: capsule.name,
          openDate: new Date(capsule.open_date).toLocaleDateString(),
          highestBid: capsule.current_bid || capsule.initial_bid,
          bids: 0
        })));
      }
    } catch (error: any) {
      console.error("Error placing bid:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to place bid",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const getAvatarText = () => {
    if (address) {
      return `${address.slice(0, 2).toUpperCase()}`;
    }
    return "UN";
  };

  const formatWalletAddress = () => {
    if (!address) return "No wallet connected";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-space-gradient text-white">
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-12">
          <Link to="/" className="flex items-center text-neon-blue hover:text-neon-pink transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>BACK TO HOME</span>
          </Link>
          <div className="flex items-center gap-4">
            <WalletConnect />
            <Avatar className="w-10 h-10 border-2 border-neon-blue">
              <AvatarFallback className="bg-space-dark text-neon-blue">{getAvatarText()}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 p-6 rounded-2xl bg-space-dark/50 border border-neon-blue/20 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <ProfileImageUpload />
            <div className="text-left">
              <h1 className="text-2xl font-bold">WALLET USER</h1>
              <p className="text-neon-blue">{formatWalletAddress()}</p>
              <div className="mt-2 flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Timer className="w-4 h-4 text-neon-pink" />
                  <span className="text-white/70 text-sm">{userCapsules.length} Capsules</span>
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-neon-pink" />
                  <span className="text-white/70 text-sm">{bidRequests.length} Active Bids</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="border-neon-blue/30 hover:border-neon-blue text-neon-blue bg-transparent">
              <Bell className="w-4 h-4 mr-2" />
              NOTIFICATIONS
            </Button>
            <Button variant="outline" className="border-neon-blue/30 hover:border-neon-blue text-neon-blue bg-transparent">
              <Settings className="w-4 h-4 mr-2" />
              SETTINGS
            </Button>
            <Button 
              variant="outline" 
              className="border-neon-pink/30 hover:border-neon-pink text-neon-pink bg-transparent"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              SIGN OUT
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="capsules" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="capsules">MY CAPSULES</TabsTrigger>
            <TabsTrigger value="bids">BID REQUESTS</TabsTrigger>
            <TabsTrigger value="history">HISTORY</TabsTrigger>
          </TabsList>
          
          <TabsContent value="capsules">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userCapsules.map((capsule) => (
                <div
                  key={capsule.id}
                  className="relative min-h-[350px] group perspective-1000"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-neon-blue/10 to-transparent rounded-[30px] backdrop-blur-md border border-neon-blue/20 overflow-hidden transition-all duration-300 hover:border-neon-blue/40">
                    <div className="absolute inset-0 bg-gradient-to-t from-neon-green/20 to-transparent opacity-50" />
                    
                    <div className="absolute inset-x-0 top-1/4 h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
                    <div className="absolute inset-x-0 top-2/4 h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
                    <div className="absolute inset-x-0 top-3/4 h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
                  </div>

                  <div className="relative h-full flex flex-col items-center justify-center gap-6 p-8">
                    <Timer className="w-12 h-12 text-neon-blue" />
                    <div className="text-center z-10">
                      <h3 className="text-2xl font-bold mb-2">{capsule.name}</h3>
                      <p className="text-neon-blue">OPENS {capsule.openDate}</p>
                    </div>

                    <div className="absolute bottom-24 left-0 right-0 flex justify-center">
                      <div className="px-4 py-2 bg-space-dark/50 rounded-full border border-neon-blue/30">
                        <span className="text-neon-blue text-sm flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          HIGHEST BID: {capsule.highestBid} BNB ({capsule.bids} bids)
                        </span>
                      </div>
                    </div>

                    <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                      <div className="px-4 py-2 bg-space-dark/50 rounded-full border border-neon-blue/30">
                        <span className="text-neon-blue text-sm">CAPSULE ID: #{capsule.id.toString().padStart(3, '0')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="bids">
            <div className="space-y-6">
              {bidRequests.map((request) => (
                <div 
                  key={request.id}
                  className="p-6 rounded-xl border border-neon-pink/20 bg-space-dark/50 backdrop-blur-md hover:border-neon-pink/40 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{request.capsuleName}</h3>
                      <div className="flex flex-wrap gap-4 text-sm mb-2">
                        <span className="text-white/70">ID: #{request.capsuleId.toString().padStart(3, '0')}</span>
                        <span className="text-white/70">Bidder: {request.bidderWallet}</span>
                        <span className="text-white/70">{request.timestamp}</span>
                      </div>
                      <div className="flex items-center text-neon-pink font-bold">
                        <DollarSign className="w-5 h-5 mr-1" />
                        <span>{request.amount} BNB</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        className="bg-neon-pink hover:bg-neon-pink/80 text-white"
                        onClick={() => setAcceptBidCapsule(request.capsuleId)}
                      >
                        ACCEPT BID
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-neon-pink/30 hover:border-neon-pink text-neon-pink bg-transparent"
                        onClick={() => handleRejectBid()}
                      >
                        REJECT
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {bidRequests.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-white/50">No active bid requests</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-neon-blue/20 bg-space-dark/50 backdrop-blur-md">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center">
                    <History className="w-5 h-5 text-neon-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold">CAPSULE CREATED</h3>
                    <p className="text-sm text-white/70">STELLAR MEMORIES • 3 days ago</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-neon-pink/20 bg-space-dark/50 backdrop-blur-md">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-neon-pink/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-neon-pink" />
                  </div>
                  <div>
                    <h3 className="font-semibold">BID ACCEPTED</h3>
                    <p className="text-sm text-white/70">GALAXY WHISPERS • 1 week ago</p>
                    <p className="text-neon-pink flex items-center mt-1">
                      <DollarSign className="w-4 h-4 mr-1" />
                      3.5 BNB
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-neon-green/20 bg-space-dark/50 backdrop-blur-md">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-neon-green/20 flex items-center justify-center">
                    <Timer className="w-5 h-5 text-neon-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold">CAPSULE OPENED</h3>
                    <p className="text-sm text-white/70">MOON SECRETS • 2 weeks ago</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={acceptBidCapsule !== null} onOpenChange={() => setAcceptBidCapsule(null)}>
          <DialogContent className="bg-space-dark/95 backdrop-blur-xl border border-neon-pink/20 rounded-xl w-full max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-white">
                ACCEPT BID
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <p className="text-center text-white/80">
                Are you sure you want to accept this bid? The capsule will be opened early for the bidder.
              </p>

              <div className="p-6 rounded-lg bg-space-light/20 border border-neon-blue/20 text-center">
                <p className="text-sm text-neon-blue mb-2">BID AMOUNT</p>
                <p className="text-3xl font-bold flex items-center justify-center">
                  <DollarSign className="w-6 h-6 mr-1" />
                  {bidRequests.find(bid => bid.capsuleId === acceptBidCapsule)?.amount || 0} BNB
                </p>
                <p className="text-xs text-white/60 mt-2">
                  You will receive {((bidRequests.find(bid => bid.capsuleId === acceptBidCapsule)?.amount || 0) * 0.98).toFixed(2)} BNB (98%)
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  className="flex-1 bg-neon-pink hover:bg-neon-pink/80 text-white"
                  onClick={handleAcceptBid}
                >
                  CONFIRM ACCEPTANCE
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-white/30 hover:border-white text-white bg-transparent"
                  onClick={() => setAcceptBidCapsule(null)}
                >
                  CANCEL
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={selectedCapsule !== null} onOpenChange={() => setSelectedCapsule(null)}>
          <DialogContent className="bg-space-dark/95 backdrop-blur-xl border border-neon-pink/20 rounded-xl w-full max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-white">
                PLACE A BID
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-8 py-6">
              {selectedCapsule && (
                <div className="p-4 rounded-lg bg-space-light/20 border border-neon-pink/30 text-center">
                  <p className="text-sm text-neon-pink mb-2">CURRENT HIGHEST BID</p>
                  <p className="text-2xl font-bold text-white flex items-center justify-center">
                    <DollarSign className="w-5 h-5 mr-1" />
                    {(() => {
                      const capsule = userCapsules.find(c => c.id === selectedCapsule);
                      return capsule ? capsule.highestBid : "0";
                    })()} BNB
                  </p>
                  <p className="text-xs text-white/60 mt-2">
                    Minimum next bid: {(() => {
                      const capsule = userCapsules.find(c => c.id === selectedCapsule);
                      const currentBid = capsule ? parseFloat(capsule.highestBid) : 0;
                      return (currentBid * 1.1).toFixed(2);
                    })()} BNB (10% higher)
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <label className="text-sm text-neon-pink font-medium">BID AMOUNT (BNB)</label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Enter bid amount"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="bg-space-light/30 border-neon-pink/20 text-white placeholder:text-white/50 focus:border-neon-pink pl-12"
                  />
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-pink" />
                </div>
              </div>

              {selectedCapsule && (
                <Button
                  variant="outline"
                  className="w-full border-neon-blue text-neon-blue hover:bg-neon-blue/20"
                  onClick={() => {
                    const capsule = userCapsules.find(c => c.id === selectedCapsule);
                    if (capsule) {
                      const currentBid = parseFloat(capsule.highestBid);
                      const minBid = (currentBid * 1.1).toFixed(2);
                      setBetAmount(minBid);
                    }
                  }}
                >
                  AUTO BID (+10%): {(() => {
                    const capsule = userCapsules.find(c => c.id === selectedCapsule);
                    const currentBid = capsule ? parseFloat(capsule.highestBid) : 0;
                    return (currentBid * 1.1).toFixed(2);
                  })()} BNB
                </Button>
              )}

              <div className="text-center space-y-2 p-4 bg-space-light/20 rounded-lg border border-neon-blue/20">
                <p className="text-sm text-neon-blue">
                  ONCE ACCEPTED, THE CAPSULE CREATOR WILL RECEIVE 98% OF THE BID.
                  <br/>PLATFORM FEE IS 2%.
                </p>
              </div>

              <Button
                className="w-full py-4 rounded-lg bg-gradient-to-r from-neon-pink to-neon-blue text-white font-bold hover:opacity-90 transition-opacity"
                onClick={handlePlaceBid}
              >
                PLACE BID
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UserProfile;

