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
import { getUserCapsules } from "@/services/capsuleService";

const UserProfile = () => {
  const [selectedCapsule, setSelectedCapsule] = useState<number | null>(null);
  const [acceptBidCapsule, setAcceptBidCapsule] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState("");
  const [userCapsules, setUserCapsules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  // Sample data for bid requests
  const bidRequests = [
    { id: 1, capsuleId: 2, capsuleName: "COSMIC THOUGHTS", bidder: "0x1a2...3b4c", amount: 2.8, timestamp: "2 hours ago" },
    { id: 2, capsuleId: 1, capsuleName: "STELLAR MEMORIES", bidder: "0x5d6...7e8f", amount: 1.5, timestamp: "8 hours ago" },
    { id: 3, capsuleId: 3, capsuleName: "SPACE DREAMS", bidder: "0x9a0...1b2c", amount: 0.75, timestamp: "1 day ago" },
  ];

  useEffect(() => {
    const fetchUserCapsules = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch capsules created by the current user
        const data = await getUserCapsules(user.id);
        
        // Format the data for display
        const formattedCapsules = data.map((capsule) => ({
          id: capsule.id,
          name: capsule.name,
          openDate: new Date(capsule.open_date).toLocaleDateString(),
          highestBid: capsule.initial_bid,
          bids: 0 // Currently not tracking bids
        }));
        
        setUserCapsules(formattedCapsules);
      } catch (error) {
        console.error("Error fetching user capsules:", error);
        toast({
          title: "Error",
          description: "Failed to load your capsules",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserCapsules();
  }, [user, toast]);

  const handleAcceptBid = () => {
    toast({
      title: "Bid Accepted",
      description: "You have accepted the bid. The capsule will be opened for the bidder.",
    });
    setAcceptBidCapsule(null);
  };

  const handleRejectBid = () => {
    toast({
      title: "Bid Rejected",
      description: "You have rejected the bid. The capsule remains locked.",
    });
    setAcceptBidCapsule(null);
  };

  const handlePlaceBid = () => {
    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid bid amount",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Bid Placed",
      description: `Your bid of ${betAmount} SOL on capsule #${selectedCapsule?.toString().padStart(3, '0')} has been placed successfully`,
    });
    
    setBetAmount("");
    setSelectedCapsule(null);
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

  return (
    <div className="min-h-screen bg-space-gradient text-white">
      <div className="container mx-auto py-8">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-12">
          <Link to="/" className="flex items-center text-neon-blue hover:text-neon-pink transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>BACK TO HOME</span>
          </Link>
          <div className="flex items-center gap-4">
            <WalletConnect />
            <Avatar className="w-10 h-10 border-2 border-neon-blue">
              <AvatarFallback className="bg-space-dark text-neon-blue">UN</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* User Profile Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 p-6 rounded-2xl bg-space-dark/50 border border-neon-blue/20 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20 border-3 border-neon-blue">
              <AvatarFallback className="bg-space-dark text-neon-blue text-2xl">UN</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <h1 className="text-2xl font-bold">COSMIC USER</h1>
              <p className="text-neon-blue">@cosmic_user</p>
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
            <Button variant="outline" className="border-neon-pink/30 hover:border-neon-pink text-neon-pink bg-transparent">
              <LogOut className="w-4 h-4 mr-2" />
              SIGN OUT
            </Button>
          </div>
        </div>
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="capsules" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="capsules">MY CAPSULES</TabsTrigger>
            <TabsTrigger value="bids">BID REQUESTS</TabsTrigger>
            <TabsTrigger value="history">HISTORY</TabsTrigger>
          </TabsList>
          
          {/* My Capsules Tab */}
          <TabsContent value="capsules">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userCapsules.map((capsule) => (
                <div
                  key={capsule.id}
                  className="relative min-h-[350px] group perspective-1000"
                >
                  {/* Glass Container */}
                  <div className="absolute inset-0 bg-gradient-to-b from-neon-blue/10 to-transparent rounded-[30px] backdrop-blur-md border border-neon-blue/20 overflow-hidden transition-all duration-300 hover:border-neon-blue/40">
                    {/* Inner Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-neon-green/20 to-transparent opacity-50" />
                    
                    {/* Technical Details */}
                    <div className="absolute inset-x-0 top-1/4 h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
                    <div className="absolute inset-x-0 top-2/4 h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
                    <div className="absolute inset-x-0 top-3/4 h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="relative h-full flex flex-col items-center justify-center gap-6 p-8">
                    <Timer className="w-12 h-12 text-neon-blue" />
                    <div className="text-center z-10">
                      <h3 className="text-2xl font-bold mb-2">{capsule.name}</h3>
                      <p className="text-neon-blue">OPENS {capsule.openDate}</p>
                    </div>

                    {/* Bid Information */}
                    <div className="absolute bottom-24 left-0 right-0 flex justify-center">
                      <div className="px-4 py-2 bg-space-dark/50 rounded-full border border-neon-blue/30">
                        <span className="text-neon-blue text-sm flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          HIGHEST BID: {capsule.highestBid} SOL ({capsule.bids} bids)
                        </span>
                      </div>
                    </div>

                    {/* Bottom Technical Details */}
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
          
          {/* Bid Requests Tab */}
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
                        <span className="text-white/70">Bidder: {request.bidder}</span>
                        <span className="text-white/70">{request.timestamp}</span>
                      </div>
                      <div className="flex items-center text-neon-pink font-bold">
                        <DollarSign className="w-5 h-5 mr-1" />
                        <span>{request.amount} SOL</span>
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
          
          {/* History Tab */}
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
                      3.5 SOL
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

        {/* Accept Bid Modal */}
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
                  {bidRequests.find(bid => bid.capsuleId === acceptBidCapsule)?.amount || 0} SOL
                </p>
                <p className="text-xs text-white/60 mt-2">
                  You will receive {((bidRequests.find(bid => bid.capsuleId === acceptBidCapsule)?.amount || 0) * 0.98).toFixed(2)} SOL (98%)
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
      </div>
    </div>
  );
};

export default UserProfile;
