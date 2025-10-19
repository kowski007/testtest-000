import { useState, useEffect } from 'react';
import { FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';
import confetti from 'canvas-confetti';

interface E1XPPointsCardProps {
  points: number;
  streak: number;
  onShare?: () => void;
}

export function E1XPPointsCard({ points, streak, onShare }: E1XPPointsCardProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (showConfetti) {
      // Trigger confetti from both sides
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0, y: 0.6 }
      });
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 1, y: 0.6 }
      });

      // Reset after animation
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [showConfetti]);

  const shareText = `I've earned ${points} E1XP points on @Every1Fun! Currently on a ${streak} day streak! 🔥\n\n#Every1Fun #E1XP #Web3`;

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">⚡ E1XP Points</h2>
        <div className="flex space-x-2">
          <button
            onClick={shareToTwitter}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <FaTwitter size={20} />
          </button>
          <button
            onClick={shareToFacebook}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <FaFacebook size={20} />
          </button>
        </div>
      </div>

      <div className="text-4xl font-bold mb-4">
        {points.toLocaleString()} pts
      </div>

      <div className="bg-white/10 rounded-lg p-4 mb-4">
        <div className="font-semibold mb-2">🔥 Current Streak</div>
        <div className="text-2xl">{streak} days</div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Daily Login</span>
          <span>+10 pts</span>
        </div>
        <div className="flex justify-between">
          <span>Create Coin</span>
          <span>+50 pts</span>
        </div>
        <div className="flex justify-between">
          <span>Complete Trade</span>
          <span>+5 pts</span>
        </div>
        <div className="flex justify-between">
          <span>Referral</span>
          <span>+100 pts</span>
        </div>
      </div>
    </div>
  );
}