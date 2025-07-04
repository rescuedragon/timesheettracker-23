
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';
import { generateProjectColor } from '@/lib/projectColors';

interface FrequentSubprojectsProps {
  frequentSubprojects: string[];
  selectedSubprojectName?: string;
  selectedProjectName: string;
  colorCodedEnabled: boolean;
  onSubprojectSelect: (subprojectName: string) => void;
}

const FrequentSubprojects: React.FC<FrequentSubprojectsProps> = ({
  frequentSubprojects,
  selectedSubprojectName,
  selectedProjectName,
  colorCodedEnabled,
  onSubprojectSelect
}) => {
  const getProjectBackgroundStyle = (projectName: string) => {
    if (!colorCodedEnabled) return {};
    return {
      backgroundColor: generateProjectColor(projectName),
      border: '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '6px'
    };
  };

  if (frequentSubprojects.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm font-semibold text-black">
        <Clock className="h-4 w-4 text-black" />
        Frequently Used Subprojects (Top 5)
      </Label>
      <div className="flex flex-wrap gap-2">
        {frequentSubprojects.map(subprojectName => (
          <Button
            key={subprojectName}
            variant={selectedSubprojectName === subprojectName ? "default" : "outline"}
            size="sm"
            onClick={() => onSubprojectSelect(subprojectName)}
            className={`text-xs ${selectedSubprojectName === subprojectName ? 'text-white' : 'text-black'}`}
          >
            {subprojectName}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FrequentSubprojects;
