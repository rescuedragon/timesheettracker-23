import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, Plus, Trash2, Edit, Save, X } from 'lucide-react';

const Settings: React.FC = () => {
  const [newProjectName, setNewProjectName] = useState('');
  const [newSubprojectName, setNewSubprojectName] = useState('');
  const [selectedProjectForSub, setSelectedProjectForSub] = useState('');
  const [newHoliday, setNewHoliday] = useState({ name: '', date: '' });
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingSubproject, setEditingSubproject] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Progress bar settings
  const [progressBarEnabled, setProgressBarEnabled] = useState(() => {
    const saved = localStorage.getItem('progressbar-enabled');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [progressBarColor, setProgressBarColor] = useState(() => {
    const saved = localStorage.getItem('progressbar-color');
    return saved || '#10b981';
  });

  // Color-coded projects settings
  const [colorCodedProjectsEnabled, setColorCodedProjectsEnabled] = useState(() => {
    const saved = localStorage.getItem('color-coded-projects-enabled');
    return saved ? JSON.parse(saved) : false;
  });

  // Frequent subprojects settings
  const [frequentSubprojectsEnabled, setFrequentSubprojectsEnabled] = useState(() => {
    const saved = localStorage.getItem('frequent-subprojects-enabled');
    return saved ? JSON.parse(saved) : false;
  });

  // Get projects from localStorage
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('timesheet-projects');
    return saved ? JSON.parse(saved) : [];
  });

  // Get holidays from localStorage
  const [holidays, setHolidays] = useState(() => {
    const saved = localStorage.getItem('timesheet-holidays');
    return saved ? JSON.parse(saved) : [];
  });

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      const newProject = {
        id: Date.now().toString(),
        name: newProjectName,
        subprojects: [],
        totalTime: 0
      };
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      localStorage.setItem('timesheet-projects', JSON.stringify(updatedProjects));
      setNewProjectName('');
    }
  };

  const handleAddSubproject = () => {
    if (newSubprojectName.trim() && selectedProjectForSub) {
      const updatedProjects = projects.map(project => 
        project.id === selectedProjectForSub 
          ? {
              ...project,
              subprojects: [...project.subprojects, {
                id: `${Date.now()}-sub`,
                name: newSubprojectName,
                totalTime: 0
              }]
            }
          : project
      );
      setProjects(updatedProjects);
      localStorage.setItem('timesheet-projects', JSON.stringify(updatedProjects));
      setNewSubprojectName('');
    }
  };

  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem('timesheet-projects', JSON.stringify(updatedProjects));
    
    // Also remove associated time logs
    const savedTimeLogs = localStorage.getItem('timesheet-logs');
    if (savedTimeLogs) {
      const timeLogs = JSON.parse(savedTimeLogs);
      const filteredLogs = timeLogs.filter((log: any) => log.projectId !== projectId);
      localStorage.setItem('timesheet-logs', JSON.stringify(filteredLogs));
    }
  };

  const handleEditProject = (projectId: string, newName: string) => {
    const updatedProjects = projects.map(project => 
      project.id === projectId 
        ? { ...project, name: newName }
        : project
    );
    setProjects(updatedProjects);
    localStorage.setItem('timesheet-projects', JSON.stringify(updatedProjects));
    
    // Update project names in time logs
    const savedTimeLogs = localStorage.getItem('timesheet-logs');
    if (savedTimeLogs) {
      const timeLogs = JSON.parse(savedTimeLogs);
      const updatedLogs = timeLogs.map((log: any) => 
        log.projectId === projectId 
          ? { ...log, projectName: newName }
          : log
      );
      localStorage.setItem('timesheet-logs', JSON.stringify(updatedLogs));
    }
    
    setEditingProject(null);
    setEditingName('');
  };

  const handleDeleteSubproject = (projectId: string, subprojectId: string) => {
    const updatedProjects = projects.map(project => 
      project.id === projectId 
        ? {
            ...project,
            subprojects: project.subprojects.filter((sub: any) => sub.id !== subprojectId)
          }
        : project
    );
    setProjects(updatedProjects);
    localStorage.setItem('timesheet-projects', JSON.stringify(updatedProjects));
    
    // Also remove associated time logs
    const savedTimeLogs = localStorage.getItem('timesheet-logs');
    if (savedTimeLogs) {
      const timeLogs = JSON.parse(savedTimeLogs);
      const filteredLogs = timeLogs.filter((log: any) => log.subprojectId !== subprojectId);
      localStorage.setItem('timesheet-logs', JSON.stringify(filteredLogs));
    }
  };

  const handleEditSubproject = (projectId: string, subprojectId: string, newName: string) => {
    const updatedProjects = projects.map(project => 
      project.id === projectId 
        ? {
            ...project,
            subprojects: project.subprojects.map((sub: any) => 
              sub.id === subprojectId 
                ? { ...sub, name: newName }
                : sub
            )
          }
        : project
    );
    setProjects(updatedProjects);
    localStorage.setItem('timesheet-projects', JSON.stringify(updatedProjects));
    
    // Update subproject names in time logs
    const savedTimeLogs = localStorage.getItem('timesheet-logs');
    if (savedTimeLogs) {
      const timeLogs = JSON.parse(savedTimeLogs);
      const updatedLogs = timeLogs.map((log: any) => 
        log.subprojectId === subprojectId 
          ? { ...log, subprojectName: newName }
          : log
      );
      localStorage.setItem('timesheet-logs', JSON.stringify(updatedLogs));
    }
    
    setEditingSubproject(null);
    setEditingName('');
  };

  const handleAddHoliday = () => {
    if (newHoliday.name.trim() && newHoliday.date) {
      const updatedHolidays = [...holidays, { ...newHoliday, id: Date.now().toString() }];
      setHolidays(updatedHolidays);
      localStorage.setItem('timesheet-holidays', JSON.stringify(updatedHolidays));
      setNewHoliday({ name: '', date: '' });
    }
  };

  const handleDeleteHoliday = (holidayId: string) => {
    const updatedHolidays = holidays.filter(h => h.id !== holidayId);
    setHolidays(updatedHolidays);
    localStorage.setItem('timesheet-holidays', JSON.stringify(updatedHolidays));
  };

  const handleProgressBarToggle = (enabled: boolean) => {
    setProgressBarEnabled(enabled);
    localStorage.setItem('progressbar-enabled', JSON.stringify(enabled));
  };

  const handleProgressBarColorChange = (color: string) => {
    setProgressBarColor(color);
    localStorage.setItem('progressbar-color', color);
  };

  const handleColorCodedProjectsToggle = (enabled: boolean) => {
    setColorCodedProjectsEnabled(enabled);
    localStorage.setItem('color-coded-projects-enabled', JSON.stringify(enabled));
    window.dispatchEvent(new CustomEvent('settings-changed'));
  };

  const handleFrequentSubprojectsToggle = (enabled: boolean) => {
    setFrequentSubprojectsEnabled(enabled);
    localStorage.setItem('frequent-subprojects-enabled', JSON.stringify(enabled));
    window.dispatchEvent(new CustomEvent('settings-changed'));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="fixed top-4 right-4 z-50">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="holidays">Holidays</TabsTrigger>
            <TabsTrigger value="user">User Access</TabsTrigger>
            <TabsTrigger value="manager">Manager Access</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Add New Project</Label>
                <div className="flex gap-2">
                  <Input
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Enter project name..."
                  />
                  <Button onClick={handleAddProject}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Add New Subproject</Label>
                <div className="flex gap-2">
                  <select 
                    value={selectedProjectForSub}
                    onChange={(e) => setSelectedProjectForSub(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    value={newSubprojectName}
                    onChange={(e) => setNewSubprojectName(e.target.value)}
                    placeholder="Enter subproject name..."
                  />
                  <Button onClick={handleAddSubproject}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Existing Projects</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {projects.map(project => (
                    <div key={project.id} className="border rounded p-3">
                      <div className="flex items-center justify-between">
                        {editingProject === project.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="flex-1"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => handleEditProject(project.id, editingName)}
                              disabled={!editingName.trim()}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {setEditingProject(null); setEditingName('')}}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <h4 className="font-medium">{project.name}</h4>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {setEditingProject(project.id); setEditingName(project.name)}}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteProject(project.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                      {project.subprojects.length > 0 && (
                        <div className="mt-3 pl-4 border-l-2 border-gray-200">
                          <Label className="text-xs text-muted-foreground mb-2 block">Subprojects:</Label>
                          <div className="space-y-2">
                            {project.subprojects.map((sub: any) => (
                              <div key={sub.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                {editingSubproject === sub.id ? (
                                  <div className="flex items-center gap-2 flex-1">
                                    <Input
                                      value={editingName}
                                      onChange={(e) => setEditingName(e.target.value)}
                                      className="flex-1 h-8"
                                      autoFocus
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => handleEditSubproject(project.id, sub.id, editingName)}
                                      disabled={!editingName.trim()}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Save className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {setEditingSubproject(null); setEditingName('')}}
                                      className="h-8 w-8 p-0"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <span className="text-sm">• {sub.name}</span>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {setEditingSubproject(sub.id); setEditingName(sub.name)}}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteSubproject(project.id, sub.id)}
                                        className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="holidays" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Add New Holiday</Label>
                <div className="flex gap-2">
                  <Input
                    value={newHoliday.name}
                    onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                    placeholder="Holiday name..."
                  />
                  <Input
                    type="date"
                    value={newHoliday.date}
                    onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                  />
                  <Button onClick={handleAddHoliday}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Existing Holidays</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {holidays.map(holiday => (
                    <div key={holiday.id} className="border rounded p-3 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{holiday.name}</h4>
                        <p className="text-sm text-muted-foreground">{holiday.date}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteHoliday(holiday.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="user" className="space-y-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Experimental Features</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-base">Animated Progress Bar</Label>
                      <p className="text-sm text-muted-foreground">
                        Turn the "Total Time Today" panel into an animated progress bar with 8-hour target
                      </p>
                    </div>
                    <Switch
                      checked={progressBarEnabled}
                      onCheckedChange={handleProgressBarToggle}
                    />
                  </div>
                  
                  {progressBarEnabled && (
                    <div className="ml-4 p-4 bg-muted rounded-lg space-y-3">
                      <div className="space-y-2">
                        <Label>Progress Bar Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={progressBarColor}
                            onChange={(e) => handleProgressBarColorChange(e.target.value)}
                            className="w-16 h-10"
                          />
                          <Input
                            value={progressBarColor}
                            onChange={(e) => handleProgressBarColorChange(e.target.value)}
                            placeholder="#10b981"
                            className="font-mono"
                          />
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        Preview: The progress bar will fill as you log time entries throughout the day.
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-base">Frequent Subprojects</Label>
                      <p className="text-sm text-muted-foreground">
                        Show frequently used subprojects as quick selection buttons in the Time Tracker
                      </p>
                    </div>
                    <Switch
                      checked={frequentSubprojectsEnabled}
                      onCheckedChange={handleFrequentSubprojectsToggle}
                    />
                  </div>
                  
                  {frequentSubprojectsEnabled && (
                    <div className="ml-4 p-4 bg-muted rounded-lg space-y-3">
                      <div className="text-sm text-muted-foreground">
                        Preview: Quick access buttons for your top 5 most frequently used subprojects will appear below the subproject selector.
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-base">Color-Coded Projects</Label>
                      <p className="text-sm text-muted-foreground">
                        Highlight project names and rows with consistent colors to easily identify project groups
                      </p>
                    </div>
                    <Switch
                      checked={colorCodedProjectsEnabled}
                      onCheckedChange={handleColorCodedProjectsToggle}
                    />
                  </div>
                  
                  {colorCodedProjectsEnabled && (
                    <div className="ml-4 p-4 bg-muted rounded-lg space-y-3">
                      <div className="text-sm text-muted-foreground">
                        Preview: Each project and its subprojects will be highlighted with the same soft color across all views for easy identification.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="manager" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Manager access settings will be implemented here.
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
