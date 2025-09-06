import React from 'react';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { TopNavigation } from '@/components/ui/TopNavigation';

const Activity: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <main className="container mx-auto px-4 py-8">
        <ActivityFeed />
      </main>
    </div>
  );
};

export default Activity;