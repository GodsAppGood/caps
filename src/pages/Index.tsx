
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

const Index = () => {
  const { user } = useAuth();
  const { isConnected, address } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="min-h-screen bg-space-gradient text-white overflow-x-hidden">
      <Header />
      <Hero />
      <FeatureSection />
      <AuctionCarousel auctionCapsules={auctionCapsules} />
      <UpcomingCapsules upcomingCapsules={upcomingCapsules} />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
