
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderOpen, Target, Clock, Search } from 'lucide-react';
import { Project } from './TimeTracker';
import { generateProjectColor, isColorCodedProjectsEnabled } from '@/lib/projectColors';

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId: string;
  selectedSubprojectId: string;
  onProjectSelect: (projectId: string) => void;
  onSubprojectSelect: (subprojectId: string) => void;
  onAddProject: (projectName: string, subprojectName?: string) => void;
  onAddSubproject: (projectId: string, subprojectName: string) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  selectedProjectId,
  selectedSubprojectId,
  onProjectSelect,
  onSubprojectSelect,
  onAddProject,
  onAddSubproject
}) => {
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [subprojectSearchTerm, setSubprojectSearchTerm] = useState('');
  const [frequentProjects, setFrequentProjects] = useState<string[]>([]);
  const [colorCodedEnabled, setColorCodedEnabled] = useState(false);

  useEffect(() => {
    // Check if color-coded projects are enabled
    setColorCodedEnabled(isColorCodedProjectsEnabled());
    
    // Listen for storage changes
    const handleStorageChange = () => {
      setColorCodedEnabled(isColorCodedProjectsEnabled());
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from the settings component
    const handleSettingsChange = () => {
      setColorCodedEnabled(isColorCodedProjectsEnabled());
    };
    
    window.addEventListener('settings-changed', handleSettingsChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settings-changed', handleSettingsChange);
    };
  }, []);

  useEffect(() => {
    // Calculate frequent projects based on total time charged
    const savedTimeLogs = localStorage.getItem('timesheet-logs');
    if (savedTimeLogs) {
      const timeLogs = JSON.parse(savedTimeLogs);
      const projectTimeMap = new Map<string, number>();
      
      timeLogs.forEach((log: any) => {
        const totalTime = projectTimeMap.get(log.projectName) || 0;
        projectTimeMap.set(log.projectName, totalTime + log.duration);
      });
      
      // Get top 5 most time-charged projects that still exist
      const sortedProjects = Array.from(projectTimeMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([projectName]) => projectName)
        .filter(projectName => projects.some(p => p.name === projectName))
        .slice(0, 5);
        
      setFrequentProjects(sortedProjects);
    }
  }, [projects]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const selectedSubproject = selectedProject?.subprojects.find(s => s.id === selectedSubprojectId);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(projectSearchTerm.toLowerCase())
  );

  const filteredSubprojects = selectedProject?.subprojects.filter(subproject =>
    subproject.name.toLowerCase().includes(subprojectSearchTerm.toLowerCase())
  ) || [];

  const handleFrequentProjectSelect = (projectName: string) => {
    let project = projects.find(p => p.name === projectName);
    if (!project) {
      onAddProject(projectName);
      setTimeout(() => {
        const newProject = projects.find(p => p.name === projectName);
        if (newProject) onProjectSelect(newProject.id);
      }, 100);
    } else {
      onProjectSelect(project.id);
      // Reset search terms when selecting a project
      setProjectSearchTerm('');
      setSubprojectSearchTerm('');
    }
  };

  const handleProjectSelectChange = (projectId: string) => {
    onProjectSelect(projectId);
    setProjectSearchTerm('');
    setSubprojectSearchTerm('');
  };

  const handleSubprojectSelectChange = (subprojectId: string) => {
    onSubprojectSelect(subprojectId);
    setSubprojectSearchTerm('');
  };

  const getProjectBackgroundStyle = (projectName: string) => {
    if (!colorCodedEnabled) return {};
    return {
      backgroundColor: generateProjectColor(projectName),
      border: '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '6px'
    };
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Project Selection */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          Main Project
        </Label>
        <div className="relative" style={selectedProject ? getProjectBackgroundStyle(selectedProject.name) : {}}>
          <Select value={selectedProjectId} onValueChange={handleProjectSelectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a main project..." />
            </SelectTrigger>
            <SelectContent>
              <div className="flex items-center px-3 pb-2">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Input
                  placeholder="Search projects..."
                  value={projectSearchTerm}
                  onChange={(e) => setProjectSearchTerm(e.target.value)}
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
        
        {/* Frequently Used Projects - Top 5 based on time charged */}
        {frequentProjects.length > 0 && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4" />
              Frequently Used Projects (Top 5)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {frequentProjects.map(projectName => (
                <Button
                  key={projectName}
                  variant={selectedProject?.name === projectName ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFrequentProjectSelect(projectName)}
                  className="text-xs"
                  style={colorCodedEnabled ? getProjectBackgroundStyle(projectName) : {}}
                >
                  {projectName}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Subproject Selection */}
      <div className="space-y-2 flex-1">
        <Label className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          Subproject
        </Label>
        <div 
          className="relative" 
          style={selectedProject && selectedSubproject ? getProjectBackgroundStyle(selectedProject.name) : {}}
        >
          <Select 
            value={selectedSubprojectId} 
            onValueChange={handleSubprojectSelectChange}
            disabled={!selectedProject}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a subproject..." />
            </SelectTrigger>
            <SelectContent>
              {selectedProject && (
                <div className="flex items-center px-3 pb-2">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <Input
                    placeholder="Search subprojects..."
                    value={subprojectSearchTerm}
                    onChange={(e) => setSubprojectSearchTerm(e.target.value)}
                    className="h-8 w-full border-0 p-0 focus:ring-0 focus:outline-none"
                  />
                </div>
              )}
              {filteredSubprojects.map(subproject => (
                <SelectItem key={subproject.id} value={subproject.id}>
                  {subproject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ProjectSelector;
