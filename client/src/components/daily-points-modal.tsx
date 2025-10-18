
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame, Gift, TrendingUp, Award } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DailyPointsModalProps {
  userAddress: string;
}

export default function DailyPointsModal({ userAddress }: DailyPointsModalProps) {
  const [open, setOpen] = useState(false);
  const [claimData, setClaimData] = useState<any>(null);
  const { toast } = useToast();

  const { data: streakData } = useQuery({
    queryKey: ['/api/login-streak', userAddress],
    enabled: !!userAddress,
  });

  const checkInMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/login-streak/check-in', {
        address: userAddress,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.pointsEarned > 0) {
        setClaimData(data);
        setOpen(true);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/login-streak'] });
      queryClient.invalidateQueries({ queryKey: ['/api/creators'] });
      queryClient.invalidateQueries({ queryKey: [`/api/notifications/${userAddress}`] });
    },
  });

  useEffect(() => {
    if (streakData && userAddress) {
      const today = new Date().toISOString().split('T')[0];
      if (streakData.lastLoginDate !== today) {
        checkInMutation.mutate();
      }
    }
  }, [streakData, userAddress]);

  const handleClose = () => {
    setOpen(false);
    setClaimData(null);
  };

  if (!claimData) return null;

  const isFirstLogin = claimData.isFirstLogin;
  const pointsEarned = claimData.pointsEarned;
  const currentStreak = parseInt(claimData.streak?.currentStreak || '0');
  const isNewRecord = currentStreak.toString() === claimData.streak?.longestStreak && 
                       currentStreak > 1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
            {isFirstLogin ? (
              <Gift className="w-8 h-8 text-white" />
            ) : isNewRecord ? (
              <Award className="w-8 h-8 text-white" />
            ) : (
              <Flame className="w-8 h-8 text-white" />
            )}
          </div>
          <DialogTitle className="text-center text-2xl">
            {isFirstLogin ? (
              '🎉 Welcome Bonus!'
            ) : isNewRecord ? (
              `🏆 New Record!`
            ) : currentStreak >= 7 ? (
              `🔥 Day ${currentStreak} Streak!`
            ) : (
              `🔥 Day ${currentStreak} Login!`
            )}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {isFirstLogin ? (
              `You've claimed ${pointsEarned} points for your first login!`
            ) : isNewRecord ? (
              `New personal best! You've claimed ${pointsEarned} points for ${currentStreak} consecutive days!`
            ) : currentStreak >= 7 ? (
              `Amazing streak! You've claimed ${pointsEarned} points (${pointsEarned - 10} bonus)!`
            ) : (
              `You've claimed ${pointsEarned} points! Keep your streak going!`
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Points Claimed</p>
                <p className="text-3xl font-bold text-orange-500">+{pointsEarned}</p>
              </div>
            </div>
            {!isFirstLogin && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{currentStreak} days</p>
              </div>
            )}
          </div>
        </div>

        {!isFirstLogin && currentStreak < 7 && (
          <p className="text-sm text-center text-muted-foreground">
            {7 - currentStreak} more days to unlock bonus points!
          </p>
        )}

        <Button onClick={handleClose} className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
          Awesome! Continue
        </Button>
      </DialogContent>
    </Dialog>
  );
}
