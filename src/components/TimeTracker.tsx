
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProjectSelector from './ProjectSelector';
import StopwatchPanel from './StopwatchPanel';
import QueuedProjects, { QueuedProject } from './QueuedProjects';

export interface Project {
  id: string;
  name: string;
  subprojects: Subproject[];
  totalTime: number;
}

export interface Subproject {
  id: string;
  name: string;
  totalTime: number;
}

export interface TimeLog {
  id: string;
  projectId: string;
  subprojectId: string;
  projectName: string;
  subprojectName: string;
  duration: number;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
}

const TimeTracker = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    const saved = localStorage.getItem('selected-project-id');
    return saved || '';
  });
  const [selectedSubprojectId, setSelectedSubprojectId] = useState<string>(() => {
    const saved = localStorage.getItem('selected-subproject-id');
    return saved || '';
  });
  const [queuedProjects, setQueuedProjects] = useState<QueuedProject[]>(() => {
    const saved = localStorage.getItem('queued-projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [resumedProject, setResumedProject] = useState<QueuedProject | undefined>();

  // Load data from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('timesheet-projects');
    const savedTimeLogs = localStorage.getItem('timesheet-logs');
    
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
    if (savedTimeLogs) {
      setTimeLogs(JSON.parse(savedTimeLogs));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('timesheet-projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('timesheet-logs', JSON.stringify(timeLogs));
  }, [timeLogs]);

  // Save selected project and subproject to localStorage
  useEffect(() => {
    localStorage.setItem('selected-project-id', selectedProjectId);
  }, [selectedProjectId]);

  useEffect(() => {
    localStorage.setItem('selected-subproject-id', selectedSubprojectId);
  }, [selectedSubprojectId]);

  // Save queued projects to localStorage
  useEffect(() => {
    localStorage.setItem('queued-projects', JSON.stringify(queuedProjects));
  }, [queuedProjects]);

  // Listen for subproject update/delete events
  useEffect(() => {
    const handleUpdateSubproject = (event: any) => {
      const { projectId, subprojectId, newName } = event.detail;
      setProjects(projects.map(project => 
        project.id === projectId 
          ? {
              ...project,
              subprojects: project.subprojects.map(sub =>
                sub.id === subprojectId ? { ...sub, name: newName } : sub
              )
            }
          : project
      ));
    };

    const handleDeleteSubproject = (event: any) => {
      const { projectId, subprojectId } = event.detail;
      setProjects(projects.map(project => 
        project.id === projectId 
          ? {
              ...project,
              subprojects: project.subprojects.filter(sub => sub.id !== subprojectId)
            }
          : project
      ));
      
      // Clear selection if the deleted subproject was selected
      if (selectedSubprojectId === subprojectId) {
        setSelectedSubprojectId('');
      }
    };

    window.addEventListener('update-subproject', handleUpdateSubproject);
    window.addEventListener('delete-subproject', handleDeleteSubproject);

    return () => {
      window.removeEventListener('update-subproject', handleUpdateSubproject);
      window.removeEventListener('delete-subproject', handleDeleteSubproject);
    };
  }, [projects, selectedSubprojectId]);

  const addProject = (projectName: string, subprojectName: string = '') => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: projectName,
      subprojects: subprojectName ? [{
        id: `${Date.now()}-sub`,
        name: subprojectName,
        totalTime: 0
      }] : [],
      totalTime: 0
    };

    setProjects([...projects, newProject]);
  };

  const addSubproject = (projectId: string, subprojectName: string) => {
    setProjects(projects.map(project => 
      project.id === projectId 
        ? {
            ...project,
            subprojects: [...project.subprojects, {
              id: `${Date.now()}-sub`,
              name: subprojectName,
              totalTime: 0
            }]
          }
        : project
    ));
  };

  const logTime = (duration: number, description: string, startTime: Date, endTime: Date, projectId?: string, subprojectId?: string) => {
    const targetProjectId = projectId || selectedProjectId;
    const targetSubprojectId = subprojectId || selectedSubprojectId;
    
    const project = projects.find(p => p.id === targetProjectId);
    const subproject = project?.subprojects.find(s => s.id === targetSubprojectId);
    
    if (!project || !subproject) return;

    const newTimeLog: TimeLog = {
      id: Date.now().toString(),
      projectId: targetProjectId,
      subprojectId: targetSubprojectId,
      projectName: project.name,
      subprojectName: subproject.name,
      duration,
      description,
      date: new Date().toISOString().split('T')[0],
      startTime: startTime.toLocaleTimeString(),
      endTime: endTime.toLocaleTimeString()
    };

    setTimeLogs([newTimeLog, ...timeLogs]);

    // Update project and subproject total times
    setProjects(projects.map(p =>
      p.id === targetProjectId
        ? {
            ...p,
            totalTime: p.totalTime + duration,
            subprojects: p.subprojects.map(s =>
              s.id === targetSubprojectId
                ? { ...s, totalTime: s.totalTime + duration }
                : s
            )
          }
        : p
    ));
  };

  const switchToExcelView = () => {
    window.dispatchEvent(new CustomEvent('switchToExcelView'));
  };

  const handlePauseProject = (queuedProject: QueuedProject) => {
    setQueuedProjects([...queuedProjects, queuedProject]);
  };

  const handleResumeProject = (queuedProject: QueuedProject) => {
    // Check if there's currently a running timer
    const currentStopwatchState = localStorage.getItem('stopwatch-state');
    if (currentStopwatchState) {
      const state = JSON.parse(currentStopwatchState);
      if (state.isRunning && state.startTime) {
        // Pause the current running project and add it to queue
        const currentProject = projects.find(p => p.id === selectedProjectId);
        const currentSubproject = currentProject?.subprojects.find(s => s.id === selectedSubprojectId);
        
        if (currentProject && currentSubproject) {
          const currentElapsedTime = Math.floor((new Date().getTime() - new Date(state.startTime).getTime()) / 1000);
          const currentQueuedProject: QueuedProject = {
            id: Date.now().toString(),
            projectId: selectedProjectId,
            subprojectId: selectedSubprojectId,
            projectName: currentProject.name,
            subprojectName: currentSubproject.name,
            elapsedTime: currentElapsedTime,
            startTime: new Date(state.startTime)
          };
          
          // Add current running project to queue
          setQueuedProjects([...queuedProjects.filter(p => p.id !== queuedProject.id), currentQueuedProject]);
        }
      }
    }
    
    // Remove the resumed project from queue and set it as current
    setQueuedProjects(queuedProjects.filter(p => p.id !== queuedProject.id));
    setSelectedProjectId(queuedProject.projectId);
    setSelectedSubprojectId(queuedProject.subprojectId);
    setResumedProject(queuedProject);
  };

  const handleStopQueuedProject = (queuedProjectId: string) => {
    setQueuedProjects(queuedProjects.filter(p => p.id !== queuedProjectId));
  };

  const handleResumedProjectHandled = () => {
    setResumedProject(undefined);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const selectedSubproject = selectedProject?.subprojects.find(s => s.id === selectedSubprojectId);

  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[650px]">
        {/* Left Panel - Project Selection */}
        <Card className="h-full shadow-lg border-0 bg-gradient-modern">
          <CardHeader className="pb-6">
          </CardHeader>
          <CardContent className="h-full pt-0">
            <ProjectSelector
              projects={projects}
              selectedProjectId={selectedProjectId}
              selectedSubprojectId={selectedSubprojectId}
              onProjectSelect={setSelectedProjectId}
              onSubprojectSelect={setSelectedSubprojectId}
              onAddProject={addProject}
              onAddSubproject={addSubproject}
            />
          </CardContent>
        </Card>

        {/* Right Panel - Stopwatch */}
        <Card className="h-full shadow-lg border-0 bg-gradient-modern">
          <CardHeader className="pb-6">
            <CardTitle className="text-center text-lg font-medium text-foreground">Stopwatch</CardTitle>
          </CardHeader>
          <CardContent className="h-full pt-0">
            <StopwatchPanel
              selectedProject={selectedProject}
              selectedSubproject={selectedSubproject}
              onLogTime={logTime}
              onSwitchToExcelView={switchToExcelView}
              onPauseProject={handlePauseProject}
              resumedProject={resumedProject}
              onResumedProjectHandled={handleResumedProjectHandled}
            />
          </CardContent>
        </Card>
      </div>

      {/* Queued Projects */}
      <QueuedProjects
        queuedProjects={queuedProjects}
        onResumeProject={handleResumeProject}
        onStopProject={handleStopQueuedProject}
        onLogTime={logTime}
      />
    </div>
  );
};

export default TimeTracker;
