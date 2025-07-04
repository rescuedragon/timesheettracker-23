import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';
import { generateProjectColor } from '@/lib/projectColors';
interface FrequentProjectsProps {
  frequentProjects: string[];
  selectedProjectName?: string;
  colorCodedEnabled: boolean;
  onProjectSelect: (projectName: string) => void;
}
const FrequentProjects: React.FC<FrequentProjectsProps> = ({
  frequentProjects,
  selectedProjectName,
  colorCodedEnabled,
  onProjectSelect
}) => {
  const getProjectBackgroundStyle = (projectName: string) => {
    if (!colorCodedEnabled) return {};
    return {
      backgroundColor: generateProjectColor(projectName),
      border: '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '6px'
    };
  };
  if (frequentProjects.length === 0) {
    return null;
  }
  return <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm font-semibold text-black">
        <Clock className="h-4 w-4 text-black" />
        Frequently Used Projects (Top 5)
      </Label>
      <div className="grid grid-cols-2 gap-2">
         {frequentProjects.map(projectName => <Button key={projectName} variant={selectedProjectName === projectName ? "default" : "outline"} size="sm" onClick={() => onProjectSelect(projectName)} className={`text-left font-normal text-xs ${selectedProjectName === projectName ? 'text-white' : 'text-black'}`}>
             {projectName}
           </Button>)}
      </div>
    </div>;
};
export default FrequentProjects;