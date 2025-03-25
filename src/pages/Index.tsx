import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAccount } from "wagmi";
import { getAllCapsules, Capsule } from "@/services/capsuleService";
import { 
  ArrowRight, 
  Box, 
  Upload, 
  Clock, 
  DollarSign, 
  Package, 
  ChevronRight, 
  ChevronLeft, 
  Star, 
  Twitter,
  MessageSquare,
  ArrowDown, 
  Circle, 
  Share2,
  MessageCircle,
  ArrowLeft,
  Bell,
  Settings,
  LogOut
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WalletConnect } from "@/components/WalletConnect";

const Index = () => {
  const { user } = useAuth();
  const { isConnected, address } = useAccount();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [auctionCapsules, setAuctionCapsules] = useState<Capsule[]>([]);
  const [upcomingCapsules, setUpcomingCapsules] = useState<Capsule[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchCapsules();
  }, []);

  const fetchCapsules = async () => {
    try {
      const data = await getAllCapsules();
      if (data && data.length) {
        const auctionEnabled = data.filter(capsule => capsule.current_bid !== undefined);
        setAuctionCapsules(auctionEnabled.slice(0, 6));
        
        const now = new Date();
        const oneWeekFromNow = new Date(now);
        oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
        
        const upcoming = data.filter(capsule => {
          const openDate = new Date(capsule.open_date);
          return openDate > now && openDate <= oneWeekFromNow;
        });
        setUpcomingCapsules(upcoming.slice(0, 4));
        
        setCapsules(data);
      }
    } catch (error) {
      console.error("Error fetching capsules:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const goToSlide = (index: number) => {
    if (index < 0) {
      setCurrentSlide(auctionCapsules.length - 1);
    } else if (index >= auctionCapsules.length) {
      setCurrentSlide(0);
    } else {
      setCurrentSlide(index);
    }
  };

  const shortenAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-space-gradient text-white overflow-x-hidden">
      <header className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-6 h-6 text-neon-blue" />
            <span className="text-xl font-bold text-gradient">COSMIC CAPSULES</span>
          </div>
          
          <div className="flex items-center gap-4">
            <WalletConnect />
            <Avatar className="w-10 h-10 border-2 border-neon-blue">
              <AvatarFallback className="bg-space-dark text-neon-blue">UN</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="stars-container absolute inset-0">
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: `${Math.random() * 3 + 1}px`,
                  height: `${Math.random() * 3 + 1}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.8 + 0.2,
                }}
              />
            ))}
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-radial from-neon-blue/20 via-neon-pink/5 to-transparent blur-3xl" />
        </div>
        
        <div className="container relative z-10 px-4 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient animate-fade-in">
            🌠 UNLOCK THE FUTURE
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-8 animate-fade-in delay-150">
            CREATE DIGITAL TIME CAPSULES ON BLOCKCHAIN
          </h2>
          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mb-12 animate-fade-in delay-300">
            Store important memories, photos, and messages securely.
            <br />
            Set an opening date or start an auction for early access!
          </p>
          <Button
            className="rounded-full text-lg px-8 py-6 bg-gradient-to-r from-neon-pink to-neon-blue hover:opacity-90 transition-opacity animate-fade-in delay-500"
            onClick={() => navigate("/profile")}
          >
            🚀 CREATE CAPSULE
          </Button>
        </div>
      </section>
      
      <section className="py-24 bg-space-dark">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gradient">
            HOW IT WORKS
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-space-light/10 backdrop-blur-sm border border-neon-blue/20 hover:border-neon-blue/50 transition-all">
              <div className="w-16 h-16 rounded-full bg-neon-blue/20 flex items-center justify-center mb-6">
                <Box className="w-8 h-8 text-neon-blue" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-neon-blue">🌀 CREATE CAPSULE</h3>
              <p className="text-white/80">
                Upload photos or text, set an opening date and create a capsule with one click.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-space-light/10 backdrop-blur-sm border border-neon-pink/20 hover:border-neon-pink/50 transition-all">
              <div className="w-16 h-16 rounded-full bg-neon-pink/20 flex items-center justify-center mb-6">
                <Upload className="w-8 h-8 text-neon-pink" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-neon-pink">🚨 GRANT ACCESS</h3>
              <p className="text-white/80">
                Set a date or allow users to bid to open your capsule earlier.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-space-light/10 backdrop-blur-sm border border-neon-green/20 hover:border-neon-green/50 transition-all">
              <div className="w-16 h-16 rounded-full bg-neon-green/20 flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-neon-green" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-neon-green">🎉 OPEN CONTENT</h3>
              <p className="text-white/80">
                When the capsule opens, its content becomes available for everyone!
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-neon-blue/10 blur-[100px]" />
          <div className="absolute top-1/3 right-1/4 w-[250px] h-[250px] rounded-full bg-neon-pink/10 blur-[100px]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold text-center mb-16 text-gradient">
            CURRENT AUCTIONS
          </h2>
          
          {auctionCapsules.length > 0 ? (
            <div className="relative">
              <div className="flex justify-center mb-8">
                <button
                  onClick={() => goToSlide(currentSlide - 1)}
                  className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center mr-4 hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex space-x-2">
                  {auctionCapsules.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full ${
                        currentSlide === index ? "bg-neon-blue" : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => goToSlide(currentSlide + 1)}
                  className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center ml-4 hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {auctionCapsules.map((capsule, index) => (
                  <div
                    key={capsule.id}
                    className={`transition-all duration-500 transform ${
                      Math.abs(index - currentSlide) <= 2
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-95 hidden lg:block"
                    }`}
                  >
                    <Card className="bg-space-dark/80 backdrop-blur-xl border border-neon-blue/20 hover:border-neon-blue/60 transition-all h-full">
                      <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                          <span className="text-gradient">{capsule.name}</span>
                          <Circle className="w-5 h-5 text-neon-blue" />
                        </CardTitle>
                        <CardDescription className="text-white/60">
                          Opens: {new Date(capsule.open_date).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-white/80">Current Bid:</span>
                            <span className="text-neon-pink font-bold">
                              {capsule.current_bid || capsule.initial_bid} BNB
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/80">Time Left:</span>
                            <span className="text-neon-green">
                              {(() => {
                                const now = new Date();
                                const openDate = new Date(capsule.open_date);
                                const diffTime = Math.abs(openDate.getTime() - now.getTime());
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                return `${diffDays} days`;
                              })()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full bg-gradient-to-r from-neon-blue to-neon-pink hover:opacity-90 transition-opacity">
                          PLACE BID
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-white/60 py-12">
              <p>No active auctions at the moment.</p>
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              className="rounded-full border-neon-blue text-neon-blue hover:bg-neon-blue/20"
              onClick={() => navigate("/profile")}
            >
              VIEW ALL AUCTIONS
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>
      
      <section className="py-24 bg-space-dark">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gradient">
            OPENING THIS WEEK
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {upcomingCapsules.length > 0 ? (
              upcomingCapsules.map((capsule) => (
                <Card 
                  key={capsule.id}
                  className="bg-space-light/10 backdrop-blur-xl border border-neon-green/20 hover:border-neon-green/60 transition-all"
                >
                  <CardHeader>
                    <CardTitle className="text-neon-green">{capsule.name}</CardTitle>
                    <CardDescription className="text-white/60">
                      By {capsule.creator?.username || "Anonymous"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-white/80">
                        Opens on: {new Date(capsule.open_date).toLocaleDateString()} at {new Date(capsule.open_date).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="w-full bg-space-dark/50 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-neon-green to-neon-blue"
                        style={{
                          width: (() => {
                            const now = new Date();
                            const created = new Date(capsule.created_at);
                            const opens = new Date(capsule.open_date);
                            const total = opens.getTime() - created.getTime();
                            const elapsed = now.getTime() - created.getTime();
                            return `${Math.min(100, (elapsed / total) * 100)}%`;
                          })()
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center text-white/60 py-12 col-span-2">
                <p>No capsules opening this week.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
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
      
      <footer className="py-12 bg-space-dark border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <Package className="w-6 h-6 text-neon-blue mr-2" />
              <span className="text-xl font-bold text-gradient">COSMIC CAPSULES</span>
            </div>
            
            <div className="flex items-center space-x-6">
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
          
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm mb-4 md:mb-0">
              © 2023 Cosmic Capsules. All rights reserved.
            </p>
            
            <div className="flex space-x-6">
              <a href="#" className="text-white/60 hover:text-white text-sm">Privacy Policy</a>
              <a href="#" className="text-white/60 hover:text-white text-sm">Terms of Service</a>
              <a href="#" className="text-white/60 hover:text-white text-sm">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
