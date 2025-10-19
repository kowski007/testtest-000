import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface UnclaimedPointsReminderProps {
  onClaim: () => void;
  streakResetTime?: Date;
}

export function UnclaimedPointsReminder({ onClaim, streakResetTime }: UnclaimedPointsReminderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Show the reminder after a short delay
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (streakResetTime) {
      const updateTime = () => {
        const now = new Date();
        const diff = streakResetTime.getTime() - now.getTime();
        
        if (diff <= 0) {
          setTimeLeft('');
          return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      };

      updateTime();
      const interval = setInterval(updateTime, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [streakResetTime]);

  const handleClaim = () => {
    if (router.pathname !== '/profile') {
      router.push('/profile');
    }
    onClaim();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm w-full bg-white rounded-lg shadow-lg p-4 transform transition-all duration-300 scale-100 opacity-100 animate-bounce-gentle">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚡</span>
          </div>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">
            Unclaimed E1XP Points!
          </h3>
          <p className="text-sm text-gray-600">
            Don't forget to claim your daily E1XP points
            {timeLeft && (
              <span className="text-red-500 font-medium">
                {' '}(Resets in {timeLeft})
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <button
          onClick={handleClaim}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Claim Now
        </button>
      </div>
    </div>
  );
}