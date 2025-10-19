import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { safeNavigate } from "@/lib/navigation";
import Layout from "@/components/layout";
import type { Coin } from "@shared/schema";
import { getCoin } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";
import TradeModal from "@/components/trade-modal";
import MobileTradeModal from "@/components/mobile-trade-modal";
import { useIsMobile } from "@/hooks/use-mobile";

export default function CoinDetails() {
  const isMobile = useIsMobile();
  const [, params] = useRoute("/coin/:symbol/:address");
  const [, navigate] = useLocation();
  const [tradeDialogOpen, setTradeDialogOpen] = useState(true);

  const { data: coin } = useQuery<Coin>({
    queryKey: ["/api/coins/address", params?.address],
    enabled: !!params?.address
  });

  if (!coin) {
    return <Layout>Loading...</Layout>;
  }

  return (
    <Layout>
      {isMobile ? (
        <MobileTradeModal
          coin={coin as any}
          open={tradeDialogOpen}
          onOpenChange={(open) => {
            setTradeDialogOpen(open);
            if (!open) {
              // Navigate back to home when modal is closed
              safeNavigate(navigate, "/");
            }
          }}
        />
      ) : (
        <TradeModal
          coin={coin as any}
          open={tradeDialogOpen}
          onOpenChange={(open) => {
            setTradeDialogOpen(open);
            if (!open) {
              // Navigate back to home when modal is closed
              safeNavigate(navigate, "/");
            }
          }}
        />
      )}
    </Layout>
  );
}