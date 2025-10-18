
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Coin, Creator } from "@shared/schema";
import Layout from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, X, ChevronRight, Coins as CoinsIcon, Users, TrendingUp } from "lucide-react";
import CoinCard from "@/components/coin-card";

type SearchCategory = "top" | "coins" | "creators" | "channels";

export default function Search() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>("top");
  const [isFocused, setIsFocused] = useState(false);

  const { data: coins = [], isLoading: isLoadingCoins } = useQuery<Coin[]>({
    queryKey: ["/api/coins"],
  });

  const { data: creators = [], isLoading: isLoadingCreators } = useQuery<Creator[]>({
    queryKey: ["/api/creators"],
  });

  // Filter results based on search query
  const filteredCoins = useMemo(() => {
    if (!searchQuery.trim()) return coins.slice(0, 6);
    const query = searchQuery.toLowerCase();
    return coins.filter(coin => 
      coin.name.toLowerCase().includes(query) ||
      coin.symbol.toLowerCase().includes(query) ||
      coin.creator.toLowerCase().includes(query)
    );
  }, [coins, searchQuery]);

  const filteredCreators = useMemo(() => {
    if (!searchQuery.trim()) return creators.slice(0, 6);
    const query = searchQuery.toLowerCase();
    return creators.filter(creator => 
      creator.name?.toLowerCase().includes(query) ||
      creator.address.toLowerCase().includes(query)
    );
  }, [creators, searchQuery]);

  // Featured/Trending coins for "Featuring" section
  const featuredCoins = useMemo(() => {
    return coins.slice(0, 3);
  }, [coins]);

  const categories = [
    { id: "top" as SearchCategory, label: "Top" },
    { id: "coins" as SearchCategory, label: "Coins" },
    { id: "creators" as SearchCategory, label: "Creators" },
    { id: "channels" as SearchCategory, label: "Channels" },
  ];

  const clearSearch = () => {
    setSearchQuery("");
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const hasSearchResults = searchQuery.trim().length > 0;
  const showResults = (selectedCategory === "top" || selectedCategory === "coins") && filteredCoins.length > 0;
  const showCreators = (selectedCategory === "top" || selectedCategory === "creators") && filteredCreators.length > 0;

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Search Header */}
        <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-md border-b border-border">
          <div className="max-w-5xl mx-auto p-4 md:p-6">
            {/* Search Input */}
            <div className="relative mb-4">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search coins, creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="pl-10 pr-24 h-12 bg-muted/20 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/30 transition-all"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => navigate("/")}
                  className="text-muted-foreground hover:text-foreground font-medium text-sm transition-colors px-2"
                >
                  Cancel
                </button>
              </div>
            </div>

            
          </div>
        </div>

        {/* Search Results Content */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-8">
          {(isLoadingCoins || isLoadingCreators) ? (
            /* Loading State */
            <div className="space-y-8">
              <div className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="spotify-card rounded-xl p-3 space-y-3">
                      <Skeleton className="aspect-square w-full rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : hasSearchResults ? (
            /* Search Results */
            <>
              {/* Coins Results */}
              {showResults && (
                <div className="space-y-4">
                  <h2 className="text-foreground font-bold text-xl">
                    Coins {filteredCoins.length > 0 && `(${filteredCoins.length})`}
                  </h2>
                  {filteredCoins.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {filteredCoins.slice(0, 6).map((coin) => (
                        <CoinCard key={coin.id} coin={coin} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No coins found matching "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Creators Results */}
              {showCreators && (
                <div className="space-y-4">
                  <h2 className="text-foreground font-bold text-xl">
                    Creators {filteredCreators.length > 0 && `(${filteredCreators.length})`}
                  </h2>
                  {filteredCreators.length > 0 ? (
                    <div className="space-y-2">
                      {filteredCreators.slice(0, 6).map((creator) => (
                        <div 
                          key={creator.id}
                          className="spotify-card flex items-center gap-3 p-3 cursor-pointer group"
                          onClick={() => navigate("/creators")}
                        >
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                            {creator.name ? creator.name.substring(0, 2).toUpperCase() : creator.address.substring(2, 4).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-foreground font-bold text-sm truncate">
                              {creator.name || formatAddress(creator.address)}
                            </h3>
                            <p className="text-muted-foreground text-xs">Creator</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No creators found matching "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* No Results */}
              {!showResults && !showCreators && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SearchIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-foreground font-bold text-xl mb-2">No results found</h3>
                  <p className="text-muted-foreground">Try searching for something else</p>
                </div>
              )}
            </>
          ) : (
            /* Empty state when no search */
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-foreground font-bold text-xl mb-2">Search coins and creators</h3>
              <p className="text-muted-foreground">Start typing to find what you're looking for</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
