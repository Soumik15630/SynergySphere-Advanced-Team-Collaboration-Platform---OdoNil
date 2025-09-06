import React from 'react';
import { FileManager } from '@/components/files/FileManager';
import { TopNavigation } from '@/components/ui/TopNavigation';

const Files: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <main className="container mx-auto px-4 py-8">
        <FileManager />
      </main>
    </div>
  );
};

export default Files;