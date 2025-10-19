import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { AlertTriangle, Ban, BellRing } from 'lucide-react';

interface ModeratorPanelProps {
  onModerateUser: (action: any) => Promise<void>;
  onSendNotification: (notification: any) => Promise<void>;
}

export function ModeratorPanel({ onModerateUser, onSendNotification }: ModeratorPanelProps) {
  const [targetAddress, setTargetAddress] = useState('');
  const [moderationType, setModerationType] = useState<'warning' | 'restrict' | 'ban'>('warning');
  const [duration, setDuration] = useState<string>('1');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Notification Testing State
  const [notificationType, setNotificationType] = useState('points_earned');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [testingMode, setTestingMode] = useState<'single' | 'all'>('single');

  const moderationOptions = [
    {
      value: 'warning',
      label: 'Warning',
      description: 'Send a warning to the user',
      icon: AlertTriangle,
      color: 'text-yellow-500'
    },
    {
      value: 'restrict',
      label: 'Restrict',
      description: 'Temporarily restrict user actions',
      icon: Ban,
      color: 'text-orange-500'
    },
    {
      value: 'ban',
      label: 'Ban',
      description: 'Permanently ban the user',
      icon: Ban,
      color: 'text-red-500'
    }
  ];

  const notificationTypes = [
    { value: 'points_earned', label: 'Points Earned' },
    { value: 'streak_milestone', label: 'Streak Milestone' },
    { value: 'coin_created', label: 'Coin Created' },
    { value: 'trade_completed', label: 'Trade Completed' },
    { value: 'referral_bonus', label: 'Referral Bonus' },
    { value: 'zora_rewards', label: 'ZORA Rewards' }
  ];

  const handleModerate = async () => {
    if (!targetAddress || !reason) return;
    setLoading(true);
    try {
      await onModerateUser({
        address: targetAddress,
        type: moderationType,
        duration: duration === 'permanent' ? null : parseInt(duration),
        reason
      });
    } catch (error) {
      console.error('Moderation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    try {
      if (testingMode === 'all') {
        // Send all types of notifications
        for (const type of notificationTypes) {
          await onSendNotification({
            type: type.value,
            title: `Test ${type.label}`,
            message: `This is a test ${type.label.toLowerCase()} notification`,
            address: targetAddress || 'all'
          });
        }
      } else {
        await onSendNotification({
          type: notificationType,
          title: notificationTitle,
          message: notificationMessage,
          address: targetAddress || 'all'
        });
      }
    } catch (error) {
      console.error('Notification test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* User Moderation Section */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">User Moderation</h2>
        
        <div className="space-y-4">
          <div>
            <Label>Target User Address</Label>
            <Input
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
              placeholder="0x... or leave empty for all users"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Action Type</Label>
            <div className="grid grid-cols-3 gap-4 mt-1">
              {moderationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setModerationType(option.value as any)}
                  className={`p-4 rounded-lg border text-left ${
                    moderationType === option.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200'
                  }`}
                >
                  <option.icon className={`w-5 h-5 ${option.color} mb-2`} />
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {moderationType !== 'ban' && (
            <div>
              <Label>Duration</Label>
              <Select
                value={duration}
                onValueChange={setDuration}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Reason</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the reason for this action..."
              className="mt-1"
              rows={3}
            />
          </div>

          <Button
            onClick={handleModerate}
            disabled={loading || !reason}
            className="w-full"
          >
            {loading ? 'Processing...' : 'Apply Moderation'}
          </Button>
        </div>
      </Card>

      {/* Notification Testing Section */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">
          <BellRing className="inline-block w-6 h-6 mr-2" />
          Notification Testing
        </h2>

        <div className="space-y-4">
          <div>
            <Label>Testing Mode</Label>
            <div className="grid grid-cols-2 gap-4 mt-1">
              <button
                onClick={() => setTestingMode('single')}
                className={`p-4 rounded-lg border ${
                  testingMode === 'single' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                }`}
              >
                <div className="font-medium">Single Notification</div>
                <div className="text-sm text-gray-500">Test one notification type</div>
              </button>
              <button
                onClick={() => setTestingMode('all')}
                className={`p-4 rounded-lg border ${
                  testingMode === 'all' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                }`}
              >
                <div className="font-medium">All Notifications</div>
                <div className="text-sm text-gray-500">Test all notification types</div>
              </button>
            </div>
          </div>

          {testingMode === 'single' && (
            <>
              <div>
                <Label>Notification Type</Label>
                <Select
                  value={notificationType}
                  onValueChange={setNotificationType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {notificationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Title</Label>
                <Input
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="Notification title..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Message</Label>
                <Textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Notification message..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </>
          )}

          <Button
            onClick={handleTestNotification}
            disabled={loading || (testingMode === 'single' && (!notificationTitle || !notificationMessage))}
            className="w-full"
          >
            {loading ? 'Sending...' : testingMode === 'all' ? 'Test All Notifications' : 'Send Test Notification'}
          </Button>
        </div>
      </Card>
    </div>
  );
}