
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Play, Pause, Square, Clock, Eye } from 'lucide-react';
import { Project, Subproject } from './TimeTracker';
import { QueuedProject } from './QueuedProjects';
import { generateProjectColor, isColorCodedProjectsEnabled } from '@/lib/projectColors';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface StopwatchPanelProps {
  selectedProject: Project | undefined;
  selectedSubproject: Subproject | undefined;
  onLogTime: (duration: number, description: string, startTime: Date, endTime: Date, projectId?: string, subprojectId?: string) => void;
  onSwitchToExcelView: () => void;
  onPauseProject: (queuedProject: QueuedProject) => void;
  resumedProject?: QueuedProject;
  onResumedProjectHandled: () => void;
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
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [colorCodedEnabled, setColorCodedEnabled] = useState(false);
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);
  const [description, setDescription] = useState('');
  const [pendingLogData, setPendingLogData] = useState<{duration: number, startTime: Date, endTime: Date} | null>(null);

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

  // Load stopwatch state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('stopwatch-state');
    if (savedState) {
      const state = JSON.parse(savedState);
      setIsRunning(state.isRunning);
      setElapsedTime(state.elapsedTime);
      if (state.startTime) {
        setStartTime(new Date(state.startTime));
      }
    }
  }, []);

  // Handle resumed project
  useEffect(() => {
    if (resumedProject) {
      setElapsedTime(resumedProject.elapsedTime);
      setStartTime(resumedProject.startTime);
      setIsRunning(true);
      onResumedProjectHandled();
    }
  }, [resumedProject, onResumedProjectHandled]);

  // Save stopwatch state to localStorage
  useEffect(() => {
    const state = {
      isRunning,
      elapsedTime,
      startTime: startTime?.toISOString()
    };
    localStorage.setItem('stopwatch-state', JSON.stringify(state));
  }, [isRunning, elapsedTime, startTime]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const newElapsedTime = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(newElapsedTime);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!selectedProject || !selectedSubproject) return;
    
    const now = new Date();
    setStartTime(now);
    setIsRunning(true);
    setElapsedTime(0);
  };

  const handlePause = () => {
    if (!selectedProject || !selectedSubproject || !startTime) return;
    
    const queuedProject: QueuedProject = {
      id: Date.now().toString(),
      projectId: selectedProject.id,
      subprojectId: selectedSubproject.id,
      projectName: selectedProject.name,
      subprojectName: selectedSubproject.name,
      elapsedTime,
      startTime
    };
    
    onPauseProject(queuedProject);
    handleStop();
  };

  const handleStop = () => {
    if (!selectedProject || !selectedSubproject || !startTime) return;
    
    const endTime = new Date();
    const finalDuration = elapsedTime;
    
    if (finalDuration > 0) {
      // Store the log data and show description dialog
      setPendingLogData({
        duration: finalDuration,
        startTime,
        endTime
      });
      setShowDescriptionDialog(true);
    }
    
    setIsRunning(false);
    setElapsedTime(0);
    setStartTime(null);
    localStorage.removeItem('stopwatch-state');
  };

  const handleConfirmLog = () => {
    if (pendingLogData) {
      onLogTime(pendingLogData.duration, description, pendingLogData.startTime, pendingLogData.endTime);
    }
    setShowDescriptionDialog(false);
    setDescription('');
    setPendingLogData(null);
  };

  const handleCancelLog = () => {
    setShowDescriptionDialog(false);
    setDescription('');
    setPendingLogData(null);
  };

  const canStart = selectedProject && selectedSubproject && !isRunning;
  const canPauseOrStop = isRunning && startTime;

  const getProjectBackgroundStyle = () => {
    if (!colorCodedEnabled || !selectedProject) return {};
    return {
      backgroundColor: generateProjectColor(selectedProject.name),
      border: '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      padding: '16px',
      margin: '8px 0'
    };
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Project Info Display */}
      {selectedProject && selectedSubproject && (
        <div className="text-center space-y-2" style={getProjectBackgroundStyle()}>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {selectedProject.name}
          </div>
          <div className="text-md text-gray-600 dark:text-gray-400">
            {selectedSubproject.name}
          </div>
        </div>
      )}
      
      {/* Stopwatch Display */}
      <div className="text-center">
        <div className="text-6xl font-mono font-bold text-gray-800 dark:text-gray-200 mb-4">
          {formatTime(elapsedTime)}
        </div>
        
        {/* Control Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              disabled={!canStart}
              className="flex items-center gap-2 px-6 py-3 text-lg bg-green-600 hover:bg-green-700"
            >
              <Play className="h-5 w-5" />
              Start
            </Button>
          ) : (
            <Button
              onClick={handleStop}
              disabled={!canPauseOrStop}
              className="flex items-center gap-2 px-6 py-3 text-lg bg-red-600 hover:bg-red-700"
            >
              <Square className="h-5 w-5" />
              Stop
            </Button>
          )}
          
          <Button
            onClick={handlePause}
            disabled={!canPauseOrStop}
            variant="outline"
            className="flex items-center gap-2 px-6 py-3 text-lg"
          >
            <Pause className="h-5 w-5" />
            Pause
          </Button>
        </div>
      </div>

      {/* View Data Button */}
      <div className="mt-auto">
        <Button
          onClick={onSwitchToExcelView}
          variant="outline"
          className="w-full flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          View Time Data
        </Button>
      </div>

      {/* Status Message */}
      {!selectedProject || !selectedSubproject ? (
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
          Please select a project and subproject to start tracking time
        </div>
      ) : (
        <div className="text-center text-gray-600 dark:text-gray-300 text-sm">
          <Clock className="h-4 w-4 inline mr-1" />
          Ready to track time for {selectedProject.name} → {selectedSubproject.name}
        </div>
      )}

      {/* Description Dialog - Only shown after stopping */}
      <Dialog open={showDescriptionDialog} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Time Entry</DialogTitle>
          </DialogHeader>
          {pendingLogData && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="font-medium">{selectedProject?.name}</div>
                <div className="text-sm text-muted-foreground">{selectedSubproject?.name}</div>
                <div className="text-sm font-mono mt-1">Duration: {formatTime(pendingLogData.duration)}</div>
              </div>
              
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
                <Button onClick={handleConfirmLog} className="flex-1">
                  Save Entry
                </Button>
                <Button variant="outline" onClick={handleCancelLog}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StopwatchPanel;
