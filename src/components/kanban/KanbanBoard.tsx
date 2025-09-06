import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { Plus, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Updated Task interface to match Supabase schema
export interface Task {
  id: string;
  title: string;
  description: string | null;
  assignee_id: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date: string | null;
  profiles: {
    name: string | null;
    avatar_url: string | null;
  } | null;
  // Omitting tags, comments, attachments for simplicity as they are not in the tasks table
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

const initialColumns: Column[] = [
  { id: 'todo', title: 'To Do', color: 'border-muted-foreground/30', tasks: [] },
  { id: 'in-progress', title: 'In Progress', color: 'border-primary/50', tasks: [] },
  { id: 'review', title: 'In Review', color: 'border-warning/50', tasks: [] },
  { id: 'done', title: 'Done', color: 'border-success/50', tasks: [] },
];

export const KanbanBoard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchKanbanData();
    }
  }, [user]);

  const fetchKanbanData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          *,
          profiles:assignee_id (
            name,
            avatar_url
          )
        `);

      if (error) throw error;

      const newColumns = [...initialColumns].map(col => ({ ...col, tasks: [] }));

      tasks.forEach((task: any) => {
        const column = newColumns.find(col => col.id === task.status);
        if (column) {
          column.tasks.push(task);
        }
      });

      setColumns(newColumns);

    } catch (error) {
      console.error('Error fetching Kanban data:', error);
      toast({
        title: "Error",
        description: "Failed to load Kanban board data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = findTaskById(active.id as string);
    setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
  
    if (!over || !active) return;
  
    const activeTaskId = active.id as string;
    const overColumnId = over.id as string;
  
    const activeColumn = findColumnByTaskId(activeTaskId);
    if (!activeColumn || activeColumn.id === overColumnId) {
      return;
    }
  
    // Optimistic UI Update
    const taskToMove = findTaskById(activeTaskId);
    if (!taskToMove) return;
  
    setColumns(prev => {
      const newColumns = prev.map(col => ({ ...col, tasks: [...col.tasks] }));
      const sourceColIndex = newColumns.findIndex(c => c.id === activeColumn.id);
      const destColIndex = newColumns.findIndex(c => c.id === overColumnId);
  
      if (sourceColIndex === -1 || destColIndex === -1) return prev;
  
      newColumns[sourceColIndex].tasks = newColumns[sourceColIndex].tasks.filter(t => t.id !== activeTaskId);
      newColumns[destColIndex].tasks.push(taskToMove);
  
      return newColumns;
    });
  
    // Update Supabase
    const { error } = await supabase
      .from('tasks')
      .update({ status: overColumnId })
      .eq('id', activeTaskId);
  
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive",
      });
      // Revert UI on error
      fetchKanbanData(); 
    } else {
        toast({
            title: "Task Updated",
            description: `Task moved to "${columns.find(c=>c.id === overColumnId)?.title}".`,
          });
    }
  };

  const findTaskById = (taskId: string): Task | null => {
    for (const column of columns) {
      const task = column.tasks.find(task => task.id === taskId);
      if (task) return task;
    }
    return null;
  };

  const findColumnByTaskId = (taskId: string): Column | null => {
    return columns.find(column => 
      column.tasks.some(task => task.id === taskId)
    ) || null;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Project Board</h1>
          <p className="text-muted-foreground">Manage tasks with drag and drop</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <MoreVertical className="w-5 h-5 mr-2" />
            Options
          </Button>
          <Button className="btn-hero">
            <Plus className="w-5 h-5 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[600px]">
          {columns.map((column, index) => (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <SortableContext items={column.tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                <KanbanColumn column={column} />
              </SortableContext>
            </motion.div>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <KanbanCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
