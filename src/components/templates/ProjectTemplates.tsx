import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Rocket, 
  Code, 
  Palette, 
  ShoppingCart, 
  Users, 
  Calendar,
  Plus,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  category: string;
  tasks: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'todo' | 'in-progress' | 'done';
  }[];
  estimatedDuration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const templates: ProjectTemplate[] = [
  {
    id: 'web-development',
    name: 'Web Development Project',
    description: 'Complete template for building modern web applications with planning, development, and deployment phases.',
    icon: Code,
    color: 'text-blue-500',
    category: 'Development',
    estimatedDuration: '8-12 weeks',
    difficulty: 'Intermediate',
    tasks: [
      { title: 'Project Planning & Requirements', description: 'Define project scope, requirements, and technical specifications', priority: 'high', status: 'todo' },
      { title: 'UI/UX Design', description: 'Create wireframes, mockups, and design system', priority: 'high', status: 'todo' },
      { title: 'Frontend Development Setup', description: 'Initialize React/Vue project with tooling and dependencies', priority: 'medium', status: 'todo' },
      { title: 'Backend API Development', description: 'Build REST API endpoints and database models', priority: 'high', status: 'todo' },
      { title: 'Database Design & Implementation', description: 'Design schema and implement database structure', priority: 'high', status: 'todo' },
      { title: 'Authentication & Authorization', description: 'Implement user authentication and role-based access', priority: 'critical', status: 'todo' },
      { title: 'Frontend Components', description: 'Build reusable UI components and pages', priority: 'medium', status: 'todo' },
      { title: 'API Integration', description: 'Connect frontend with backend services', priority: 'medium', status: 'todo' },
      { title: 'Testing Implementation', description: 'Write unit tests, integration tests, and E2E tests', priority: 'medium', status: 'todo' },
      { title: 'Performance Optimization', description: 'Optimize loading times, bundle size, and runtime performance', priority: 'low', status: 'todo' },
      { title: 'Deployment Setup', description: 'Configure CI/CD pipeline and production deployment', priority: 'medium', status: 'todo' },
      { title: 'Documentation', description: 'Write technical documentation and user guides', priority: 'low', status: 'todo' }
    ]
  },
  {
    id: 'mobile-app',
    name: 'Mobile App Development',
    description: 'Template for developing cross-platform mobile applications with React Native or Flutter.',
    icon: Rocket,
    color: 'text-purple-500',
    category: 'Development',
    estimatedDuration: '10-16 weeks',
    difficulty: 'Advanced',
    tasks: [
      { title: 'Market Research & Analysis', description: 'Research target audience, competitors, and market opportunities', priority: 'high', status: 'todo' },
      { title: 'App Architecture Planning', description: 'Define app structure, navigation, and state management', priority: 'high', status: 'todo' },
      { title: 'UI/UX Design for Mobile', description: 'Create mobile-specific designs following platform guidelines', priority: 'high', status: 'todo' },
      { title: 'Development Environment Setup', description: 'Configure React Native/Flutter development environment', priority: 'medium', status: 'todo' },
      { title: 'Core App Features', description: 'Implement main application features and functionality', priority: 'critical', status: 'todo' },
      { title: 'Push Notifications', description: 'Implement push notification system', priority: 'medium', status: 'todo' },
      { title: 'Offline Functionality', description: 'Add offline support and data synchronization', priority: 'medium', status: 'todo' },
      { title: 'Device Integration', description: 'Integrate with camera, GPS, contacts, and other device features', priority: 'low', status: 'todo' },
      { title: 'App Store Optimization', description: 'Optimize app listing for app stores', priority: 'low', status: 'todo' },
      { title: 'Beta Testing', description: 'Conduct beta testing with real users', priority: 'medium', status: 'todo' },
      { title: 'App Store Submission', description: 'Submit app to Apple App Store and Google Play Store', priority: 'high', status: 'todo' }
    ]
  },
  {
    id: 'marketing-campaign',
    name: 'Marketing Campaign',
    description: 'Comprehensive template for planning and executing digital marketing campaigns.',
    icon: Palette,
    color: 'text-pink-500',
    category: 'Marketing',
    estimatedDuration: '6-8 weeks',
    difficulty: 'Beginner',
    tasks: [
      { title: 'Campaign Strategy & Goals', description: 'Define campaign objectives, target audience, and success metrics', priority: 'critical', status: 'todo' },
      { title: 'Market Research', description: 'Research target audience, competitors, and market trends', priority: 'high', status: 'todo' },
      { title: 'Content Strategy', description: 'Plan content themes, formats, and publishing schedule', priority: 'high', status: 'todo' },
      { title: 'Creative Asset Development', description: 'Create graphics, videos, and other marketing materials', priority: 'medium', status: 'todo' },
      { title: 'Social Media Setup', description: 'Set up and optimize social media profiles and pages', priority: 'medium', status: 'todo' },
      { title: 'Email Marketing Campaign', description: 'Create email sequences and automation workflows', priority: 'medium', status: 'todo' },
      { title: 'Paid Advertising Setup', description: 'Configure Google Ads, Facebook Ads, and other paid channels', priority: 'low', status: 'todo' },
      { title: 'Landing Page Creation', description: 'Build dedicated landing pages for campaign conversion', priority: 'medium', status: 'todo' },
      { title: 'Analytics Implementation', description: 'Set up tracking and analytics for campaign performance', priority: 'high', status: 'todo' },
      { title: 'Campaign Launch', description: 'Execute campaign launch across all channels', priority: 'critical', status: 'todo' },
      { title: 'Performance Monitoring', description: 'Monitor campaign performance and make optimizations', priority: 'high', status: 'todo' },
      { title: 'Campaign Analysis & Report', description: 'Analyze results and create comprehensive campaign report', priority: 'medium', status: 'todo' }
    ]
  },
  {
    id: 'ecommerce-store',
    name: 'E-commerce Store Launch',
    description: 'Template for launching a complete e-commerce store from planning to go-live.',
    icon: ShoppingCart,
    color: 'text-green-500',
    category: 'Business',
    estimatedDuration: '12-20 weeks',
    difficulty: 'Advanced',
    tasks: [
      { title: 'Business Plan & Strategy', description: 'Define business model, target market, and revenue projections', priority: 'critical', status: 'todo' },
      { title: 'Product Catalog Planning', description: 'Plan product categories, descriptions, and pricing strategy', priority: 'high', status: 'todo' },
      { title: 'E-commerce Platform Setup', description: 'Set up Shopify, WooCommerce, or custom e-commerce solution', priority: 'high', status: 'todo' },
      { title: 'Payment Gateway Integration', description: 'Integrate Stripe, PayPal, and other payment methods', priority: 'critical', status: 'todo' },
      { title: 'Inventory Management System', description: 'Set up inventory tracking and management processes', priority: 'high', status: 'todo' },
      { title: 'Shipping & Logistics Setup', description: 'Configure shipping rates, carriers, and fulfillment processes', priority: 'high', status: 'todo' },
      { title: 'Product Photography', description: 'Create high-quality product images and videos', priority: 'medium', status: 'todo' },
      { title: 'SEO Optimization', description: 'Optimize store for search engines and implement SEO best practices', priority: 'medium', status: 'todo' },
      { title: 'Customer Service Setup', description: 'Set up customer support channels and processes', priority: 'medium', status: 'todo' },
      { title: 'Security & Compliance', description: 'Implement security measures and ensure compliance with regulations', priority: 'critical', status: 'todo' },
      { title: 'Marketing & Launch Strategy', description: 'Plan and execute store launch marketing campaign', priority: 'high', status: 'todo' }
    ]
  },
  {
    id: 'team-onboarding',
    name: 'Team Onboarding Process',
    description: 'Structured template for onboarding new team members effectively.',
    icon: Users,
    color: 'text-orange-500',
    category: 'HR',
    estimatedDuration: '2-4 weeks',
    difficulty: 'Beginner',
    tasks: [
      { title: 'Pre-boarding Preparation', description: 'Prepare workspace, accounts, and welcome materials', priority: 'high', status: 'todo' },
      { title: 'Welcome & Orientation', description: 'Conduct welcome meeting and company orientation', priority: 'critical', status: 'todo' },
      { title: 'System Access Setup', description: 'Provide access to tools, systems, and platforms', priority: 'high', status: 'todo' },
      { title: 'Role-specific Training', description: 'Conduct training specific to the new hire\'s role', priority: 'high', status: 'todo' },
      { title: 'Team Introductions', description: 'Facilitate introductions with team members and stakeholders', priority: 'medium', status: 'todo' },
      { title: 'Documentation Review', description: 'Review company policies, procedures, and documentation', priority: 'medium', status: 'todo' },
      { title: 'Goal Setting Session', description: 'Set initial goals and expectations for the first 90 days', priority: 'high', status: 'todo' },
      { title: 'Week 1 Check-in', description: 'Conduct first week feedback session', priority: 'medium', status: 'todo' },
      { title: 'Month 1 Review', description: 'Review progress and address any concerns', priority: 'medium', status: 'todo' },
      { title: '90-day Evaluation', description: 'Conduct comprehensive 90-day performance review', priority: 'high', status: 'todo' }
    ]
  },
  {
    id: 'event-planning',
    name: 'Event Planning',
    description: 'Complete template for organizing successful events from conception to execution.',
    icon: Calendar,
    color: 'text-indigo-500',
    category: 'Event',
    estimatedDuration: '8-12 weeks',
    difficulty: 'Intermediate',
    tasks: [
      { title: 'Event Concept & Goals', description: 'Define event purpose, objectives, and success criteria', priority: 'critical', status: 'todo' },
      { title: 'Budget Planning', description: 'Create detailed budget and allocate resources', priority: 'high', status: 'todo' },
      { title: 'Venue Research & Booking', description: 'Research and book appropriate venue for the event', priority: 'high', status: 'todo' },
      { title: 'Vendor Management', description: 'Source and coordinate with catering, AV, and other vendors', priority: 'medium', status: 'todo' },
      { title: 'Marketing & Promotion', description: 'Create marketing materials and promote the event', priority: 'medium', status: 'todo' },
      { title: 'Registration System', description: 'Set up event registration and ticketing system', priority: 'medium', status: 'todo' },
      { title: 'Program & Agenda', description: 'Plan detailed event schedule and program content', priority: 'high', status: 'todo' },
      { title: 'Speaker Coordination', description: 'Coordinate with speakers and presenters', priority: 'medium', status: 'todo' },
      { title: 'Logistics Planning', description: 'Plan transportation, accommodation, and other logistics', priority: 'medium', status: 'todo' },
      { title: 'Day-of Coordination', description: 'Execute event day coordination and management', priority: 'critical', status: 'todo' },
      { title: 'Post-event Follow-up', description: 'Send thank you messages and gather feedback', priority: 'low', status: 'todo' },
      { title: 'Event Analysis & Report', description: 'Analyze event success and create final report', priority: 'low', status: 'todo' }
    ]
  }
];

