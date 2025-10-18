import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Layout from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TradeModal from "@/components/trade-modal";
import CreateCoinModal from "@/components/create-coin-modal";
import {
  Hash,
  TrendingUp,
  Users,
  Search,
  Filter,
  Plus,
  Clock,
  DollarSign,
  Globe,
  CoinsIcon,
  PenTool,
  Music,
} from "lucide-react";
import { SiYoutube, SiFarcaster, SiTiktok, SiInstagram, SiMedium, SiX } from "react-icons/si";
import { Skeleton } from "@/components/ui/skeleton";

interface Channel {
  id: string;
  name: string;
  creator: string;
  image: string;
  marketCap: string;
  price: string;
  holders: number;
  timeAgo: string;
  priceChange: number;
  address: string;
  symbol: string;
}

export default function Channels() {
  const [location, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Extract search parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split("?")[1] || "");
    const searchParam = urlParams.get("search");
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [location]);

  const categories = [
    { id: "all", name: "All", icon: Globe },
    { id: "youtube", name: "YouTube", icon: SiYoutube },
    { id: "farcaster", name: "Farcaster", icon: SiFarcaster },
    { id: "gitcoin", name: "Gitcoin", icon: CoinsIcon },
    { id: "music", name: "Music", icon: Music },
    { id: "tiktok", name: "TikTok", icon: SiTiktok },
    { id: "instagram", name: "Instagram", icon: SiInstagram },
    { id: "medium", name: "Medium", icon: SiMedium },
    { id: "giveth", name: "Giveth", icon: CoinsIcon },
    { id: "karmagap", name: "KarmaGap", icon: CoinsIcon },
    { id: "publicgoods", name: "PublicGoods", icon: CoinsIcon },
    { id: "twitter", name: "Twitter", icon: SiX },
    { id: "blog", name: "Blog", icon: PenTool },
  ];

  const filteredChannels: Channel[] = [];

  const handleTradeChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    setTradeModalOpen(true);
  };

  return (
    <Layout>
      {/* Header */}
      <section className="p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Channel Import Tab and Category Tabs */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Channel Import Tab */}
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-black hover:bg-primary/90 font-semibold px-6 py-2 rounded-full transition-colors"
            >
              <Plus className="w-4 h-4" />
              Import Channel
            </Button>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedCategory === category.id
                        ? "bg-primary text-black font-semibold"
                        : "bg-muted/20 text-muted-foreground hover:text-white hover:bg-muted/30"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Channels Grid */}
      <section className="px-4 md:px-8 pb-4 md:pb-8">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="spotify-card rounded-xl p-3 space-y-3">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <div className="space-y-2 text-center">
                    <Skeleton className="h-5 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredChannels.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Hash className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {searchTerm ? "No channels found" : "No channels yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? `No channels match "${searchTerm}". Try a different search term.`
                  : "Be the first coin your Channel and earn forever!"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  className="spotify-button"
                >
                  Import your Channel
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {searchTerm
                    ? `Search results for "${searchTerm}"`
                    : "Trending Channels"}
                  <span className="text-muted-foreground ml-2">
                    ({filteredChannels.length})
                  </span>
                </h2>
              </div>

              {/* Responsive Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredChannels.map((channel) => (
                  <div
                    key={channel.id}
                    className="compact-channel-card group cursor-pointer"
                    onClick={() => handleTradeChannel(channel)}
                  >
                    {/* Channel Icon */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden mb-3 mx-auto">
                      <img
                        src={channel.image}
                        alt={channel.name}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                      />
                    </div>

                    {/* Channel Info */}
                    <div className="text-center space-y-1">
                      <h3 className="font-bold text-white text-sm leading-tight">
                        {channel.name}
                        <br />
                        <span className="text-xs text-muted-foreground font-normal">
                          ({channel.symbol})
                        </span>
                      </h3>

                      <div className="text-xs text-muted-foreground">
                        market cap:{" "}
                        <span className="text-primary font-semibold">
                          {channel.marketCap}
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        replies:{" "}
                        <span className="text-white font-semibold">
                          {channel.holders * 30 +
                            Math.floor(Math.random() * 50)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Button */}
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  className="border-border/50 hover:border-primary/50 transition-colors"
                >
                  View All Channels
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Trade Modal */}
      {selectedChannel && (
        <TradeModal
          coin={{
            id: selectedChannel.id,
            name: selectedChannel.name,
            symbol: selectedChannel.symbol,
            address: selectedChannel.address,
            creator: selectedChannel.creator,
            createdAt: new Date().toISOString(),
          }}
          open={tradeModalOpen}
          onOpenChange={setTradeModalOpen}
        />
      )}

      {/* Create Coin Modal */}
      <CreateCoinModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </Layout>
  );
}