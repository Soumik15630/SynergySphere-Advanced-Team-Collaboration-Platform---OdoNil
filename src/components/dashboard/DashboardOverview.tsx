import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Users, CheckCircle, Clock, TrendingUp, Calendar, MessageCircle, FileText, GitBranch, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardStats {
  projects: number;
  tasks: number;
  completedTasks: number;
  teamMembers: number;
}

interface RecentProject {
  id: string;
  name: string;
  progress: number;
  teamSize: number;
  deadline: string;
  status: string;
}

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    projects: 0,
    tasks: 0,
    completedTasks: 0,
    teamMembers: 0,
  });
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch projects count
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name')
        .eq('owner_id', user?.id);

      // Fetch tasks data
      const projectIds = projectsData?.map(p => p.id) || [];
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('status, project_id')
        .in('project_id', projectIds);

      // Fetch team members count
      const { data: membersData } = await supabase
        .from('project_members')
        .select('id')
        .in('project_id', projectIds);

      // Fetch recent projects with task progress
      const recentProjectsWithProgress = await Promise.all(
        (projectsData?.slice(0, 4) || []).map(async (project) => {
          const { data: projectTasks } = await supabase
            .from('tasks')
            .select('status')
            .eq('project_id', project.id);

          const totalTasks = projectTasks?.length || 0;
          const completedTasks = projectTasks?.filter(t => t.status === 'done').length || 0;
          const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

          const { data: projectMembers } = await supabase
            .from('project_members')
            .select('id')
            .eq('project_id', project.id);

          return {
            id: project.id,
            name: project.name,
            progress: Math.round(progress),
            teamSize: (projectMembers?.length || 0) + 1, // +1 for owner
            deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Random future date
            status: progress === 100 ? 'completed' : progress > 70 ? 'on-track' : 'at-risk'
          };
        })
      );

      const totalTasks = tasksData?.length || 0;
      const completedTasks = tasksData?.filter(t => t.status === 'done').length || 0;

      setStats({
        projects: projectsData?.length || 0,
        tasks: totalTasks,
        completedTasks,
        teamMembers: (membersData?.length || 0) + (projectsData?.length || 0), // Members + owners
      });

      setRecentProjects(recentProjectsWithProgress);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      label: 'Active Projects',
      value: stats.projects.toString(),
      icon: FolderOpen,
      change: '+2.5%'
    },
    {
      label: 'Team Members',
      value: stats.teamMembers.toString(),
      icon: Users,
      change: '+12%'
    },
    {
      label: 'Completed Tasks',
      value: stats.completedTasks.toString(),
      icon: CheckCircle,
      change: '+8.2%'
    },
    {
      label: 'Total Tasks',
      value: stats.tasks.toString(),
      icon: Clock,
      change: stats.tasks > 0 ? '+5.1%' : '0%'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your projects.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-feature"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                <p className="text-xs text-success">{stat.change}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Recent Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No projects yet</p>
                ) : (
                  recentProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-success"></div>
                            <span className="font-medium">{project.name}</span>
                          </div>
                        </div>
                        <Badge variant={project.status === 'completed' ? 'default' : project.status === 'on-track' ? 'secondary' : 'destructive'}>
                          {project.status}
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground mt-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {project.teamSize} members
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(project.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    action: 'created a new project',
                    target: 'Website Redesign',
                    time: '2 hours ago',
                    icon: FolderOpen,
                    user: user?.email || 'You'
                  },
                  { 
                    action: 'completed task',
                    target: 'Setup Database',
                    time: '4 hours ago',
                    icon: CheckCircle,
                    user: user?.email || 'You'
                  },
                  { 
                    action: 'joined team',
                    target: 'Mobile App Project',
                    time: '1 day ago',
                    icon: Users,
                    user: 'Team member'
                  },
                  { 
                    action: 'updated task',
                    target: 'API Integration',
                    time: '2 days ago',
                    icon: GitBranch,
                    user: user?.email || 'You'
                  }
                ].map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span>
                          {' '}{activity.action}{' '}
                          <span className="font-medium">{activity.target}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};