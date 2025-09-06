import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, FolderOpen, CheckSquare, Users, FileIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface SearchResult {
  id: string;
  type: 'project' | 'task' | 'file';
  title: string;
  description?: string;
  project_name?: string;
  highlight?: string;
}

export const GlobalSearch: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Listen for keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      performSearch(query);
    } else {
      setResults([]);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const searchTerms = `%${searchQuery}%`;
      
      // Search projects
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, description')
        .or(`name.ilike.${searchTerms},description.ilike.${searchTerms}`)
        .limit(5);

      // Search tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          id, 
          title, 
          description,
          projects:project_id (name)
        `)
        .or(`title.ilike.${searchTerms},description.ilike.${searchTerms}`)
        .limit(5);

      // Search files
      const { data: files } = await supabase
        .from('file_attachments')
        .select(`
          id,
          filename,
          projects:project_id (name)
        `)
        .ilike('filename', searchTerms)
        .limit(5);

      const searchResults: SearchResult[] = [
        ...(projects || []).map(p => ({
          id: p.id,
          type: 'project' as const,
          title: p.name,
          description: p.description,
        })),
        ...(tasks || []).map((t: any) => ({
          id: t.id,
          type: 'task' as const,
          title: t.title,
          description: t.description,
          project_name: t.projects?.name,
        })),
        ...(files || []).map((f: any) => ({
          id: f.id,
          type: 'file' as const,
          title: f.filename,
          project_name: f.projects?.name,
        })),
      ];

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <FolderOpen className="w-4 h-4" />;
      case 'task':
        return <CheckSquare className="w-4 h-4" />;
      case 'file':
        return <FileIcon className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getResultBadgeVariant = (type: string) => {
    switch (type) {
      case 'project':
        return 'default';
      case 'task':
        return 'secondary';
      case 'file':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Search trigger button */}
      <div 
        className="relative cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border rounded-md hover:bg-accent/50 transition-colors">
          <Search className="w-4 h-4" />
          <span>Search...</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Search dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search projects, tasks, and files..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              "No results found."
            )}
          </CommandEmpty>
          
          {results.length > 0 && (
            <CommandGroup heading="Results">
              {results.map((result) => (
                <CommandItem
                  key={`${result.type}-${result.id}`}
                  className="flex items-center gap-3 p-3"
                  onSelect={() => {
                    // Handle navigation based on result type
                    console.log('Navigate to:', result);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    {getResultIcon(result.type)}
                    <Badge variant={getResultBadgeVariant(result.type)} className="text-xs">
                      {result.type}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{result.title}</p>
                    {result.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {result.description}
                      </p>
                    )}
                    {result.project_name && (
                      <p className="text-xs text-muted-foreground">
                        in {result.project_name}
                      </p>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};