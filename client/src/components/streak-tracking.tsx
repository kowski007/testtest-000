import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface StreakTrackingProps {
  streak: number;
  nextRewardAmount: number;
  daysUntilBonus: number;
}

export function StreakTracking({ streak, nextRewardAmount, daysUntilBonus }: StreakTrackingProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate week progress
  const weekProgress = streak % 7;
  const progress = (weekProgress / 7) * 100;

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">🔥 Daily Streak</h3>
        <div className="text-2xl font-bold text-purple-600">
          {streak} days
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={mounted ? { width: 0 } : { width: `${progress}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute h-full bg-gradient-to-r from-purple-500 to-indigo-500"
        />
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full ${
              i < weekProgress ? 'bg-purple-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Next Reward:</span>
          <span className="font-medium">+{nextRewardAmount} E1XP</span>
        </div>
        
        {daysUntilBonus > 0 && (
          <div className="flex justify-between text-sm text-purple-600">
            <span>Bonus in:</span>
            <span className="font-medium">{daysUntilBonus} days</span>
          </div>
        )}

        {weekProgress === 6 && (
          <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm">
            🎉 Next login will complete a week streak and unlock bonus points!
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t text-xs text-gray-500">
        <div className="flex justify-between mb-1">
          <span>Base Daily Points:</span>
          <span>+10 E1XP</span>
        </div>
        <div className="flex justify-between">
          <span>Week Streak Bonus:</span>
          <span>+5 E1XP</span>
        </div>
      </div>
    </div>
  );
}