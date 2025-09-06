import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/ui/navigation';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { ProjectManager } from '@/components/projects/ProjectManager';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TeamsManagement } from '@/components/teams/TeamsManagement';
import { TaskManager } from '@/components/tasks/TaskManager';
import { UserProfile } from '@/components/profile/UserProfile';
import { AdvancedAnalytics } from '@/components/analytics/AdvancedAnalytics';
import { TimeTracker } from '@/components/timetracking/TimeTracker';
import { ProjectTemplates } from '@/components/templates/ProjectTemplates';
import { RealtimeCollaboration } from '@/components/realtime/RealtimeCollaboration';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('overview');
  const [selectedProject, setSelectedProject] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return <DashboardOverview />;
      case 'projects':
        return <ProjectManager />;
      case 'kanban':
        return <KanbanBoard />;
      case 'tasks':
        return <TaskManager />;
      case 'analytics':
        return <AdvancedAnalytics />;
      case 'time-tracking':
        return <TimeTracker />;
      case 'templates':
        return <ProjectTemplates />;
      case 'teams':
        return <TeamsManagement />;
      case 'realtime':
        return <RealtimeCollaboration projectId={selectedProject} />;
      case 'profile':
        return <UserProfile />;
      case 'messages':
        return <div className="text-center py-8 text-muted-foreground">Messages feature coming soon...</div>;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Navigation */}
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
      />

      {/* Main Content */}
      <motion.main 
        className="flex-1 p-8 overflow-auto"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderCurrentView()}
      </motion.main>
    </div>
  );
};

export default Dashboard;