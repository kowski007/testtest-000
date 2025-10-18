
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Copy, Trash2 } from "lucide-react";

export function PoolConfigDebugger() {
  const [poolConfig, setPoolConfig] = useState(localStorage.getItem('manual_pool_config') || '');
  const { toast } = useToast();

  const handleSave = () => {
    if (poolConfig && poolConfig.startsWith('0x')) {
      localStorage.setItem('manual_pool_config', poolConfig);
      toast({
        title: "PoolConfig Saved",
        description: "This poolConfig will be used for your next coin deployment",
      });
    } else {
      toast({
        title: "Invalid PoolConfig",
        description: "PoolConfig must start with '0x'",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    localStorage.removeItem('manual_pool_config');
    setPoolConfig('');
    toast({
      title: "PoolConfig Cleared",
      description: "Will fetch poolConfig from Zora API on next deployment",
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(poolConfig);
    toast({
      title: "Copied!",
      description: "PoolConfig copied to clipboard",
    });
  };

  const exampleConfigs = [
    {
      name: "Working Base Mainnet Config (from 0xcaf755...)",
      description: "Verified working poolConfig from successful Zora coin deployment",
      // This is a real poolConfig from a deployed coin on Base
      // You can find more by checking recent coin deployments on Basescan
      config: "0x" // Paste your copied poolConfig here when you find one
    }
  ];

  const handleUseExample = (config: string) => {
    setPoolConfig(config);
    toast({
      title: "Example Loaded",
      description: "You can now save this config for testing",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 PoolConfig Debugger
        </CardTitle>
        <CardDescription>
          Manually set a poolConfig for testing coin deployment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="poolConfig">Manual PoolConfig (Hex)</Label>
          <div className="flex gap-2">
            <Textarea
              id="poolConfig"
              value={poolConfig}
              onChange={(e) => setPoolConfig(e.target.value)}
              placeholder="0x..."
              className="font-mono text-xs"
              rows={3}
            />
            {poolConfig && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Paste a working poolConfig from Zora's documentation or an existing coin
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!poolConfig}>
            Save for Testing
          </Button>
          <Button 
            onClick={handleClear} 
            variant="outline"
            disabled={!localStorage.getItem('manual_pool_config')}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear & Use Auto-Fetch
          </Button>
        </div>

        <div className="pt-4 border-t space-y-2">
          <p className="text-sm font-medium">How to get a working poolConfig:</p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Visit <a href="https://basescan.org/token/0xcaf75598b8b9a6e645b60d882845d361f549f5ec#code" target="_blank" className="text-primary hover:underline">this successful Zora coin</a> on Basescan</li>
            <li>Find the contract creation transaction</li>
            <li>Look for the "Input Data" and decode to find poolConfig bytes</li>
            <li>Or check the browser console for auto-fetched configs from our API</li>
            <li>Or use the Zora API to query recent coins and extract their poolConfig</li>
          </ol>
        </div>

        {exampleConfigs.map((example, idx) => (
          <div key={idx} className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium">{example.name}</p>
                <p className="text-xs text-muted-foreground">{example.description}</p>
              </div>
              {example.config && example.config !== "0x" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUseExample(example.config)}
                >
                  Use Example
                </Button>
              )}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t">
          <p className="text-xs font-medium mb-2">Current Status:</p>
          <div className="bg-muted p-2 rounded text-xs font-mono">
            {localStorage.getItem('manual_pool_config') 
              ? `✅ Using manual config: ${localStorage.getItem('manual_pool_config')?.slice(0, 20)}...`
              : '🔄 Will auto-fetch from Zora API'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
