
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, Folder } from 'lucide-react';
import { Project, Subproject } from './TimeTracker';

interface ProjectCardProps {
  project: Project;
  onAddSubproject: (projectId: string, subprojectName: string) => void;
  onUpdateSubproject: (projectId: string, subprojectId: string, updates: Partial<Subproject>) => void;
  onLogTime: (projectId: string, subprojectId: string, duration: number, description: string) => void;
  formatTime: (seconds: number) => string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onAddSubproject,
  onUpdateSubproject,
  onLogTime,
  formatTime
}) => {
  const [showAddSubproject, setShowAddSubproject] = useState(false);
  const [newSubprojectName, setNewSubprojectName] = useState('');

  const handleAddSubproject = () => {
    if (newSubprojectName.trim()) {
      onAddSubproject(project.id, newSubprojectName);
      setNewSubprojectName('');
      setShowAddSubproject(false);
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-blue-600" />
            {project.name}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <Badge variant="secondary">{formatTime(project.totalTime)}</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subprojects List */}
        <div className="space-y-2">
          {project.subprojects.map(subproject => (
            <div key={subproject.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span className="text-sm font-medium">{subproject.name}</span>
              <Badge variant="outline">{formatTime(subproject.totalTime)}</Badge>
            </div>
          ))}
        </div>

        {/* Add Subproject */}
        {!showAddSubproject ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddSubproject(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Subproject
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              value={newSubprojectName}
              onChange={(e) => setNewSubprojectName(e.target.value)}
              placeholder="Subproject name..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddSubproject()}
            />
            <Button onClick={handleAddSubproject}>Add</Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddSubproject(false);
                setNewSubprojectName('');
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
