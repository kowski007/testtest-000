import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Search } from "lucide-react";

interface URLInputFormProps {
  onScraped: (data: any) => void;
}

export default function URLInputForm({ onScraped }: URLInputFormProps) {
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const scrapeMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await apiRequest("POST", "/api/scrape", { url });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Content scraped successfully!",
        description: "Review the preview below to create your coin.",
      });
      onScraped(data);
      setUrl("");
    },
    onError: (error: Error) => {
      toast({
        title: "Scraping failed",
        description: error.message || "Failed to scrape content from URL",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast({
        title: "URL required",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }
    scrapeMutation.mutate(url);
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-card border border-border/60 rounded-3xl p-8 shadow-black/20 dark:shadow-black/40">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="bg-muted/30 dark:bg-muted/20 rounded-2xl p-1 border border-border/30">
              <Input
                type="url"
                id="contentUrl"
                placeholder="Paste any URL - Public goods, YouTube, Vlogs, Blogs, Music..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-transparent border-0 text-foreground placeholder:text-muted-foreground h-12 text-sm px-5 focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={scrapeMutation.isPending}
                data-testid="input-content-url"
              />
            </div>

            <Button
              type="submit"
              disabled={scrapeMutation.isPending}
              className="w-full h-12 bg-gradient-to-r from-primary to-primary hover:from-primary/90 text-primary-foreground font-semibold rounded-2xl transition-all"
              data-testid="button-scrape"
            >
              {scrapeMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Import Content
                </>
              )}
            </Button>
          </div>

          <div className="pt-2 border-t border-border/30">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              <span className="font-medium text-foreground">Supports:</span>{" "}
              Public goods, YouTube, Farcaster, X, Twitch, Blogs, and more
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
