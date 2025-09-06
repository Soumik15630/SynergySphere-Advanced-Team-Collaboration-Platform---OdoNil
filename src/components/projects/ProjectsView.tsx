import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, MoreHorizontal } from "lucide-react";

interface Project {
  id: string;
  title: string;
  image: string;
  date: string;
  time: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'RD Services',
    image: '/placeholder.svg',
    date: '21/03/22',
    time: '17:30',
  },
  {
    id: '2',
    title: 'RD Sales',
    image: '/placeholder.svg',
    date: '21/03/22',
    time: '21:16',
  },
  {
    id: '3',
    title: 'RD Upgrade',
    image: '/placeholder.svg',
    date: '21/03/22',
    time: '17:58',
  }
];

export function ProjectsView() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Projects</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
          <Button variant="default" size="sm" className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProjects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <div className="p-4 pb-2 flex justify-between items-start">
              <h3 className="text-base font-medium">{project.title}</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <div className="aspect-[4/3] relative px-4">
              <img
                src={project.image}
                alt={project.title}
                className="rounded-lg object-cover w-full h-full"
              />
            </div>
            <div className="p-4 pt-2 flex items-center justify-between text-sm text-muted-foreground">
              <span>{project.date}</span>
              <span>{project.time}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
