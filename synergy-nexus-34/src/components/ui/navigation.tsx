import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  MessageSquare, 
  Settings,
  LogOut,
  User,
  CheckSquare,
  Folder,
  PieChart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  className?: string;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: Folder },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'kanban', label: 'Kanban Board', icon: PieChart },
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'settings', label: 'Profile', icon: Settings },
];

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onViewChange,
  className
}) => {
  const { user, signOut } = useAuth();

  return (
    <motion.nav
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={cn(
        "card-glass h-full w-64 p-6 flex flex-col",
        className
      )}
    >
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gradient">SynergySphere</h1>
        <p className="text-sm text-muted-foreground">Team Collaboration</p>
      </div>

      {/* User Profile */}
      <div className="mb-6 p-4 rounded-lg bg-secondary/50 border border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.user_metadata?.name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-primary/20 to-primary-glow/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
              whileHover={{ x: isActive ? 0 : 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Sign Out */}
      <Button
        variant="ghost"
        onClick={signOut}
        className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </Button>
    </motion.nav>
  );
};