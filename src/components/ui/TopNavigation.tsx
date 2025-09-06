import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogOut, User, Calendar, Activity, FileIcon, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { GlobalSearch } from "@/components/search/GlobalSearch";

export function TopNavigation() {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold sm:inline-block">
              TaskFlow Pro
            </span>
          </a>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <a
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              href="/dashboard"
            >
              Dashboard
            </a>
            <a
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              href="/projects"
            >
              Projects
            </a>
            <a
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              href="/tasks"
            >
              Tasks
            </a>
            <a
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              href="/teams"
            >
              Teams
            </a>
            <a
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              href="/calendar"
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Calendar
            </a>
            <a
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              href="/activity"
            >
              <Activity className="w-4 h-4 inline mr-1" />
              Activity
            </a>
            <a
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              href="/files"
            >
              <FileIcon className="w-4 h-4 inline mr-1" />
              Files
            </a>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {user && <GlobalSearch />}
          </div>
          <nav className="flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-2">
                <NotificationCenter />
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => window.location.href = '/profile'}
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.email}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/settings'}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <AuthModal isOpen={false} onClose={() => {}} />
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}