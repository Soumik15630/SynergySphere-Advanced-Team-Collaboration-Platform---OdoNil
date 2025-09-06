import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: string;
  priority: string;
  projects?: {
    name: string;
  };
}

export const CalendarView: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, currentDate]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects:project_id (
            name
          )
        `)
        .not('due_date', 'is', null)
        .gte('due_date', startOfMonth.toISOString())
        .lte('due_date', endOfMonth.toISOString())
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks((data as any) || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch calendar tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getTasksForDate = (date: Date | null) => {
    if (!date) return [];
    
    const dateString = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date).toISOString().split('T')[0];
      return taskDate === dateString;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground mt-2">
            View your tasks and deadlines in calendar format
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-medium text-lg min-w-[200px] text-center">
            {monthYear}
          </span>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Task Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center font-medium text-sm text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const dayTasks = getTasksForDate(day);
                  const isToday = day && day.toDateString() === new Date().toDateString();
                  
                  return (
                    <motion.div
                      key={index}
                      className={`min-h-[120px] p-2 border rounded-lg ${
                        day ? 'bg-background' : 'bg-muted/30'
                      } ${isToday ? 'border-primary bg-primary/5' : 'border-border'}`}
                      whileHover={day ? { scale: 1.02 } : {}}
                      transition={{ duration: 0.2 }}
                    >
                      {day && (
                        <>
                          <div className={`text-sm font-medium mb-2 ${
                            isToday ? 'text-primary' : 'text-foreground'
                          }`}>
                            {day.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayTasks.slice(0, 3).map((task) => (
                              <div
                                key={task.id}
                                className="text-xs p-1 rounded bg-secondary/50 border truncate"
                                title={task.title}
                              >
                                <div className="flex items-center gap-1">
                                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                                  <span className="truncate">{task.title}</span>
                                </div>
                              </div>
                            ))}
                            {dayTasks.length > 3 && (
                              <div className="text-xs text-muted-foreground text-center">
                                +{dayTasks.length - 3} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No upcoming deadlines this month
            </p>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 10).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {task.projects?.name} • Due: {new Date(task.due_date!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};