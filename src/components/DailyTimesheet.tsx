
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import { TimeLog } from './TimeTracker';

interface DailyTimesheetProps {
  timeLogs: TimeLog[];
  onUpdateTime: (logId: string, newDuration: number) => void;
}

interface DayGroup {
  date: string;
  displayDate: string;
  logs: TimeLog[];
  totalHours: number;
}

const DailyTimesheet: React.FC<DailyTimesheetProps> = ({ timeLogs, onUpdateTime }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingLog, setEditingLog] = useState<TimeLog | null>(null);
  const [editFormData, setEditFormData] = useState({
    duration: '',
    description: '',
    startTime: '',
    endTime: ''
  });

  const formatHours = (seconds: number) => {
    return (seconds / 3600).toFixed(2);
  };

  const parseHours = (hours: string) => {
    return parseFloat(hours) * 3600;
  };

  const getCurrentWeekDays = (): DayGroup[] => {
    const weekStart = new Date(currentDate);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    weekStart.setDate(diff);

    const days: DayGroup[] = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayLogs = timeLogs.filter(log => log.date === dateStr);
      const totalHours = dayLogs.reduce((sum, log) => sum + log.duration, 0);
      
      days.push({
        date: dateStr,
        displayDate: `${dayNames[i]} ${date.getDate()}/${date.getMonth() + 1}`,
        logs: dayLogs,
        totalHours
      });
    }
    
    return days;
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
      onUpdateTime(editingLog.id, newDuration);
      
      // Update the log in localStorage
      const savedLogs = localStorage.getItem('timesheet-logs');
      if (savedLogs) {
        const logs = JSON.parse(savedLogs);
        const updatedLogs = logs.map((log: TimeLog) =>
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
        localStorage.setItem('timesheet-logs', JSON.stringify(updatedLogs));
      }
      
      setEditingLog(null);
    }
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const prevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const weekDays = getCurrentWeekDays();
  const weekStart = new Date(currentDate);
  const day = weekStart.getDay();
  const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
  weekStart.setDate(diff);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 4);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={prevWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span>
                Week: {weekStart.toLocaleDateString()} to {weekEnd.toLocaleDateString()}
              </span>
              <Button variant="outline" size="sm" onClick={nextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {weekDays.map(day => (
              <div key={day.date} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{day.displayDate}</h3>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Hours</div>
                    <div className="text-xl font-bold">{formatHours(day.totalHours)}</div>
                  </div>
                </div>
                
                {day.logs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-sm">No time entries for this day</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {day.logs
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map(log => (
                        <div key={log.id} className="flex items-center justify-between p-3 border rounded bg-gray-50 dark:bg-gray-800">
                          <div className="flex-1 grid grid-cols-3 gap-4">
                            <div>
                              <div className="font-medium">{log.projectName}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">{log.subprojectName}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Time Period</div>
                              <div className="text-sm">{log.startTime} - {log.endTime}</div>
                            </div>
                            <div>
                              {log.description && (
                                <div className="text-sm">
                                  <div className="text-gray-500">Description</div>
                                  <div className="text-sm">{log.description}</div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="font-mono text-lg font-bold">{formatHours(log.duration)}h</div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditLog(log)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Log Dialog */}
      <Dialog open={!!editingLog} onOpenChange={() => setEditingLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Duration (hours)</Label>
              <Input
                value={editFormData.duration}
                onChange={(e) => setEditFormData({...editFormData, duration: e.target.value})}
                placeholder="e.g., 2.5"
                type="number"
                step="0.1"
              />
            </div>
            <div>
              <Label>Start Time</Label>
              <Input
                value={editFormData.startTime}
                onChange={(e) => setEditFormData({...editFormData, startTime: e.target.value})}
                placeholder="e.g., 09:00:00"
              />
            </div>
            <div>
              <Label>End Time</Label>
              <Input
                value={editFormData.endTime}
                onChange={(e) => setEditFormData({...editFormData, endTime: e.target.value})}
                placeholder="e.g., 11:30:00"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                placeholder="What did you work on?"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditingLog(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DailyTimesheet;
