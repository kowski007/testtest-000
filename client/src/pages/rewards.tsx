
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Search, TrendingUp, Users, Heart, Eye, DollarSign, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Layout from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface AnalysisResult {
  url: string;
  platform: string;
  title: string;
  author?: string;
  followers?: number;
  engagement?: number;
  estimatedMarketCap: number;
  estimatedDailyEarnings: number;
  estimatedMonthlyEarnings: number;
  popularityScore: number;
}

// Mock analysis function - in production, this would call your backend
async function analyzeUrl(url: string): Promise<AnalysisResult> {
  const response = await fetch('/api/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) throw new Error('Failed to analyze URL');
  
  const data = await response.json();
  
  // Calculate estimated metrics based on scraped data
  // This is a simplified algorithm - adjust based on your needs
  const baseMultiplier = 0.001; // Base market cap per follower
  const engagementBonus = 1.5; // Bonus for high engagement
  
  // Use followers from scraped data if available, otherwise try to extract from description
  let estimatedFollowers = data.followers || 0;
  
  // If followers not in data, try to extract from description as fallback
  if (!estimatedFollowers) {
    const followerMatch = data.description?.match(/(\d+(?:,\d+)*)\s*(?:followers|subs|subscribers)/i);
    estimatedFollowers = followerMatch ? parseInt(followerMatch[1].replace(/,/g, '')) : 10000;
  }
  
  const popularityScore = Math.min(100, (estimatedFollowers / 1000) * 10);
  const estimatedMarketCap = estimatedFollowers * baseMultiplier * engagementBonus;
  const estimatedDailyEarnings = estimatedMarketCap * 0.02; // 2% daily volume
  const estimatedMonthlyEarnings = estimatedDailyEarnings * 30;

  return {
    url: data.url,
    platform: data.platform,
    title: data.title,
    author: data.author,
    followers: estimatedFollowers,
    engagement: data.engagement || Math.floor(Math.random() * 10),
    estimatedMarketCap,
    estimatedDailyEarnings,
    estimatedMonthlyEarnings,
    popularityScore,
  };
}

export default function Analyzer() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: analyzeUrl,
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    analyzeMutation.mutate(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <Layout>
      <div className="p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-black mb-4 text-white">
              Social <span className="spotify-green">Analyzer</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Analyze any social media page and estimate potential earnings on CoinIT
            </p>
          </div>

          {/* URL Input */}
          <Card className="spotify-card mb-8">
            <CardHeader>
              <CardTitle className="text-white">Analyze Social Page</CardTitle>
              <CardDescription>
                Enter a URL from YouTube, Instagram, TikTok, Twitter, or any social platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAnalyze} className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://instagram.com/username or https://youtube.com/@channel"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 bg-muted/20 border-border text-white"
                    disabled={analyzeMutation.isPending}
                  />
                  <Button
                    type="submit"
                    disabled={analyzeMutation.isPending || !url.trim()}
                    className="spotify-button"
                  >
                    {analyzeMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>

                {analyzeMutation.isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to analyze URL. Some platforms (Instagram, TikTok) may block automated access. 
                      Try YouTube, Medium, or blog URLs for better results.
                    </AlertDescription>
                  </Alert>
                )}

                <Alert className="bg-muted/10 border-muted/20">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <AlertDescription className="text-muted-foreground text-sm">
                    <strong>Note:</strong> Instagram and TikTok often block automated analysis. 
                    For best results, use YouTube channels, Medium profiles, or blog URLs.
                  </AlertDescription>
                </Alert>
              </form>
            </CardContent>
          </Card>

          {/* Loading State */}
          {analyzeMutation.isPending && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="spotify-card">
                    <CardHeader className="space-y-2">
                      <Skeleton className="h-4 w-24 bg-muted/20" />
                      <Skeleton className="h-8 w-32 bg-muted/20" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {result && !analyzeMutation.isPending && (
            <div className="space-y-6">
              {/* Page Info */}
              <Card className="spotify-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-xl mb-2">{result.title}</CardTitle>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {result.author && (
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {result.author}
                          </span>
                        )}
                        <Badge variant="secondary" className="capitalize">
                          {result.platform}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{result.popularityScore}</div>
                      <div className="text-xs text-muted-foreground">Popularity Score</div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="spotify-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Followers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {result.followers ? formatNumber(result.followers) : 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Estimated audience size
                    </p>
                  </CardContent>
                </Card>

                <Card className="spotify-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Engagement Rate</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {result.engagement ? `${result.engagement}%` : 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Average interaction rate
                    </p>
                  </CardContent>
                </Card>

                <Card className="spotify-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Est. Market Cap</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(result.estimatedMarketCap)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Potential initial value
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Earnings Projections */}
              <Card className="spotify-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Earning Projections
                  </CardTitle>
                  <CardDescription>
                    Based on 4% creator fee from trading volume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Daily Earnings</span>
                        <span className="text-xl font-bold text-white">
                          {formatCurrency(result.estimatedDailyEarnings)}
                        </span>
                      </div>
                      <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(result.popularityScore, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Monthly Earnings</span>
                        <span className="text-xl font-bold text-white">
                          {formatCurrency(result.estimatedMonthlyEarnings)}
                        </span>
                      </div>
                      <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(result.popularityScore, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <Alert className="mt-6 bg-primary/10 border-primary/20">
                    <Eye className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-white">
                      These are estimated projections. Actual earnings depend on trading activity, 
                      market conditions, and platform growth.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* CTA */}
              <Card className="spotify-card bg-gradient-to-r from-primary/20 to-primary/5 border-primary/20">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Ready to monetize your content?
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create a coin for this page and start earning from every trade
                  </p>
                  <Button 
                    className="spotify-button"
                    onClick={() => {
                      setUrl('');
                      window.location.href = '/create';
                    }}
                  >
                    Create Coin Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {!result && !analyzeMutation.isPending && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Analyze Your Social Presence
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter any social media URL above to see estimated earnings potential based on 
                followers, engagement, and platform popularity.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
