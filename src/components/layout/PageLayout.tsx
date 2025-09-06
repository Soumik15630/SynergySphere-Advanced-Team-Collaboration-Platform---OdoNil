import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  title: string;
  description?: string;
  isSidebarCollapsed?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className,
  title,
  description,
  isSidebarCollapsed = false
}) => {
  return (
    <motion.main 
      className={cn(
        "min-h-screen bg-background/50 transition-all duration-200 ease-in-out",
        isSidebarCollapsed
          ? "ml-0 md:ml-[80px]"
          : "ml-0 md:ml-64",
      )}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={cn(
        "mx-auto transition-all duration-200",
        isSidebarCollapsed
          ? "max-w-[1800px] px-4 md:px-8 lg:px-12"
          : "max-w-[1600px] px-4 md:px-6 lg:px-8"
      )}>
        <div className="space-y-8 py-6 md:py-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-lg text-muted-foreground">{description}</p>
            )}
          </div>

          {/* Main Content */}
          <div className={className}>
            {children}
          </div>
        </div>
      </div>
    </motion.main>
  );
};
