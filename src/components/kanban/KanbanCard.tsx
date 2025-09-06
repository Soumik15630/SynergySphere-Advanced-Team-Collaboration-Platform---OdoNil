import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from './KanbanBoard';
import { 
  Calendar, 
  MessageSquare, 
  Paperclip, 
  AlertTriangle,
  Flag,
  Clock
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface KanbanCardProps {
  task: Task;
  isDragging?: boolean;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ task, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-3 h-3 text-destructive" />;
      case 'high': return <Flag className="w-3 h-3 text-warning" />;
      case 'medium': return <Clock className="w-3 h-3 text-primary" />;
      case 'low': return <Clock className="w-3 h-3 text-success" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-destructive';
      case 'high': return 'border-l-warning';
      case 'medium': return 'border-l-primary';
      case 'low': return 'border-l-success';
      default: return 'border-l-muted-foreground';
    }
  };
  
  const assigneeName = task.profiles?.name || 'Unassigned';
  const assigneeAvatarUrl = task.profiles?.avatar_url || '';
  const assigneeInitials = assigneeName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'NA';


  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-card border border-border rounded-lg p-4 cursor-grab active:cursor-grabbing
        border-l-4 ${getPriorityColor(task.priority)}
        hover:shadow-md transition-all duration-200
        ${isDragging || isSortableDragging ? 'opacity-50 rotate-2 scale-105' : ''}
      `}
    >
      {/* Priority and Tags */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          {getPriorityIcon(task.priority)}
          <span className="text-xs font-medium capitalize">{task.priority}</span>
        </div>
        {/* Tags have been omitted as they are not in the db schema */}
      </div>

      {/* Title and Description */}
      <h4 className="font-semibold mb-2 line-clamp-2">{task.title}</h4>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {task.description}
      </p>

      {/* Assignee */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={assigneeAvatarUrl} alt={assigneeName} />
              <AvatarFallback className="text-xs">{assigneeInitials}</AvatarFallback>
            </Avatar>
          <span className="text-xs text-muted-foreground">{assigneeName}</span>
        </div>
        {task.due_date && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {new Date(task.due_date).toLocaleDateString()}
            </div>
        )}
      </div>

      {/* Footer Stats - Omitting for now as not in task table */}
      {/* <div className="flex items-center justify-between pt-3 border-t border-border">
      </div> */}
    </div>
  );
};
