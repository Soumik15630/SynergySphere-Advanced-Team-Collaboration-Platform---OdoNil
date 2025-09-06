import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Users,
  Calendar,
  TrendingUp,
  Star,
  Folder
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const mockProjects = [
  {
    id: 1,
    name: 'Mobile App Redesign',
    description: 'Complete overhaul of the mobile application UI/UX',
    progress: 75,
    members: 8,
    deadline: '2024-01-15',
    status: 'active',
    priority: 'high',
    tasks: { total: 24, completed: 18 },
    starred: true
  },
  {
    id: 2,
    name: 'API Integration',
    description: 'Integrate third-party APIs for enhanced functionality',
    progress: 45,
    members: 5,
    deadline: '2024-01-20',
    status: 'active',
    priority: 'medium',
    tasks: { total: 16, completed: 7 },
    starred: false
  },
  {
    id: 3,
    name: 'Marketing Campaign',
    description: 'Q1 2024 marketing campaign planning and execution',
    progress: 90,
    members: 12,
    deadline: '2024-01-10',
    status: 'active',
    priority: 'high',
    tasks: { total: 30, completed: 27 },
    starred: true
  },
  {
    id: 4,
    name: 'Database Migration',
    description: 'Migrate legacy database to new infrastructure',
    progress: 30,
    members: 4,
    deadline: '2024-02-01',
    status: 'planning',
    priority: 'low',
    tasks: { total: 12, completed: 4 },
    starred: false
  },
];

export const ProjectGrid: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredProjects = mockProjects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive border-destructive/30 bg-destructive/10';
      case 'medium': return 'text-warning border-warning/30 bg-warning/10';
      case 'low': return 'text-success border-success/30 bg-success/10';
      default: return 'text-muted-foreground border-border bg-secondary/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success border-success/30 bg-success/10';
      case 'planning': return 'text-primary border-primary/30 bg-primary/10';
      case 'completed': return 'text-muted-foreground border-border bg-secondary/20';
      default: return 'text-muted-foreground border-border bg-secondary/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">Manage and track all your team projects</p>
        </div>
        <Button className="btn-hero" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-5 h-5 mr-2" />
          New Project
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="shrink-0">
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-feature group cursor-pointer"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                  <Folder className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(project.priority)}`}>
                      {project.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {project.starred && (
                  <Star className="w-4 h-4 text-warning fill-warning" />
                )}
                <button className="p-1 rounded hover:bg-secondary/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {project.description}
            </p>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <motion.div 
                  className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
            </div>

            {/* Tasks Overview */}
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {project.tasks.completed}/{project.tasks.total} tasks
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {project.members}
              </span>
            </div>

            {/* Deadline */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Due {project.deadline}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Folder className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first project'}
          </p>
          <Button className="btn-hero" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Create Project
          </Button>
        </motion.div>
      )}
    </div>
  );
};