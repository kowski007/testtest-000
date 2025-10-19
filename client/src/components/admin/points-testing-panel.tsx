import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface PointsTestingPanelProps {
  onTestPoints: (action: string, amount: number) => Promise<void>;
}

export function PointsTestingPanel({ onTestPoints }: PointsTestingPanelProps) {
  const [isLoading, setIsLoading] = useState(false);

  const testActions = [
    { name: 'Daily Login', points: 10, action: 'daily_login' },
    { name: 'Create Coin', points: 50, action: 'coin_creation' },
    { name: 'Complete Trade', points: 5, action: 'trade' },
    { name: 'Referral Bonus', points: 100, action: 'referral' },
    { name: 'ZORA Reward', points: 10, action: 'zora_reward' }
  ];

  const handleTest = async (action: string, points: number) => {
    setIsLoading(true);
    try {
      await onTestPoints(action, points);
    } catch (error) {
      console.error('Test action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testStreakScenarios = async () => {
    setIsLoading(true);
    try {
      // Test 7-day streak bonus
      for (let i = 0; i < 7; i++) {
        await onTestPoints('daily_login', 10 + Math.floor(i / 7) * 5);
      }
    } catch (error) {
      console.error('Streak test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">⚡ E1XP Points Testing</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {testActions.map(({ name, points, action }) => (
            <Button
              key={action}
              onClick={() => handleTest(action, points)}
              disabled={isLoading}
              variant="outline"
              className="h-20"
            >
              <div className="text-left">
                <div className="font-medium">{name}</div>
                <div className="text-sm text-gray-500">+{points} E1XP</div>
              </div>
            </Button>
          ))}
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Streak Testing</h3>
          <Button
            onClick={testStreakScenarios}
            disabled={isLoading}
            variant="secondary"
            className="w-full"
          >
            Test 7-Day Streak (With Bonus)
          </Button>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Batch Testing</h3>
          <Button
            onClick={() => handleTest('batch_all', 0)}
            disabled={isLoading}
            variant="secondary"
            className="w-full"
          >
            Test All Point Actions
          </Button>
        </div>
      </div>
    </Card>
  );
}