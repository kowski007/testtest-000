import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface GeckoTerminalChartProps {
  network?: string;
  poolAddress?: string;
  tokenAddress?: string;
  height?: string;
  chartType?: "price" | "market_cap" | "volume";
  resolution?: string;
  lightChart?: boolean;
  showInfo?: boolean;
  showSwaps?: boolean;
  bgColor?: string;
  overlayColor?: string;
}

export default function GeckoTerminalChart({
  network = "base",
  poolAddress,
  tokenAddress,
  height = "500px",
  chartType = "price",
  resolution = "1d",
  lightChart = false,
  showInfo = false,
  showSwaps = false,
  bgColor = "111827",
  overlayColor = "8B5CF6",
}: GeckoTerminalChartProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function findPool() {
      if (poolAddress) {
        const url = `https://www.geckoterminal.com/${network}/pools/${poolAddress}?embed=1&info=${showInfo ? 1 : 0}&swaps=${showSwaps ? 1 : 0}&light_chart=${lightChart ? 1 : 0}&chart_type=${chartType}&resolution=${resolution}&bg_color=${bgColor}&overlay_color=${overlayColor}`;
        console.log('📊 GeckoTerminal: Using pool address', poolAddress);
        setEmbedUrl(url);
        setIsLoading(false);
        return;
      }

      if (tokenAddress) {
        try {
          console.log('📊 GeckoTerminal: Searching for pool for token', tokenAddress);
          const response = await fetch(
            `/api/geckoterminal/pools/${network}/${tokenAddress}?page=1`
          );
          
          if (!response.ok) {
            throw new Error("Failed to fetch pool data");
          }

          const data = await response.json();
          console.log('📊 GeckoTerminal: Pool search result', data);
          
          if (data.data && data.data.length > 0) {
            const topPool = data.data[0];
            const poolAddr = topPool.attributes.address;
            const url = `https://www.geckoterminal.com/${network}/pools/${poolAddr}?embed=1&info=${showInfo ? 1 : 0}&swaps=${showSwaps ? 1 : 0}&light_chart=${lightChart ? 1 : 0}&chart_type=${chartType}&resolution=${resolution}&bg_color=${bgColor}&overlay_color=${overlayColor}`;
            console.log('📊 GeckoTerminal: Chart URL generated', url);
            setEmbedUrl(url);
            setIsLoading(false);
          } else {
            console.warn('📊 GeckoTerminal: No pools found for token');
            setError("No pools found for this token");
            setIsLoading(false);
          }
        } catch (err) {
          console.error('📊 GeckoTerminal chart error:', err);
          setError(err instanceof Error ? err.message : "Failed to load chart");
          setIsLoading(false);
        }
      } else {
        setError("Either poolAddress or tokenAddress is required");
        setIsLoading(false);
      }
    }

    findPool();
  }, [network, poolAddress, tokenAddress, chartType, resolution, lightChart, showInfo, showSwaps, bgColor, overlayColor]);

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height }}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !embedUrl) {
    return (
      <div className="w-full flex items-center justify-center text-muted-foreground" style={{ height }}>
        {error || "Unable to load chart"}
      </div>
    );
  }

  return (
    <iframe
      id="geckoterminal-embed"
      title="GeckoTerminal Chart"
      src={embedUrl}
      frameBorder="0"
      allow="clipboard-write"
      allowFullScreen
      className="w-full rounded-lg"
      style={{ height }}
      data-testid="geckoterminal-chart-iframe"
    />
  );
}
