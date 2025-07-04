
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
    <div className="min-h-screen bg-gradient-modern relative">
      <div className="fixed top-6 left-6 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-3 rounded-full shadow-modern-md hover:shadow-modern-lg bg-card/80 backdrop-blur-sm border border-border/60"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      
      <div className="fixed top-6 right-6 z-50">
        <Settings />
      </div>
      
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-5xl font-bold text-foreground mb-4 tracking-tight">Team Timesheet</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Track your time across projects and subprojects with precision and style</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-slide-up">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-14 rounded-xl bg-muted p-2 shadow-modern-md">
            <TabsTrigger value="tracker" className="rounded-lg font-semibold text-base h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-modern-md transition-all duration-200">
              Time Tracker
            </TabsTrigger>
            <TabsTrigger value="data" className="rounded-lg font-semibold text-base h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-modern-md transition-all duration-200">
              Timesheet
            </TabsTrigger>
            <TabsTrigger value="holidays" className="rounded-lg font-semibold text-base h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-modern-md transition-all duration-200 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Holidays
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracker" className="animate-fade-in">
            <TimeTracker />
          </TabsContent>
          
          <TabsContent value="data" className="animate-fade-in">
            <ExcelView />
          </TabsContent>
          
          <TabsContent value="holidays" className="animate-fade-in">
            <Holidays />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
