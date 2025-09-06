import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, User, FolderOpen, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface ActivityItem {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  created_at: string;
  user_id: string;
  profiles?: {
    name?: string;
    email?: string;
    avatar_url?: string;
  };
}

export const ActivityFeed: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActivities();
      subscribeToActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          profiles:user_id (
            name,
            email,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities((data as any) || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch activity feed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToActivities = () => {
    const channel = supabase
      .channel('activities-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities'
        },
        (payload) => {
          const newActivity = payload.new as ActivityItem;
          setActivities(prev => [newActivity, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getActivityIcon = (entityType: string, action: string) => {
    switch (entityType) {
      case 'project':
        return <FolderOpen className="w-4 h-4" />;
      case 'task':
        return <CheckSquare className="w-4 h-4" />;
      case 'user':
        return <User className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'updated':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'deleted':
        return 'text-red-600 bg-red-100 dark:bg-red-900';
      case 'completed':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  const formatActivityMessage = (activity: ActivityItem) => {
    const userName = activity.profiles?.name || activity.profiles?.email || 'Someone';
    const entityName = activity.details?.name || activity.details?.title || `${activity.entity_type} ${activity.entity_id.slice(0, 8)}`;
    
    switch (activity.action) {
      case 'created':
        return `${userName} created ${activity.entity_type} "${entityName}"`;
      case 'updated':
        return `${userName} updated ${activity.entity_type} "${entityName}"`;
      case 'deleted':
        return `${userName} deleted ${activity.entity_type} "${entityName}"`;
      case 'completed':
        return `${userName} completed ${activity.entity_type} "${entityName}"`;
      case 'assigned':
        return `${userName} was assigned to ${activity.entity_type} "${entityName}"`;
      case 'joined':
        return `${userName} joined the project`;
      default:
        return `${userName} performed ${activity.action} on ${activity.entity_type} "${entityName}"`;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activity Feed</h1>
        <p className="text-muted-foreground mt-2">
          Stay updated with recent activities across your projects
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No recent activity</p>
              <p className="text-sm text-muted-foreground">
                Activity will appear here as you and your team work on projects
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={activity.profiles?.avatar_url} />
                    <AvatarFallback>
                      {activity.profiles?.name?.slice(0, 2).toUpperCase() || 
                       activity.profiles?.email?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`p-1 rounded-full ${getActivityColor(activity.action)}`}>
                        {getActivityIcon(activity.entity_type, activity.action)}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.action}
                      </Badge>
                    </div>
                    
                    <p className="text-sm font-medium">
                      {formatActivityMessage(activity)}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {getTimeAgo(activity.created_at)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};