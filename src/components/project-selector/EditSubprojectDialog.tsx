
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface EditSubprojectDialogProps {
  editingSubproject: {id: string, name: string, projectId: string} | null;
  editSubprojectName: string;
  onEditSubprojectNameChange: (name: string) => void;
  onSaveEdit: () => void;
  onCancel: () => void;
}

const EditSubprojectDialog: React.FC<EditSubprojectDialogProps> = ({
  editingSubproject,
  editSubprojectName,
  onEditSubprojectNameChange,
  onSaveEdit,
  onCancel
}) => {
  return (
    <Dialog open={!!editingSubproject} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Subproject</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Subproject Name</Label>
            <Input
              value={editSubprojectName}
              onChange={(e) => onEditSubprojectNameChange(e.target.value)}
              placeholder="Enter subproject name"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onSaveEdit} className="flex-1">
              Save Changes
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubprojectDialog;
