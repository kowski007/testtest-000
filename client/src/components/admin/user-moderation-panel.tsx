import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { Select } from '../ui/select';
import { AlertTriangle, Ban, Eye, EyeOff } from 'lucide-react';

interface ModerationType {
  type: 'warning' | 'restrict' | 'ban';
  duration?: number; // in days, null for permanent
  reason: string;
}

interface UserModerationPanelProps {
  onModerate: (userId: string, action: ModerationType) => Promise<void>;
}

export function UserModerationPanel({ onModerate }: UserModerationPanelProps) {
  const [userId, setUserId] = useState('');
  const [moderationType, setModerationType] = useState<'warning' | 'restrict' | 'ban'>('warning');
  const [duration, setDuration] = useState<number | null>(1);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const moderationOptions = [
    {
      value: 'warning',
      label: 'Warning',
      icon: AlertTriangle,
      description: 'Send a warning message to the user',
      color: 'text-yellow-500'
    },
    {
      value: 'restrict',
      label: 'Restrict',
      icon: EyeOff,
      description: 'Restrict user from creating new content',
      color: 'text-orange-500'
    },
    {
      value: 'ban',
      label: 'Ban',
      icon: Ban,
      description: 'Permanently ban user from the platform',
      color: 'text-red-500'
    }
  ];

  const guidelineLinks = {
    prohibited_content: '/guidelines#prohibited-content',
    community_standards: '/guidelines#community-standards',
    terms_of_service: '/terms-of-service'
  };

  const handleSubmit = async () => {
    if (!userId || !reason) return;

    setIsLoading(true);
    try {
      await onModerate(userId, {
        type: moderationType,
        duration: duration,
        reason
      });

      // Reset form
      setReason('');
      setDuration(1);
    } catch (error) {
      console.error('Failed to moderate user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">User Moderation</h2>

      <div className="space-y-6">
        {/* User ID Input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            User Address or ID
          </label>
          <Input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="0x... or user ID"
            className="w-full"
          />
        </div>

        {/* Moderation Type Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Action Type
          </label>
          <div className="grid grid-cols-3 gap-4">
            {moderationOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setModerationType(option.value as any)}
                className={`p-4 rounded-lg border ${
                  moderationType === option.value
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200'
                } text-left`}
              >
                <option.icon className={`w-5 h-5 ${option.color} mb-2`} />
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-gray-500">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Duration Selection */}
        {moderationType !== 'warning' && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Duration
            </label>
            <Select
              value={duration?.toString() || 'permanent'}
              onValueChange={(value) => setDuration(value === 'permanent' ? null : parseInt(value))}
            >
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="permanent">Permanent</option>
            </Select>
          </div>
        )}

        {/* Reason and Guidelines */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Reason
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain the reason for this action..."
            className="mb-2"
            rows={4}
          />
          <div className="text-sm text-gray-500">
            Include references to:
            <div className="mt-1 space-x-2">
              {Object.entries(guidelineLinks).map(([key, link]) => (
                <a
                  key={key}
                  href={link}
                  className="inline-block text-purple-600 hover:underline"
                >
                  {key.split('_').join(' ')}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !userId || !reason}
          className="w-full"
        >
          {isLoading ? 'Processing...' : 'Apply Moderation Action'}
        </Button>
      </div>
    </Card>
  );
}