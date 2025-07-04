
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
    
    // Reset the current timer without showing description dialog
    setIsRunning(false);
    setElapsedTime(0);
    setStartTime(null);
    localStorage.removeItem('stopwatch-state');
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
    <div className="space-y-6 flex flex-col h-full bg-white">
      {/* Project Info Display */}
      {selectedProject && selectedSubproject && (
        <div className="text-center space-y-3 px-6 py-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-lg font-medium text-gray-900">
            {selectedProject.name}
          </div>
          <div className="text-sm text-gray-600">
            {selectedSubproject.name}
          </div>
        </div>
      )}
      
      {/* Google Material Design Timer */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 px-6">
        {/* Time Display */}
        <div className="text-center">
          <div className="text-6xl font-mono font-light text-gray-900 tracking-wider mb-2">
            {formatTime(elapsedTime)}
          </div>
          {isRunning && (
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              disabled={!canStart}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-medium text-base shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Play className="h-5 w-5 mr-2" />
              Start
            </Button>
          ) : (
            <Button
              onClick={handleStop}
              disabled={!canPauseOrStop}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-medium text-base shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Square className="h-5 w-5 mr-2" />
              Stop
            </Button>
          )}
          
          <Button
            onClick={handlePause}
            disabled={!canPauseOrStop}
            variant="outline"
            className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-full font-medium text-base shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Pause className="h-5 w-5 mr-2" />
            Pause
          </Button>
        </div>
      </div>

      {/* View Time Data Button */}
      <div className="px-6 pb-6">
        <Button
          onClick={onSwitchToExcelView}
          variant="ghost"
          className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-50 py-3 rounded-lg font-medium transition-colors"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Time Data
        </Button>
      </div>

      {/* Status Message */}
      {!selectedProject || !selectedSubproject ? (
        <div className="text-center text-gray-500 text-sm bg-gray-50 p-4 rounded-lg mx-6 mb-6">
          Please select a project and subproject to start tracking time
        </div>
      ) : (
        <div className="text-center text-gray-600 text-sm bg-gray-50 p-3 rounded-lg mx-6 mb-6 flex items-center justify-center">
          <Clock className="h-4 w-4 mr-2" />
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
