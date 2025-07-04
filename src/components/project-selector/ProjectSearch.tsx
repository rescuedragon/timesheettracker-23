
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderOpen, Search } from 'lucide-react';
import { Project } from '../TimeTracker';
import { generateProjectColor } from '@/lib/projectColors';

interface ProjectSearchProps {
  projects: Project[];
  selectedProjectId: string;
  colorCodedEnabled: boolean;
  onProjectSelect: (projectId: string) => void;
}

const ProjectSearch: React.FC<ProjectSearchProps> = ({
  projects,
  selectedProjectId,
  colorCodedEnabled,
  onProjectSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProjectBackgroundStyle = (projectName: string) => {
    if (!colorCodedEnabled) return {};
    return {
      backgroundColor: generateProjectColor(projectName),
      border: '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '6px'
    };
  };

  const handleProjectSelect = (projectId: string) => {
    onProjectSelect(projectId);
    setSearchTerm('');
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <FolderOpen className="h-4 w-4" />
        Main Project
      </Label>
      <div className="relative" style={selectedProject ? getProjectBackgroundStyle(selectedProject.name) : {}}>
        <Select value={selectedProjectId} onValueChange={handleProjectSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select a main project..." />
          </SelectTrigger>
          <SelectContent>
            <div className="flex items-center px-3 pb-2">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 w-full border-0 p-0 focus:ring-0 focus:outline-none"
              />
            </div>
            {filteredProjects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProjectSearch;
