
import { useState } from "react";
import { Timer, Wallet, Star, Lock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Index = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const capsules = [
    { id: 1, name: "STELLAR MEMORIES", openDate: "2024-12-31", creator: { name: "ALEX", avatar: "" } },
    { id: 2, name: "COSMIC THOUGHTS", openDate: "2024-10-15", creator: { name: "MARIA", avatar: "" } },
    { id: 3, name: "SPACE DREAMS", openDate: "2024-11-20", creator: { name: "JOHN", avatar: "" } },
  ];

  return (
    <div className="min-h-screen bg-space-gradient text-white">
      {/* Header */}
      <header className="container mx-auto p-4">
        <nav className="flex items-center justify-between">
          <div className="text-4xl font-bold tracking-wider animate-glow">
            <span className="text-neon-blue">CAPS</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setIsWalletConnected(!isWalletConnected)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-space-light border border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-white transition-all duration-300"
            >
              <Wallet className="w-5 h-5" />
              {isWalletConnected ? "CONNECTED" : "CONNECT WALLET"}
            </button>
            <button className="px-6 py-3 rounded-full bg-space-light border border-neon-green text-neon-green hover:bg-neon-green hover:text-white transition-all duration-300">
              PREMIUM CAPS
            </button>
          </div>
        </nav>
      </header>

      {/* Today's Capsules */}
      <section className="container mx-auto py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">TODAY'S CAPS</h2>
        <div className="flex gap-8 overflow-x-auto pb-8">
          {[1, 2, 3].map((capsule) => (
            <div
              key={capsule}
              className="relative min-w-[300px] h-[200px] bg-space-light/30 backdrop-blur-md rounded-xl p-6 border border-neon-blue/20 flex flex-col items-center justify-center gap-4"
            >
              <Avatar className="absolute top-4 right-4 w-8 h-8 border-2 border-neon-blue">
                <AvatarFallback className="bg-space-dark text-neon-blue text-xs">UN</AvatarFallback>
              </Avatar>
              <Timer className="w-8 h-8 text-neon-blue animate-glow" />
              <div className="text-center">
                <p className="text-neon-blue">OPENS IN</p>
                <p className="text-2xl font-bold">12:00:00</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All Capsules */}
      <section className="container mx-auto py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">ALL CAPS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {capsules.map((capsule) => (
            <div
              key={capsule.id}
              className="group relative bg-space-light/30 backdrop-blur-md rounded-xl p-6 border border-neon-pink/20 hover:border-neon-pink transition-all duration-300"
            >
              <Avatar className="absolute top-4 right-4 w-8 h-8 border-2 border-neon-pink">
                <AvatarFallback className="bg-space-dark text-neon-pink text-xs">
                  {capsule.creator.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-gradient-to-r from-neon-pink/0 to-neon-blue/0 group-hover:from-neon-pink/10 group-hover:to-neon-blue/10 rounded-xl transition-all duration-300" />
              <div className="relative flex flex-col items-center gap-4">
                <Lock className="w-8 h-8 text-neon-pink group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-bold">{capsule.name}</h3>
                <p className="text-neon-pink">OPENS {capsule.openDate}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

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
    </div>
  );
};

export default Index;
