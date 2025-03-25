
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAccount } from "wagmi";
import { getAllCapsules, Capsule } from "@/services/capsuleService";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import FeatureSection from "@/components/home/FeatureSection";
import AuctionCarousel from "@/components/home/AuctionCarousel";
import UpcomingCapsules from "@/components/home/UpcomingCapsules";
import Testimonials from "@/components/home/Testimonials";
import CreateCapsuleModal from "@/components/CreateCapsuleModal";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const { isConnected, address } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [auctionCapsules, setAuctionCapsules] = useState<Capsule[]>([]);
  const [upcomingCapsules, setUpcomingCapsules] = useState<Capsule[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-space-gradient text-white overflow-x-hidden">
      <Header />
      <Hero />
      
      {/* Floating Create Capsule Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-full px-6 py-6 bg-gradient-to-r from-neon-pink to-neon-blue hover:opacity-90 transition-all shadow-lg hover:scale-105"
        >
          <Rocket className="w-6 h-6 mr-2" />
          CREATE CAPSULE
        </Button>
      </div>
      
      <FeatureSection />
      <AuctionCarousel auctionCapsules={auctionCapsules} />
      <UpcomingCapsules upcomingCapsules={upcomingCapsules} />
      <Testimonials />
      <Footer />
      
      <CreateCapsuleModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export default Index;
