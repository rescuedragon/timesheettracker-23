
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, FileText } from 'lucide-react';
import { TimeLog } from './TimeTracker';

interface TimeEntryProps {
  timeLog: TimeLog;
  formatTime: (seconds: number) => string;
}

const TimeEntry: React.FC<TimeEntryProps> = ({ timeLog, formatTime }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="border-l-4 border-l-green-400">
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-slate-800">{timeLog.projectName}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">{timeLog.subprojectName}</span>
            </div>
            
            {timeLog.description && (
              <div className="flex items-start gap-1 mb-2">
                <FileText className="h-3 w-3 text-slate-400 mt-0.5" />
                <span className="text-sm text-slate-600">{timeLog.description}</span>
              </div>
            )}
            
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(timeLog.date)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-green-600" />
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {formatTime(timeLog.duration)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeEntry;
