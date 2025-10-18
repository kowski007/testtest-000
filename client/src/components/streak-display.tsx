import { useQuery, useMutation } from "@tanstack/react-query";
import { Flame, Check, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";

interface StreakDisplayProps {
  userAddress: string;
}

export default function StreakDisplay({ userAddress }: StreakDisplayProps) {
  const { toast } = useToast();
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  const { data: streakData, isLoading } = useQuery({
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
      if (data.alreadyCheckedIn) {
        toast({
          title: "Already checked in today!",
          description: "Come back tomorrow to continue your streak 🔥",
        });
      } else {
        toast({
          title: `+${data.pointsEarned} Points Claimed!`,
          description: data.isNewStreak 
            ? "Your streak started fresh! Login daily to build it up 💪" 
            : `${data.streak?.currentStreak || 1} day streak! Keep it going! 🔥`,
          variant: "success",
        });
      }
      setHasCheckedIn(true);
      queryClient.invalidateQueries({ queryKey: ['/api/login-streak', userAddress] });
      queryClient.invalidateQueries({ queryKey: ['/api/creators/address', userAddress] });
      queryClient.invalidateQueries({ queryKey: [`/api/notifications/${userAddress}`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to check in. Please try again.",
        variant: "destructive",
      });
    },
  });

  const checkUnclaimedMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/login-streak/check-unclaimed', {
        address: userAddress,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.hasUnclaimed) {
        queryClient.invalidateQueries({ queryKey: [`/api/notifications/${userAddress}`] });
      }
    },
  });

  useEffect(() => {
    if (streakData && !hasCheckedIn && !checkInMutation.isPending) {
      const today = new Date().toISOString().split('T')[0];
      if (streakData.lastLoginDate !== today) {
        checkInMutation.mutate();
      }
    }
  }, [streakData, userAddress, hasCheckedIn]);

  // Check for unclaimed points every 5 minutes
  useEffect(() => {
    if (!userAddress) return;

    // Initial check
    checkUnclaimedMutation.mutate();

    // Set up interval for reminders
    const interval = setInterval(() => {
      checkUnclaimedMutation.mutate();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [userAddress]);

  if (isLoading || !streakData) {
    return null;
  }

  const currentStreak = parseInt(streakData.currentStreak || '0');
  const longestStreak = parseInt(streakData.longestStreak || '0');
  const totalPoints = parseInt(streakData.totalPoints || '0');

  const getLastWeekDays = () => {
    const days = [];
    const today = new Date();
    const loginDates = new Set(streakData.loginDates || []);
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
      
      days.push({
        date: dateStr,
        day: dayName,
        isChecked: loginDates.has(dateStr),
        isToday: i === 0
      });
    }
    return days;
  };

  const weekDays = getLastWeekDays();

  return (
    <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 p-6" data-testid="card-streak-display">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Flame className="w-12 h-12 text-orange-500" />
          </div>
        </div>

        <div>
          <div className="text-5xl font-bold text-gray-900 dark:text-white mb-1" data-testid="text-streak-count">
            {currentStreak}
          </div>
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Day Streak
          </div>
          {currentStreak > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Keep logging in daily! 🔥
            </p>
          )}
        </div>

        <div className="flex gap-2 justify-center w-full">
          {weekDays.map((day, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                {day.day}
              </div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  day.isChecked
                    ? 'bg-orange-500 text-white'
                    : day.isToday
                    ? 'bg-gray-300 dark:bg-gray-600 border-2 border-orange-400 dark:border-orange-500'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                }`}
                data-testid={`day-${day.day}-${day.isChecked ? 'checked' : 'unchecked'}`}
              >
                {day.isChecked && <Check className="w-5 h-5" />}
              </div>
            </div>
          ))}
        </div>

        <div className="w-full bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4 mt-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Your Stats
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-total-points">
                {totalPoints}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-current-streak">
                {currentStreak}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Current</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-1" data-testid="text-longest-streak">
                <Trophy className="w-5 h-5" />
                {longestStreak}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Best</div>
            </div>
          </div>
        </div>

        {currentStreak === 0 && (
          <Button
            onClick={() => checkInMutation.mutate()}
            disabled={checkInMutation.isPending}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            data-testid="button-start-streak"
          >
            Start Your Streak
          </Button>
        )}
      </div>
    </Card>
  );
}
