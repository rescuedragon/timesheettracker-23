
import React, { useState, useEffect } from 'react';
import { Project } from './TimeTracker';
import { isColorCodedProjectsEnabled } from '@/lib/projectColors';
import FrequentProjects from './project-selector/FrequentProjects';
import FrequentSubprojects from './project-selector/FrequentSubprojects';
import ProjectSearch from './project-selector/ProjectSearch';
import SubprojectSearch from './project-selector/SubprojectSearch';
import { useFrequentProjects } from '@/hooks/useFrequentProjects';
import { useFrequentSubprojects } from '@/hooks/useFrequentSubprojects';

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
  const [colorCodedEnabled, setColorCodedEnabled] = useState(false);
  const [frequentSubprojectsEnabled, setFrequentSubprojectsEnabled] = useState(false);

  const { frequentProjects, trackProjectSelection } = useFrequentProjects(projects);
  const { frequentSubprojects, trackSubprojectSelection } = useFrequentSubprojects(selectedProjectId, projects);

  useEffect(() => {
    setColorCodedEnabled(isColorCodedProjectsEnabled());
    const savedFrequentSubprojects = localStorage.getItem('frequent-subprojects-enabled');
    setFrequentSubprojectsEnabled(savedFrequentSubprojects ? JSON.parse(savedFrequentSubprojects) : false);
    
    const handleStorageChange = () => {
      setColorCodedEnabled(isColorCodedProjectsEnabled());
      const savedFrequentSubprojects = localStorage.getItem('frequent-subprojects-enabled');
      setFrequentSubprojectsEnabled(savedFrequentSubprojects ? JSON.parse(savedFrequentSubprojects) : false);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('settings-changed', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settings-changed', handleStorageChange);
    };
  }, []);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const selectedSubproject = selectedProject?.subprojects.find(s => s.id === selectedSubprojectId);

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
    }
  };

  const handleFrequentSubprojectSelect = (subprojectName: string) => {
    if (selectedProject) {
      const subproject = selectedProject.subprojects.find(s => s.name === subprojectName);
      if (subproject) {
        onSubprojectSelect(subproject.id);
        trackSubprojectSelection(selectedProject.id, subprojectName);
      }
    }
  };

  const handleProjectSelectChange = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      onProjectSelect(projectId);
      trackProjectSelection(project.name);
    }
  };

  const handleSubprojectSelectChange = (subprojectId: string) => {
    if (selectedProject) {
      const subproject = selectedProject.subprojects.find(s => s.id === subprojectId);
      if (subproject) {
        onSubprojectSelect(subprojectId);
        trackSubprojectSelection(selectedProject.id, subproject.name);
      }
    }
  };

  return (
    <div className="space-y-4 flex flex-col h-full">
      <ProjectSearch
        projects={projects}
        selectedProjectId={selectedProjectId}
        colorCodedEnabled={colorCodedEnabled}
        onProjectSelect={handleProjectSelectChange}
      />
      
      <FrequentProjects
        frequentProjects={frequentProjects}
        selectedProjectName={selectedProject?.name}
        colorCodedEnabled={colorCodedEnabled}
        onProjectSelect={handleFrequentProjectSelect}
      />

      {selectedProject && (
        <div className="space-y-4">
          <SubprojectSearch
            selectedProject={selectedProject}
            selectedSubprojectId={selectedSubprojectId}
            colorCodedEnabled={colorCodedEnabled}
            onSubprojectSelect={handleSubprojectSelectChange}
          />

          {frequentSubprojectsEnabled && (
            <FrequentSubprojects
              frequentSubprojects={frequentSubprojects}
              selectedSubprojectName={selectedSubproject?.name}
              selectedProjectName={selectedProject.name}
              colorCodedEnabled={colorCodedEnabled}
              onSubprojectSelect={handleFrequentSubprojectSelect}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;
