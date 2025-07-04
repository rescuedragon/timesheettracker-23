import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Play, Pause, Square, Save, Clock, Edit } from 'lucide-react';
import { Project, Subproject } from './TimeTracker';
import { QueuedProject } from './QueuedProjects';

interface StopwatchPanelProps {
  selectedProject?: Project;
  selectedSubproject?: Subproject;
  onLogTime: (duration: number, description: string, startTime: Date, endTime: Date) => void;
  onSwitchToExcelView?: () => void;
  onPauseProject?: (queuedProject: QueuedProject) => void;
  resumedProject?: QueuedProject;
  onResumedProjectHandled?: () => void;
}

const StopwatchPanel: React.FC<StopwatchPanelProps> = ({
  selectedProject,
  selectedSubproject,
  onLogTime,
  onSwitchToExcelView,
  onPauseProject,
  resumedProject,
  onResumedProjectHandled
}) => {
  const [isRunning, setIsRunning] = useState(() => {
    const saved = localStorage.getItem('stopwatch-state');
    return saved ? JSON.parse(saved).isRunning : false;
  });
  const [startTime, setStartTime] = useState<Date | null>(() => {
    const saved = localStorage.getItem('stopwatch-state');
    return saved && JSON.parse(saved).startTime ? new Date(JSON.parse(saved).startTime) : null;
  });
  const [elapsedTime, setElapsedTime] = useState(() => {
    const saved = localStorage.getItem('stopwatch-state');
    return saved ? JSON.parse(saved).elapsedTime : 0;
  });
  const [description, setDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editableTime, setEditableTime] = useState('');

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const state = {
      isRunning,
      startTime: startTime?.toISOString(),
      elapsedTime,
      projectId: selectedProject?.id,
      subprojectId: selectedSubproject?.id
    };
    localStorage.setItem('stopwatch-state', JSON.stringify(state));
  }, [isRunning, startTime, elapsedTime, selectedProject?.id, selectedSubproject?.id]);

  // Handle resumed project
  useEffect(() => {
    if (resumedProject) {
      setStartTime(new Date(Date.now() - resumedProject.elapsedTime * 1000));
      setElapsedTime(resumedProject.elapsedTime);
      setIsRunning(true);
      if (onResumedProjectHandled) {
        onResumedProjectHandled();
      }
    }
  }, [resumedProject, onResumedProjectHandled]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && startTime) {
      interval = setInterval(() => {
        const newElapsedTime = Math.floor((Date.now() - startTime.getTime()) / 1000);
        
        // Stop if exceeds 8 hours (28800 seconds)
        if (newElapsedTime >= 28800) {
          setElapsedTime(28800);
          setIsRunning(false);
          // Auto-save when hitting 8 hours
          if (selectedProject && selectedSubproject) {
            const endTime = new Date(startTime.getTime() + 28800 * 1000);
            onLogTime(28800, 'Auto-stopped at 8 hours', startTime, endTime);
            handleReset();
          }
        } else {
          setElapsedTime(newElapsedTime);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime, selectedProject, selectedSubproject, onLogTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatHours = (seconds: number) => {
    return (seconds / 3600).toFixed(2);
  };

  const parseTimeInput = (timeStr: string) => {
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      const seconds = parseInt(parts[2]) || 0;
      return hours * 3600 + minutes * 60 + seconds;
    } else if (parts.length === 2) {
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      return hours * 3600 + minutes * 60;
    } else {
      const hours = parseFloat(timeStr) || 0;
      return Math.round(hours * 3600);
    }
  };

  const handleStart = () => {
    if (!selectedProject) return;
    
    const now = new Date();
    setStartTime(now);
    setIsRunning(true);
    setElapsedTime(0);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handlePause = () => {
    if (startTime && selectedProject && onPauseProject) {
      const queuedProject: QueuedProject = {
        id: Date.now().toString(),
        projectId: selectedProject.id,
        subprojectId: selectedSubproject?.id || '',
        projectName: selectedProject.name,
        subprojectName: selectedSubproject?.name || 'No subproject',
        elapsedTime,
        startTime
      };
      
      onPauseProject(queuedProject);
      setIsRunning(false);
      setStartTime(null);
      setElapsedTime(0);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setStartTime(null);
    setElapsedTime(0);
    setDescription('');
    setShowDescription(false);
    setIsEditingTime(false);
    setEditableTime('');
    localStorage.removeItem('stopwatch-state');
  };

  const handleEditTime = () => {
    setIsEditingTime(true);
    setEditableTime(formatTime(elapsedTime));
  };

  const handleSaveEditedTime = () => {
    const newElapsedTime = parseTimeInput(editableTime);
    setElapsedTime(newElapsedTime);
    setIsEditingTime(false);
  };

  const handleSave = () => {
    if (startTime && elapsedTime > 0) {
      const endTime = new Date(startTime.getTime() + elapsedTime * 1000);
      onLogTime(elapsedTime, description, startTime, endTime);
      handleReset();
      
      if (onSwitchToExcelView) {
        setTimeout(() => {
          onSwitchToExcelView();
        }, 500);
      }
    }
  };

  const canStart = selectedProject && !isRunning;
  const canStop = isRunning;
  const canPause = isRunning;
  const canSave = !isRunning && elapsedTime > 0;

  return (
    <div className="flex flex-col h-full items-center justify-center space-y-6">
      {/* Selection Info */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">
          {selectedProject ? selectedProject.name : 'No project selected'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {selectedSubproject ? selectedSubproject.name : 'No subproject (optional)'}
        </p>
      </div>

      {/* Stopwatch Display */}
      <div className="text-center">
        <div className="text-6xl font-mono font-bold text-slate-800 dark:text-slate-200 mb-4">
          {formatTime(elapsedTime)}
        </div>
        
        {isRunning && (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <Clock className="h-4 w-4 animate-pulse" />
            <span className="text-sm">Recording...</span>
          </div>
        )}

        {elapsedTime >= 28800 && (
          <div className="text-red-600 text-sm mt-2">
            Maximum 8 hours reached - automatically stopped
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3">
        {!isRunning ? (
          <Button
            onClick={handleStart}
            disabled={!canStart}
            className="bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <Play className="h-5 w-5 mr-2" />
            Start
          </Button>
        ) : (
          <Button
            onClick={handleStop}
            disabled={!canStop}
            className="bg-red-600 hover:bg-red-700"
            size="lg"
          >
            <Square className="h-5 w-5 mr-2" />
            Stop
          </Button>
        )}

        <Button
          onClick={handlePause}
          disabled={!canPause}
          variant="outline"
          size="lg"
        >
          <Pause className="h-5 w-5 mr-2" />
          Pause
        </Button>

        <Button
          onClick={handleReset}
          variant="outline"
          size="lg"
        >
          <Square className="h-5 w-5 mr-2" />
          Reset
        </Button>
      </div>

      {/* Save Section */}
      {canSave && (
        <div className="w-full max-w-md space-y-3">
          {!showDescription ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 justify-center">
                <span className="text-lg font-semibold">{formatHours(elapsedTime)} hrs</span>
                <Button
                  onClick={handleEditTime}
                  variant="ghost"
                  size="sm"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              
              {isEditingTime && (
                <div className="space-y-2">
                  <Input
                    value={editableTime}
                    onChange={(e) => setEditableTime(e.target.value)}
                    placeholder="HH:MM:SS or decimal hours"
                    className="text-center"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEditedTime} size="sm" className="flex-1">
                      Save Time
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditingTime(false)}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              <Button
                onClick={() => setShowDescription(true)}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isEditingTime}
              >
                <Save className="h-4 w-4 mr-2" />
                Log Time
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label>Description (optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What did you work on?"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  Save Entry
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDescription(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!selectedProject ? (
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Select a project from the left panel to start tracking time
        </p>
      ) : null}
    </div>
  );
};

export default StopwatchPanel;
