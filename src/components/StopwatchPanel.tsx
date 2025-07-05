
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
    <div className="space-y-6 flex flex-col h-full bg-gradient-modern">
      {/* Project Info Display */}
      {selectedProject && selectedSubproject && (
        <div className="text-center space-y-2 px-6 py-5 bg-card/50 rounded-xl border border-border/40 shadow-sm backdrop-blur-sm">
          <div className="text-lg font-medium text-foreground">
            {selectedProject.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {selectedSubproject.name}
          </div>
        </div>
      )}
      
      {/* Google Material Design Timer */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-10 px-6">
        {/* Time Display */}
        <div className="text-center">
          <div className="text-7xl font-light text-foreground tracking-wider mb-3 font-mono">
            {formatTime(elapsedTime)}
          </div>
          {isRunning && (
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              disabled={!canStart}
              className="bg-success hover:bg-success/90 text-white px-10 py-4 rounded-full font-medium text-lg shadow-md hover:shadow-lg transition-all duration-200 border-0"
            >
              <Play className="h-6 w-6 mr-3" />
              Start
            </Button>
          ) : (
            <Button
              onClick={handleStop}
              disabled={!canPauseOrStop}
              className="bg-destructive hover:bg-destructive/90 text-white px-10 py-4 rounded-full font-medium text-lg shadow-md hover:shadow-lg transition-all duration-200 border-0"
            >
              <Square className="h-6 w-6 mr-3" />
              Stop
            </Button>
          )}
          
          <Button
            onClick={handlePause}
            disabled={!canPauseOrStop}
            variant="outline"
            className="border-2 border-border text-foreground hover:bg-accent px-10 py-4 rounded-full font-medium text-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Pause className="h-6 w-6 mr-3" />
            Pause
          </Button>
        </div>
      </div>

      {/* View Time Data Button */}
      <div className="px-6 pb-6">
        <Button
          onClick={onSwitchToExcelView}
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground hover:bg-accent/50 py-4 rounded-xl font-medium transition-colors"
        >
          <Eye className="h-5 w-5 mr-3" />
          View Time Data
        </Button>
      </div>

      {/* Status Message */}
      {!selectedProject || !selectedSubproject ? (
        <div className="text-center text-muted-foreground text-sm bg-muted/50 p-5 rounded-xl mx-6 mb-6 border border-border/40">
          Please select a project and subproject to start tracking time
        </div>
      ) : (
        <div className="text-center text-muted-foreground text-sm bg-muted/30 p-4 rounded-xl mx-6 mb-6 flex items-center justify-center border border-border/40">
          <Clock className="h-4 w-4 mr-2" />
          Ready to track time for {selectedProject.name} → {selectedSubproject.name}
        </div>
      )}

      {/* Description Dialog - Only shown after stopping */}
      <Dialog open={showDescriptionDialog} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium">Log Time Entry</DialogTitle>
          </DialogHeader>
          {pendingLogData && (
            <div className="space-y-6">
              <div className="p-5 bg-muted/50 rounded-xl border border-border/40">
                <div className="font-medium text-foreground">{selectedProject?.name}</div>
                <div className="text-sm text-muted-foreground">{selectedSubproject?.name}</div>
                <div className="text-sm font-mono mt-2 text-foreground">Duration: {formatTime(pendingLogData.duration)}</div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-foreground">Description (optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What did you work on?"
                  rows={3}
                  className="mt-2 border-border/60 bg-input/50 focus:bg-background"
                />
              </div>
              
              <div className="flex gap-3">
                <Button onClick={handleConfirmLog} className="flex-1 py-3">
                  Save Entry
                </Button>
                <Button variant="outline" onClick={handleCancelLog} className="px-6 py-3">
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
