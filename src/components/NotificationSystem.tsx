import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  BellRing,
  CheckCircle,
  AlertCircle,
  Info,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  Volume2,
  VolumeX,
  Clock,
  User,
  FileText,
  Coins,
  Shield,
  Activity,
  TrendingUp,
  Calendar,
  MessageSquare,
  X,
  MarkAll as MarkAllRead
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export type NotificationType = 
  | 'project_status_change' 
  | 'verification_complete' 
  | 'payment_received' 
  | 'new_message' 
  | 'system_update'
  | 'carbon_credits_issued'
  | 'project_approved'
  | 'project_rejected'
  | 'audit_scheduled'
  | 'marketplace_activity';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
  emailNotifications: boolean;
  types: Record<NotificationType, boolean>;
}

export function NotificationSystem() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    soundEnabled: true,
    desktopNotifications: true,
    emailNotifications: false,
    types: {
      project_status_change: true,
      verification_complete: true,
      payment_received: true,
      new_message: true,
      system_update: false,
      carbon_credits_issued: true,
      project_approved: true,
      project_rejected: true,
      audit_scheduled: true,
      marketplace_activity: false,
    }
  });
  const [activeTab, setActiveTab] = useState('all');

  // Mock notification data
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'project_approved',
        title: 'Project Approved!',
        message: 'Your mangrove restoration project "Sundarbans Conservation" has been approved by the verification team.',
        priority: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        actionUrl: '/projects/sundarbans-conservation',
        actionLabel: 'View Project',
        metadata: { projectId: 'proj-123' }
      },
      {
        id: '2',
        type: 'carbon_credits_issued',
        title: 'Carbon Credits Issued',
        message: '150.5 tCO₂ carbon credits have been issued to your wallet for the seagrass restoration project.',
        priority: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        actionUrl: '/profile?tab=wallet',
        actionLabel: 'View Wallet',
        metadata: { credits: 150.5 }
      },
      {
        id: '3',
        type: 'verification_complete',
        title: 'Verification Complete',
        message: 'The field verification for "Coastal Mangrove Restoration" has been completed. Awaiting final approval.',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        read: true,
        actionUrl: '/verification',
        actionLabel: 'View Details',
      },
      {
        id: '4',
        type: 'payment_received',
        title: 'Payment Received',
        message: 'Payment of 2.5 ETH received from carbon credit sale.',
        priority: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
        actionUrl: '/marketplace',
        actionLabel: 'View Transaction',
        metadata: { amount: 2.5, currency: 'ETH' }
      },
      {
        id: '5',
        type: 'audit_scheduled',
        title: 'Audit Scheduled',
        message: 'Field audit scheduled for October 15, 2024 at 10:00 AM for project "Seagrass Restoration Phase 2".',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        read: true,
        actionUrl: '/projects',
        actionLabel: 'View Calendar',
      },
      {
        id: '6',
        type: 'new_message',
        title: 'New Message from Auditor',
        message: 'Dr. Sarah Johnson has sent you a message regarding the verification process.',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
        read: true,
        actionUrl: '/messages',
        actionLabel: 'Read Message',
      }
    ];

    setNotifications(mockNotifications);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'project_approved':
      case 'verification_complete':
        return CheckCircle;
      case 'project_rejected':
        return AlertCircle;
      case 'carbon_credits_issued':
      case 'payment_received':
        return Coins;
      case 'new_message':
        return MessageSquare;
      case 'audit_scheduled':
        return Calendar;
      case 'marketplace_activity':
        return Activity;
      case 'system_update':
        return Settings;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (priority: NotificationPriority, type: NotificationType) => {
    if (priority === 'urgent') return 'text-red-600';
    if (priority === 'high') {
      if (type === 'project_approved' || type === 'carbon_credits_issued') return 'text-green-600';
      if (type === 'payment_received') return 'text-blue-600';
      return 'text-orange-600';
    }
    return 'text-gray-600';
  };

  const getBadgeVariant = (priority: NotificationPriority): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast.success('Notification deleted');
  };

  const showDesktopNotification = (notification: Notification) => {
    if (!settings.desktopNotifications || !('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
      });
    }
  };

  const playNotificationSound = () => {
    if (!settings.soundEnabled) return;
    
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const updateSettings = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateTypeSettings = (type: NotificationType, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      types: { ...prev.types, [type]: enabled }
    }));
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') return !notification.read;
    if (activeTab === 'high') return notification.priority === 'high' || notification.priority === 'urgent';
    return true;
  });

  const handleNotificationAction = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      // In a real app, this would use React Router
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    variant="destructive"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </div>
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <MarkAllRead className="h-4 w-4 mr-2" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="high">High Priority</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          <NotificationList 
            notifications={filteredNotifications}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
            onAction={handleNotificationAction}
          />
        </TabsContent>

        <TabsContent value="unread" className="space-y-3">
          <NotificationList 
            notifications={filteredNotifications}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
            onAction={handleNotificationAction}
          />
        </TabsContent>

        <TabsContent value="high" className="space-y-3">
          <NotificationList 
            notifications={filteredNotifications}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
            onAction={handleNotificationAction}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Notifications</Label>
                    <p className="text-sm text-gray-600">Turn all notifications on or off</p>
                  </div>
                  <Switch
                    checked={settings.enabled}
                    onCheckedChange={(checked) => updateSettings('enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sound Notifications</Label>
                    <p className="text-sm text-gray-600">Play sound when notifications arrive</p>
                  </div>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => updateSettings('soundEnabled', checked)}
                    disabled={!settings.enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Desktop Notifications</Label>
                    <p className="text-sm text-gray-600">Show browser notifications</p>
                  </div>
                  <Switch
                    checked={settings.desktopNotifications}
                    onCheckedChange={(checked) => updateSettings('desktopNotifications', checked)}
                    disabled={!settings.enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">Send important notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSettings('emailNotifications', checked)}
                    disabled={!settings.enabled}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Notification Types</h4>
                <div className="space-y-3">
                  {Object.entries(settings.types).map(([type, enabled]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div>
                        <Label className="capitalize">
                          {type.replace(/_/g, ' ')}
                        </Label>
                        <p className="text-sm text-gray-600">
                          {getTypeDescription(type as NotificationType)}
                        </p>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => updateTypeSettings(type as NotificationType, checked)}
                        disabled={!settings.enabled}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => toast.success('Settings saved')}>
                  Save Settings
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    playNotificationSound();
                    toast.info('Test notification sound played');
                  }}
                >
                  Test Sound
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAction: (notification: Notification) => void;
}

function NotificationList({ notifications, onMarkAsRead, onDelete, onAction }: NotificationListProps) {
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'project_approved':
      case 'verification_complete':
        return CheckCircle;
      case 'project_rejected':
        return AlertCircle;
      case 'carbon_credits_issued':
      case 'payment_received':
        return Coins;
      case 'new_message':
        return MessageSquare;
      case 'audit_scheduled':
        return Calendar;
      case 'marketplace_activity':
        return Activity;
      case 'system_update':
        return Settings;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (priority: NotificationPriority, type: NotificationType) => {
    if (priority === 'urgent') return 'text-red-600';
    if (priority === 'high') {
      if (type === 'project_approved' || type === 'carbon_credits_issued') return 'text-green-600';
      if (type === 'payment_received') return 'text-blue-600';
      return 'text-orange-600';
    }
    return 'text-gray-600';
  };

  const getBadgeVariant = (priority: NotificationPriority): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No notifications</h3>
          <p className="text-gray-600">
            You're all caught up! New notifications will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const Icon = getNotificationIcon(notification.type);
        const iconColor = getNotificationColor(notification.priority, notification.type);
        
        return (
          <Card key={notification.id} className={cn(
            'transition-all hover:shadow-md',
            !notification.read && 'bg-blue-50 border-blue-200'
          )}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', iconColor)} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{notification.title}</h4>
                    <Badge variant={getBadgeVariant(notification.priority)}>
                      {notification.priority}
                    </Badge>
                    {!notification.read && (
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        New
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2 leading-relaxed">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatDistanceToNow(notification.timestamp, { addSuffix: true })}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {notification.actionUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAction(notification)}
                        >
                          {notification.actionLabel || 'View'}
                        </Button>
                      )}
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onMarkAsRead(notification.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(notification.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function getTypeDescription(type: NotificationType): string {
  switch (type) {
    case 'project_status_change':
      return 'Updates about your project status changes';
    case 'verification_complete':
      return 'Notifications when verification is completed';
    case 'payment_received':
      return 'Alerts when payments are received';
    case 'new_message':
      return 'New messages from auditors or admin';
    case 'system_update':
      return 'System maintenance and updates';
    case 'carbon_credits_issued':
      return 'When carbon credits are issued to your wallet';
    case 'project_approved':
      return 'Project approval notifications';
    case 'project_rejected':
      return 'Project rejection notifications';
    case 'audit_scheduled':
      return 'Audit and inspection scheduling updates';
    case 'marketplace_activity':
      return 'Carbon credit marketplace activities';
    default:
      return 'General notifications';
  }
}