// TeamChatContainer.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from './Message'; // Import your updated  component
import { toast } from 'sonner';

const TeamChatContainer = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
        try {
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .or(`owner_id.eq.${user?.id},id.in.(${await getUserProjectIds()})`);
    
          if (error) throw error;
          if (data && data.length > 0) {
            setProjects(data || []);
          }
        } catch (error) {
          console.error('Error fetching projects:', error);
        }
    };

    const getUserProjectIds = async () => {
          const { data } = await supabase
            .from('project_members')
            .select('project_id')
            .eq('user_id', user?.id);
          
          return data?.map(m => m.project_id).join(',') || '';
    };

    fetchProjects();
  }, []);

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