import React from 'react';
import { CalendarView } from '@/components/calendar/CalendarView';
import { TopNavigation } from '@/components/ui/TopNavigation';

const Calendar: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <main className="container mx-auto px-4 py-8">
        <CalendarView />
      </main>
    </div>
  );
};

export default Calendar;