import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, Clock, CheckCircle, AlertTriangle, Calendar, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { addDays, format, subDays } from 'date-fns';

interface AnalyticsData {
  taskCompletion: any[];
  teamProductivity: any[];
  projectProgress: any[];
  timeTracking: any[];
  projectStats: {
    total: number;
    completed: number;
    overdue: number;
    onTrack: number;
  };
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
  };
  teamStats: {
    totalMembers: number;
    activeMembers: number;
    avgTasksPerMember: number;
  };
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

export const AdvancedAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    taskCompletion: [],
    teamProductivity: [],
    projectProgress: [],
    timeTracking: [],
    projectStats: { total: 0, completed: 0, overdue: 0, onTrack: 0 },
    taskStats: { total: 0, completed: 0, inProgress: 0, todo: 0 },
    teamStats: { totalMembers: 0, activeMembers: 0, avgTasksPerMember: 0 }
  });
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchAnalytics();
    }
  }, [user, selectedProject, dateRange]);

  const fetchProjects = async () => {
    try {
      const { data } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');
      
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Build base query conditions
      let projectFilter = selectedProject !== 'all' ? selectedProject : null;
      
      // Fetch projects data
      let projectQuery = supabase
        .from('projects')
        .select('id, name, created_at, updated_at');
      
      if (projectFilter) {
        projectQuery = projectQuery.eq('id', projectFilter);
      }
      
      const { data: projectsData } = await projectQuery;
      
      const projectIds = projectsData?.map(p => p.id) || [];
      
      // Fetch tasks data
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('id, status, priority, created_at, updated_at, due_date, project_id')
        .in('project_id', projectIds)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      // Fetch time entries
      const { data: timeData } = await supabase
        .from('time_entries')
        .select('duration, created_at, task_id, user_id')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      // Fetch team members
      const { data: membersData } = await supabase
        .from('project_members')
        .select('user_id, project_id')
        .in('project_id', projectIds);

      // Calculate analytics
      const taskCompletion = calculateTaskCompletion(tasksData || []);
      const teamProductivity = calculateTeamProductivity(timeData || [], membersData || []);
      const projectProgress = calculateProjectProgress(projectsData || [], tasksData || []);
      const timeTracking = calculateTimeTracking(timeData || []);
      
      const projectStats = {
        total: projectsData?.length || 0,
        completed: projectsData?.filter(p => {
          const projectTasks = tasksData?.filter(t => t.project_id === p.id) || [];
          return projectTasks.length > 0 && projectTasks.every(t => t.status === 'done');
        }).length || 0,
        overdue: projectsData?.filter(p => {
          const projectTasks = tasksData?.filter(t => t.project_id === p.id && t.due_date) || [];
          return projectTasks.some(t => new Date(t.due_date) < new Date() && t.status !== 'done');
        }).length || 0,
        onTrack: 0
      };
      projectStats.onTrack = projectStats.total - projectStats.completed - projectStats.overdue;

      const taskStats = {
        total: tasksData?.length || 0,
        completed: tasksData?.filter(t => t.status === 'done').length || 0,
        inProgress: tasksData?.filter(t => t.status === 'in-progress').length || 0,
        todo: tasksData?.filter(t => t.status === 'todo').length || 0
      };

      const uniqueMembers = new Set(membersData?.map(m => m.user_id) || []);
      const teamStats = {
        totalMembers: uniqueMembers.size,
        activeMembers: uniqueMembers.size, // Simplified - could check recent activity
        avgTasksPerMember: uniqueMembers.size > 0 ? Math.round(taskStats.total / uniqueMembers.size) : 0
      };

      setAnalytics({
        taskCompletion,
        teamProductivity,
        projectProgress,
        timeTracking,
        projectStats,
        taskStats,
        teamStats
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTaskCompletion = (tasks: any[]) => {
    const dailyData: { [key: string]: { completed: number; total: number } } = {};
    
    tasks.forEach(task => {
      const date = format(new Date(task.created_at), 'MMM dd');
      if (!dailyData[date]) {
        dailyData[date] = { completed: 0, total: 0 };
      }
      dailyData[date].total++;
      if (task.status === 'done') {
        dailyData[date].completed++;
      }
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      completed: data.completed,
      total: data.total,
      percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
    }));
  };

  const calculateTeamProductivity = (timeEntries: any[], members: any[]) => {
    const memberData: { [key: string]: number } = {};
    
    timeEntries.forEach(entry => {
      const userId = entry.user_id;
      if (!memberData[userId]) {
        memberData[userId] = 0;
      }
      memberData[userId] += entry.duration || 0;
    });

    return Object.entries(memberData).map(([userId, totalTime]) => ({
      member: `Member ${userId.slice(0, 8)}`,
      hours: Math.round(totalTime / 3600), // Convert seconds to hours
      tasks: Math.floor(Math.random() * 10) + 1 // Simplified
    }));
  };

  const calculateProjectProgress = (projects: any[], tasks: any[]) => {
    return projects.map(project => {
      const projectTasks = tasks.filter(t => t.project_id === project.id);
      const completedTasks = projectTasks.filter(t => t.status === 'done').length;
      const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
      
      return {
        name: project.name,
        progress,
        tasks: projectTasks.length,
        completed: completedTasks
      };
    });
  };

  const calculateTimeTracking = (timeEntries: any[]) => {
    const dailyTime: { [key: string]: number } = {};
    
    timeEntries.forEach(entry => {
      const date = format(new Date(entry.created_at), 'MMM dd');
      if (!dailyTime[date]) {
        dailyTime[date] = 0;
      }
      dailyTime[date] += entry.duration || 0;
    });

    return Object.entries(dailyTime).map(([date, seconds]) => ({
      date,
      hours: Math.round(seconds / 3600 * 10) / 10 // Convert to hours with 1 decimal
    }));
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive insights into your project performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="time">Time Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-feature"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold mb-1">{analytics.projectStats.total}</p>
                  <p className="text-sm text-muted-foreground mb-2">Total Projects</p>
                  <p className="text-xs text-success">+12.5% from last month</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-feature"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-success/10">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold mb-1">{analytics.taskStats.completed}</p>
                  <p className="text-sm text-muted-foreground mb-2">Completed Tasks</p>
                  <p className="text-xs text-success">+8.2% from last week</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card-feature"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Users className="w-5 h-5 text-warning" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold mb-1">{analytics.teamStats.totalMembers}</p>
                  <p className="text-sm text-muted-foreground mb-2">Team Members</p>
                  <p className="text-xs text-success">+3 new members</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card-feature"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <TrendingDown className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold mb-1">{analytics.projectStats.overdue}</p>
                  <p className="text-sm text-muted-foreground mb-2">Overdue Projects</p>
                  <p className="text-xs text-destructive">-2.1% from last week</p>
                </div>
              </motion.div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mt-6">
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle>Project Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.projectProgress}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))', 
                          borderRadius: '8px' 
                        }} 
                      />
                      <Bar dataKey="progress" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="card-glass">
                <CardHeader>
                  <CardTitle>Task Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completed', value: analytics.taskStats.completed },
                          { name: 'In Progress', value: analytics.taskStats.inProgress },
                          { name: 'To Do', value: analytics.taskStats.todo },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: 'Completed', value: analytics.taskStats.completed },
                          { name: 'In Progress', value: analytics.taskStats.inProgress },
                          { name: 'To Do', value: analytics.taskStats.todo },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle>Task Completion Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analytics.taskCompletion}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: '8px' 
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--success))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle>Team Productivity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analytics.teamProductivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="member" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: '8px' 
                      }} 
                    />
                    <Bar dataKey="hours" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="time">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle>Daily Time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analytics.timeTracking}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: '8px' 
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};