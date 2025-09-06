import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  PieChart,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  className?: string;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const navigationItems = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: Folder },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'kanban', label: 'Kanban Board', icon: FolderKanban },
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'profile', label: 'Profile', icon: User },
];

const MobileNav: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed left-0 top-0 z-50 h-screen w-64 bg-background border-r shadow-lg"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onViewChange,
  className,
  onCollapsedChange
}) => {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  };

  const handleMobileToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigationContent = (
    <motion.nav
      initial={false}
      animate={{ 
        width: isCollapsed && !isMobile ? 80 : 256
      }}
      className={cn(
        "h-screen bg-background/80 backdrop-blur-lg border-r",
        "flex flex-col p-4 transition-all duration-200",
        !isMobile && "fixed left-0 top-0 z-40",
        className
      )}
    >
      {/* Collapse Toggle */}
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full border bg-background"
          onClick={handleToggle}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
        </Button>
      )}

      {/* Logo */}
      <div className={cn("mb-8 overflow-hidden", isCollapsed && !isMobile && "text-center")}>
        {isCollapsed && !isMobile ? (
          <h1 className="text-2xl font-bold text-gradient">S</h1>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gradient">SynergySphere</h1>
            <p className="text-sm text-muted-foreground">Team Collaboration</p>
          </>
        )}
      </div>

      {/* User Profile */}
      <div className={cn(
        "mb-6 rounded-lg bg-gradient-to-b from-secondary/50 to-background/50 border border-border/50 backdrop-blur-sm",
        isCollapsed && !isMobile ? "p-2" : "px-4 py-3"
      )}>
        <div className={cn(
          "flex items-center",
          isCollapsed && !isMobile ? "justify-center" : "gap-3"
        )}>
          <div className="relative group">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-primary-foreground opacity-75 blur-md group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.name || 'User'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-background"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary border-2 border-background flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary-foreground">
                    {(user?.email?.[0] || 'U').toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          )}
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
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                isCollapsed && !isMobile && "justify-center px-2"
              )}
              whileHover={{ x: isActive || (isCollapsed && !isMobile) ? 0 : 4 }}
              whileTap={{ scale: 0.98 }}
              title={isCollapsed && !isMobile ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {(!isCollapsed || isMobile) && (
                <span className="font-medium">{item.label}</span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Sign Out */}
      <Button
        variant="ghost"
        onClick={signOut}
        className={cn(
          "w-full gap-3 text-muted-foreground hover:text-destructive",
          isCollapsed && !isMobile ? "justify-center px-2" : "justify-start"
        )}
        title={isCollapsed && !isMobile ? "Sign Out" : undefined}
      >
        <LogOut className="w-5 h-5 flex-shrink-0" />
        {(!isCollapsed || isMobile) && "Sign Out"}
      </Button>
    </motion.nav>
  );

  return (
    <>
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={handleMobileToggle}
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      {/* Desktop Navigation */}
      {!isMobile && navigationContent}

      {/* Mobile Navigation */}
      {isMobile && (
        <MobileNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
          {navigationContent}
        </MobileNav>
      )}
    </>
  );
};