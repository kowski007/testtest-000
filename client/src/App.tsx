import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { WagmiProvider } from "wagmi";
import { config } from "./lib/wagmi";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProductTour from "@/components/product-tour";
import DailyPointsModal from "@/components/daily-points-modal";
import Home from "@/pages/home";
import Create from "@/pages/create";
import Channels from "@/pages/channels";
import Creators from "@/pages/creators";
import Leaderboard from "@/pages/leaderboard";
import FAQ from "@/pages/faq";
import Rewards from "./pages/rewards";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";
import Search from "@/pages/search";
import Profile from "@/pages/profile";
import Notifications from "@/pages/notifications";
import Settings from "@/pages/settings";
import Referrals from "@/pages/referrals";
import Docs from "@/pages/docs";
import AdminMetrics from "@/pages/AdminMetrics";
import PublicProfile from "@/pages/public-profile";
import CoinDetails from "@/pages/coin";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/channels" component={Channels} />
      <Route path="/create" component={Create} />
      <Route path="/creators" component={Creators} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route path="/referrals" component={Referrals} />
      <Route path="/rewards" component={Rewards} />
      <Route path="/faq" component={FAQ} />
      <Route path="/docs" component={Docs} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/metrics" component={AdminMetrics} />
      <Route path="/coin/:symbol/:address" component={CoinDetails} />
      <Route path="/@:username" component={PublicProfile} />
      <Route path="/:identifier" component={PublicProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { user, authenticated } = usePrivy();
  const { toast } = useToast();
  const [pendingReferral, setPendingReferral] = useState<string | null>(null);

  const checkInMutation = useMutation({
    mutationFn: async (address: string) => {
      const response = await fetch('/api/login-streak/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      if (!response.ok) throw new Error('Check-in failed');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.pointsEarned > 0) {
        toast({
          title: data.isFirstLogin ? '🎉 Welcome Bonus!' : `🔥 Day ${data.streak.currentStreak} Streak!`,
          description: `You earned ${data.pointsEarned} points!`,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/login-streak'] });
      queryClient.invalidateQueries({ queryKey: ['/api/creators'] });
    },
  });

  const applyReferralMutation = useMutation({
    mutationFn: async ({ referralCode, referredAddress }: { referralCode: string; referredAddress: string }) => {
      // First, find the referrer by their code
      const creatorsResponse = await fetch('/api/creators');
      const creators = await creatorsResponse.json();
      const referrer = creators.find((c: any) => 
        c.referralCode?.toLowerCase() === referralCode.toLowerCase()
      );

      if (!referrer) {
        throw new Error('Invalid referral code');
      }

      // Apply the referral
      const response = await fetch('/api/referrals/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referrerAddress: referrer.address,
          referredAddress: referredAddress,
          referralCode: referralCode,
          pointsEarned: '100',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to apply referral');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: '🎉 Referral Applied!',
        description: 'Welcome! Your referrer has been credited with points.',
      });
      // Clear the pending referral
      setPendingReferral(null);
      localStorage.removeItem('pendingReferral');
      queryClient.invalidateQueries({ queryKey: ['/api/referrals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/creators'] });
    },
    onError: (error: Error) => {
      console.error('Referral application error:', error);
      // Only show toast if it's not a "already exists" error
      if (!error.message.includes('already exists')) {
        toast({
          title: 'Referral Error',
          description: error.message,
          variant: 'destructive',
        });
      }
      // Clear the pending referral even on error
      setPendingReferral(null);
      localStorage.removeItem('pendingReferral');
    },
  });

  // Capture referral code from URL on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');

    if (refCode) {
      // Store in localStorage and state for later use
      localStorage.setItem('pendingReferral', refCode);
      setPendingReferral(refCode);
      console.log('Referral code captured:', refCode);
    } else {
      // Check if we have a pending referral from previous visit
      const stored = localStorage.getItem('pendingReferral');
      if (stored) {
        setPendingReferral(stored);
      }
    }
  }, []);

  // Apply referral when user authenticates with Privy
  useEffect(() => {
    if (authenticated && user?.wallet?.address && pendingReferral) {
      console.log('Applying referral for new user:', user.wallet.address, 'with code:', pendingReferral);

      // Apply referral after a short delay to ensure user is fully set up
      setTimeout(() => {
        applyReferralMutation.mutate({
          referralCode: pendingReferral,
          referredAddress: user.wallet.address,
        });
      }, 1000);
    }
  }, [authenticated, user?.wallet?.address, pendingReferral]);

  return (
    <TooltipProvider>
      <ProductTour />
      <DailyPointsModal userAddress={user?.wallet?.address || ''} />
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

function App() {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID || "cmgmh4vtm00ysl50d198fvxik"}
      config={{
        loginMethods: ['email', 'wallet', 'google', 'twitter'],
        appearance: {
          theme: 'dark',
          accentColor: '#8B5CF6',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  );
}

export default App;