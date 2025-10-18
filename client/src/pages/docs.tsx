import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Coins,
  Upload,
  TrendingUp,
  Sparkles,
  Zap,
  DollarSign,
} from "lucide-react";

export default function Docs() {
  return (
    <Layout>
      <div className="p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Alpha Badge */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-6 h-6 text-primary" />
              <h1 className="text-3xl font-black text-foreground">Documentation</h1>
              <Badge
                variant="secondary"
                className="bg-primary/20 text-primary border-primary/30"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Alpha
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg">
              Transform content into tradeable blockchain assets
            </p>
          </div>

          {/* What is Every1.fun */}
          <Card className="spotify-card mb-6 rounded-3xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Zap className="w-6 h-6 text-primary" />
                What is Every1.fun?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p className="text-foreground font-semibold">
                A Product by GiveStation
              </p>
              <p>
                Every1.fun revolutionizes creator monetization by transforming
                any digital content into tradeable blockchain assets on Base.
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                <p className="text-foreground font-medium mb-2">
                  ✨ Key Features:
                </p>
                <ul className="space-y-1.5 ml-4 list-disc">
                  <li>
                    Import content from any platform (KarmaGAP, PublicGOODS,
                    Music, Videos, YouTube, TikTok, Farcaster, etc.)
                  </li>
                  <li>Automatic Creator Earnings from every trade</li>
                  <li>One-click content tokenization</li>
                  <li>Real-time market data and transparent pricing</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Quick Start */}
          <Card className="spotify-card mb-6 rounded-3xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Coins className="w-6 h-6 text-primary" />
                Quick Start
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">1</div>
                  <p className="text-sm font-medium">Connect Wallet</p>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">2</div>
                  <p className="text-sm font-medium">Import Content</p>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">3</div>
                  <p className="text-sm font-medium">Start Earning</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Creating Coins */}
          <Card className="spotify-card mb-6 rounded-3xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Upload className="w-6 h-6 text-primary" />
                Creating Coins
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <div>
                <h3 className="text-foreground font-semibold mb-1">
                  📎 Import from URL
                </h3>
                <p className="text-sm">
                  Paste any content URL to auto-extract and create a coin.
                  Supports YouTube, Medium, Farcaster, TikTok, and more.
                </p>
              </div>
              <div className="border-t border-border/30 pt-3">
                <h3 className="text-foreground font-semibold mb-1">
                  📁 Upload Content
                </h3>
                <p className="text-sm">
                  Upload images, videos, or audio directly. Add a title and
                  description to create your coin.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Trading */}
          <Card className="spotify-card mb-6 rounded-3xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="w-6 h-6 text-primary" />
                Trading & Earnings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <div>
                <h3 className="text-foreground font-semibold mb-1">
                  💱 Trading
                </h3>
                <p className="text-sm">
                  Click any coin to trade. Buy or sell using ETH with automatic
                  price discovery through bonding curves.
                </p>
              </div>
              <div className="border-t border-border/30 pt-3">
                <h3 className="text-foreground font-semibold mb-1 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Creator Earnings
                </h3>
                <p className="text-sm">
                  Earn automatically from every trade of your coins. Earnings
                  are sent directly to your wallet - no claiming needed!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Alpha Notice */}
          <Card className="spotify-card rounded-3xl border-primary/30 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  <h3 className="text-foreground font-bold text-lg">
                    Alpha Launch
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    We're actively developing new features. Your feedback shapes
                    the future of content monetization!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
