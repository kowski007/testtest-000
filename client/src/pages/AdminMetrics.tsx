import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Activity, TrendingUp, Users, Coins, DollarSign, Wallet } from "lucide-react";
import { formatEther } from "viem";

const ACTIVITY_TRACKER_ADDRESS = import.meta.env.VITE_ACTIVITY_TRACKER_ADDRESS;

export default function AdminMetrics() {
  const { data: platformStats, isLoading: loadingPlatform } = useQuery({
    queryKey: ['/api/blockchain/platform-stats'],
    enabled: !!ACTIVITY_TRACKER_ADDRESS
  });

  if (!ACTIVITY_TRACKER_ADDRESS) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              On-Chain Activity Tracker Not Configured
            </CardTitle>
            <CardDescription>
              Deploy the activity tracker contract to enable on-chain metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To enable on-chain activity tracking for grant verification:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Set deployer private key in Replit Secrets: <code className="bg-muted px-2 py-1 rounded">DEPLOYER_PRIVATE_KEY</code></li>
                <li>Deploy the tracker contract: <code className="bg-muted px-2 py-1 rounded">npm run deploy:tracker</code></li>
                <li>Add contract address to Replit Secrets: <code className="bg-muted px-2 py-1 rounded">VITE_ACTIVITY_TRACKER_ADDRESS</code></li>
                <li>Restart the application</li>
              </ol>
              <Button asChild data-testid="link-deployment-guide">
                <a href="https://docs.zora.co/coins" target="_blank">
                  View Zora Docs <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalCoins = platformStats?.totalCoins ? Number(platformStats.totalCoins) : 0;
  const totalPlatformFees = platformStats?.totalPlatformFees ? formatEther(BigInt(platformStats.totalPlatformFees)) : "0";
  const totalCreatorFees = platformStats?.totalCreatorFees ? formatEther(BigInt(platformStats.totalCreatorFees)) : "0";
  const totalVolume = platformStats?.totalVolume ? formatEther(BigInt(platformStats.totalVolume)) : "0";
  const totalCreators = platformStats?.totalCreators ? Number(platformStats.totalCreators) : 0;

  const totalFeesEarned = (parseFloat(totalPlatformFees) + parseFloat(totalCreatorFees)).toFixed(4);

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">On-Chain Platform Metrics</h1>
          <p className="text-muted-foreground mt-2">
            Verifiable on-chain activity for grant judges
          </p>
        </div>
        <Button asChild variant="outline" data-testid="button-view-contract">
          <a 
            href={`https://basescan.org/address/${ACTIVITY_TRACKER_ADDRESS}#readContract`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Contract <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-coins">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coins className="h-4 w-4 text-blue-500" />
              Total Coins Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-coins">
              {loadingPlatform ? '...' : totalCoins}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-unique-creators">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              Unique Creators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-unique-creators">
              {loadingPlatform ? '...' : totalCreators}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-volume">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Total Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-volume">
              {loadingPlatform ? '...' : `${parseFloat(totalVolume).toFixed(4)} ETH`}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-contract-status">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-500" />
              Contract Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="bg-green-500" data-testid="badge-status">
              Active on Base
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Fee Earnings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-platform-fees" className="bg-gradient-to-br from-blue-500/10 to-blue-600/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4 text-blue-500" />
              Platform Fees Earned
            </CardTitle>
            <CardDescription>20% of all trading fees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-platform-fees">
              {loadingPlatform ? '...' : `${parseFloat(totalPlatformFees).toFixed(6)} ETH`}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-creator-fees" className="bg-gradient-to-br from-purple-500/10 to-purple-600/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-500" />
              Creator Fees Earned
            </CardTitle>
            <CardDescription>Distributed to coin creators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400" data-testid="text-creator-fees">
              {loadingPlatform ? '...' : `${parseFloat(totalCreatorFees).toFixed(6)} ETH`}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-fees" className="bg-gradient-to-br from-green-500/10 to-green-600/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Total Fees Generated
            </CardTitle>
            <CardDescription>All platform activity fees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400" data-testid="text-total-fees">
              {loadingPlatform ? '...' : `${totalFeesEarned} ETH`}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm">On-Chain Verification</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>All platform metrics are permanently recorded on-chain:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>✅ Coin creation tracking</li>
              <li>✅ Creator fee distribution</li>
              <li>✅ Platform fee earnings</li>
              <li>✅ Trading volume tracking</li>
              <li>✅ Market cap updates</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm">For Grant Judges</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>Verify all platform activities on Base blockchain:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Contract: <code className="bg-background px-2 py-1 rounded text-xs">{ACTIVITY_TRACKER_ADDRESS?.slice(0, 10)}...</code></li>
              <li>Network: Base (Chain ID: 8453)</li>
              <li>
                <a 
                  href={`https://basescan.org/address/${ACTIVITY_TRACKER_ADDRESS}#readContract`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  View on Basescan <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance Summary</CardTitle>
          <CardDescription>
            Comprehensive on-chain metrics for grant verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Coins Deployed:</span>
                  <span className="font-semibold">{totalCoins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Creators:</span>
                  <span className="font-semibold">{totalCreators}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trading Volume:</span>
                  <span className="font-semibold">{parseFloat(totalVolume).toFixed(4)} ETH</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Revenue:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{parseFloat(totalPlatformFees).toFixed(6)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creator Earnings:</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{parseFloat(totalCreatorFees).toFixed(6)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Fees:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{totalFeesEarned} ETH</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                📊 All data is verifiable on-chain via the youbuidlevery1 contract on Base mainnet
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
