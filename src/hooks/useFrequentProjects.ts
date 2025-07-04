
import { useState, useEffect } from 'react';
import { Project } from '@/components/TimeTracker';

export const useFrequentProjects = (projects: Project[]) => {
  const [frequentProjects, setFrequentProjects] = useState<string[]>([]);

  useEffect(() => {
    const savedSelections = localStorage.getItem('project-selections');
    if (savedSelections) {
      const selections = JSON.parse(savedSelections);
      const projectSelectionCount = new Map<string, number>();
      
      selections.forEach((selection: any) => {
        const count = projectSelectionCount.get(selection.projectName) || 0;
        projectSelectionCount.set(selection.projectName, count + 1);
      });
      
      const sortedProjects = Array.from(projectSelectionCount.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([projectName]) => projectName)
        .filter(projectName => projects.some(p => p.name === projectName))
        .slice(0, 5);
        
      setFrequentProjects(sortedProjects);
    }
  }, [projects]);

  const trackProjectSelection = (projectName: string) => {
    const savedSelections = localStorage.getItem('project-selections');
    const selections = savedSelections ? JSON.parse(savedSelections) : [];
    selections.push({
      projectName,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('project-selections', JSON.stringify(selections));
  };

  return { frequentProjects, trackProjectSelection };
};
