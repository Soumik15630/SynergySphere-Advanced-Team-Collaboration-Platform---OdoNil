import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Play, Pause, Square, Clock, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  description?: string;
  created_at: string;
  tasks?: {
    title: string;
    projects?: {
      name: string;
    };
  };
}

interface Task {
  id: string;
  title: string;
  project_id: string;
  projects?: {
    name: string;
  };
}

export const TimeTracker: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Manual entry form state
  const [manualEntry, setManualEntry] = useState({
    task_id: '',
    description: '',
    start_time: '',
    end_time: '',
    duration: ''
  });

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchTimeEntries();
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeEntry) {
      interval = setInterval(() => {
        const now = new Date();
        const start = new Date(activeEntry.start_time);
        const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeEntry]);

  const fetchTasks = async () => {
    try {
      const { data } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          project_id,
          projects:project_id (
            name
          )
        `)
        .order('title');

      setTasks((data as any) || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchTimeEntries = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('time_entries')
        .select(`
          *,
          tasks:task_id (
            title,
            projects:project_id (
              name
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      const entries = (data as any) || [];
      setTimeEntries(entries);
      
      // Check for active entry
      const active = entries.find((entry: TimeEntry) => !entry.end_time);
      setActiveEntry(active || null);
      
      if (active) {
        const now = new Date();
        const start = new Date(active.start_time);
        const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
        setElapsedTime(elapsed);
      }
    } catch (error) {
      console.error('Error fetching time entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = async () => {
    if (!selectedTask) {
      toast({
        title: "Error",
        description: "Please select a task first",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          task_id: selectedTask,
          user_id: user?.id,
          start_time: new Date().toISOString(),
          description: description || null
        })
        .select()
        .single();

      if (error) throw error;

      setActiveEntry(data);
      setElapsedTime(0);
      setDescription('');
      
      toast({
        title: "Timer started",
        description: "Time tracking has begun for this task",
      });
    } catch (error) {
      console.error('Error starting timer:', error);
      toast({
        title: "Error",
        description: "Failed to start timer",
        variant: "destructive",
      });
    }
  };

  const stopTimer = async () => {
    if (!activeEntry) return;

    try {
      const now = new Date();
      const start = new Date(activeEntry.start_time);
      const duration = Math.floor((now.getTime() - start.getTime()) / 1000);

      const { error } = await supabase
        .from('time_entries')
        .update({
          end_time: now.toISOString(),
          duration
        })
        .eq('id', activeEntry.id);

      if (error) throw error;

      setActiveEntry(null);
      setElapsedTime(0);
      fetchTimeEntries();

      toast({
        title: "Timer stopped",
        description: `Tracked ${formatDuration(duration)}`,
      });
    } catch (error) {
      console.error('Error stopping timer:', error);
      toast({
        title: "Error",
        description: "Failed to stop timer",
        variant: "destructive",
      });
    }
  };

  const addManualEntry = async () => {
    try {
      let duration = 0;
      
      if (manualEntry.start_time && manualEntry.end_time) {
        const start = new Date(manualEntry.start_time);
        const end = new Date(manualEntry.end_time);
        duration = Math.floor((end.getTime() - start.getTime()) / 1000);
      } else if (manualEntry.duration) {
        duration = parseInt(manualEntry.duration) * 60; // Convert minutes to seconds
      }

      const { error } = await supabase
        .from('time_entries')
        .insert({
          task_id: manualEntry.task_id,
          user_id: user?.id,
          start_time: manualEntry.start_time || new Date().toISOString(),
          end_time: manualEntry.end_time || new Date().toISOString(),
          duration,
          description: manualEntry.description || null
        });

      if (error) throw error;

      setIsManualEntryOpen(false);
      setManualEntry({
        task_id: '',
        description: '',
        start_time: '',
        end_time: '',
        duration: ''
      });
      fetchTimeEntries();

      toast({
        title: "Success",
        description: "Time entry added successfully",
      });
    } catch (error) {
      console.error('Error adding manual entry:', error);
      toast({
        title: "Error",
        description: "Failed to add time entry",
        variant: "destructive",
      });
    }
  };

  const deleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      fetchTimeEntries();
      toast({
        title: "Success",
        description: "Time entry deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete time entry",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalTime = () => {
    return timeEntries.reduce((total, entry) => {
      return total + (entry.duration || 0);
    }, 0);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Time Tracking</h1>
          <p className="text-muted-foreground mt-2">
            Track your time spent on tasks and projects
          </p>
        </div>
        <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Manual Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Manual Time Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="manual-task">Task</Label>
                <Select 
                  value={manualEntry.task_id} 
                  onValueChange={(value) => setManualEntry(prev => ({ ...prev, task_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a task" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title} - {task.projects?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="manual-description">Description</Label>
                <Textarea
                  id="manual-description"
                  value={manualEntry.description}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What did you work on?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="manual-start">Start Time</Label>
                  <Input
                    id="manual-start"
                    type="datetime-local"
                    value={manualEntry.start_time}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="manual-end">End Time</Label>
                  <Input
                    id="manual-end"
                    type="datetime-local"
                    value={manualEntry.end_time}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="manual-duration">Or Duration (minutes)</Label>
                <Input
                  id="manual-duration"
                  type="number"
                  value={manualEntry.duration}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="120"
                />
              </div>

              <Button onClick={addManualEntry} className="w-full">
                Add Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Timer Card */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Current Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeEntry ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="text-4xl font-mono font-bold text-primary mb-2">
                  {formatTime(elapsedTime)}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Running since {format(new Date(activeEntry.start_time), 'HH:mm')}
                </p>
                <Button 
                  onClick={stopTimer}
                  variant="destructive"
                  className="gap-2"
                >
                  <Square className="w-4 h-4" />
                  Stop Timer
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <Select value={selectedTask} onValueChange={setSelectedTask}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a task to track" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title} - {task.projects?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you working on? (optional)"
                  rows={3}
                />

                <Button 
                  onClick={startTimer}
                  className="w-full gap-2"
                  disabled={!selectedTask}
                >
                  <Play className="w-4 h-4" />
                  Start Timer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Today's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatDuration(getTotalTime())}
                </div>
                <p className="text-sm text-muted-foreground">Total time tracked</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold">{timeEntries.length}</div>
                  <div className="text-muted-foreground">Entries</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">
                    {new Set(timeEntries.map(e => e.task_id)).size}
                  </div>
                  <div className="text-muted-foreground">Tasks</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries List */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : timeEntries.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No time entries yet</p>
              <p className="text-sm text-muted-foreground">Start tracking your time to see entries here</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {timeEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{entry.tasks?.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {entry.tasks?.projects?.name}
                        </Badge>
                        {!entry.end_time && (
                          <Badge variant="default" className="text-xs animate-pulse">
                            Running
                          </Badge>
                        )}
                      </div>
                      {entry.description && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {entry.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(entry.start_time), 'MMM dd, HH:mm')}
                        </span>
                        {entry.end_time && (
                          <span>
                            to {format(new Date(entry.end_time), 'HH:mm')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-mono font-semibold">
                          {entry.duration ? formatDuration(entry.duration) : formatTime(elapsedTime)}
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEntry(entry.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};