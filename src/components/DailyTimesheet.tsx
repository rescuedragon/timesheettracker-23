
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Calendar, Clock, FileSpreadsheet } from 'lucide-react';
import { TimeLog } from './TimeTracker';
import { format, startOfDay, endOfDay, addDays, subDays } from 'date-fns';

interface DailyTimesheetProps {
  timeLogs: TimeLog[];
  onSwitchToWeeklyView: () => void;
}

const DailyTimesheet: React.FC<DailyTimesheetProps> = ({ timeLogs, onSwitchToWeeklyView }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedProject, setSelectedProject] = useState<string>('all');

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDuration = (seconds: number) => {
    const hours = (seconds / 3600).toFixed(2);
    return `${hours}h`;
  };

  const dayStart = startOfDay(selectedDate);
  const dayEnd = endOfDay(selectedDate);

  const dailyLogs = timeLogs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= dayStart && logDate <= dayEnd;
  });

  const filteredLogs = selectedProject === 'all' 
    ? dailyLogs 
    : dailyLogs.filter(log => log.projectName === selectedProject);

  const totalDuration = filteredLogs.reduce((sum, log) => sum + log.duration, 0);

  const uniqueProjects = [...new Set(dailyLogs.map(log => log.projectName))];

  const goToPreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const goToNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <Calendar className="h-5 w-5" />
              Daily View
            </CardTitle>
            <Button onClick={onSwitchToWeeklyView} variant="outline" size="sm">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Weekly View
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button onClick={goToPreviousDay} variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-lg font-semibold text-gray-700 min-w-[200px] text-center">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </div>
              <Button onClick={goToNextDay} variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={goToToday} variant="outline" size="sm">
              Today
            </Button>
          </div>

          {/* Project Filter */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Filter by Project:</span>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {uniqueProjects.map(project => (
                    <SelectItem key={project} value={project}>{project}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Total: {formatTime(totalDuration)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-700">Time Entries ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No time entries for this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map(log => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-700">{log.projectName}</h3>
                      <p className="text-sm text-gray-600">{log.subprojectName}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatDuration(log.duration)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {log.startTime} - {log.endTime}
                      </div>
                    </div>
                  </div>
                  {log.description && (
                    <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      {log.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyTimesheet;
