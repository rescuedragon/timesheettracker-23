
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Holiday {
  id: string;
  name: string;
  date: string;
}

interface PlannedLeave {
  id: string;
  name: string;
  employee: string;
  startDate: string;
  endDate: string;
}

const Holidays: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [plannedLeaves, setPlannedLeaves] = useState<PlannedLeave[]>([]);
  const [showPlannedLeaves, setShowPlannedLeaves] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isAddingLeave, setIsAddingLeave] = useState(false);
  const [newLeave, setNewLeave] = useState({ name: '', employee: '', startDate: '', endDate: '' });

  useEffect(() => {
    const savedHolidays = localStorage.getItem('timesheet-holidays');
    const savedLeaves = localStorage.getItem('planned-leaves');
    if (savedHolidays) {
      setHolidays(JSON.parse(savedHolidays));
    }
    if (savedLeaves) {
      setPlannedLeaves(JSON.parse(savedLeaves));
    }
  }, []);

  const getHolidayDates = () => {
    return holidays.map(holiday => new Date(holiday.date));
  };

  const getPlannedLeaveDates = () => {
    const dates: Date[] = [];
    plannedLeaves.forEach(leave => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        dates.push(new Date(date));
      }
    });
    return dates;
  };

  const handleAddPlannedLeave = () => {
    if (newLeave.name && newLeave.employee && newLeave.startDate && newLeave.endDate) {
      const leave: PlannedLeave = {
        id: Date.now().toString(),
        ...newLeave
      };
      const updatedLeaves = [...plannedLeaves, leave];
      setPlannedLeaves(updatedLeaves);
      localStorage.setItem('planned-leaves', JSON.stringify(updatedLeaves));
      setNewLeave({ name: '', employee: '', startDate: '', endDate: '' });
      setIsAddingLeave(false);
    }
  };

  const handleRemovePlannedLeave = (leaveId: string) => {
    const updatedLeaves = plannedLeaves.filter(leave => leave.id !== leaveId);
    setPlannedLeaves(updatedLeaves);
    localStorage.setItem('planned-leaves', JSON.stringify(updatedLeaves));
  };

  const nextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const prevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const handleShowPlannedLeavesChange = (checked: boolean | "indeterminate") => {
    setShowPlannedLeaves(checked === true);
  };

  const holidayDates = getHolidayDates();
  const leaveDates = getPlannedLeaveDates();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Holidays & Leaves - {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="show-leaves" 
                  checked={showPlannedLeaves}
                  onCheckedChange={handleShowPlannedLeavesChange}
                />
                <Label htmlFor="show-leaves" className="text-sm">Show planned leaves</Label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={prevMonth}
                  className="px-3 py-1 rounded border hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="px-3 py-1 rounded border hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="flex-1 max-w-2xl">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className={cn("w-full pointer-events-auto")}
                modifiers={{
                  holiday: holidayDates,
                  leave: showPlannedLeaves ? leaveDates : [],
                  weekend: (date) => date.getDay() === 0 || date.getDay() === 6,
                }}
                modifiersClassNames={{
                  holiday: "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100",
                  leave: "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100",
                  weekend: "text-gray-400 dark:text-gray-600",
                }}
                showOutsideDays={true}
              />
            </div>
            
            <div className="w-80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Legend</h3>
                {showPlannedLeaves && (
                  <Dialog open={isAddingLeave} onOpenChange={setIsAddingLeave}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Leave
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Planned Leave</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Leave Name</Label>
                          <Input
                            value={newLeave.name}
                            onChange={(e) => setNewLeave({...newLeave, name: e.target.value})}
                            placeholder="e.g., Annual Leave"
                          />
                        </div>
                        <div>
                          <Label>Employee</Label>
                          <Input
                            value={newLeave.employee}
                            onChange={(e) => setNewLeave({...newLeave, employee: e.target.value})}
                            placeholder="Employee name"
                          />
                        </div>
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={newLeave.startDate}
                            onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={newLeave.endDate}
                            onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
                          />
                        </div>
                        <Button onClick={handleAddPlannedLeave} className="w-full">
                          Add Leave
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border rounded"></div>
                  <span>Public Holidays</span>
                </div>
                {showPlannedLeaves && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-100 border rounded"></div>
                    <span>Planned Leaves</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border rounded"></div>
                  <span>Weekends</span>
                </div>
              </div>

              {/* Current month holidays */}
              <div className="space-y-2">
                <h4 className="font-medium">This Month's Holidays</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {holidays
                    .filter(holiday => {
                      const holidayDate = new Date(holiday.date);
                      return holidayDate.getMonth() === currentMonth.getMonth() && 
                             holidayDate.getFullYear() === currentMonth.getFullYear();
                    })
                    .map(holiday => (
                      <div key={holiday.id} className="text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        <div className="font-medium">{holiday.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(holiday.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {showPlannedLeaves && (
                <div className="space-y-2">
                  <h4 className="font-medium">This Month's Leaves</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {plannedLeaves
                      .filter(leave => {
                        const startDate = new Date(leave.startDate);
                        const endDate = new Date(leave.endDate);
                        return (startDate.getMonth() === currentMonth.getMonth() && 
                               startDate.getFullYear() === currentMonth.getFullYear()) ||
                               (endDate.getMonth() === currentMonth.getMonth() && 
                               endDate.getFullYear() === currentMonth.getFullYear());
                      })
                      .map(leave => (
                        <div key={leave.id} className="text-sm p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded flex items-center justify-between">
                          <div>
                            <div className="font-medium">{leave.name}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {leave.employee} - {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemovePlannedLeave(leave.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Holidays;
