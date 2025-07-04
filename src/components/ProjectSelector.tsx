
import React, { useState, useEffect } from 'react';
import { Project } from './TimeTracker';
import { isColorCodedProjectsEnabled } from '@/lib/projectColors';
import FrequentProjects from './project-selector/FrequentProjects';
import FrequentSubprojects from './project-selector/FrequentSubprojects';
import ProjectSearch from './project-selector/ProjectSearch';
import SubprojectSearch from './project-selector/SubprojectSearch';
import EditSubprojectDialog from './project-selector/EditSubprojectDialog';
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
  const [editingSubproject, setEditingSubproject] = useState<{id: string, name: string, projectId: string} | null>(null);
  const [editSubprojectName, setEditSubprojectName] = useState('');

  const { frequentProjects, trackProjectSelection } = useFrequentProjects(projects);
  const { frequentSubprojects, trackSubprojectSelection } = useFrequentSubprojects(selectedProjectId, projects);

  useEffect(() => {
    setColorCodedEnabled(isColorCodedProjectsEnabled());
    
    const handleStorageChange = () => {
      setColorCodedEnabled(isColorCodedProjectsEnabled());
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

  return (
    <div className="space-y-6 flex flex-col h-full">
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

      <SubprojectSearch
        selectedProject={selectedProject}
        selectedSubprojectId={selectedSubprojectId}
        colorCodedEnabled={colorCodedEnabled}
        onSubprojectSelect={handleSubprojectSelectChange}
        onEditSubproject={handleEditSubproject}
        onDeleteSubproject={handleDeleteSubproject}
      />

      {selectedProject && (
        <FrequentSubprojects
          frequentSubprojects={frequentSubprojects}
          selectedSubprojectName={selectedSubproject?.name}
          selectedProjectName={selectedProject.name}
          colorCodedEnabled={colorCodedEnabled}
          onSubprojectSelect={handleFrequentSubprojectSelect}
        />
      )}

      <EditSubprojectDialog
        editingSubproject={editingSubproject}
        editSubprojectName={editSubprojectName}
        onEditSubprojectNameChange={setEditSubprojectName}
        onSaveEdit={handleSaveSubprojectEdit}
        onCancel={() => setEditingSubproject(null)}
      />
    </div>
  );
};

export default ProjectSelector;
