import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Package,
  Clock,
  Calendar,
  Lock,
  Plus,
  DollarSign,
  User,
  ChevronRight,
  ChevronLeft,
  Star,
  Twitter,
  MessageSquare,
  ArrowDown,
  Circle,
  Share2,
  MessageCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { getAllCapsules, getTodayCapsules, getCapsuleBids, Capsule, placeBid, acceptBid } from "@/services/capsuleService";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow, format, parseISO } from "date-fns";
import AICapsuleWidget from "@/components/AICapsuleWidget";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null);
  const [showCapsuleDetails, setShowCapsuleDetails] = useState(false);
  const [allCapsules, setAllCapsules] = useState<Capsule[]>([]);
  const [todayCapsules, setTodayCapsules] = useState<Capsule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [bids, setBids] = useState<any[]>([]);
  const [bidAmount, setBidAmount] = useState("");
  const [isBidding, setIsBidding] = useState(false);
  const [isAcceptingBid, setIsAcceptingBid] = useState(false);
  const { toast } = useToast();
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchCapsules = async () => {
      try {
        setIsLoading(true);
        const [allCapsulesData, todayCapsulesData] = await Promise.all([
          getAllCapsules(),
          getTodayCapsules(),
        ]);
        
        setAllCapsules(allCapsulesData);
        setTodayCapsules(todayCapsulesData);
      } catch (error) {
        console.error("Error fetching capsules:", error);
        toast({
          title: "Error",
          description: "Failed to load time capsules",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCapsules();
  }, [toast]);

  const fetchBids = async (capsuleId: string) => {
    try {
      const bidsData = await getCapsuleBids(capsuleId);
      setBids(bidsData);
    } catch (error) {
      console.error("Error fetching bids:", error);
      toast({
        title: "Error",
        description: "Failed to load bids for this capsule",
        variant: "destructive",
      });
    }
  };

  const handleViewCapsule = async (capsule: Capsule) => {
    setSelectedCapsule(capsule);
    setShowCapsuleDetails(true);
    await fetchBids(capsule.id);
    setBidAmount("");
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

    if (!selectedCapsule) return;

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Bid",
        description: "Please enter a valid bid amount",
        variant: "destructive",
      });
      return;
    }

    const currentHighestBid = selectedCapsule.current_bid || selectedCapsule.initial_bid;
    const minimumBid = currentHighestBid * 1.1; // 10% higher than current bid

    if (amount < minimumBid) {
      toast({
        title: "Bid Too Low",
        description: `Bid must be at least ${minimumBid.toFixed(3)} BNB (10% higher than current bid)`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsBidding(true);
      await placeBid(selectedCapsule.id, amount, user.id);
      
      toast({
        title: "Success",
        description: "Your bid has been placed successfully",
      });
      
      const updatedCapsules = allCapsules.map(c => 
        c.id === selectedCapsule.id 
          ? { ...c, current_bid: amount, highest_bidder_id: user.id } 
          : c
      );
      setAllCapsules(updatedCapsules);
      
      setSelectedCapsule({ ...selectedCapsule, current_bid: amount, highest_bidder_id: user.id });
      
      await fetchBids(selectedCapsule.id);
      
      setBidAmount("");
    } catch (error: any) {
      console.error("Error placing bid:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to place bid",
        variant: "destructive",
      });
    } finally {
      setIsBidding(false);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    if (!user || !selectedCapsule) return;

    try {
      setIsAcceptingBid(true);
      await acceptBid(selectedCapsule.id, bidId);
      
      toast({
        title: "Success",
        description: "You have accepted the bid. The capsule is now opened!",
      });
      
      const updatedCapsules = allCapsules.map(c => 
        c.id === selectedCapsule.id 
          ? { ...c, status: 'opened' as const } 
          : c
      );
      setAllCapsules(updatedCapsules);
      
      setShowCapsuleDetails(false);
    } catch (error: any) {
      console.error("Error accepting bid:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept bid",
        variant: "destructive",
      });
    } finally {
      setIsAcceptingBid(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allCapsules.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allCapsules.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted overflow-x-hidden">
      {/* Hero Block */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Animation - stars */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-space-gradient opacity-80"></div>
          <div className="stars-container absolute inset-0">
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white animate-pulse"
                style={{
                  width: `${Math.random() * 2 + 1}px`,
                  height: `${Math.random() * 2 + 1}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${Math.random() * 3 + 1}s`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 pt-20 pb-16 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white uppercase animate-fade-in">
            <span className="text-gradient">🌠 Unlock the Future</span>
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Create Digital Time Capsules on the Blockchain
          </h2>
          <p className="text-xl mb-12 text-white/80 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
            Store important memories, photos, and messages securely.
            Set an opening date or launch an auction for early access!
          </p>
          <div className="flex justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <Button
              size="lg"
              onClick={() => navigate("/profile")}
              className="bg-neon-blue hover:bg-neon-blue/90 text-black text-lg px-8 py-6 rounded-full border border-white/20 shadow-lg shadow-neon-blue/30 transition-all duration-300 hover:scale-105"
            >
              🚀 Create Capsule
            </Button>
          </div>
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ArrowDown className="text-white/60" size={32} />
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-space-dark">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center text-white">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-space-light p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-neon-blue/50 shadow-lg shadow-neon-blue/10">
                <Package className="text-neon-blue" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">🌀 Create a Capsule</h3>
              <p className="text-white/70">
                Upload photos or text, set an opening date, and create your capsule with just one click.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-space-light p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-neon-pink/50 shadow-lg shadow-neon-pink/10">
                <Lock className="text-neon-pink" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">🚨 Grant Access</h3>
              <p className="text-white/70">
                Set a specific date or allow users to place bids to open your capsule earlier.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-space-light p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-neon-green/50 shadow-lg shadow-neon-green/10">
                <MessageSquare className="text-neon-green" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">🎉 Reveal Content</h3>
              <p className="text-white/70">
                When a capsule opens, its content becomes accessible to everyone!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Auctions Section */}
      <div className="py-24 bg-gradient-to-b from-space-dark to-space">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center text-white">
            <DollarSign className="inline-block mr-2 mb-1" />
            Current Auctions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="bg-space-light/30 border border-white/10 animate-pulse glass-morphism">
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-white/10 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
                    <div className="h-4 bg-white/10 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              allCapsules
                .filter(capsule => capsule.status === "closed" && capsule.initial_bid)
                .slice(0, 6)
                .map((capsule) => (
                  <Card
                    key={capsule.id}
                    className="bg-space-light/30 border border-white/10 glass-morphism hover:shadow-lg hover:shadow-neon-blue/20 transition-all duration-300 hover:scale-105 cursor-pointer"
                    onClick={() => handleViewCapsule(capsule)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg text-white">{capsule.name}</CardTitle>
                        <Badge variant="outline" className="bg-neon-blue/20 text-white border-neon-blue/50">
                          Bidding Open
                        </Badge>
                      </div>
                      <CardDescription className="text-white/60">
                        Created by {capsule.creator?.username || "Anonymous"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 items-center text-sm text-white/60 mb-3">
                        <Clock size={16} className="text-neon-blue" />
                        <span>Opens {format(parseISO(capsule.open_date), "PP")}</span>
                      </div>
                      <div className="flex gap-2 items-center text-sm text-white/60 mb-4">
                        <DollarSign size={16} className="text-neon-pink" />
                        <span>Current bid: {capsule.current_bid || capsule.initial_bid} BNB</span>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black"
                      >
                        Place Bid
                      </Button>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
          
          {!isLoading && (
            <div className="text-center mt-12">
              <Button 
                onClick={() => setCurrentPage(1)} 
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                View All Auctions
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* This Week's Openings Section */}
      {todayCapsules.length > 0 && (
        <div className="py-24 bg-space">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center text-white">
              <Calendar className="inline-block mr-2 mb-1" />
              Opening This Week
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {todayCapsules.map((capsule) => (
                <Card
                  key={capsule.id}
                  className="bg-space-light/30 border border-white/10 glass-morphism hover:shadow-lg hover:shadow-neon-green/20 transition-all duration-300 hover:scale-105 cursor-pointer"
                  onClick={() => handleViewCapsule(capsule)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-white">{capsule.name}</CardTitle>
                      <Badge variant={capsule.status === "opened" ? "default" : "outline"} className={
                        capsule.status === "opened" 
                          ? "bg-neon-green/80 text-black" 
                          : "bg-neon-green/20 text-white border-neon-green/50"
                      }>
                        {capsule.status === "opened" ? "Opened" : "Unlocking Today"}
                      </Badge>
                    </div>
                    <CardDescription className="text-white/60">
                      Created by {capsule.creator?.username || "Anonymous"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 items-center text-sm text-white/60">
                      <Clock size={16} className="text-neon-green" />
                      <span>Opens {format(parseISO(capsule.open_date), "PP")}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Testimonials Section */}
      <div className="py-24 bg-gradient-to-b from-space to-space-dark">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center text-white">
            <Star className="inline-block mr-2 mb-1 text-yellow-500" />
            What People Say
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Testimonial 1 */}
            <Card className="bg-space-light/30 border border-white/10 glass-morphism">
              <CardContent className="pt-6">
                <div className="flex items-start mb-4">
                  <Avatar className="h-10 w-10 mr-4 border-2 border-neon-blue">
                    <AvatarFallback className="bg-neon-blue/20 text-white">JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">John Doe</p>
                    <p className="text-sm text-white/60">@johndoe</p>
                  </div>
                </div>
                <p className="text-white/80 italic">
                  "It was incredible to see a message from myself after a year! This project brings nostalgia to a whole new level."
                </p>
                <div className="flex mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} className="text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Testimonial 2 */}
            <Card className="bg-space-light/30 border border-white/10 glass-morphism">
              <CardContent className="pt-6">
                <div className="flex items-start mb-4">
                  <Avatar className="h-10 w-10 mr-4 border-2 border-neon-pink">
                    <AvatarFallback className="bg-neon-pink/20 text-white">AS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">Alice Smith</p>
                    <p className="text-sm text-white/60">@alicesmith</p>
                  </div>
                </div>
                <p className="text-white/80 italic">
                  "I created a capsule for my daughter to open on her 18th birthday. The blockchain ensures it will be there waiting for her."
                </p>
                <div className="flex mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} className="text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-space-dark border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold text-white mb-2">Cosmic Capsules</h3>
              <p className="text-white/60 text-sm">Preserving memories on the blockchain</p>
            </div>
            
            <div className="flex gap-6">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-neon-blue transition-colors">
                <Twitter size={24} />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-neon-blue transition-colors">
                <MessageCircle size={24} />
              </a>
              <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-neon-blue transition-colors">
                <Share2 size={24} />
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <a 
              href="https://gitcoin.co" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-white/60 hover:text-neon-blue transition-colors"
            >
              <span className="mr-2">Support us on Gitcoin Grants</span>
              <ChevronRight size={16} />
            </a>
            <p className="text-white/40 text-sm mt-4">&copy; {new Date().getFullYear()} Cosmic Capsules. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Original dialog and other functionality */}
      {selectedCapsule && (
        <Dialog open={showCapsuleDetails} onOpenChange={setShowCapsuleDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedCapsule.name}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="bids">Bids</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Capsule Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <User className="mr-2 text-primary" size={18} />
                          <span className="text-muted-foreground mr-2">Creator:</span>
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage
                              src={selectedCapsule.creator?.avatar_url || ""}
                              alt={selectedCapsule.creator?.username || ""}
                            />
                            <AvatarFallback>
                              {selectedCapsule.creator?.username?.charAt(0) || "A"}
                            </AvatarFallback>
                          </Avatar>
                          <span>{selectedCapsule.creator?.username || "Anonymous"}</span>
                        </div>

                        <div className="flex items-center">
                          <Calendar className="mr-2 text-primary" size={18} />
                          <span className="text-muted-foreground mr-2">Opening Date:</span>
                          <span>{format(parseISO(selectedCapsule.open_date), "PPP")}</span>
                        </div>

                        <div className="flex items-center">
                          <Lock className="mr-2 text-primary" size={18} />
                          <span className="text-muted-foreground mr-2">Encryption:</span>
                          <span>
                            {selectedCapsule.encryption_level?.charAt(0).toUpperCase() +
                              selectedCapsule.encryption_level?.slice(1)}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <DollarSign className="mr-2 text-primary" size={18} />
                          <span className="text-muted-foreground mr-2">Initial Bid:</span>
                          <span>{selectedCapsule.initial_bid} BNB</span>
                        </div>

                        {selectedCapsule.current_bid && (
                          <div className="flex items-center">
                            <DollarSign className="mr-2 text-primary" size={18} />
                            <span className="text-muted-foreground mr-2">Current Bid:</span>
                            <span>{selectedCapsule.current_bid} BNB</span>
                          </div>
                        )}

                        <div className="flex items-center">
                          <Clock className="mr-2 text-primary" size={18} />
                          <span className="text-muted-foreground mr-2">Created:</span>
                          <span>{formatDistanceToNow(parseISO(selectedCapsule.created_at), { addSuffix: true })}</span>
                        </div>

                        <div className="flex items-center">
                          <Badge variant={selectedCapsule.status === "opened" ? "default" : "outline"}>
                            {selectedCapsule.status === "opened" ? "Opened" : "Sealed"}
                          </Badge>
                        </div>
                      </div>

                      {selectedCapsule.message && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium mb-2">Message</h3>
                          <div className="p-4 bg-muted rounded-md">
                            <p>{selectedCapsule.message}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      {selectedCapsule.status === "closed" && (
                        <div className="bg-card p-6 rounded-lg border border-border">
                          <h3 className="text-lg font-medium mb-4">Place a Bid</h3>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Current highest bid: {selectedCapsule.current_bid || selectedCapsule.initial_bid} BNB
                              </p>
                              <p className="text-sm text-muted-foreground mb-4">
                                Minimum bid required:{" "}
                                {((selectedCapsule.current_bid || selectedCapsule.initial_bid) * 1.1).toFixed(3)} BNB
                              </p>
                            </div>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                              <Input
                                type="number"
                                placeholder="Enter bid amount in BNB"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                className="pl-10"
                                step="0.01"
                                min={((selectedCapsule.current_bid || selectedCapsule.initial_bid) * 1.1).toFixed(3)}
                              />
                            </div>
                            <Button 
                              className="w-full" 
                              onClick={handlePlaceBid}
                              disabled={isBidding || !user}
                            >
                              {isBidding ? "Processing..." : "Place Bid"}
                            </Button>
                            {!user && (
                              <p className="text-xs text-muted-foreground text-center mt-2">
                                You need to be signed in to place a bid
                              </p>
                            )}
                          </div>

                          <div className="mt-6">
                            <h4 className="text-sm font-medium mb-2">Bidding Rules:</h4>
                            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                              <li>Minimum bid increment is 10% of the current highest bid</li>
                              <li>Bids are binding and cannot be withdrawn</li>
                              <li>The capsule creator can accept any bid at any time</li>
                              <li>If your bid is outbid, your funds will be automatically returned</li>
                              <li>Platform fee of 2% applies to accepted bids</li>
                            </ul>
                          </div>
                        </div>
                      )}

                      {selectedCapsule.image_url && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium mb-2">Image</h3>
                          <div className="bg-muted rounded-md overflow-hidden">
                            <img
                              src={selectedCapsule.image_url}
                              alt={selectedCapsule.name}
                              className="w-full h-auto object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="bids">
                  {bids.length > 0 ? (
                    <div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Bidder</TableHead>
                            <TableHead>Amount (BNB)</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Status</TableHead>
                            {selectedCapsule.creator_id === user?.id && 
                             selectedCapsule.status === "closed" && (
                              <TableHead className="text-right">Action</TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bids.map((bid) => (
                            <TableRow key={bid.id}>
                              <TableCell className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarImage
                                    src={bid.bidder?.avatar_url || ""}
                                    alt={bid.bidder?.username || ""}
                                  />
                                  <AvatarFallback>
                                    {bid.bidder?.username?.charAt(0) || "A"}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{bid.bidder?.username || "Anonymous"}</span>
                              </TableCell>
                              <TableCell>{bid.amount}</TableCell>
                              <TableCell>
                                {formatDistanceToNow(parseISO(bid.created_at), { addSuffix: true })}
                              </TableCell>
                              <TableCell>
                                {bid.is_accepted ? (
                                  <Badge>Accepted</Badge>
                                ) : (
                                  <Badge variant="outline">Pending</Badge>
                                )}
                              </TableCell>
                              {selectedCapsule.creator_id === user?.id && 
                               selectedCapsule.status === "closed" && (
                                <TableCell className="text-right">
                                  {!bid.is_accepted && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleAcceptBid(bid.id)}
                                      disabled={isAcceptingBid}
                                    >
                                      {isAcceptingBid ? "Processing..." : "Accept Bid"}
                                    </Button>
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No bids have been placed yet</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AICapsuleWidget />
    </div>
  );
};

export default Index;
