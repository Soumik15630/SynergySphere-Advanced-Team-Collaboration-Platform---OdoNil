-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Create activity feed table
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create policies for activities
CREATE POLICY "Users can view project activities" 
ON public.activities 
FOR SELECT 
USING (
  project_id IS NULL OR 
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = activities.project_id 
    AND (p.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM project_members pm 
      WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
    ))
  )
);

CREATE POLICY "System can insert activities" 
ON public.activities 
FOR INSERT 
WITH CHECK (true);

-- Create file attachments table
CREATE TABLE public.file_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID,
  project_id UUID,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.file_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for file attachments
CREATE POLICY "Users can view project file attachments" 
ON public.file_attachments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = file_attachments.project_id 
    AND (p.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM project_members pm 
      WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
    ))
  )
);

CREATE POLICY "Users can insert file attachments to their projects" 
ON public.file_attachments 
FOR INSERT 
WITH CHECK (
  uploaded_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = file_attachments.project_id 
    AND (p.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM project_members pm 
      WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
    ))
  )
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
CREATE POLICY "Users can view comments on accessible tasks" 
ON public.comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM tasks t 
    JOIN projects p ON p.id = t.project_id
    WHERE t.id = comments.task_id 
    AND (p.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM project_members pm 
      WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
    ))
  )
);

CREATE POLICY "Users can insert comments on accessible tasks" 
ON public.comments 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM tasks t 
    JOIN projects p ON p.id = t.project_id
    WHERE t.id = comments.task_id 
    AND (p.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM project_members pm 
      WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
    ))
  )
);

CREATE POLICY "Users can update their own comments" 
ON public.comments 
FOR UPDATE 
USING (user_id = auth.uid());

-- Create time tracking table
CREATE TABLE public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  user_id UUID NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in minutes
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for time entries
CREATE POLICY "Users can view time entries on accessible tasks" 
ON public.time_entries 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM tasks t 
    JOIN projects p ON p.id = t.project_id
    WHERE t.id = time_entries.task_id 
    AND (p.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM project_members pm 
      WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
    ))
  )
);

CREATE POLICY "Users can manage their own time entries" 
ON public.time_entries 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create storage bucket for file attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', false);

-- Create storage policies
CREATE POLICY "Users can view files in their projects" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'project-files' AND 
  EXISTS (
    SELECT 1 FROM file_attachments fa
    JOIN projects p ON p.id = fa.project_id
    WHERE fa.file_path = name
    AND (p.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM project_members pm 
      WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
    ))
  )
);

CREATE POLICY "Users can upload files to their projects" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'project-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create update triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();