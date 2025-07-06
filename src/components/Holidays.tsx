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

function adjustColor(color: string, amount: number) {
  return '#' + color.replace(/^#/, '').replace(/../g, color => 
    ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2)
  );
}

function lightenColor(color: string, percent: number) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

const Holidays: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([
    { id: '1', name: 'New Year', date: '2025-01-01' },
    { id: '2', name: 'Christmas', date: '2025-12-25' },
  ]);
  const [plannedLeaves, setPlannedLeaves] = useState<PlannedLeave[]>([
    { id: '1', name: 'Annual Leave', employee: 'John Doe', startDate: '2025-07-10', endDate: '2025-07-15' },
    { id: '2', name: 'Sick Leave', employee: 'Jane Smith', startDate: '2025-07-22', endDate: '2025-07-23' },
  ]);
  const [showPlannedLeaves, setShowPlannedLeaves] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isAddingLeave, setIsAddingLeave] = useState(false);
  const [newLeave, setNewLeave] = useState({ name: '', employee: '', startDate: '', endDate: '' });
  const [animationPhase, setAnimationPhase] = useState(0);
  const [intensity, setIntensity] = useState(0.3);
  const [progressBarColor, setProgressBarColor] = useState('#00b3ff');

  useEffect(() => {
    const savedHolidays = localStorage.getItem('timesheet-holidays');
    const savedLeaves = localStorage.getItem('planned-leaves');
    
    if (savedHolidays) setHolidays(JSON.parse(savedHolidays));
    if (savedLeaves) setPlannedLeaves(JSON.parse(savedLeaves));
    
    // Load the progress bar color from the same key used by Settings
    const loadProgressBarColor = () => {
      const savedColor = localStorage.getItem('progressbar-color');
      if (savedColor) {
        setProgressBarColor(savedColor);
      }
    };
    
    loadProgressBarColor();
    
    // Listen for storage changes and settings changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'progressbar-color' && e.newValue) {
        setProgressBarColor(e.newValue);
      }
    };
    
    const handleSettingsChange = () => {
      loadProgressBarColor();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('settings-changed', handleSettingsChange);
    
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 100);
      if (Math.random() > 0.7) {
        setIntensity(0.2 + Math.random() * 0.3);
      }
    }, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settings-changed', handleSettingsChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('timesheet-holidays', JSON.stringify(holidays));
    localStorage.setItem('planned-leaves', JSON.stringify(plannedLeaves));
  }, [holidays, plannedLeaves]);

  const generateWindPattern = (phase: number, intensity: number) => {
    const patterns = [];
    const patternCount = 15 + Math.floor(10 * intensity);
    
    for (let i = 0; i < patternCount; i++) {
      const offset = (phase + i * 10) % 100;
      const size = 5 + Math.random() * 20;
      const opacity = 0.1 + Math.random() * 0.3 * intensity;
      const direction = i % 2 === 0 ? 'to bottom right' : 'to top right';
      
      patterns.push(
        `linear-gradient(${direction}, 
          transparent ${offset}%, 
          rgba(255,255,255,${opacity}) ${offset}%, 
          rgba(255,255,255,${opacity}) ${offset + size}%, 
          transparent ${offset + size}%)`
      );
    }
    
    return patterns.join(',');
  };

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

  const hasHolidaysThisMonth = () => {
    return holidays.some(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.getMonth() === currentMonth.getMonth() && 
             holidayDate.getFullYear() === currentMonth.getFullYear();
    });
  };

  const handleAddPlannedLeave = () => {
    if (newLeave.name && newLeave.employee && newLeave.startDate && newLeave.endDate) {
      const leave: PlannedLeave = {
        id: Date.now().toString(),
        ...newLeave
      };
      const updatedLeaves = [...plannedLeaves, leave];
      setPlannedLeaves(updatedLeaves);
      setNewLeave({ name: '', employee: '', startDate: '', endDate: '' });
      setIsAddingLeave(false);
    }
  };

  const handleRemovePlannedLeave = (leaveId: string) => {
    const updatedLeaves = plannedLeaves.filter(leave => leave.id !== leaveId);
    setPlannedLeaves(updatedLeaves);
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

  // Create lighter version of the progress bar color for the header
  const lightProgressColor = lightenColor(progressBarColor, 35);
  const lightProgressColor2 = lightenColor(progressBarColor, 25);
  const lightProgressColor3 = lightenColor(progressBarColor, 15);
  const lightProgressColor4 = lightenColor(progressBarColor, 5);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-gray-50">
      <Card className="border-0 shadow-lg overflow-hidden relative">
        <div 
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            mask: 'linear-gradient(#fff, #fff) content-box, linear-gradient(#fff, #fff)',
            maskComposite: 'exclude',
            WebkitMask: 'linear-gradient(#fff, #fff) content-box, linear-gradient(#fff, #fff)',
            WebkitMaskComposite: 'xor',
            padding: '3px',
            background: generateWindPattern(animationPhase, intensity),
            animation: 'pulseBorder 3s infinite alternate',
            borderColor: progressBarColor,
          }}
        />
        
        <CardHeader 
          className="text-white p-6 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${lightProgressColor}, ${lightProgressColor2}, ${lightProgressColor3}, ${lightProgressColor4})`,
            backgroundSize: '400% 400%',
            animation: 'gradientFlow 15s ease infinite',
          }}
        >
          <div 
            className="absolute inset-0"
            style={{
              background: generateWindPattern(animationPhase, intensity),
              opacity: intensity,
              transition: 'opacity 1s ease',
            }}
          />
          
          <CardTitle className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Timesheet</h1>
                <p className="text-white/90 text-sm">
                  Holidays & Leaves - {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                <Checkbox
                  id="show-leaves"
                  checked={showPlannedLeaves}
                  onCheckedChange={handleShowPlannedLeavesChange}
                  className="border-white data-[state=checked]:bg-white data-[state=checked]:text-blue-600"
                />
                <Label htmlFor="show-leaves" className="text-sm text-white">Show planned leaves</Label>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className={cn("w-full pointer-events-auto border-0 shadow-none")}
                modifiers={{
                  holiday: holidayDates,
                  leave: showPlannedLeaves ? leaveDates : [],
                  weekend: (date) => date.getDay() === 0 || date.getDay() === 6,
                  today: (date) => date.toDateString() === new Date().toDateString(),
                }}
                modifiersClassNames={{
                  holiday: "bg-gradient-to-br from-red-500 to-red-600 text-white font-medium",
                  leave: "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white font-medium",
                  weekend: "text-gray-400 dark:text-gray-600",
                  today: "relative after:absolute after:top-1 after:right-1 after:w-2 after:h-2 after:bg-blue-600 after:rounded-full",
                }}
                classNames={{
                  head_cell: "text-gray-500 font-normal text-sm pb-3",
                  cell: "h-14",
                  day: cn(
                    "h-12 w-12 text-base hover:bg-blue-50 rounded-lg transition-colors",
                    "mx-auto"
                  ),
                  day_selected: `bg-[${progressBarColor}] text-white hover:bg-[${progressBarColor}]/90`,
                  day_today: "bg-white border-2 border-blue-500",
                }}
                showOutsideDays={true}
              />
            </div>
            
            <div className="w-full lg:w-96 space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Legend</h3>
                  {showPlannedLeaves && (
                    <Dialog open={isAddingLeave} onOpenChange={setIsAddingLeave}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Leave
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-semibold">Add Planned Leave</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Leave Name</Label>
                            <Input
                              id="name"
                              value={newLeave.name}
                              onChange={(e) => setNewLeave({...newLeave, name: e.target.value})}
                              placeholder="e.g., Annual Leave"
                              className="focus-visible:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="employee">Employee</Label>
                            <Input
                              id="employee"
                              value={newLeave.employee}
                              onChange={(e) => setNewLeave({...newLeave, employee: e.target.value})}
                              placeholder="Employee name"
                              className="focus-visible:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={newLeave.startDate}
                              onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
                              className="focus-visible:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={newLeave.endDate}
                              onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
                              className="focus-visible:ring-blue-500"
                            />
                          </div>
                          <Button 
                            onClick={handleAddPlannedLeave} 
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
                          >
                            Add Leave
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-5 h-5 rounded bg-gradient-to-br from-red-500 to-red-600"></div>
                    <span className="text-gray-700">Public Holidays</span>
                  </div>
                  {showPlannedLeaves && (
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-5 h-5 rounded bg-gradient-to-br from-yellow-400 to-yellow-500"></div>
                      <span className="text-gray-700">Planned Leaves</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-5 h-5 rounded bg-gray-100 border border-gray-200"></div>
                    <span className="text-gray-700">Weekends</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-5 h-5 rounded border-2 border-blue-600"></div>
                    <span className="text-gray-700">Current Day</span>
                  </div>
                </div>
              </div>

              {hasHolidaysThisMonth() && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">This Month's Holidays</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {holidays
                      .filter(holiday => {
                        const holidayDate = new Date(holiday.date);
                        return holidayDate.getMonth() === currentMonth.getMonth() && 
                               holidayDate.getFullYear() === currentMonth.getFullYear();
                      })
                      .map(holiday => (
                        <div 
                          key={holiday.id} 
                          className="p-3 rounded-lg bg-gradient-to-r from-red-50 to-red-100 border border-red-100"
                        >
                          <div className="font-medium text-gray-800">{holiday.name}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {showPlannedLeaves && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">This Month's Leaves</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
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
                        <div 
                          key={leave.id} 
                          className="p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-100 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-gray-800">{leave.name}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {leave.employee} • {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemovePlannedLeave(leave.id)}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
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
      
      <style jsx global>{`
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes pulseBorder {
          0% { opacity: 0.3; }
          100% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default Holidays;