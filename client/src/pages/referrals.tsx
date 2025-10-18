import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import Layout from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Gift, Users, Calendar, Award } from "lucide-react";
import type { Referral } from "@shared/schema";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Share2, Copy, Trophy, DollarSign, Check } from "lucide-react";

// Helper function to update OG meta tags
const updateOGMeta = ({
  title,
  description,
  image,
  url,
}: {
  title: string;
  description: string;
  image?: string;
  url?: string;
}) => {
  document.title = title;

  const setMetaTag = (property: string, content: string) => {
    let tag = document.querySelector(
      `meta[property="${property}"]`,
    ) as HTMLMetaElement;
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("property", property);
      document.head.appendChild(tag);
    }
    tag.content = content;
  };

  setMetaTag("og:title", title);
  setMetaTag("og:description", description);
  setMetaTag("twitter:title", title);
  setMetaTag("twitter:description", description);
  setMetaTag("twitter:card", "summary_large_image");

  if (image) {
    setMetaTag("og:image", image);
    setMetaTag("twitter:image", image);
  }

  if (url) {
    setMetaTag("og:url", url);
    setMetaTag("twitter:url", url);
  }
};

export default function Referrals() {
  const { address, isConnected } = useAccount();
  const [referralLink, setReferralLink] = useState<string>("");
  const { toast } = useToast();

  const { data: referralStats, isLoading: loadingStats } = useQuery({
    queryKey: ["/api/referrals/stats", address],
    enabled: !!address,
  });

  const { data: referrals = [], isLoading: loadingReferrals } = useQuery<
    Referral[]
  >({
    queryKey: ["/api/referrals/referrer", address],
    enabled: !!address,
  });

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Your referral link has been copied.",
      variant: "success",
    });
  };

  useEffect(() => {
    if (address) {
      const refLink = `${window.location.origin}/?ref=${address}`;
      setReferralLink(refLink);

      // Update OG meta for sharing
      updateOGMeta({
        title: "🎁 Join Every1.Fun & Earn 100 Bonus Points!",
        description: `Create content coins, trade on Base blockchain, and earn rewards! Use referral code ${address.slice(0, 8)}... to get started with bonus points. 🚀`,
        url: refLink,
        image: `${window.location.origin}/purple-white.png`,
      });
    }
  }, [address]);

  if (!isConnected) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Users className="w-16 h-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Please connect your wallet to view your referrals
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1
              className="text-4xl font-bold mb-2"
              data-testid="text-referrals-title"
            >
              My Referrals
            </h1>
            <p className="text-muted-foreground">
              Track your referral performance and rewards
            </p>
          </div>

          {/* Referral Link Sharing */}
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <Input
              type="text"
              value={referralLink}
              readOnly
              className="flex-grow max-w-xs"
              placeholder="Your referral link..."
            />
            <Button
              onClick={() => copyToClipboard(referralLink)}
              variant="outline"
              size="icon"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button asChild>
              <a
                href={`https://twitter.com/intent/tweet?text=Join%20CoinIT%20and%20earn%20100%20bonus%20points!%20Create%20content%20coins%20on%20Base%20blockchain.%20Use%20my%20referral%20link:%0A%0A${encodeURIComponent(referralLink)}%0A%0A%23CoinIT%20%23Web3%20%23Base%20%23Referral`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Share2 className="w-4 h-4 mr-2" /> Share on X
              </a>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Points
              </CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold"
                data-testid="text-points-earned"
              >
                {loadingStats ? "..." : referralStats?.totalPoints || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                100 points per referral
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Referrals
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold"
                data-testid="text-referral-count"
              >
                {loadingStats ? "..." : referralStats?.totalReferrals || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Users you've referred
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rank</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {referralStats?.totalReferrals >= 10
                  ? "Gold"
                  : referralStats?.totalReferrals >= 5
                    ? "Silver"
                    : "Bronze"}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on referrals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Referrals List */}
        <Card>
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
            <CardDescription>
              View all users you've successfully referred
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingReferrals ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading referrals...
              </div>
            ) : referrals.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No referrals yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Share your referral link from Settings to start earning
                  points!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    data-testid={`referral-item-${referral.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p
                          className="font-medium font-mono"
                          data-testid={`text-referred-address-${referral.id}`}
                        >
                          {formatAddress(referral.referredAddress)}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(referral.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        +{referral.pointsEarned} points
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {referral.claimed ? "Claimed" : "Pending"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How Referrals Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <p>Get your unique referral link from the Settings page (your username or wallet becomes your referral code)</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <p>
                  Share your link with friends via social media, email, or
                  direct message
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <p>
                  When they click your link and sign up using Privy (email, social login, or wallet), the referral is automatically tracked
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <p>
                  You automatically earn 100 points once they complete authentication - no wallet connection required!
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  5
                </div>
                <p>
                  Use your points for exclusive rewards and benefits on the
                  platform
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
