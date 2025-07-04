
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
  const progressPercentage = Math.min((currentHours / 3600 / targetHours) * 100, 100);
  const hours = (currentHours / 3600).toFixed(1);
  const remaining = Math.max(0, targetHours - currentHours / 3600).toFixed(1);
  
  if (!enabled) {
    return (
      <div className="mb-6 p-6 bg-gradient-secondary-modern rounded-xl border border-border/60 shadow-modern-md hover:shadow-modern-lg transition-all duration-300 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground font-medium mb-1">Total Time Today</div>
            <div className="text-4xl font-bold text-foreground tracking-tight">{hours} hrs</div>
          </div>
          <div className="text-right">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
              <div className="text-2xl font-bold text-accent">{Math.round(parseFloat(hours))}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 p-6 bg-gradient-secondary-modern rounded-xl border border-border/60 shadow-modern-md hover:shadow-modern-lg transition-all duration-300 animate-fade-in overflow-hidden relative">
      {/* Animated background progress */}
      <div 
        className="absolute inset-0 bg-gradient-accent-modern opacity-5 transition-all duration-1000 ease-out"
        style={{
          clipPath: `polygon(0 0, ${progressPercentage}% 0, ${progressPercentage}% 100%, 0 100%)`,
        }}
      />
      
      {/* Shimmer effect for progress */}
      <div 
        className="absolute inset-0 progress-animated opacity-10"
        style={{
          background: `linear-gradient(90deg, transparent 0%, hsl(var(--accent)) ${progressPercentage}%, transparent ${progressPercentage}%)`,
        }}
      />
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground font-medium">Today's Progress</div>
          <div className="text-4xl font-bold text-foreground tracking-tight">{hours} hrs</div>
          <div className="text-sm text-muted-foreground">
            Target: {targetHours}h • {remaining}h remaining
          </div>
        </div>
        
        <div className="text-right space-y-3">
          {/* Circular Progress */}
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="hsl(var(--border))"
                strokeWidth="8"
                fill="none"
                className="opacity-20"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={color}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercentage / 100)}`}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-accent">{Math.round(progressPercentage)}%</span>
            </div>
          </div>
          
          {/* Linear Progress Bar */}
          <div className="w-40 h-3 bg-border/40 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full transition-all duration-1000 ease-out rounded-full relative overflow-hidden"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: color,
              }}
            >
              {/* Animated shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse-slow" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
