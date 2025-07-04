
import React from 'react';

interface ProgressBarProps {
  currentHours: number;
  targetHours?: number;
  color?: string;
  enabled?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  currentHours, 
  targetHours = 8, 
  color = '#10b981',
  enabled = false 
}) => {
  if (!enabled) {
    return (
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Time Today</div>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">{(currentHours / 3600).toFixed(1)} hrs</div>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.min((currentHours / 3600 / targetHours) * 100, 100);
  
  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-200 dark:border-blue-800 overflow-hidden relative">
      {/* Animated background progress */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-out opacity-20"
        style={{
          background: `linear-gradient(90deg, ${color} 0%, ${color}88 ${progressPercentage}%, transparent ${progressPercentage}%)`,
        }}
      />
      
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            {(currentHours / 3600).toFixed(1)} hrs
          </div>
        </div>
        
        <div className="text-right">
          <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-1000 ease-out"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: color,
              }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.max(0, targetHours - currentHours / 3600).toFixed(1)}h remaining
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
