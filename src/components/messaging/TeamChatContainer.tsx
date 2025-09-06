import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from './Message';
import { toast } from 'sonner';

const TeamChatContainer = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchProjects();
    }
  }, [user?.id]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      
      // First get projects where user is owner
      const { data: ownedProjects, error: ownedError } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user.id);

      if (ownedError) throw ownedError;

      // Then get projects where user is a member
      const { data: memberProjects, error: memberError } = await supabase
        .from('project_members')
        .select('projects(*)')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      // Combine both arrays and remove duplicates
      const allProjects = [
        ...(ownedProjects || []),
        ...(memberProjects?.map(m => m.projects) || [])
      ];

      // Remove duplicates based on project id
      const uniqueProjects = allProjects.filter((project, index, self) => 
        index === self.findIndex(p => p.id === project.id)
      );

      setProjects(uniqueProjects);
      
      // Auto-select first project if available
      if (uniqueProjects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(uniqueProjects[0].id);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-900 rounded-lg">
        <div className="text-gray-400 text-center">Loading projects...</div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-4 bg-gray-900 rounded-lg">
        <div className="text-gray-400 text-center">
          No projects available. Create or join a project to start chatting.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-900 rounded-lg space-y-4">
      <div>
        <label htmlFor="project-select" className="block text-sm font-medium text-gray-300 mb-2">
          Select a Project Channel
        </label>
        <select
          id="project-select"
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full bg-gray-800 border-gray-600 text-white rounded-md p-2 focus:ring-violet-500 focus:border-violet-500"
        >
          <option value="">Select a project...</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* Render the Messages component only if a project is selected */}
      {selectedProjectId && (
        <Message projectId={selectedProjectId} userId={user?.id} />
      )}
    </div>
  );
};

export default TeamChatContainer;