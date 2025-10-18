import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, DollarSign, TrendingUp, Users, Coins, Activity, Zap, BarChart3, Clock, Settings, Wallet, ExternalLink } from "lucide-react";
import Layout from "@/components/layout";
import { PoolConfigDebugger } from "@/components/pool-config-debugger";
import type { Reward, Coin } from "@shared/schema";
import { getCoin } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";

const PLATFORM_FEE_ADDRESS = "0xf25af781c4F1Df40Ac1D06e6B80c17815AD311F7";
const BASE_CHAIN_ID = 8453;

export default function Admin() {
  const { toast } = useToast();
  const [result, setResult] = useState<any>(null);
  const [totalVolume24h, setTotalVolume24h] = useState<number>(0);
  const [totalMarketCap, setTotalMarketCap] = useState<number>(0);
  const [totalHolders, setTotalHolders] = useState<number>(0);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const migrateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/migrate", {});
      return res.json();
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Migration complete!",
        description: `Migrated ${data.count} out of ${data.total} coins`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/coins"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Migration failed",
        description: error.message,
        variant: "error",
      });
    },
  });

  const { data: rewards = [], isLoading: isLoadingRewards } = useQuery<Reward[]>({
    queryKey: ["/api/rewards"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: coins = [], isLoading: isLoadingCoins } = useQuery<Coin[]>({
    queryKey: ["/api/coins"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: activityTrackerStats, isLoading: isLoadingTrackerStats } = useQuery<{
    totalInDb: number;
    recordedInDb: number;
    pendingRecording: number;
  }>({
    queryKey: ["/api/activity-tracker/stats"],
    refetchInterval: 10000,
  });

  const syncActivityTrackerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/activity-tracker/sync", {});
      return res.json();
    },
    onSuccess: (data) => {
      const hasFailures = data.failed > 0;
      const description = hasFailures 
        ? `Recorded: ${data.recorded}, Already on-chain: ${data.alreadyRegistered}, Failed: ${data.failed}. Check console for details.`
        : `Successfully recorded ${data.recorded} coins on-chain, ${data.alreadyRegistered} already registered`;
      
      toast({
        title: hasFailures ? "Sync Completed with Errors" : "Activity Tracker Synced!",
        description,
        variant: hasFailures ? "destructive" : "default",
      });
      
      if (hasFailures && data.failedCoins) {
        console.error('Failed coins:', data.failedCoins);
        console.error('Troubleshooting tips:', data.troubleshooting);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/activity-tracker/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coins"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [actualZoraBalance, setActualZoraBalance] = useState<string>("0");

  // Fetch actual ZORA token balance from blockchain
  useEffect(() => {
    async function fetchZoraBalance() {
      try {
        const { createPublicClient, http } = await import('viem');
        const { base } = await import('viem/chains');

        const publicClient = createPublicClient({
          chain: base,
          transport: http()
        });

        const ADMIN_ADDRESS = "0xf25af781c4F1Df40Ac1D06e6B80c17815AD311F7";
        const ZORA_TOKEN_ADDRESS = "0x1111111111166b7fe7bd91427724b487980afc69"; // ZORA token on Base

        // ERC20 balanceOf ABI
        const balance = await publicClient.readContract({
          address: ZORA_TOKEN_ADDRESS as `0x${string}`,
          abi: [{
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'account', type: 'address' }],
            outputs: [{ name: 'balance', type: 'uint256' }]
          }],
          functionName: 'balanceOf',
          args: [ADMIN_ADDRESS as `0x${string}`]
        });

        const balanceInZora = Number(balance) / 1e18;
        setActualZoraBalance(balanceInZora.toFixed(4));

        console.log('✅ Actual ZORA balance from blockchain:', balanceInZora.toFixed(4));
      } catch (error) {
        console.error('Failed to fetch ZORA balance:', error);
      }
    }

    fetchZoraBalance();
    const interval = setInterval(fetchZoraBalance, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!coins.length || isLoadingCoins) {
      setTotalVolume24h(0);
      setTotalMarketCap(0);
      setTotalHolders(0);
      return;
    }

    let isMounted = true;
    setIsLoadingStats(true);

    async function fetchAllCoinStats() {
      try {
        let volume = 0;
        let marketCap = 0;
        let holders = 0;

        const activeCoins = coins.filter(c => c.address && c.status === 'active');

        for (const coin of activeCoins) {
          try {
            const coinData = await getCoin({
              address: coin.address as `0x${string}`,
              chain: base.id,
            });

            const tokenData = coinData.data?.zora20Token;

            if (tokenData) {
              // Use volume24h directly from Zora SDK - this is the accurate 24h trading volume
              if (tokenData.volume24h !== null && tokenData.volume24h !== undefined) {
                const volValue = typeof tokenData.volume24h === 'string'
                  ? parseFloat(tokenData.volume24h)
                  : tokenData.volume24h;
                if (!isNaN(volValue) && volValue >= 0) {
                  volume += volValue;
                }
              }

              if (tokenData.marketCap !== null && tokenData.marketCap !== undefined) {
                const mcValue = typeof tokenData.marketCap === 'string'
                  ? parseFloat(tokenData.marketCap)
                  : tokenData.marketCap;
                marketCap += mcValue;
              }

              if (tokenData.uniqueHolders !== undefined) {
                holders += Number(tokenData.uniqueHolders);
              }
            }
          } catch (err) {
            console.error(`Error fetching stats for ${coin.address}:`, err);
          }
        }

        if (isMounted) {
          setTotalVolume24h(volume);
          setTotalMarketCap(marketCap);
          setTotalHolders(holders);
          setIsLoadingStats(false);
        }
      } catch (error) {
        console.error('Error fetching platform stats:', error);
        if (isMounted) {
          setIsLoadingStats(false);
        }
      }
    }

    fetchAllCoinStats();

    return () => {
      isMounted = false;
    };
  }, [coins, isLoadingCoins]);

  const platformRewards = rewards.filter(r => r.type === 'platform');
  const tradeRewards = rewards.filter(r => r.type === 'trade');

  const totalPlatformFees = platformRewards.reduce((sum, r) => {
    // Skip rewards with missing or invalid amounts
    if (!r.rewardAmount || r.rewardAmount === 'null' || r.rewardAmount === 'undefined') {
      return sum;
    }
    const amount = parseFloat(r.rewardAmount);
    if (isNaN(amount) || amount <= 0) {
      return sum;
    }
    const amountInZora = amount / 1e18;
    return sum + amountInZora;
  }, 0);

  const totalTradeFees = tradeRewards.reduce((sum, r) => {
    // Skip rewards with missing or invalid amounts
    if (!r.rewardAmount || r.rewardAmount === 'null' || r.rewardAmount === 'undefined') {
      return sum;
    }
    const amount = parseFloat(r.rewardAmount);
    if (isNaN(amount) || amount <= 0) {
      return sum;
    }
    const amountInZora = amount / 1e18;
    return sum + amountInZora;
  }, 0);

  const creatorRewards = rewards.filter(r => r.type === 'creator' || r.coinAddress);
  const totalCreatorFees = creatorRewards.reduce((sum, r) => {
    if (!r.rewardAmount || r.rewardAmount === 'null' || r.rewardAmount === 'undefined') return sum;
    const amount = parseFloat(r.rewardAmount);
    return sum + (isNaN(amount) || amount <= 0 ? 0 : amount / 1e18);
  }, 0);

  const today = new Date();
  const todayRewards = rewards.filter(r => {
    const rewardDate = new Date(r.createdAt);
    return rewardDate.toDateString() === today.toDateString();
  });

  const todayPlatformFees = todayRewards
    .filter(r => r.type === 'platform')
    .reduce((sum, r) => {
      if (!r.rewardAmount || r.rewardAmount === 'null' || r.rewardAmount === 'undefined') return sum;
      const amount = parseFloat(r.rewardAmount);
      return sum + (isNaN(amount) || amount <= 0 ? 0 : amount / 1e18);
    }, 0);

  const todayTradeFees = todayRewards
    .filter(r => r.type === 'trade')
    .reduce((sum, r) => {
      if (!r.rewardAmount || r.rewardAmount === 'null' || r.rewardAmount === 'undefined') return sum;
      const amount = parseFloat(r.rewardAmount);
      return sum + (isNaN(amount) || amount <= 0 ? 0 : amount / 1e18);
    }, 0);

  const recentRewards = [...rewards]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const activeCoins = coins.filter(c => c.status === 'active').length;
  const pendingCoins = coins.filter(c => c.status === 'pending').length;
  const failedCoins = coins.filter(c => c.status === 'failed').length;

  const totalEarnings = totalPlatformFees + totalTradeFees;
  const avgEarningsPerCoin = activeCoins > 0 ? totalEarnings / activeCoins : 0;

  return (
    <Layout>
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">Admin Dashboard</h1>
          <div className="flex items-center gap-1 sm:gap-2 text-xs text-green-500">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="hidden sm:inline">Live</span>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Earnings</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Tools</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Platform Configuration Section */}
            <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-500/20">
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                  Platform Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Platform Fee Address (20%)</div>
                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                      <code className="text-xs font-mono text-white flex-1 truncate">
                        {PLATFORM_FEE_ADDRESS}
                      </code>
                      <a
                        href={`https://basescan.org/address/${PLATFORM_FEE_ADDRESS}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-400 transition-colors"
                        title="View on BaseScan"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Trade Fee Address (4%)</div>
                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                      <code className="text-xs font-mono text-white flex-1 truncate">
                        {PLATFORM_FEE_ADDRESS}
                      </code>
                      <a
                        href={`https://basescan.org/address/${PLATFORM_FEE_ADDRESS}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-400 transition-colors"
                        title="View on BaseScan"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Primary Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                <CardHeader className="p-3 sm:p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                    <div className="text-right">
                      <div className="text-lg sm:text-2xl font-bold text-white">
                        {isLoadingStats || isLoadingCoins ? '...' : `$${(totalMarketCap / 1000).toFixed(1)}k`}
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Market Cap</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                <CardHeader className="p-3 sm:p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                    <div className="text-right">
                      <div className="text-lg sm:text-2xl font-bold text-white">
                        {isLoadingStats || isLoadingCoins ? '...' : `$${totalVolume24h.toFixed(0)}`}
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">24h Volume</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                <CardHeader className="p-3 sm:p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                    <div className="text-right">
                      <div className="text-lg sm:text-2xl font-bold text-white">
                        {isLoadingStats || isLoadingCoins ? '...' : totalHolders}
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Holders</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
                <CardHeader className="p-3 sm:p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                    <div className="text-right">
                      <div className="text-lg sm:text-2xl font-bold text-white">
                        {isLoadingCoins ? '...' : coins.length}
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Total Coins</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Secondary Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <Card className="bg-muted/20">
                <CardContent className="p-2 sm:p-3">
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-bold text-green-500">{activeCoins}</div>
                    <div className="text-[9px] sm:text-[10px] text-muted-foreground">Active</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/20">
                <CardContent className="p-2 sm:p-3">
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-bold text-yellow-500">{pendingCoins}</div>
                    <div className="text-[9px] sm:text-[10px] text-muted-foreground">Pending</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/20">
                <CardContent className="p-2 sm:p-3">
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-bold text-red-500">{failedCoins}</div>
                    <div className="text-[9px] sm:text-[10px] text-muted-foreground">Failed</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/20">
                <CardContent className="p-2 sm:p-3">
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-bold text-white">{totalEarnings.toFixed(4)}</div>
                    <div className="text-[9px] sm:text-[10px] text-muted-foreground">Total ZORA</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/20">
                <CardContent className="p-2 sm:p-3">
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-bold text-white">{(todayPlatformFees + todayTradeFees).toFixed(4)}</div>
                    <div className="text-[9px] sm:text-[10px] text-muted-foreground">Today</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/20">
                <CardContent className="p-2 sm:p-3">
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-bold text-white">{avgEarningsPerCoin.toFixed(4)}</div>
                    <div className="text-[9px] sm:text-[10px] text-muted-foreground">Avg/Coin</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Deployed Coins with Links */}
            <Card>
              <CardHeader className="p-3 sm:p-4 pb-2">
                <CardTitle className="text-sm sm:text-base">Active Coins On-Chain</CardTitle>
                <CardDescription className="text-xs">View coins on BaseScan and GeckoTerminal</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {coins
                    .filter(c => c.address && c.status === 'active')
                    .map((coin) => (
                      <div key={coin.id} className="flex items-center justify-between p-2 bg-muted/10 rounded-lg text-xs">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">{coin.name} ({coin.symbol})</div>
                          <div className="text-[9px] sm:text-[10px] text-muted-foreground font-mono">
                            {coin.address?.slice(0, 10)}...{coin.address?.slice(-8)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <a
                            href={`https://basescan.org/address/${coin.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded transition-colors"
                            title="View on BaseScan"
                          >
                            <svg className="w-3 h-3 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                            </svg>
                          </a>
                          <a
                            href={`https://www.geckoterminal.com/base/pools/${coin.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-green-500/20 hover:bg-green-500/30 rounded transition-colors"
                            title="View on GeckoTerminal"
                          >
                            <svg className="w-3 h-3 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                            </svg>
                          </a>
                          <a
                            href={`https://dexscreener.com/base/${coin.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded transition-colors"
                            title="View on DexScreener"
                          >
                            <svg className="w-3 h-3 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                            </svg>
                          </a>
                        </div>
                      </div>
                    ))}
                  {coins.filter(c => c.address && c.status === 'active').length === 0 && (
                    <p className="text-center text-muted-foreground text-xs py-4">No active coins deployed yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-4">
            {/* Developer Earnings Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                <CardHeader className="p-3 sm:p-4 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Actual Balance</CardTitle>
                    <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white">{actualZoraBalance}</div>
                  <p className="text-[9px] sm:text-[10px] text-green-500">From blockchain ✓</p>
                </CardHeader>
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardHeader className="p-3 sm:p-4 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Platform (20%)</CardTitle>
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white">{totalPlatformFees.toFixed(4)}</div>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground">Tracked in DB</p>
                </CardHeader>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
                <CardHeader className="p-3 sm:p-4 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Trade (4%)</CardTitle>
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white">{totalTradeFees.toFixed(4)}</div>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground">Tracked in DB</p>
                </CardHeader>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
                <CardHeader className="p-3 sm:p-4 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">DB Records</CardTitle>
                    <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white">{rewards.length}</div>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground">Total transactions</p>
                </CardHeader>
              </Card>
            </div>

            {/* Per-Coin Earnings with Transactions */}
            {coins.filter(c => c.address && c.status === 'active').length > 0 && (
              <Card>
                <CardHeader className="p-3 sm:p-4 pb-2">
                  <CardTitle className="text-sm sm:text-base">Earnings by Coin</CardTitle>
                  <CardDescription className="text-xs">Transaction-level fee tracking</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="space-y-1.5 max-h-96 overflow-y-auto">
                    {coins
                      .filter(c => c.address && c.status === 'active')
                      .map((coin) => {
                        const coinRewards = rewards.filter(r => 
                          r.coinAddress?.toLowerCase() === coin.address?.toLowerCase()
                        );

                        const platformFees = coinRewards
                          .filter(r => r.type === 'platform')
                          .reduce((sum, r) => sum + parseFloat(r.rewardAmount) / 1e18, 0);

                        const tradeFees = coinRewards
                          .filter(r => r.type === 'trade')
                          .reduce((sum, r) => sum + parseFloat(r.rewardAmount) / 1e18, 0);

                        const totalEarnings = platformFees + tradeFees;

                        if (totalEarnings === 0) return null;

                        return (
                          <div key={coin.id} className="space-y-1">
                            <div className="flex items-center justify-between p-2 bg-muted/10 rounded-lg text-xs">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-white truncate">{coin.symbol}</div>
                                <div className="text-[9px] sm:text-[10px] text-muted-foreground font-mono">
                                  {coin.address?.slice(0, 6)}...{coin.address?.slice(-4)}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 sm:gap-3 ml-2">
                                <div className="text-center">
                                  <div className="text-xs sm:text-sm font-bold text-primary">{platformFees.toFixed(4)}</div>
                                  <div className="text-[8px] sm:text-[9px] text-muted-foreground">20%</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs sm:text-sm font-bold text-purple-500">{tradeFees.toFixed(4)}</div>
                                  <div className="text-[8px] sm:text-[9px] text-muted-foreground">4%</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs sm:text-sm font-bold text-green-500">{totalEarnings.toFixed(4)}</div>
                                  <div className="text-[8px] sm:text-[9px] text-muted-foreground">Total</div>
                                </div>
                              </div>
                            </div>
                            {/* Recent transactions for this coin */}
                            <div className="pl-4 space-y-1">
                              {coinRewards.slice(0, 3).map((reward) => (
                                <div key={reward.id} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                  <span className={`px-1.5 py-0.5 rounded ${
                                    reward.type === 'platform' ? 'bg-primary/20 text-primary' : 'bg-purple-500/20 text-purple-500'
                                  }`}>
                                    {reward.type === 'platform' ? '20%' : '4%'}
                                  </span>
                                  <span className="flex-1 truncate">
                                    {(parseFloat(reward.rewardAmount) / 1e18).toFixed(6)} ZORA
                                  </span>
                                  <a
                                    href={`https://basescan.org/tx/${reward.transactionHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-400"
                                    title="View transaction"
                                  >
                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                                    </svg>
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            {/* Recent Activity */}
            <Card>
              <CardHeader className="p-3 sm:p-4 pb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-sm sm:text-base">Recent Activity</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                {isLoadingRewards ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : recentRewards.length === 0 ? (
                  <p className="text-center text-muted-foreground text-xs py-4">No activity yet</p>
                ) : (
                  <div className="space-y-2">
                    {recentRewards.map((reward) => (
                      <div key={reward.id} className="flex items-center justify-between p-2 bg-muted/10 rounded-lg text-xs sm:text-sm">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 sm:gap-2 mb-0.5">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium ${
                              reward.type === 'platform' 
                                ? 'bg-primary/20 text-primary' 
                                : 'bg-purple-500/20 text-purple-500'
                            }`}>
                              {reward.type === 'platform' ? '20%' : '4%'}
                            </span>
                            <span className="font-mono text-[10px] sm:text-xs text-muted-foreground truncate">{reward.coinSymbol}</span>
                            <a
                              href={`https://basescan.org/tx/${reward.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-400 transition-colors"
                              title="View transaction on BaseScan"
                            >
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                              </svg>
                            </a>
                          </div>
                          <div className="text-[9px] sm:text-[10px] text-muted-foreground">
                            {new Date(reward.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right ml-2">
                          <div className="text-xs sm:text-sm font-bold text-white">
                            {(parseFloat(reward.rewardAmount) / 1e18).toFixed(6)}
                          </div>
                          <div className="text-[9px] sm:text-[10px] text-muted-foreground">ZORA</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Tracker Section */}
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
              <CardHeader className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                      <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                      On-Chain Activity Tracker
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Batch record coin creations to blockchain for grant verification
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => syncActivityTrackerMutation.mutate()}
                    disabled={syncActivityTrackerMutation.isPending || (activityTrackerStats?.pendingRecording === 0)}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    data-testid="button-sync-activity-tracker"
                  >
                    {syncActivityTrackerMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Sync Now
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-white" data-testid="text-total-coins">
                      {isLoadingTrackerStats ? '...' : activityTrackerStats?.totalInDb || 0}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Total Coins</div>
                  </div>
                  <div className="bg-green-500/10 rounded-lg p-3 text-center border border-green-500/20">
                    <div className="text-2xl font-bold text-green-500" data-testid="text-recorded-coins">
                      {isLoadingTrackerStats ? '...' : activityTrackerStats?.recordedInDb || 0}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Recorded On-Chain</div>
                  </div>
                  <div className="bg-orange-500/10 rounded-lg p-3 text-center border border-orange-500/20">
                    <div className="text-2xl font-bold text-orange-500" data-testid="text-pending-coins">
                      {isLoadingTrackerStats ? '...' : activityTrackerStats?.pendingRecording || 0}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Pending Recording</div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-muted/10 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-white mb-1">Automated Sync Schedule</div>
                      <div className="text-xs text-muted-foreground">
                        Automatic batch recording runs every hour to keep all coins synced on-chain
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="p-3 sm:p-4">
                  <CardTitle className="text-sm sm:text-base">Check Coin Earnings</CardTitle>
                  <CardDescription className="text-xs">Verify platform referral status</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="0x..."
                      className="w-full p-2 bg-muted rounded-lg text-white text-xs sm:text-sm font-mono"
                      id="coin-address-input"
                    />
                    <Button
                      onClick={async () => {
                        const input = document.getElementById('coin-address-input') as HTMLInputElement;
                        const address = input?.value.trim();

                        if (!address || !address.startsWith('0x')) {
                          toast({
                            title: "Invalid address",
                            description: "Please enter a valid coin address",
                            variant: "error"
                          });
                          return;
                        }

                        try {
                          const res = await fetch(`/api/rewards/coin/${address}/status`);
                          const data = await res.json();

                          if (!res.ok) {
                            throw new Error(data.error || 'Failed to fetch coin status');
                          }

                          const resultDiv = document.getElementById('coin-earnings-result');
                          if (resultDiv) {
                            resultDiv.innerHTML = `
                              <div class="p-3 bg-muted rounded-lg space-y-2 text-xs sm:text-sm">
                                <div class="flex items-center justify-between">
                                  <h3 class="font-bold text-white">${data.coinSymbol}</h3>
                                  <span class="text-[9px] sm:text-[10px] px-2 py-1 rounded ${data.hasPlatformReferral ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}">
                                    ${data.hasPlatformReferral ? '✓ Set' : '✗ Not Set'}
                                  </span>
                                </div>
                                <div class="grid grid-cols-3 gap-2 pt-2 border-t border-muted/20">
                                  <div class="text-center">
                                    <div class="text-sm sm:text-base font-bold text-green-500">${data.earnings.total.toFixed(6)}</div>
                                    <div class="text-[9px] sm:text-[10px] text-muted-foreground">Total</div>
                                  </div>
                                  <div class="text-center">
                                    <div class="text-sm sm:text-base font-bold text-primary">${data.earnings.platform.toFixed(6)}</div>
                                    <div class="text-[9px] sm:text-[10px] text-muted-foreground">Platform</div>
                                  </div>
                                  <div class="text-center">
                                    <div class="text-sm sm:text-base font-bold text-purple-500">${data.earnings.trade.toFixed(6)}</div>
                                    <div class="text-[9px] sm:text-[10px] text-muted-foreground">Trade</div>
                                  </div>
                                </div>
                              </div>
                            `;
                          }

                          toast({
                            title: "Coin checked",
                            description: `${data.coinSymbol}: ${data.hasPlatformReferral ? 'Platform referral is set ✓' : 'No platform referral ✗'}`
                          });
                        } catch (error: any) {
                          toast({
                            title: "Check failed",
                            description: error.message,
                            variant: "error"
                          });
                        }
                      }}
                      className="spotify-button w-full text-xs sm:text-sm"
                    >
                      Check Earnings
                    </Button>
                    <div id="coin-earnings-result"></div>
                  </div>
                </CardContent>
              </Card>

              <PoolConfigDebugger />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}