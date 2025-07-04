
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Moon, Sun } from 'lucide-react';
import TimeTracker from '@/components/TimeTracker';
import ExcelView from '@/components/ExcelView';
import Holidays from '@/components/Holidays';
import Settings from '@/components/Settings';

const Index = () => {
  const [activeTab, setActiveTab] = useState('tracker');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('dark-mode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('dark-mode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleSwitchToExcel = () => {
      setActiveTab('data');
    };

    window.addEventListener('switchToExcelView', handleSwitchToExcel);
    
    return () => {
      window.removeEventListener('switchToExcelView', handleSwitchToExcel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 relative">
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      
      <div className="fixed top-4 right-4 z-50">
        <Settings />
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-2">Team Timesheet</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">Track your time across projects and subprojects</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="tracker">Time Tracker</TabsTrigger>
            <TabsTrigger value="data">Timesheet</TabsTrigger>
            <TabsTrigger value="holidays" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Holidays
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracker">
            <TimeTracker />
          </TabsContent>
          
          <TabsContent value="data">
            <ExcelView />
          </TabsContent>
          
          <TabsContent value="holidays">
            <Holidays />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
