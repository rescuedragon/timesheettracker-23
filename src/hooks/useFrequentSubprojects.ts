
import { useState, useEffect } from 'react';
import { Project } from '@/components/TimeTracker';

export const useFrequentSubprojects = (selectedProjectId: string, projects: Project[]) => {
  const [frequentSubprojects, setFrequentSubprojects] = useState<string[]>([]);

  useEffect(() => {
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

  return { frequentSubprojects, trackSubprojectSelection };
};
