
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Search } from 'lucide-react';
import { Project } from '../TimeTracker';
import { generateProjectColor } from '@/lib/projectColors';

interface SubprojectSearchProps {
  selectedProject: Project | undefined;
  selectedSubprojectId: string;
  colorCodedEnabled: boolean;
  onSubprojectSelect: (subprojectId: string) => void;
}

const SubprojectSearch: React.FC<SubprojectSearchProps> = ({
  selectedProject,
  selectedSubprojectId,
  colorCodedEnabled,
  onSubprojectSelect
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
                {subproject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SubprojectSearch;
