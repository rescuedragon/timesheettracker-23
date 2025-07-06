import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileSpreadsheet, Calendar, Edit, Save, X, Trash2, Plus, Group } from 'lucide-react';
import ProgressBar from './ProgressBar';
import { TimeLog } from './TimeTracker';
import WeeklyTimesheet from './WeeklyTimesheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateProjectColor, isColorCodedProjectsEnabled } from '@/lib/projectColors';

const ExcelView: React.FC = () => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [editingLog, setEditingLog] = useState<TimeLog | null>(null);
  const [editFormData, setEditFormData] = useState({
    duration: '',
    description: '',
    startTime: '',
    endTime: ''
  });
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    projectId: '',
    subprojectId: '',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    description: '',
    startTime: '',
    endTime: ''
  });
  const [colorCodedEnabled, setColorCodedEnabled] = useState(false);
  const [groupByProject, setGroupByProject] = useState(false); // New state for grouping

  // Progress bar settings
  const [progressBarEnabled, setProgressBarEnabled] = useState(() => {
    const saved = localStorage.getItem('progressbar-enabled');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [progressBarColor, setProgressBarColor] = useState(() => {
    const saved = localStorage.getItem('progressbar-color');
    return saved || '#10b981';
  });

  useEffect(() => {
    setColorCodedEnabled(isColorCodedProjectsEnabled());
    
    const handleStorageChange = () => {
      setColorCodedEnabled(isColorCodedProjectsEnabled());
      
      // Update progress bar settings
      const savedEnabled = localStorage.getItem('progressbar-enabled');
      const savedColor = localStorage.getItem('progressbar-color');
      
      setProgressBarEnabled(savedEnabled ? JSON.parse(savedEnabled) : false);
      setProgressBarColor(savedColor || '#10b981');
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('settings-changed', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settings-changed', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const savedTimeLogs = localStorage.getItem('timesheet-logs');
    const savedProjects = localStorage.getItem('timesheet-projects');
    
    if (savedTimeLogs) {
      setTimeLogs(JSON.parse(savedTimeLogs));
    }
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  // Filter time logs to only show entries for projects that still exist
  const filteredTimeLogs = timeLogs.filter(log => 
    projects.some(project => 
      project.id === log.projectId && 
      project.subprojects.some((sub: any) => sub.id === log.subprojectId)
    )
  );

  // Get current day's total time
  const getCurrentDayTotal = () => {
    const today = new Date().toISOString().split('T')[0];
    return filteredTimeLogs
      .filter(log => log.date === today)
      .reduce((total, log) => total + log.duration, 0);
  };

  // Group time logs by day
  const getGroupedTimeLogs = () => {
    const grouped: { [key: string]: { date: string; displayDate: string; logs: TimeLog[]; totalHours: number } } = {};
    
    filteredTimeLogs.forEach(log => {
      const date = log.date;
      if (!grouped[date]) {
        const logDate = new Date(date);
        const today = new Date();
        const isToday = logDate.toDateString() === today.toDateString();
        const isYesterday = logDate.toDateString() === new Date(today.getTime() - 24 * 60 * 60 * 1000).toDateString();
        
        let displayDate = logDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        if (isToday) displayDate = `Today - ${displayDate}`;
        else if (isYesterday) displayDate = `Yesterday - ${displayDate}`;
        
        grouped[date] = {
          date,
          displayDate,
          logs: [],
          totalHours: 0
        };
      }
      grouped[date].logs.push(log);
      grouped[date].totalHours += log.duration;
    });
    
    return Object.values(grouped).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Group logs by project within a day
  const groupLogsByProject = (logs: TimeLog[]) => {
    const grouped: { [key: string]: { projectName: string; logs: TimeLog[]; totalHours: number } } = {};
    
    logs.forEach(log => {
      if (!grouped[log.projectName]) {
        grouped[log.projectName] = {
          projectName: log.projectName,
          logs: [],
          totalHours: 0
        };
      }
      grouped[log.projectName].logs.push(log);
      grouped[log.projectName].totalHours += log.duration;
    });
    
    return Object.values(grouped);
  };

  const getRowBackgroundStyle = (projectName: string) => {
    if (!colorCodedEnabled) return {};
    return {
      backgroundColor: generateProjectColor(projectName)
    };
  };

  const handleUpdateTime = (logId: string, newDuration: number) => {
    const updatedLogs = timeLogs.map(log => 
      log.id === logId ? { ...log, duration: newDuration } : log
    );
    setTimeLogs(updatedLogs);
    localStorage.setItem('timesheet-logs', JSON.stringify(updatedLogs));
  };

  const handleEditLog = (log: TimeLog) => {
    setEditingLog(log);
    setEditFormData({
      duration: formatHours(log.duration),
      description: log.description,
      startTime: log.startTime,
      endTime: log.endTime
    });
  };

  const handleSaveEdit = () => {
    if (editingLog && editFormData.duration) {
      const newDuration = parseHours(editFormData.duration);
      
      const updatedLogs = timeLogs.map(log =>
        log.id === editingLog.id
          ? {
              ...log,
              duration: newDuration,
              description: editFormData.description,
              startTime: editFormData.startTime,
              endTime: editFormData.endTime
            }
          : log
      );
      
      setTimeLogs(updatedLogs);
      localStorage.setItem('timesheet-logs', JSON.stringify(updatedLogs));
      setEditingLog(null);
    }
  };

  const handleDeleteLog = (logId: string) => {
    const updatedLogs = timeLogs.filter(log => log.id !== logId);
    setTimeLogs(updatedLogs);
    localStorage.setItem('timesheet-logs', JSON.stringify(updatedLogs));
  };

  const handleAddEntry = () => {
    if (addFormData.projectId && addFormData.subprojectId && addFormData.duration) {
      const selectedProject = projects.find(p => p.id === addFormData.projectId);
      const selectedSubproject = selectedProject?.subprojects.find((s: any) => s.id === addFormData.subprojectId);
      
      const newLog: TimeLog = {
        id: Date.now().toString(),
        projectId: addFormData.projectId,
        subprojectId: addFormData.subprojectId,
        projectName: selectedProject?.name || '',
        subprojectName: selectedSubproject?.name || '',
        duration: parseHours(addFormData.duration),
        description: addFormData.description,
        date: addFormData.date,
        startTime: addFormData.startTime,
        endTime: addFormData.endTime
      };

      const updatedLogs = [...timeLogs, newLog];
      setTimeLogs(updatedLogs);
      localStorage.setItem('timesheet-logs', JSON.stringify(updatedLogs));
      
      setAddFormData({
        projectId: '',
        subprojectId: '',
        date: new Date().toISOString().split('T')[0],
        duration: '',
        description: '',
        startTime: '',
        endTime: ''
      });
      setIsAddEntryOpen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatHours = (seconds: number) => {
    return (seconds / 3600).toFixed(1);
  };

  const parseHours = (hours: string) => {
    return parseFloat(hours) * 3600;
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Project', 'Subproject', 'Start Time', 'End Time', 'Duration', 'Description'];
    const csvData = [
      headers.join(','),
      ...filteredTimeLogs.map(log => [
        log.date,
        `"${log.projectName}"`,
        `"${log.subprojectName}"`,
        log.startTime,
        log.endTime,
        formatTime(log.duration),
        `"${log.description}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheet-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const currentDayTotal = getCurrentDayTotal();
  const groupedLogs = getGroupedTimeLogs();

  return (
    <div className="space-y-6">
      <ProgressBar
        currentHours={currentDayTotal}
        targetHours={8}
        color={progressBarColor}
        enabled={progressBarEnabled}
      />

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
          <TabsTrigger value="weekly" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
            <Calendar className="h-4 w-4" />
            Weekly View
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
            <FileSpreadsheet className="h-4 w-4" />
            Daily View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekly">
          <WeeklyTimesheet timeLogs={filteredTimeLogs} onUpdateTime={handleUpdateTime} />
        </TabsContent>
        
        <TabsContent value="detailed">
          <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Time Entries
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setGroupByProject(!groupByProject)} 
                    variant={groupByProject ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Group className="h-4 w-4" />
                    Group by project
                  </Button>
                  <Button onClick={exportToCSV} variant="outline" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-900">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {groupedLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="mb-4 text-lg">No time entries yet</div>
                    <Button onClick={() => setIsAddEntryOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add your first entry
                    </Button>
                  </div>
                ) : (
                  groupedLogs.map(dayGroup => (
                    <div key={dayGroup.date} className="border rounded-xl p-5 bg-white dark:bg-gray-800 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-3 border-b">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-0">
                          {dayGroup.displayDate}
                        </h3>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Daily Total</div>
                            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                              {formatHours(dayGroup.totalHours)} hrs
                            </div>
                          </div>
                          <Button 
                            onClick={() => setIsAddEntryOpen(true)}
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-800/50"
                          >
                            <Plus className="h-4 w-4" />
                            Add entry
                          </Button>
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
                          <thead>
                            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900">
                              <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project</th>
                              <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subproject</th>
                              <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Start</th>
                              <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">End</th>
                              <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration (hrs)</th>
                              <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                              <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupByProject ? (
                              groupLogsByProject(dayGroup.logs).map(projectGroup => (
                                <React.Fragment key={projectGroup.projectName}>
                                  <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <td 
                                      colSpan={7} 
                                      className="px-4 py-2 font-bold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                                      style={getRowBackgroundStyle(projectGroup.projectName)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span>{projectGroup.projectName}</span>
                                        <span className="text-sm font-normal">
                                          Total: {formatHours(projectGroup.totalHours)} hrs
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                  {projectGroup.logs
                                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                    .map(log => (
                                      <tr 
                                        key={log.id} 
                                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-0"
                                        style={getRowBackgroundStyle(log.projectName)}
                                      >
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                          {log.projectName}
                                        </td>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                          {log.subprojectName}
                                        </td>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                          {log.startTime}
                                        </td>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                          {log.endTime}
                                        </td>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm">
                                          <span className="font-mono font-bold text-green-700 dark:text-green-400">
                                            {formatHours(log.duration)}
                                          </span>
                                        </td>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                                          {log.description || '-'}
                                        </td>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-right">
                                          <div className="flex justify-end gap-2">
                                            <Button
                                              onClick={() => handleEditLog(log)}
                                              size="sm"
                                              variant="ghost"
                                              className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                                            >
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              onClick={() => handleDeleteLog(log.id)}
                                              size="sm"
                                              variant="ghost"
                                              className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/50"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                </React.Fragment>
                              ))
                            ) : (
                              dayGroup.logs
                                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                .map(log => (
                                  <tr 
                                    key={log.id} 
                                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-0"
                                    style={getRowBackgroundStyle(log.projectName)}
                                  >
                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                      {log.projectName}
                                    </td>
                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                      {log.subprojectName}
                                    </td>
                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                      {log.startTime}
                                    </td>
                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                      {log.endTime}
                                    </td>
                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm">
                                      <span className="font-mono font-bold text-green-700 dark:text-green-400">
                                        {formatHours(log.duration)}
                                      </span>
                                    </td>
                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                                      {log.description || '-'}
                                    </td>
                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-right">
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          onClick={() => handleEditLog(log)}
                                          size="sm"
                                          variant="ghost"
                                          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          onClick={() => handleDeleteLog(log.id)}
                                          size="sm"
                                          variant="ghost"
                                          className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/50"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Log Dialog */}
      <Dialog open={!!editingLog} onOpenChange={() => setEditingLog(null)}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Time Entry
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Start Time</Label>
                <Input
                  value={editFormData.startTime}
                  onChange={(e) => setEditFormData({...editFormData, startTime: e.target.value})}
                  placeholder="09:00:00"
                />
              </div>
              <div className="space-y-1">
                <Label>End Time</Label>
                <Input
                  value={editFormData.endTime}
                  onChange={(e) => setEditFormData({...editFormData, endTime: e.target.value})}
                  placeholder="11:30:00"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label>Duration (hours)</Label>
              <Input
                value={editFormData.duration}
                onChange={(e) => setEditFormData({...editFormData, duration: e.target.value})}
                placeholder="e.g., 2.5"
                type="number"
                step="0.1"
              />
            </div>
            
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                placeholder="What did you work on?"
                rows={3}
              />
            </div>
            
            <div className="flex gap-2 justify-end pt-4">
              <Button 
                variant="outline" 
                onClick={() => setEditingLog(null)}
                className="px-4"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEdit}
                className="px-4 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Entry Dialog */}
      <Dialog open={isAddEntryOpen} onOpenChange={setIsAddEntryOpen}>
        <DialogContent className="sm:max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Time Entry
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Project</Label>
                <Select 
                  value={addFormData.projectId} 
                  onValueChange={(value) => setAddFormData({...addFormData, projectId: value, subprojectId: ''})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Subproject</Label>
                <Select 
                  value={addFormData.subprojectId} 
                  onValueChange={(value) => setAddFormData({...addFormData, subprojectId: value})}
                  disabled={!addFormData.projectId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subproject" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects
                      .find(p => p.id === addFormData.projectId)
                      ?.subprojects.map((sub: any) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      )) || []}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={addFormData.date}
                  onChange={(e) => setAddFormData({...addFormData, date: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <Label>Duration (hours)</Label>
                <Input
                  value={addFormData.duration}
                  onChange={(e) => setAddFormData({...addFormData, duration: e.target.value})}
                  placeholder="e.g., 2.5"
                  type="number"
                  step="0.1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Start Time</Label>
                <Input
                  value={addFormData.startTime}
                  onChange={(e) => setAddFormData({...addFormData, startTime: e.target.value})}
                  placeholder="09:00:00"
                />
              </div>
              <div className="space-y-1">
                <Label>End Time</Label>
                <Input
                  value={addFormData.endTime}
                  onChange={(e) => setAddFormData({...addFormData, endTime: e.target.value})}
                  placeholder="11:30:00"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label>Description (optional)</Label>
              <Textarea
                value={addFormData.description}
                onChange={(e) => setAddFormData({...addFormData, description: e.target.value})}
                placeholder="What did you work on?"
                rows={3}
              />
            </div>
            
            <div className="flex gap-2 justify-end pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsAddEntryOpen(false)}
                className="px-4"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddEntry}
                className="px-4 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExcelView;