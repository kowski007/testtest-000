
import { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface TourStep {
  title: string;
  description: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  targetElement?: string; // CSS selector for the element to highlight
}

export default function ProductTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenProductTour");
    if (!hasSeenTour) {
      setTimeout(() => setIsOpen(true), 500);
    }
  }, []);

  const tourSteps: TourStep[] = [
    {
      title: "Welcome to Every1.fun! 🎉",
      description: "Transform your content into tradeable digital assets. Your creativity deserves to be rewarded.",
      position: 'center'
    },
    {
      title: "Connect Your Wallet",
      description: "Start by connecting your wallet to create and trade coins on the Base blockchain.",
      position: 'top-right',
      targetElement: 'button[data-testid="button-wallet-connect"]'
    },
    {
      title: "Create Your First Coin",
      description: "Import from YouTube, TikTok, Farcaster, or any platform. Each piece becomes a unique tradeable coin.",
      position: 'top-left',
      targetElement: 'nav a[href="/create"], header a[href="/create"]'
    },
    {
      title: "Explore Trending Coins",
      description: "Discover coins from creators, see live prices, and trade with the community.",
      position: 'bottom-left',
      targetElement: '[data-coin-card]'
    },
    {
      title: "Earn Creator Earnings",
      description: "Every time someone trades your coin, you earn Creator Earnings automatically. They're sent directly to your wallet - no claiming needed!",
      position: 'top-right',
      targetElement: 'nav a[href="/creators"], header a[href="/creators"]'
    },
    {
      title: "Ready to Start?",
      description: "Connect your wallet and create your first coin in minutes. Let's turn your content into value!",
      position: 'center'
    },
  ];

  const handleClose = () => {
    localStorage.setItem("hasSeenProductTour", "true");
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
      setLocation("/create");
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSnooze = () => {
    handleClose();
  };

  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (isOpen && currentStep > 0) {
      const step = tourSteps[currentStep];
      if (step.targetElement) {
        // Wait for DOM to update and element to be available
        const updateHighlight = () => {
          const selectors = step.targetElement!.split(',').map(s => s.trim());
          const element = selectors.map(s => document.querySelector(s)).find(el => el !== null);
          
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Small delay to ensure scroll completes
            setTimeout(() => {
              const rect = element.getBoundingClientRect();
              setHighlightStyle({
                position: 'fixed',
                top: `${rect.top - 8}px`,
                left: `${rect.left - 8}px`,
                width: `${rect.width + 16}px`,
                height: `${rect.height + 16}px`,
                borderRadius: '12px',
                pointerEvents: 'none',
                zIndex: 45,
              });
            }, 150);
          } else {
            // Element not found, clear highlight
            console.warn(`Tour step ${currentStep}: Element not found for selectors "${step.targetElement}"`);
            setHighlightStyle({});
          }
        };

        // Initial update with multiple retries
        let retries = 0;
        const maxRetries = 10;
        const retryInterval = setInterval(() => {
          const selectors = step.targetElement!.split(',').map(s => s.trim());
          const element = selectors.map(s => document.querySelector(s)).find(el => el !== null);
          if (element || retries >= maxRetries) {
            clearInterval(retryInterval);
            updateHighlight();
          }
          retries++;
        }, 100);

        // Recalculate on window resize
        window.addEventListener('resize', updateHighlight);
        
        return () => {
          clearInterval(retryInterval);
          window.removeEventListener('resize', updateHighlight);
        };
      } else {
        setHighlightStyle({});
      }
    } else {
      setHighlightStyle({});
    }
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const currentTourStep = tourSteps[currentStep];

  const getPositionClasses = () => {
    switch (currentTourStep.position) {
      case 'top-left':
        return 'top-20 left-4';
      case 'top-right':
        return 'top-20 right-4';
      case 'bottom-left':
        return 'bottom-20 left-4';
      case 'bottom-right':
        return 'bottom-20 right-4';
      case 'center':
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <>
      {/* Spotlight effect - uses box-shadow to create backdrop with cutout */}
      {currentTourStep.targetElement && highlightStyle.width ? (
        <div 
          className="fixed inset-0 z-40 pointer-events-none transition-all duration-200"
        >
          <div 
            className="absolute transition-all duration-200 pointer-events-none"
            style={{
              ...highlightStyle,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 0 3px rgba(139, 92, 246, 1)',
              border: '3px solid rgb(139, 92, 246)',
              background: 'transparent',
            }}
          />
        </div>
      ) : (
        <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200" />
      )}

      {/* Tour Modal */}
      <div 
        className={`fixed z-[60] p-3 animate-in zoom-in-95 duration-200 ${getPositionClasses()}`}
        style={{
          animation: 'slideIn 0.2s ease-out',
          maxWidth: '90vw',
          width: '380px'
        }}
      >
        <div 
          className="relative w-full bg-background rounded-2xl shadow-2xl border border-border overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-muted/80 hover:bg-muted flex items-center justify-center transition-all hover:scale-110"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="p-6">
            {/* Title */}
            <h2 className="text-lg font-black mb-2 text-foreground animate-in slide-in-from-bottom duration-500">
              {currentTourStep.title}
            </h2>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 animate-in slide-in-from-bottom duration-500 delay-100">
              {currentTourStep.description}
            </p>

            {/* Progress Dots */}
            <div className="flex justify-center gap-1.5 mb-4">
              {tourSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? "w-6 bg-primary"
                      : index < currentStep
                      ? "w-1.5 bg-primary/50"
                      : "w-1.5 bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleSnooze}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
              >
                Skip Tour
              </button>

              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    size="sm"
                    className="gap-1.5 rounded-full text-xs h-9 px-3"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  size="sm"
                  className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-xs h-9 px-4"
                >
                  {currentStep === tourSteps.length - 1 ? (
                    "Get Started"
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}
