
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Timer, DollarSign } from "lucide-react";

const UserProfile = () => {
  const [selectedCapsule, setSelectedCapsule] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState("");

  // Временные данные для демонстрации
  const userCapsules = [
    { id: 1, name: "STELLAR MEMORIES", openDate: "2024-12-31" },
    { id: 2, name: "COSMIC THOUGHTS", openDate: "2024-10-15" },
    { id: 3, name: "SPACE DREAMS", openDate: "2024-11-20" },
  ];

  return (
    <div className="min-h-screen bg-space-gradient text-white">
      <div className="container mx-auto py-16">
        <h1 className="text-4xl font-bold text-center mb-16">ВАШИ КАПСУЛЫ</h1>
        
        {/* Capsules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {userCapsules.map((capsule) => (
            <div
              key={capsule.id}
              onClick={() => setSelectedCapsule(capsule.id)}
              className="relative min-h-[400px] group perspective-1000 cursor-pointer"
            >
              {/* Glass Container */}
              <div className="absolute inset-0 bg-gradient-to-b from-neon-blue/10 to-transparent rounded-[30px] backdrop-blur-md border border-neon-blue/20 overflow-hidden transition-all duration-300 hover:border-neon-blue/40">
                {/* Inner Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-neon-green/20 to-transparent opacity-50" />
                
                {/* Technical Details */}
                <div className="absolute inset-x-0 top-1/4 h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
                <div className="absolute inset-x-0 top-2/4 h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
                <div className="absolute inset-x-0 top-3/4 h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
                
                {/* Side Glows */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-32 bg-neon-blue blur-sm" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-32 bg-neon-blue blur-sm" />

                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center gap-6 p-8">
                  <Timer className="w-12 h-12 text-neon-blue" />
                  <div className="text-center z-10">
                    <h3 className="text-2xl font-bold mb-2">{capsule.name}</h3>
                    <p className="text-neon-blue">OPENS {capsule.openDate}</p>
                  </div>

                  {/* Bottom Technical Details */}
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                    <div className="px-4 py-2 bg-space-dark/50 rounded-full border border-neon-blue/30">
                      <span className="text-neon-blue text-sm">CAPSULE ID: #{capsule.id.toString().padStart(3, '0')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-xl text-neon-blue">СМОТРИТЕ, ЧТО ОТКРЫТО ДЛЯ СТАВОК И СДЕЛАЙТЕ СВОЮ!</p>
        </div>

        {/* Betting Modal */}
        <Dialog open={selectedCapsule !== null} onOpenChange={() => setSelectedCapsule(null)}>
          <DialogContent className="bg-space-dark/95 backdrop-blur-xl border border-neon-pink/20 rounded-xl w-full max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-white">
                СДЕЛАТЬ СТАВКУ
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-8 py-6">
              {/* Bet Input */}
              <div className="space-y-4">
                <label className="text-sm text-neon-pink font-medium">СТАВКА (SOL)</label>
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
                  ПРИ ПРИНЯТИИ СТАВКИ ПОЛЬЗОВАТЕЛЬ ПОЛУЧИТ 98% ОТ СУММЫ,
                  <br />2% ПОЛУЧИТ ПЛАТФОРМА
                </p>
              </div>

              {/* Place Bet Button */}
              <button
                className="w-full py-4 rounded-lg bg-gradient-to-r from-neon-pink to-neon-blue text-white font-bold hover:opacity-90 transition-opacity"
                onClick={() => {
                  console.log("Placing bet:", { capsuleId: selectedCapsule, amount: betAmount });
                  setSelectedCapsule(null);
                }}
              >
                ПОСТАВИТЬ
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UserProfile;
