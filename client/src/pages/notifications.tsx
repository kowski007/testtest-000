import { useQuery, useMutation } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type { Notification } from "@shared/schema";
import Layout from "@/components/layout";
import { Bell, DollarSign, TrendingUp, Coins as CoinsIcon, Gift } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow, isToday, isYesterday, differenceInMinutes } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import DailyPointsModal from "@/components/daily-points-modal"; // Assuming this component exists

export default function Notifications() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: [`/api/notifications/${address}`],
    enabled: !!address,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/notifications/${address}`] });
    },
  });

  const { data: loginStreakData, isLoading: isLoadingLoginStreak } = useQuery({
    queryKey: ['/api/login-streak', address],
    enabled: !!address,
  });

  const { mutate: claimDailyPoints } = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/login-streak/claim', {
        address: address,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/login-streak'] });
      toast({
        title: "Points Claimed!",
        description: "Your daily streak points have been added.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to claim points: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsReadMutation.mutateAsync(notification.id);
    }

    // Handle daily streak notifications - trigger check-in which will show modal
    if (notification.type === 'reward' && notification.title?.includes('Daily')) {
      try {
        await apiRequest('POST', '/api/login-streak/check-in', {
          address: address,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/login-streak'] });
      } catch (error) {
        console.error('Failed to check-in:', error);
      }
    }

    // Handle navigation based on notification type
    if (notification.coinAddress) {
      // Navigate to home and let the coin modal open
      setLocation(`/`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'coin_created':
        return <CoinsIcon className="w-4 h-4" />;
      case 'trade':
      case 'buy':
        return <TrendingUp className="w-4 h-4" />;
      case 'sell':
        return <DollarSign className="w-4 h-4" />;
      case 'reward':
        return <Gift className="w-4 h-4" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4" />;
      case 'performance':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationAvatar = (type: string, title?: string) => {
    // Special styling for streak-related rewards
    const isStreak = title?.includes('Streak') || title?.includes('Login');

    const iconBg = type === 'coin_created' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                   type === 'trade' || type === 'buy' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                   type === 'sell' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                   type === 'reward' && isStreak ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                   type === 'reward' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                   type === 'trending' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                   type === 'performance' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                   'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';

    return (
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
        {getNotificationIcon(type)}
      </div>
    );
  };

  const groupNotificationsByTime = (notifications: Notification[]) => {
    const now = new Date();
    const groups: { [key: string]: Notification[] } = {
      'Now': [],
      'Today': [],
      'Yesterday': [],
      'Earlier': [],
    };

    notifications.forEach(notification => {
      if (!notification.createdAt) {
        groups['Earlier'].push(notification);
        return;
      }

      const notifDate = new Date(notification.createdAt);

      // Check if date is valid
      if (isNaN(notifDate.getTime())) {
        groups['Earlier'].push(notification);
        return;
      }

      const minutesAgo = differenceInMinutes(now, notifDate);

      if (minutesAgo < 5) {
        groups['Now'].push(notification);
      } else if (isToday(notifDate)) {
        groups['Today'].push(notification);
      } else if (isYesterday(notifDate)) {
        groups['Yesterday'].push(notification);
      } else {
        groups['Earlier'].push(notification);
      }
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  };

  const groupedNotifications = groupNotificationsByTime(notifications);

  if (!isConnected) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground">Please connect your wallet to view notifications</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Check if modal should be shown
  const showModal = loginStreakData?.needsCheckIn && !isLoadingLoginStreak;

  return (
    <Layout>
      {showModal && <DailyPointsModal onClaim={claimDailyPoints} />}
      <section className="p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Simple Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white dark:text-white" data-testid="text-notifications-title">Notifications</h1>
          </div>

          {/* Notifications List */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-white dark:text-white mb-2">No notifications yet</h3>
              <p className="text-sm text-muted-foreground">
                You'll see notifications here when there's activity on your coins
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-6">
                {groupedNotifications.map(([timeGroup, groupNotifications]) => (
                  <div key={timeGroup}>
                    {/* Time Group Header */}
                    <h2 className="text-sm font-semibold text-white dark:text-white mb-3" data-testid={`text-time-group-${timeGroup.toLowerCase()}`}>
                      {timeGroup}
                    </h2>

                    {/* Notifications in this time group */}
                    <div className="space-y-3">
                      {groupNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="flex items-start gap-3 cursor-pointer hover:bg-muted/5 dark:hover:bg-muted/5 p-2 rounded-lg transition-colors"
                          onClick={() => handleNotificationClick(notification)}
                          data-testid={`notification-item-${notification.id}`}
                        >
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            {getNotificationAvatar(notification.type, notification.title)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notification.read ? 'font-medium text-white dark:text-white' : 'text-muted-foreground'}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {notification.createdAt && new Date(notification.createdAt).getTime()
                                ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                                : 'Recently'}
                            </p>
                          </div>

                          {/* Unread indicator */}
                          {!notification.read && (
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 rounded-full bg-blue-500" data-testid="indicator-unread" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </section>
    </Layout>
  );
}