
import { Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export function TwitterLoginButton() {
  const { signInWithTwitter, isLoading } = useAuth();

  return (
    <Button
      onClick={() => signInWithTwitter()}
      disabled={isLoading}
      className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1DA1F2] border border-[#1DA1F2] text-white hover:bg-[#1a91da] transition-all duration-300"
    >
      <Twitter className="w-5 h-5" />
      {isLoading ? "CONNECTING..." : "CONNECT WITH TWITTER"}
    </Button>
  );
}
