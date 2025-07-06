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

  // Load and apply theme on mount
  useEffect(() => {
    const themesEnabled = localStorage.getItem('themes-enabled');
    const selectedTheme = localStorage.getItem('selected-theme');
    
    if (themesEnabled && JSON.parse(themesEnabled) && selectedTheme) {
      // Apply the saved theme
      const themes = {
        default: {
          colors: {
            background: '0 0% 100%',
            foreground: '0 0% 15%',
            card: '0 0% 100%',
            'card-foreground': '0 0% 15%',
            primary: '0 0% 9%',
            'primary-foreground': '0 0% 98%',
            secondary: '0 0% 98%',
            'secondary-foreground': '0 0% 15%',
            muted: '0 0% 98%',
            'muted-foreground': '0 0% 45%',
            accent: '0 0% 96%',
            'accent-foreground': '0 0% 15%',
            border: '0 0% 91%',
            input: '0 0% 96%',
            ring: '0 0% 9%',
          }
        },
        google: {
          colors: {
            background: '0 0% 100%',
            foreground: '210 40% 8%',
            card: '0 0% 100%',
            'card-foreground': '210 40% 8%',
            primary: '221 83% 53%',
            'primary-foreground': '210 40% 98%',
            secondary: '210 40% 96%',
            'secondary-foreground': '210 40% 10%',
            muted: '210 40% 96%',
            'muted-foreground': '215 16% 47%',
            accent: '210 40% 94%',
            'accent-foreground': '210 40% 10%',
            border: '214 32% 91%',
            input: '214 32% 91%',
            ring: '221 83% 53%',
          }
        },
        apple: {
          colors: {
            background: '0 0% 100%',
            foreground: '0 0% 0%',
            card: '0 0% 100%',
            'card-foreground': '0 0% 0%',
            primary: '212 100% 50%',
            'primary-foreground': '0 0% 100%',
            secondary: '210 40% 98%',
            'secondary-foreground': '210 40% 10%',
            muted: '210 40% 98%',
            'muted-foreground': '215 16% 47%',
            accent: '210 40% 96%',
            'accent-foreground': '210 40% 10%',
            border: '214 32% 91%',
            input: '214 32% 91%',
            ring: '212 100% 50%',
          }
        },
        cred: {
          colors: {
            background: '0 0% 7%',
            foreground: '0 0% 98%',
            card: '0 0% 10%',
            'card-foreground': '0 0% 98%',
            primary: '142 76% 36%',
            'primary-foreground': '0 0% 98%',
            secondary: '0 0% 14%',
            'secondary-foreground': '0 0% 98%',
            muted: '0 0% 14%',
            'muted-foreground': '240 5% 64%',
            accent: '0 0% 14%',
            'accent-foreground': '0 0% 98%',
            border: '240 3% 20%',
            input: '240 3% 20%',
            ring: '142 76% 36%',
          }
        },
        adobe: {
          colors: {
            background: '240 10% 3.9%',
            foreground: '0 0% 98%',
            card: '240 10% 3.9%',
            'card-foreground': '0 0% 98%',
            primary: '0 72% 51%',
            'primary-foreground': '0 85% 97%',
            secondary: '240 3.7% 15.9%',
            'secondary-foreground': '0 0% 98%',
            muted: '240 3.7% 15.9%',
            'muted-foreground': '240 5% 64.9%',
            accent: '240 3.7% 15.9%',
            'accent-foreground': '0 0% 98%',
            border: '240 3.7% 15.9%',
            input: '240 3.7% 15.9%',
            ring: '0 72% 51%',
          }
        },
        ocean: {
          colors: {
            background: '210 100% 98%',
            foreground: '210 40% 8%',
            card: '210 100% 98%',
            'card-foreground': '210 40% 8%',
            primary: '200 98% 39%',
            'primary-foreground': '210 40% 98%',
            secondary: '210 40% 96%',
            'secondary-foreground': '210 40% 10%',
            muted: '210 40% 96%',
            'muted-foreground': '215 16% 47%',
            accent: '210 40% 94%',
            'accent-foreground': '210 40% 10%',
            border: '214 32% 91%',
            input: '214 32% 91%',
            ring: '200 98% 39%',
          }
        }
      };

      const theme = themes[selectedTheme];
      if (theme) {
        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, value);
        });
      }
    }
  }, []);

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
          className="p-4 rounded-2xl shadow-lg hover:shadow-xl bg-card/90 backdrop-blur-md border border-border/60 transition-all duration-200"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      
      <div className="fixed top-6 right-6 z-50">
        <div className="rounded-2xl shadow-lg bg-card/90 backdrop-blur-md border border-border/60">
          <Settings />
        </div>
      </div>
      
      <div className="container mx-auto px-8 py-16">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-6xl font-light text-foreground mb-6 tracking-tight">Timesheet</h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-slide-up">
          <TabsList className="grid w-full grid-cols-3 mb-10 h-16 rounded-2xl bg-muted/50 p-2 shadow-lg backdrop-blur-sm border border-border/40">
            <TabsTrigger value="tracker" className="rounded-xl font-medium text-base h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200">
              Time Tracker
            </TabsTrigger>
            <TabsTrigger value="data" className="rounded-xl font-medium text-base h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200">
              Timesheet
            </TabsTrigger>
            <TabsTrigger value="holidays" className="rounded-xl font-medium text-base h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 flex items-center gap-2">
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