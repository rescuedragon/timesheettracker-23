
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Search, Edit, Trash2 } from 'lucide-react';
import { Project } from '../TimeTracker';
import { generateProjectColor } from '@/lib/projectColors';
import EditSubprojectDialog from './EditSubprojectDialog';

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
  const [editingSubproject, setEditingSubproject] = useState<{id: string, name: string, projectId: string} | null>(null);
  const [editSubprojectName, setEditSubprojectName] = useState('');

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

  const handleEditSubproject = (subproject: { id: string; name: string }) => {
    if (selectedProject) {
      setEditingSubproject({
        id: subproject.id,
        name: subproject.name,
        projectId: selectedProject.id
      });
      setEditSubprojectName(subproject.name);
    }
  };

  const handleSaveEdit = () => {
    if (editingSubproject && editSubprojectName.trim()) {
      // Dispatch custom event to update subproject
      window.dispatchEvent(new CustomEvent('update-subproject', {
        detail: {
          projectId: editingSubproject.projectId,
          subprojectId: editingSubproject.id,
          newName: editSubprojectName.trim()
        }
      }));
      setEditingSubproject(null);
      setEditSubprojectName('');
    }
  };

  const handleDeleteSubproject = (subprojectId: string) => {
    if (selectedProject && confirm('Are you sure you want to delete this subproject?')) {
      // Dispatch custom event to delete subproject
      window.dispatchEvent(new CustomEvent('delete-subproject', {
        detail: {
          projectId: selectedProject.id,
          subprojectId: subprojectId
        }
      }));
    }
  };

  const handleCancelEdit = () => {
    setEditingSubproject(null);
    setEditSubprojectName('');
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
              <div key={subproject.id} className="flex items-center justify-between group">
                <SelectItem value={subproject.id} className="flex-1">
                  {subproject.name}
                </SelectItem>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSubproject(subproject);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSubproject(subproject.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <EditSubprojectDialog
        editingSubproject={editingSubproject}
        editSubprojectName={editSubprojectName}
        onEditSubprojectNameChange={setEditSubprojectName}
        onSaveEdit={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
    </div>
  );
};

export default SubprojectSearch;
