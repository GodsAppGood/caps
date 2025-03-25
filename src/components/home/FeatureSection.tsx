
import React from "react";
import { Box, Upload, Clock } from "lucide-react";

const FeatureSection = () => {
  return (
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
  );
};

export default FeatureSection;
