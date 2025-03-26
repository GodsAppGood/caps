
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="stars-container absolute inset-0">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.8 + 0.2,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            />
          ))}
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-radial from-neon-blue/20 via-neon-pink/5 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
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
        {/* Button removed as per user request */}
      </div>
    </section>
  );
};

export default Hero;
