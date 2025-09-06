import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Eye, MessageCircle, Activity, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnlineUser {
  user_id: string;
  project_id: string;
  last_seen: string;
  status: 'active' | 'idle' | 'away';
  profile?: {
    name?: string;
    email?: string;
    avatar_url?: string;
  };
}

interface RealtimeActivity {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  created_at: string;
  profile?: {
    name?: string;
    email?: string;
  };
}

interface RealtimeCollaborationProps {
  projectId?: string;
}

export const RealtimeCollaboration: React.FC<RealtimeCollaborationProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [recentActivity, setRecentActivity] = useState<RealtimeActivity[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!user || !projectId) return;

    // Subscribe to presence updates
    const presenceChannel = supabase.channel(`project:${projectId}:presence`)
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users = Object.values(state).flat().filter(item => 
          item && typeof item === 'object' && 'user_id' in item
        ) as unknown as OnlineUser[];
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track current user presence
          await presenceChannel.track({
            user_id: user.id,
            project_id: projectId,
            last_seen: new Date().toISOString(),
            status: 'active'
          });
        }
      });

    // Subscribe to real-time activities
    const activityChannel = supabase
      .channel(`project:${projectId}:activities`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
          filter: `project_id=eq.${projectId}`
        },
        async (payload) => {
          // Fetch user profile for the activity
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', payload.new.user_id)
            .single();

          const newActivity = {
            ...payload.new,
            profile
          } as RealtimeActivity;

          setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
        }
      )
      .subscribe();

    // Fetch initial activities
    fetchRecentActivities();

    // Update presence status periodically
    const presenceInterval = setInterval(async () => {
      if (document.visibilityState === 'visible') {
        await presenceChannel.track({
          user_id: user.id,
          project_id: projectId,
          last_seen: new Date().toISOString(),
          status: 'active'
        });
      }
    }, 30000); // Update every 30 seconds

    // Handle visibility change
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
      if (document.visibilityState === 'hidden') {
        presenceChannel.track({
          user_id: user.id,
          project_id: projectId,
          last_seen: new Date().toISOString(),
          status: 'away'
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(presenceInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(activityChannel);
    };
  }, [user, projectId]);

  const fetchRecentActivities = async () => {
    if (!projectId) return;

    try {
      const { data } = await supabase
        .from('activities')
        .select(`
          *,
          profiles:user_id (
            name,
            email
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentActivity((data as any) || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Activity className="w-3 h-3 text-success" />;
      case 'updated':
        return <MessageCircle className="w-3 h-3 text-primary" />;
      case 'completed':
        return <Activity className="w-3 h-3 text-success" />;
      case 'deleted':
        return <Activity className="w-3 h-3 text-destructive" />;
      default:
        return <Activity className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success';
      case 'idle':
        return 'bg-warning';
      case 'away':
        return 'bg-muted-foreground';
      default:
        return 'bg-muted-foreground';
    }
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffMs = now.getTime() - activityDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (!projectId) {
    return (
      <Card className="card-glass">
        <CardContent className="p-6 text-center">
          <Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Select a project to see collaboration</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Online Users */}
      <Card className="card-glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4" />
            Online Now ({onlineUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {onlineUsers.map((user) => (
                <motion.div
                  key={user.user_id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-accent/50"
                >
                  <div className="relative">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={user.profile?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {user.profile?.name?.slice(0, 2).toUpperCase() || 
                         user.profile?.email?.slice(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div 
                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background ${getStatusColor(user.status)}`} 
                    />
                  </div>
                  <span className="text-xs font-medium">
                    {user.profile?.name || user.profile?.email?.split('@')[0] || 'User'}
                  </span>
                  <Badge variant="outline" className="text-xs px-1">
                    {user.status}
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {onlineUsers.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              No one else is online
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="card-glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              <AnimatePresence>
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="p-1 rounded-full bg-accent">
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs">
                        <span className="font-medium">
                          {activity.profile?.name || activity.profile?.email?.split('@')[0] || 'Someone'}
                        </span>
                        {' '}{activity.action} {activity.entity_type}
                        {activity.details?.title && (
                          <span className="font-medium"> "{activity.details.title}"</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(activity.created_at)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {recentActivity.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                No recent activity
              </p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};