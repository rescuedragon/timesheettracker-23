
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

  // Group logs by project name
  const groupedLogs = filteredLogs.reduce((groups, log) => {
    const key = log.projectName;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(log);
    return groups;
  }, {} as Record<string, typeof filteredLogs>);

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
    <div className="space-y-8 animate-fade-in">
      {/* Header with Navigation */}
      <Card className="bg-gradient-secondary-modern border-border/60 shadow-modern-lg">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-foreground">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="text-xl">Daily View</span>
            </CardTitle>
            <Button onClick={onSwitchToWeeklyView} variant="secondary" size="sm" className="btn-modern shadow-modern-sm">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Weekly View
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={goToPreviousDay} variant="outline" size="sm" className="btn-modern shadow-modern-sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-xl font-bold text-foreground min-w-[300px] text-center bg-muted/30 px-6 py-3 rounded-xl">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </div>
              <Button onClick={goToNextDay} variant="outline" size="sm" className="btn-modern shadow-modern-sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={goToToday} variant="secondary" size="sm" className="btn-modern shadow-modern-sm">
              Today
            </Button>
          </div>

          {/* Project Filter */}
          <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-foreground">Filter by Project:</span>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-52 h-10 shadow-modern-sm border-2 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/60 shadow-modern-lg">
                  <SelectItem value="all">All Projects</SelectItem>
                  {uniqueProjects.map(project => (
                    <SelectItem key={project} value={project}>{project}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 bg-accent/10 px-4 py-2 rounded-xl">
              <Clock className="h-5 w-5 text-accent" />
              <span className="text-base font-bold text-foreground">
                Total: {formatTime(totalDuration)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Entries */}
      <Card className="bg-gradient-secondary-modern border-border/60 shadow-modern-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-foreground">
            <span className="text-xl">Time Entries</span>
            <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
              {filteredLogs.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-16 w-16 mx-auto mb-6 opacity-40" />
              <p className="text-lg font-medium">No time entries for this day</p>
              <p className="text-sm mt-2">Start tracking time to see entries here</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedLogs).map(([projectName, logs]) => {
                const projectTotalDuration = logs.reduce((sum, log) => sum + log.duration, 0);
                
                return (
                  <div key={projectName} className="border border-border/60 rounded-xl overflow-hidden shadow-modern-md hover:shadow-modern-lg transition-all duration-300 animate-scale-in">
                    {/* Project Header */}
                    <div className="bg-primary/5 p-5 border-b border-border/40">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-foreground">{projectName}</h3>
                        <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-lg">
                          <Clock className="h-4 w-4 text-accent" />
                          <span className="text-lg font-bold text-accent">
                            {formatDuration(projectTotalDuration)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Project Logs */}
                    <div className="divide-y divide-border/40">
                      {logs.map(log => (
                        <div key={log.id} className="p-5 hover:bg-accent/5 transition-all duration-200 group">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <p className="text-base font-medium text-foreground mb-1">{log.subprojectName}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{log.startTime} - {log.endTime}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-accent group-hover:scale-105 transition-transform duration-200">
                                {formatDuration(log.duration)}
                              </div>
                            </div>
                          </div>
                          {log.description && (
                            <div className="mt-3 p-3 bg-muted/40 rounded-lg border border-border/30">
                              <p className="text-sm text-foreground italic">{log.description}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyTimesheet;
