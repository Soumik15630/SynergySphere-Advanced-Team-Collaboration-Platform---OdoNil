import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { Column } from './KanbanBoard';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  column: Column;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className="card-glass p-4 h-fit min-h-[500px]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">{column.title}</h3>
          <span className="px-2 py-1 rounded-full bg-secondary text-xs font-medium">
            {column.tasks.length}
          </span>
        </div>
        <button className="p-1 rounded hover:bg-secondary/50 transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tasks Container */}
      <div
        ref={setNodeRef}
        className={`space-y-3 min-h-[400px] rounded-lg p-2 transition-colors ${
          isOver ? 'bg-primary/5 border-2 border-primary/30 border-dashed' : ''
        }`}
      >
        <SortableContext items={column.tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </SortableContext>
        
        {/* Empty State */}
        {column.tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
};