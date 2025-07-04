
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderOpen, Target, Clock, Search, Edit, Trash2, Plus } from 'lucide-react';
import { Project } from './TimeTracker';
import { generateProjectColor, isColorCodedProjectsEnabled } from '@/lib/projectColors';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

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
  const [frequentSubprojects, setFrequentSubprojects] = useState<string[]>([]);
  const [colorCodedEnabled, setColorCodedEnabled] = useState(false);
  const [editingSubproject, setEditingSubproject] = useState<{id: string, name: string, projectId: string} | null>(null);
  const [editSubprojectName, setEditSubprojectName] = useState('');

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
    // Calculate frequent projects based on selection count
    const savedSelections = localStorage.getItem('project-selections');
    if (savedSelections) {
      const selections = JSON.parse(savedSelections);
      const projectSelectionCount = new Map<string, number>();
      
      selections.forEach((selection: any) => {
        const count = projectSelectionCount.get(selection.projectName) || 0;
        projectSelectionCount.set(selection.projectName, count + 1);
      });
      
      // Get top 5 most selected projects that still exist
      const sortedProjects = Array.from(projectSelectionCount.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([projectName]) => projectName)
        .filter(projectName => projects.some(p => p.name === projectName))
        .slice(0, 5);
        
      setFrequentProjects(sortedProjects);
    }
  }, [projects]);

  useEffect(() => {
    // Calculate frequent subprojects for selected project
    if (selectedProjectId) {
      const savedSelections = localStorage.getItem('subproject-selections');
      if (savedSelections) {
        const selections = JSON.parse(savedSelections);
        const subprojectSelectionCount = new Map<string, number>();
        
        selections
          .filter((selection: any) => selection.projectId === selectedProjectId)
          .forEach((selection: any) => {
            const count = subprojectSelectionCount.get(selection.subprojectName) || 0;
            subprojectSelectionCount.set(selection.subprojectName, count + 1);
          });
        
        const selectedProject = projects.find(p => p.id === selectedProjectId);
        if (selectedProject) {
          // Get top 5 most selected subprojects that still exist
          const sortedSubprojects = Array.from(subprojectSelectionCount.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([subprojectName]) => subprojectName)
            .filter(subprojectName => selectedProject.subprojects.some(s => s.name === subprojectName))
            .slice(0, 5);
            
          setFrequentSubprojects(sortedSubprojects);
        }
      }
    } else {
      setFrequentSubprojects([]);
    }
  }, [selectedProjectId, projects]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const selectedSubproject = selectedProject?.subprojects.find(s => s.id === selectedSubprojectId);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(projectSearchTerm.toLowerCase())
  );

  const filteredSubprojects = selectedProject?.subprojects.filter(subproject =>
    subproject.name.toLowerCase().includes(subprojectSearchTerm.toLowerCase())
  ) || [];

  const trackProjectSelection = (projectName: string) => {
    const savedSelections = localStorage.getItem('project-selections');
    const selections = savedSelections ? JSON.parse(savedSelections) : [];
    selections.push({
      projectName,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('project-selections', JSON.stringify(selections));
  };

  const trackSubprojectSelection = (projectId: string, subprojectName: string) => {
    const savedSelections = localStorage.getItem('subproject-selections');
    const selections = savedSelections ? JSON.parse(savedSelections) : [];
    selections.push({
      projectId,
      subprojectName,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('subproject-selections', JSON.stringify(selections));
  };

  const handleFrequentProjectSelect = (projectName: string) => {
    let project = projects.find(p => p.name === projectName);
    if (!project) {
      onAddProject(projectName);
      setTimeout(() => {
        const newProject = projects.find(p => p.name === projectName);
        if (newProject) {
          onProjectSelect(newProject.id);
          trackProjectSelection(projectName);
        }
      }, 100);
    } else {
      onProjectSelect(project.id);
      trackProjectSelection(projectName);
      // Reset search terms when selecting a project
      setProjectSearchTerm('');
      setSubprojectSearchTerm('');
    }
  };

  const handleFrequentSubprojectSelect = (subprojectName: string) => {
    if (selectedProject) {
      const subproject = selectedProject.subprojects.find(s => s.name === subprojectName);
      if (subproject) {
        onSubprojectSelect(subproject.id);
        trackSubprojectSelection(selectedProject.id, subprojectName);
        setSubprojectSearchTerm('');
      }
    }
  };

  const handleProjectSelectChange = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      onProjectSelect(projectId);
      trackProjectSelection(project.name);
      setProjectSearchTerm('');
      setSubprojectSearchTerm('');
    }
  };

  const handleSubprojectSelectChange = (subprojectId: string) => {
    if (selectedProject) {
      const subproject = selectedProject.subprojects.find(s => s.id === subprojectId);
      if (subproject) {
        onSubprojectSelect(subprojectId);
        trackSubprojectSelection(selectedProject.id, subproject.name);
        setSubprojectSearchTerm('');
      }
    }
  };

  const handleEditSubproject = (subproject: any) => {
    setEditingSubproject({
      id: subproject.id,
      name: subproject.name,
      projectId: selectedProjectId
    });
    setEditSubprojectName(subproject.name);
  };

  const handleSaveSubprojectEdit = () => {
    if (editingSubproject && editSubprojectName.trim()) {
      // Update the projects state through parent component
      window.dispatchEvent(new CustomEvent('update-subproject', {
        detail: {
          projectId: editingSubproject.projectId,
          subprojectId: editingSubproject.id,
          newName: editSubprojectName.trim()
        }
      }));
      setEditingSubproject(null);
      setEditSubprojectName('');
    }
  };

  const handleDeleteSubproject = (subprojectId: string) => {
    if (selectedProject && window.confirm('Are you sure you want to delete this subproject?')) {
      window.dispatchEvent(new CustomEvent('delete-subproject', {
        detail: {
          projectId: selectedProject.id,
          subprojectId: subprojectId
        }
      }));
    }
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
        
        {/* Frequently Used Projects - Always show if available */}
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
                  <div className="flex items-center justify-between w-full">
                    <span>{subproject.name}</span>
                    <div className="flex gap-1 ml-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSubproject(subproject);
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubproject(subproject.id);
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Frequently Used Subprojects - Show when project is selected */}
        {selectedProject && frequentSubprojects.length > 0 && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4" />
              Frequently Used Subprojects (Top 5)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {frequentSubprojects.map(subprojectName => (
                <Button
                  key={subprojectName}
                  variant={selectedSubproject?.name === subprojectName ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFrequentSubprojectSelect(subprojectName)}
                  className="text-xs"
                  style={colorCodedEnabled ? getProjectBackgroundStyle(selectedProject.name) : {}}
                >
                  {subprojectName}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Subproject Dialog */}
      <Dialog open={!!editingSubproject} onOpenChange={() => setEditingSubproject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subproject</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Subproject Name</Label>
              <Input
                value={editSubprojectName}
                onChange={(e) => setEditSubprojectName(e.target.value)}
                placeholder="Enter subproject name"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveSubprojectEdit} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditingSubproject(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectSelector;
