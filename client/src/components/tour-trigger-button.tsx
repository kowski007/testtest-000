
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TourTriggerButton() {
  const handleResetTour = () => {
    localStorage.removeItem("hasSeenProductTour");
    window.location.reload();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleResetTour}
      className="w-9 h-9 text-muted-foreground hover:text-foreground"
      title="View product tour"
    >
      <HelpCircle className="w-5 h-5" />
    </Button>
  );
}
