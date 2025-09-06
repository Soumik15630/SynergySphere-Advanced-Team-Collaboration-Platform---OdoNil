import React from 'react';
import { Settings } from '@/components/settings/Settings';
import { TopNavigation } from '@/components/ui/TopNavigation';

const SettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <main className="container mx-auto px-4 py-8">
        <Settings />
      </main>
    </div>
  );
};

export default SettingsPage;