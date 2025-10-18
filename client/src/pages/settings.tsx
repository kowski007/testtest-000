import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useLocation, useSearch } from "wouter";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Gift, Users, TrendingUp, Settings as SettingsIcon, Award, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Referral } from "@shared/schema";

export default function Settings() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(useSearch());
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "settings");
  const [loadingReferral, setLoadingReferral] = useState(false);
  const [referralData, setReferralData] = useState<{ referralLink: string; referralCode: string } | null>(null);

  // Fetch creator data for username-based referral
  const { data: creatorData } = useQuery({
    queryKey: ['/api/creators/address', address],
    enabled: !!address,
  });

  // Generate referral link on mount or when creator data changes
  useEffect(() => {
    const generateReferral = async () => {
      if (!address) return;

      setLoadingReferral(true);
      try {
        const response = await apiRequest('POST', '/api/referrals/generate', { address });
        const data = await response.json();
        setReferralData(data);
        console.log('Referral data loaded:', data);
        
        // Update OG meta for sharing
        if (data.referralLink) {
          const { updateOGMeta } = await import('@/lib/og-meta');
          updateOGMeta({
            title: "🎁 Join CoinIT & Earn 100 Bonus Points!",
            description: `Create content coins, trade on Base blockchain, and earn rewards! Use referral code ${data.referralCode} to get started with bonus points. 🚀`,
            url: data.referralLink,
            image: `${window.location.origin}/purple-white.png`
          });
        }
      } catch (error) {
        console.error('Error generating referral:', error);
        toast({
          title: "Error",
          description: "Failed to generate referral link",
          variant: "destructive"
        });
      } finally {
        setLoadingReferral(false);
      }
    };

    generateReferral();
  }, [address, creatorData?.name, toast]);

  const { data: referralStats, isLoading: loadingStats } = useQuery({
    queryKey: ['/api/referrals/stats', address],
    enabled: !!address,
  });

  const { data: referrals = [], isLoading: loadingReferrals } = useQuery<Referral[]>({
    queryKey: ['/api/referrals/referrer', address],
    enabled: !!address,
  });

  useEffect(() => {
    if (referralData?.referralLink) {
      setReferralLink(referralData.referralLink);
    }
  }, [referralData]);

  const handleCopyLink = () => {
    if (!referralLink) {
      toast({
        title: "Error",
        description: "Referral link not available yet",
        variant: "destructive"
      });
      return;
    }
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    if (!referralData?.referralCode) {
      toast({
        title: "Error",
        description: "Referral code not available yet",
        variant: "destructive"
      });
      return;
    }
    navigator.clipboard.writeText(referralData.referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <SettingsIcon className="w-16 h-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Please connect your wallet to access settings and referral features
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-4 sm:mb-6">
            <TabsList className="inline-flex gap-1 bg-muted/20 rounded-full p-1">
              <TabsTrigger
                value="settings"
                className="rounded-full px-4 sm:px-6 py-2 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-black"
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger
                value="referral"
                className="rounded-full px-4 sm:px-6 py-2 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-black"
              >
                <Gift className="w-4 h-4 mr-2" />
                Referral
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-3 sm:space-y-4">
            <Card className="rounded-2xl sm:rounded-3xl">
              <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-base sm:text-lg">Account Information</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Your wallet details</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <Label className="text-xs sm:text-sm">Wallet Address</Label>
                    <Input
                      value={address || ''}
                      readOnly
                      className="mt-1 sm:mt-1.5 font-mono text-xs sm:text-sm rounded-xl"
                      data-testid="input-wallet-address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username" className="text-xs sm:text-sm">Username</Label>
                    <div className="flex items-center gap-2 mt-1 sm:mt-1.5">
                      <Input
                        id="username"
                        value={creatorData?.name || ''}
                        readOnly
                        className="font-mono text-xs sm:text-sm rounded-xl"
                        data-testid="input-username"
                        placeholder="Set your username in profile"
                      />
                      <Button variant="outline" size="icon" className="rounded-xl">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referral Tab */}
          <TabsContent value="referral" className="space-y-3 sm:space-y-4">
            {/* Daily Streak Points Section */}
            <Card className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
              <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Daily Streak Points
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Points earned from daily login streaks</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                {(() => {
                  const { data: streakData } = useQuery({
                    queryKey: ['/api/login-streak', address],
                    enabled: !!address,
                  });

                  const totalPoints = parseInt(streakData?.totalPoints || '0');
                  const currentStreak = parseInt(streakData?.currentStreak || '0');

                  return (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-background/50 rounded-xl p-3 border border-orange-500/20">
                        <p className="text-xs text-muted-foreground mb-1">Total Earned</p>
                        <p className="text-2xl font-bold text-orange-500">{totalPoints}</p>
                        <p className="text-xs text-muted-foreground mt-1">Points</p>
                      </div>
                      <div className="bg-background/50 rounded-xl p-3 border border-orange-500/20">
                        <p className="text-xs text-muted-foreground mb-1">Current Streak</p>
                        <p className="text-2xl font-bold text-orange-500">{currentStreak}</p>
                        <p className="text-xs text-muted-foreground mt-1">Days</p>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid gap-3 sm:gap-4 grid-cols-3">
              <Card className="rounded-xl sm:rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Points</CardTitle>
                  <Gift className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-lg sm:text-2xl font-bold" data-testid="text-total-points">
                    {loadingStats ? '...' : referralStats?.totalPoints || 0}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                    100 per referral
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-xl sm:rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium">Referrals</CardTitle>
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-lg sm:text-2xl font-bold" data-testid="text-total-referrals">
                    {loadingStats ? '...' : referralStats?.totalReferrals || 0}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                    Total users
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-xl sm:rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium">Rank</CardTitle>
                  <Award className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-lg sm:text-2xl font-bold">
                    {(referralStats?.totalReferrals || 0) >= 10 ? 'Gold' : (referralStats?.totalReferrals || 0) >= 5 ? 'Silver' : 'Bronze'}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                    Based on refs
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Referral Link & Code */}
            <Card className="rounded-2xl sm:rounded-3xl">
              <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-base sm:text-lg">Your Referral Info</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Share to earn 100 points per referral</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
                <div>
                  <Label htmlFor="referral-code" className="text-sm">Referral Code</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      id="referral-code"
                      value={loadingReferral ? 'Loading...' : (referralData?.referralCode || creatorData?.name || '')}
                      readOnly
                      className="font-mono text-sm"
                      data-testid="input-referral-code"
                      placeholder={loadingReferral ? 'Generating...' : ''}
                    />
                    <Button
                      onClick={handleCopyCode}
                      variant="outline"
                      size="icon"
                      disabled={loadingReferral || !(referralData?.referralCode || creatorData?.name)}
                      data-testid="button-copy-code"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="referral-link" className="text-sm">Referral Link</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      id="referral-link"
                      value={loadingReferral ? 'Loading...' : (referralData?.referralLink || referralLink)}
                      readOnly
                      className="text-sm"
                      data-testid="input-referral-link"
                      placeholder={loadingReferral ? 'Generating...' : ''}
                    />
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      size="icon"
                      disabled={loadingReferral || !(referralData?.referralLink || referralLink)}
                      data-testid="button-copy-link"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referral History */}
            <Card className="rounded-2xl sm:rounded-3xl">
              <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-base sm:text-lg">Referral History</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Track your successful referrals</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingReferrals ? (
                  <div className="text-center py-6 text-sm text-muted-foreground">Loading...</div>
                ) : referrals.length === 0 ? (
                  <div className="text-center py-6">
                    <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No referrals yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Share your link to start earning!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {referrals.map((referral) => (
                      <div
                        key={referral.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium font-mono text-sm">
                              {formatAddress(referral.referredAddress)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(referral.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary text-sm">+{referral.pointsEarned}</p>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* How it Works */}
            <Card className="rounded-2xl sm:rounded-3xl">
              <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-base sm:text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="space-y-2.5 text-sm">
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                    <p className="text-sm">Copy your unique referral link or code</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                    <p className="text-sm">Share it with friends via social media or direct message</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                    <p className="text-sm">When they connect their wallet using your link, you earn 100 points</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                    <p className="text-sm">Use points for exclusive rewards and benefits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}