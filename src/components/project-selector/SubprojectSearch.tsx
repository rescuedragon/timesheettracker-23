
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Search, Edit, Trash2 } from 'lucide-react';
import { Project, Subproject } from '../TimeTracker';
import { generateProjectColor } from '@/lib/projectColors';

interface SubprojectSearchProps {
  selectedProject: Project | undefined;
  selectedSubprojectId: string;
  colorCodedEnabled: boolean;
  onSubprojectSelect: (subprojectId: string) => void;
  onEditSubproject: (subproject: Subproject) => void;
  onDeleteSubproject: (subprojectId: string) => void;
}

const SubprojectSearch: React.FC<SubprojectSearchProps> = ({
  selectedProject,
  selectedSubprojectId,
  colorCodedEnabled,
  onSubprojectSelect,
  onEditSubproject,
  onDeleteSubproject
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const selectedSubproject = selectedProject?.subprojects.find(s => s.id === selectedSubprojectId);
  
  const filteredSubprojects = selectedProject?.subprojects.filter(subproject =>
    subproject.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getProjectBackgroundStyle = (projectName: string) => {
    if (!colorCodedEnabled) return {};
    return {
      backgroundColor: generateProjectColor(projectName),
      border: '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '6px'
    };
  };

  const handleSubprojectSelect = (subprojectId: string) => {
    onSubprojectSelect(subprojectId);
    setSearchTerm('');
  };

  return (
    <div className="space-y-2 flex-1">
      <Label className="flex items-center gap-2">
        <Target className="h-4 w-4" />
        Subproject
      </Label>
      <div 
        className="relative" 
        style={selectedProject && selectedSubproject ? getProjectBackgroundStyle(selectedProject.name) : {}}
      >
        <Select 
          value={selectedSubprojectId} 
          onValueChange={handleSubprojectSelect}
          disabled={!selectedProject}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a subproject..." />
          </SelectTrigger>
          <SelectContent>
            {selectedProject && (
              <div className="flex items-center px-3 pb-2">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Input
                  placeholder="Search subprojects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 w-full border-0 p-0 focus:ring-0 focus:outline-none"
                />
              </div>
            )}
            {filteredSubprojects.map(subproject => (
              <SelectItem key={subproject.id} value={subproject.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{subproject.name}</span>
                  <div className="flex gap-1 ml-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditSubproject(subproject);
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSubproject(subproject.id);
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SubprojectSearch;
