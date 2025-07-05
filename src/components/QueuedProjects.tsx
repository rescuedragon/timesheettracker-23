
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Play, Square, Save } from 'lucide-react';
import { generateProjectColor, isColorCodedProjectsEnabled } from '@/lib/projectColors';

export interface QueuedProject {
  id: string;
  projectId: string;
  subprojectId: string;
  projectName: string;
  subprojectName: string;
  elapsedTime: number;
  startTime: Date;
}

interface QueuedProjectsProps {
  queuedProjects: QueuedProject[];
  onResumeProject: (queuedProject: QueuedProject) => void;
  onStopProject: (queuedProjectId: string) => void;
  onLogTime?: (duration: number, description: string, startTime: Date, endTime: Date, projectId: string, subprojectId: string) => void;
}

const QueuedProjects: React.FC<QueuedProjectsProps> = ({
  queuedProjects,
  onResumeProject,
  onStopProject,
  onLogTime
}) => {
  const [stoppingProject, setStoppingProject] = useState<QueuedProject | null>(null);
  const [description, setDescription] = useState('');
  const [colorCodedEnabled, setColorCodedEnabled] = useState(false);

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

  const getProjectBackgroundStyle = (projectName: string) => {
    if (!colorCodedEnabled) return {};
    return {
      backgroundColor: generateProjectColor(projectName)
    };
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopClick = (project: QueuedProject) => {
    setStoppingProject(project);
  };

  const handleConfirmStop = () => {
    if (stoppingProject && onLogTime) {
      const endTime = new Date();
      onLogTime(
        stoppingProject.elapsedTime,
        description,
        stoppingProject.startTime,
        endTime,
        stoppingProject.projectId,
        stoppingProject.subprojectId
      );
      onStopProject(stoppingProject.id);
    } else {
      // If no onLogTime callback, just stop the project
      if (stoppingProject) {
        onStopProject(stoppingProject.id);
      }
    }
    setStoppingProject(null);
    setDescription('');
  };

  const handleCancelStop = () => {
    setStoppingProject(null);
    setDescription('');
  };

  if (queuedProjects.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="mt-8 shadow-lg border-0 bg-gradient-secondary-modern">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-medium text-foreground">Queued Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {queuedProjects.map(project => (
              <div 
                key={project.id} 
                className="flex items-center justify-between p-5 border border-border/40 rounded-xl bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                style={getProjectBackgroundStyle(project.projectName)}
              >
                <div className="flex-1">
                  <div className="font-medium text-foreground">{project.projectName}</div>
                  <div className="text-sm text-muted-foreground mt-1">{project.subprojectName}</div>
                  <div className="text-sm text-muted-foreground/80 mt-1">Time: {formatTime(project.elapsedTime)}</div>
                </div>
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    onClick={() => onResumeProject(project)}
                    className="bg-success hover:bg-success/90 text-white px-4 py-2 shadow-sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStopClick(project)}
                    className="border-border/60 hover:bg-accent/50 px-4 py-2 shadow-sm"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stop Confirmation Dialog */}
      <Dialog open={!!stoppingProject} onOpenChange={(open) => !open && handleCancelStop()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium">Log Time Entry</DialogTitle>
          </DialogHeader>
          {stoppingProject && (
            <div className="space-y-6">
              <div className="p-5 bg-muted/50 rounded-xl border border-border/40">
                <div className="font-medium text-foreground">{stoppingProject.projectName}</div>
                <div className="text-sm text-muted-foreground">{stoppingProject.subprojectName}</div>
                <div className="text-sm font-mono mt-2 text-foreground">Duration: {formatTime(stoppingProject.elapsedTime)}</div>
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
                <Button onClick={handleConfirmStop} className="flex-1 py-3">
                  <Save className="h-4 w-4 mr-2" />
                  Save & Stop
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancelStop}
                  className="px-6 py-3"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QueuedProjects;
