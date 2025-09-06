import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { FolderPlus, Calendar, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  description?: string;
  visibility: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  task_count?: number;
  completed_tasks?: number;
  member_count?: number;
}

export const ProjectManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'private'
  });

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Fetch projects where user is owner or member
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .or(`owner_id.eq.${user?.id},id.in.(${await getUserProjectIds()})`);

      if (projectsError) throw projectsError;

      // Fetch task counts for each project
      const projectsWithStats = await Promise.all(
        (projectsData || []).map(async (project) => {
          const [taskData, memberData] = await Promise.all([
            supabase
              .from('tasks')
              .select('status')
              .eq('project_id', project.id),
            supabase
              .from('project_members')
              .select('id')
              .eq('project_id', project.id)
          ]);

          const tasks = taskData.data || [];
          const members = memberData.data || [];
          
          return {
            ...project,
            task_count: tasks.length,
            completed_tasks: tasks.filter(t => t.status === 'done').length,
            member_count: members.length + 1, // +1 for owner
          };
        })
      );

      setProjects(projectsWithStats);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserProjectIds = async () => {
    const { data } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', user?.id);
    
    return data?.map(m => m.project_id).join(',') || '';
  };

  const createProject = async () => {
    if (!formData.name.trim()) return;

    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          visibility: formData.visibility,
          owner_id: user?.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project created successfully",
      });

      setFormData({ name: '', description: '', visibility: 'private' });
      setIsCreateOpen(false);
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (project: Project) => {
    const progress = project.task_count ? 
      (project.completed_tasks || 0) / project.task_count * 100 : 0;
    
    if (progress === 100) return <CheckCircle className="w-4 h-4 text-success" />;
    if (progress > 0) return <Clock className="w-4 h-4 text-warning" />;
    return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-success';
    if (progress > 50) return 'bg-warning';
    return 'bg-primary';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-2">
            Manage your projects and track progress
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <FolderPlus className="w-4 h-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="Enter project name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="visibility">Visibility</Label>
                <Select 
                  value={formData.visibility} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createProject} className="w-full">
                Create Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FolderPlus className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first project to get started with team collaboration
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <FolderPlus className="w-4 h-4" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => {
            const progress = project.task_count ? 
              (project.completed_tasks || 0) / project.task_count * 100 : 0;
            
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="card-glass hover:scale-[1.02] transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        {getStatusIcon(project)}
                        <CardTitle className="text-lg truncate">
                          {project.name}
                        </CardTitle>
                      </div>
                      <Badge variant={project.visibility === 'public' ? 'default' : 'secondary'}>
                        {project.visibility}
                      </Badge>
                    </div>
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-muted-foreground" />
                        <span>{project.completed_tasks || 0}/{project.task_count || 0} tasks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{project.member_count || 1} members</span>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};