export const ProjectTemplates: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectData, setProjectData] = useState({
    name: '',
    description: ''
  });
  const [creating, setCreating] = useState(false);

  const createProjectFromTemplate = async () => {
    if (!selectedTemplate || !projectData.name.trim()) return;

    try {
      setCreating(true);

      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: projectData.name,
          description: projectData.description || selectedTemplate.description,
          owner_id: user?.id
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create tasks from template
      const tasksToCreate = selectedTemplate.tasks.map(task => ({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        project_id: project.id
      }));

      const { error: tasksError } = await supabase
        .from('tasks')
        .insert(tasksToCreate);

      if (tasksError) throw tasksError;

      // Log activity
      await supabase
        .from('activities')
        .insert({
          user_id: user?.id,
          action: 'created',
          entity_type: 'project',
          entity_id: project.id,
          project_id: project.id,
          details: {
            title: project.name,
            template: selectedTemplate.name
          }
        });

      toast({
        title: "Success",
        description: `Project "${projectData.name}" created successfully with ${selectedTemplate.tasks.length} tasks`,
      });

      setIsCreateOpen(false);
      setSelectedTemplate(null);
      setProjectData({ name: '', description: '' });
    } catch (error) {
      console.error('Error creating project from template:', error);
      toast({
        title: "Error",
        description: "Failed to create project from template",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setProjectData({
      name: '',
      description: template.description
    });
    setIsCreateOpen(true);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Project Templates</h1>
        <p className="text-muted-foreground">
          Kickstart your projects with pre-built templates and task lists
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template, index) => {
          const Icon = template.icon;
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="card-glass hover:card-glow transition-all duration-300 cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-lg bg-accent ${template.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    {template.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {template.description}
                  </p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <CheckCircle className="w-3 h-3" />
                        {template.tasks.length} tasks
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {template.estimatedDuration}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {template.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < 4 ? 'text-warning fill-current' : 'text-muted-foreground'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full gap-2"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTemplate && <selectedTemplate.icon className="w-5 h-5" />}
              Create Project from Template
            </DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="p-4 bg-accent/50 rounded-lg">
                <h3 className="font-semibold mb-2">{selectedTemplate.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {selectedTemplate.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {selectedTemplate.tasks.length} tasks included
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {selectedTemplate.estimatedDuration}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {selectedTemplate.difficulty}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    value={projectData.name}
                    onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={`My ${selectedTemplate.name}`}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="project-description">Project Description</Label>
                  <Textarea
                    id="project-description"
                    value={projectData.description}
                    onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your project goals and requirements..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={createProjectFromTemplate}
                    disabled={!projectData.name.trim() || creating}
                    className="gap-2"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create Project
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};