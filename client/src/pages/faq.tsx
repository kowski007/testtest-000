import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import Layout from "@/components/layout";

interface FAQItem {
  question: string;
  answer: string;
  category: "general" | "creation" | "trading" | "technical";
}

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "general" | "creation" | "trading" | "technical"
  >("all");

  const faqData: FAQItem[] = [
    {
      question: "What is Every1.fun?",
      answer:
        "Every1.fun is a platform that allows you to transform public goods projects, social media channels, posts and articles into tradeable digital assets (coins) on Base blockchain. It bridges traditional web content with ZORA Protocol.",
      category: "general",
    },
    {
      question: "How do I create a coin?",
      answer:
        "Simply paste a blog URL into our platform, preview the extracted content, customize the metadata, and mint it as a coin on the Base blockchain. The process is automated and user-friendly.",
      category: "creation",
    },
    {
      question: "What blockchains does Every1.fun support?",
      answer:
        "Currently, Every1.fun operates on the Base network using Zora Protocol, which is an Ethereum Layer 2 built by Coinbase. We chose Base for its low fees, fast transactions, and growing DeFi ecosystem.",
      category: "technical",
    },
    {
      question: "Can I trade coins created by others?",
      answer:
        "Yes! Once coins are minted, they become tradeable digital assets. You can buy, sell, and trade them on supported marketplaces and within our platform.",
      category: "trading",
    },
    {
      question: "How is the value of a coin determined?",
      answer:
        "Coin values are determined by market demand, the quality and popularity of the content, creator reputation, and trading activity. It follows standard supply and demand economics.",
      category: "trading",
    },
    {
      question: "Do I need a crypto wallet?",
      answer:
        "Yes, you'll need a compatible Web3 wallet like MetaMask, WalletConnect, or others to interact with the blockchain, create coins, and make trades.",
      category: "technical",
    },
    {
      question: "What types of content can I monetize?",
      answer:
        "You can create coins from blog posts, articles, news stories, opinion pieces, tutorials, and any web content that can be scraped. The content should be publicly accessible.",
      category: "creation",
    },
    {
      question: "Are there any fees?",
      answer:
        "There are standard blockchain transaction fees (gas fees) for minting and trading. We also charge a small platform fee for our services, which helps maintain and improve the platform.",
      category: "general",
    },
    {
      question: "How do I claim my Creator Earnings?",
      answer:
        "You don't need to claim anything! Creator Earnings are automatically sent to your wallet address every time someone trades your coin. The earnings come from trading fees and are distributed instantly on-chain. Just check your wallet to see your accumulated earnings.",
      category: "creation",
    },
    {
      question: "How is content stored?",
      answer:
        "Content metadata is stored on IPFS (InterPlanetary File System) for decentralized, permanent storage. This ensures your coins and their associated content remain accessible.",
      category: "technical",
    },
    {
      question: "Can I edit a coin after creation?",
      answer:
        "Once minted on the blockchain, the core coin data cannot be changed. However, you can update certain metadata fields and descriptions through our platform interface.",
      category: "creation",
    },
  ];

  const filteredFAQs =
    selectedCategory === "all"
      ? faqData
      : faqData.filter((item) => item.category === selectedCategory);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const categories = [
    { key: "all", label: "All Questions" },
    { key: "general", label: "General" },
    { key: "creation", label: "Creating Coins" },
    { key: "trading", label: "Trading" },
    { key: "technical", label: "Technical" },
  ] as const;

  return (
    <Layout>
      <div className="p-8">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-8 text-center">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-2xl font-black mb-4 text-foreground">
              F.A.Q<span className="spotify-green"></span>
            </h1>
            <p className="text-l text-muted-foreground">
              Everything you need to know about Every1.fun and content tokenization.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                  selectedCategory === category.key
                    ? "bg-primary text-black"
                    : "bg-muted/20 text-muted-foreground hover:text-foreground"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQs.map((item, index) => (
              <div
                key={index}
                className="spotify-card rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/5 transition-colors"
                >
                  <h3 className="text-lg font-bold text-foreground pr-4">
                    {item.question}
                  </h3>
                  {openItems.includes(index) ? (
                    <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </button>

                {openItems.includes(index) && (
                  <div className="px-6 pb-6">
                    <div className="border-t border-border pt-4">
                      <p className="text-muted-foreground leading-relaxed">
                        {item.answer}
                      </p>
                      <div className="mt-3">
                        <span className="inline-block px-3 py-1 bg-muted/20 rounded-full text-xs font-semibold text-primary capitalize">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Social Links Section */}
          <div className="mt-12 text-center bg-muted/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Connect With Us
            </h2>
            <p className="text-muted-foreground mb-6">
              Follow us on social media for updates and announcements
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="https://x.com/givestation"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-muted/20 hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors group"
              >
                <svg
                  className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://discord.gg/givestation"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-muted/20 hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors group"
              >
                <svg
                  className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
              <a
                href="https://t.me/coinit"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-muted/20 hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors group"
              >
                <svg
                  className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
              <a
                href="https://github.com/givestation"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-muted/20 hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors group"
              >
                <svg
                  className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
