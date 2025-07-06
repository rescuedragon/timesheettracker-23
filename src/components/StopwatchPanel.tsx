import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Play, Pause, Square } from 'lucide-react';
import { Project, Subproject } from './TimeTracker';
import { QueuedProject } from './QueuedProjects';
import { generateProjectColor } from '@/lib/projectColors';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface StopwatchPanelProps {
  selectedProject: Project | undefined;
  selectedSubproject: Subproject | undefined;
  onLogTime: (duration: number, description: string, startTime: Date, endTime: Date, projectId?: string, subprojectId?: string) => void;
  onPauseProject: (queuedProject: QueuedProject) => void;
  resumedProject?: QueuedProject;
  onResumedProjectHandled: () => void;
}

const StopwatchPanel: React.FC<StopwatchPanelProps> = ({
  selectedProject,
  selectedSubproject,
  onLogTime,
  onPauseProject,
  resumedProject,
  onResumedProjectHandled
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);
  const [description, setDescription] = useState('');
  const [pendingLogData, setPendingLogData] = useState<{duration: number, startTime: Date, endTime: Date} | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fluidCanvasRef = useRef<HTMLCanvasElement>(null);
  const projectInfoRef = useRef<HTMLDivElement>(null);
  const [projectColor, setProjectColor] = useState('rgba(240, 240, 240, 0)');
  const lastMinuteMarkRef = useRef(0);
  const [tintOpacity, setTintOpacity] = useState(0);
  const dropRef = useRef<{x: number, y: number, size: number, rippleSize: number, splashing: boolean} | null>(null);
  const auroraTimeRef = useRef(0);
  const lastUpdateRef = useRef<number | null>(null);

  // Load stopwatch state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('stopwatch-state');
    if (savedState) {
      const state = JSON.parse(savedState);
      setIsRunning(state.isRunning);
      setElapsedTime(state.elapsedTime);
      setDisplayTime(state.elapsedTime);
      if (state.startTime) {
        setStartTime(new Date(state.startTime));
      }
    }
  }, []);

  // Handle resumed project
  useEffect(() => {
    if (resumedProject) {
      setElapsedTime(resumedProject.elapsedTime);
      setDisplayTime(resumedProject.elapsedTime);
      setStartTime(resumedProject.startTime);
      setIsRunning(true);
      onResumedProjectHandled();
    }
  }, [resumedProject, onResumedProjectHandled]);

  // Save stopwatch state to localStorage
  useEffect(() => {
    const state = {
      isRunning,
      elapsedTime,
      startTime: startTime?.toISOString()
    };
    localStorage.setItem('stopwatch-state', JSON.stringify(state));
  }, [isRunning, elapsedTime, startTime]);

  // Update project color when project changes
  useEffect(() => {
    if (selectedProject && selectedSubproject) {
      const color = generateProjectColor(selectedProject.name);
      setProjectColor(color);
      
      // Animate project info appearance
      if (projectInfoRef.current) {
        projectInfoRef.current.style.opacity = '0';
        projectInfoRef.current.style.transform = 'translateY(-20px) scale(0.9)';
        setTimeout(() => {
          if (projectInfoRef.current) {
            projectInfoRef.current.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            projectInfoRef.current.style.opacity = '1';
            projectInfoRef.current.style.transform = 'translateY(0) scale(1)';
          }
        }, 10);
      }
    }
  }, [selectedProject, selectedSubproject]);

  // Update blue tint opacity based on elapsed time
  useEffect(() => {
    // 8 hours = 28,800 seconds
    const maxTime = 28800;
    const newOpacity = Math.min(0.3, elapsedTime / maxTime * 0.3);
    setTintOpacity(newOpacity);
  }, [elapsedTime]);

  // Smooth animation loop
  useEffect(() => {
    if (isRunning && startTime) {
      const updateAnimation = (timestamp: number) => {
        if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
        const delta = timestamp - lastUpdateRef.current;
        
        // Update display time for smooth animation
        if (delta > 16) { // ~60fps
          const now = new Date();
          const exactElapsed = (now.getTime() - startTime.getTime()) / 1000;
          setDisplayTime(exactElapsed);
          lastUpdateRef.current = timestamp;
        }
        
        requestAnimationFrame(updateAnimation);
      };
      
      requestAnimationFrame(updateAnimation);
    }
    
    return () => {
      lastUpdateRef.current = null;
    };
  }, [isRunning, startTime]);

  // Aurora Borealis animation effect - fixed to run independently
  useEffect(() => {
    if (!canvasRef.current || !fluidCanvasRef.current) return;
    
    const canvas = canvasRef.current;
    const fluidCanvas = fluidCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const fluidCtx = fluidCanvas.getContext('2d');
    
    if (!ctx || !fluidCtx) return;
    
    // Set canvas sizes
    const size = 260;
    canvas.width = size;
    canvas.height = size;
    fluidCanvas.width = size;
    fluidCanvas.height = size;
    
    let animationFrameId: number;
    
    // Vibrant color palette
    const auroraColors = [
      'rgba(101, 227, 242, 0.65)', // Brighter Teal
      'rgba(66, 220, 244, 0.65)',  // Bright Cyan
      'rgba(117, 255, 209, 0.60)', // Bright Turquoise
      'rgba(178, 150, 255, 0.65)', // Bright Purple
      'rgba(255, 223, 107, 0.60)', // Bright Yellow
      'rgba(76, 255, 196, 0.65)',  // Bright Emerald
      'rgba(100, 230, 255, 0.65)', // Bright Sky Blue
      'rgba(255, 150, 230, 0.60)', // Bright Pink
    ];
    
    const drawAurora = (timestamp: number) => {
      // Initialize time tracking for aurora
      if (!auroraTimeRef.current) auroraTimeRef.current = timestamp;
      const delta = timestamp - auroraTimeRef.current;
      auroraTimeRef.current = timestamp;
      
      ctx.clearRect(0, 0, size, size);
      fluidCtx.clearRect(0, 0, size, size);
      
      // Create clipping path for circle
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2 - 1, 0, Math.PI * 2);
      ctx.clip();
      
      // Draw subtle blue water-like background with tint
      ctx.fillStyle = `rgba(235, 245, 255, ${tintOpacity})`;
      ctx.fillRect(0, 0, size, size);
      
      // Draw aurora layers
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        
        // Parameters for faster, more vibrant aurora
        const offset = i * 0.5;
        const waveHeight = 35 + i * 12; 
        const speed = 0.0003; // Time-based animation
        
        ctx.moveTo(0, size/2);
        
        // Wave path
        for (let x = 0; x <= size; x += 2) {
          const noise = Math.sin(x * 0.03 + timestamp * 0.0001) * 8;
          const y = size/2 + 
                    Math.sin(x * 0.015 + timestamp * speed + offset) * waveHeight + 
                    Math.cos(x * 0.025 + timestamp * (speed * 1.5) + offset) * (waveHeight * 0.7) +
                    noise;
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(size, size);
        ctx.lineTo(0, size);
        ctx.closePath();
        
        // Create gradient with vibrant colors
        const gradient = ctx.createLinearGradient(0, size/2, size, size/2);
        gradient.addColorStop(0, auroraColors[i % auroraColors.length]);
        gradient.addColorStop(0.5, auroraColors[(i + 4) % auroraColors.length]);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.3 + (i * 0.05);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
      
      // FIX: Ensure blue fluid ring is drawn properly
      if (isRunning) {
        const center = size / 2;
        const radius = size / 2 - 10;
        const progress = (displayTime % 60) / 60;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (2 * Math.PI * progress);
        
        // Draw fluid blue line
        fluidCtx.beginPath();
        fluidCtx.arc(center, center, radius, startAngle, endAngle, false);
        fluidCtx.lineWidth = 6;
        
        // Create gradient for fluid line
        const gradient = fluidCtx.createLinearGradient(0, 0, size, 0);
        gradient.addColorStop(0, 'rgba(66, 133, 244, 0.9)');
        gradient.addColorStop(1, 'rgba(100, 181, 246, 1)');
        
        fluidCtx.strokeStyle = gradient;
        fluidCtx.lineCap = 'round';
        fluidCtx.stroke(); // This was missing before
      }
      
      // Draw water drop and splash if exists
      if (dropRef.current) {
        const { x, y, size: dropSize, rippleSize, splashing } = dropRef.current;
        
        if (!splashing) {
          // Draw falling drop
          fluidCtx.beginPath();
          fluidCtx.arc(x, y, dropSize, 0, Math.PI * 2);
          fluidCtx.fillStyle = 'rgba(66, 133, 244, 0.9)';
          fluidCtx.fill();
        } else {
          // Draw splash effect
          fluidCtx.beginPath();
          fluidCtx.arc(x, y, rippleSize, 0, Math.PI * 2);
          fluidCtx.strokeStyle = `rgba(66, 133, 244, ${0.9 - rippleSize/60})`;
          fluidCtx.lineWidth = 2 + rippleSize/20;
          fluidCtx.stroke();
          
          // Draw splash particles
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = rippleSize * 0.8;
            const px = x + Math.cos(angle) * distance;
            const py = y + Math.sin(angle) * distance;
            
            fluidCtx.beginPath();
            fluidCtx.arc(px, py, 3, 0, Math.PI * 2);
            fluidCtx.fillStyle = `rgba(66, 133, 244, ${0.9 - rippleSize/60})`;
            fluidCtx.fill();
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(drawAurora);
    };
    
    animationFrameId = requestAnimationFrame(drawAurora);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning]);

  // Waterdrop effect at minute marks
  useEffect(() => {
    if (isRunning && elapsedTime > 0 && elapsedTime % 60 === 0) {
      // Only trigger once per minute
      if (elapsedTime !== lastMinuteMarkRef.current) {
        lastMinuteMarkRef.current = elapsedTime;
        
        const center = 130;
        
        // Create water drop at top of circle
        dropRef.current = {
          x: center,
          y: 20,
          size: 8,
          rippleSize: 0,
          splashing: false
        };
        
        // Animate drop falling
        const dropAnimation = () => {
          if (!dropRef.current) return;
          
          // Move drop down
          dropRef.current.y += 4;
          
          // Increase size as it falls
          if (dropRef.current.size < 12) {
            dropRef.current.size += 0.1;
          }
          
          // When drop reaches bottom, create splash
          if (dropRef.current.y > 250) {
            dropRef.current.splashing = true;
            dropRef.current.rippleSize += 4;
            
            // Remove after splash expands
            if (dropRef.current.rippleSize > 60) {
              dropRef.current = null;
              return;
            }
          }
          
          requestAnimationFrame(dropAnimation);
        };
        
        dropAnimation();
      }
    }
  }, [elapsedTime, isRunning]);

  // Timer effect for actual seconds counting
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const newElapsedTime = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(newElapsedTime);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!selectedProject || !selectedSubproject) return;
    
    const now = new Date();
    setStartTime(now);
    setIsRunning(true);
    setElapsedTime(0);
    setDisplayTime(0);
    dropRef.current = null;
    setTintOpacity(0);
  };

  const handlePause = () => {
    if (!selectedProject || !selectedSubproject || !startTime) return;
    
    const queuedProject: QueuedProject = {
      id: Date.now().toString(),
      projectId: selectedProject.id,
      subprojectId: selectedSubproject.id,
      projectName: selectedProject.name,
      subprojectName: selectedSubproject.name,
      elapsedTime,
      startTime
    };
    
    onPauseProject(queuedProject);
    
    setIsRunning(false);
    setElapsedTime(0);
    setDisplayTime(0);
    setStartTime(null);
    localStorage.removeItem('stopwatch-state');
  };

  const handleStop = () => {
    if (!selectedProject || !selectedSubproject || !startTime) return;
    
    const endTime = new Date();
    const finalDuration = elapsedTime;
    
    if (finalDuration > 0) {
      setPendingLogData({
        duration: finalDuration,
        startTime,
        endTime
      });
      setShowDescriptionDialog(true);
    }
    
    setIsRunning(false);
    setElapsedTime(0);
    setDisplayTime(0);
    setStartTime(null);
    dropRef.current = null;
    localStorage.removeItem('stopwatch-state');
  };

  const handleConfirmLog = () => {
    if (pendingLogData) {
      onLogTime(pendingLogData.duration, description, pendingLogData.startTime, pendingLogData.endTime);
    }
    setShowDescriptionDialog(false);
    setDescription('');
    setPendingLogData(null);
  };

  const handleCancelLog = () => {
    setShowDescriptionDialog(false);
    setDescription('');
    setPendingLogData(null);
  };

  const canStart = selectedProject && selectedSubproject && !isRunning;
  const canPauseOrStop = isRunning && startTime;
  const showProjectInfo = selectedProject && selectedSubproject;

  return (
    <div className="flex flex-col items-center">
      {/* Project Info Display - No "Stopwatch" text */}
      <div 
        ref={projectInfoRef}
        className={`text-center space-y-2 px-8 py-6 rounded-2xl border shadow-xl backdrop-blur-lg transition-all duration-300 mx-6 mt-6 mb-8 min-w-[320px] max-w-[480px] truncate ${
          showProjectInfo ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          backgroundColor: showProjectInfo ? projectColor : 'transparent',
          borderColor: showProjectInfo ? projectColor.replace('0.7', '0.9') : 'transparent',
          boxShadow: showProjectInfo ? 
            `0 10px 30px ${projectColor.replace('0.7', '0.3')}, 0 4px 10px rgba(0,0,0,0.1)` : 'none',
          transition: 'opacity 0.3s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
          transform: showProjectInfo ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.9)',
          opacity: showProjectInfo ? 1 : 0,
        }}
      >
        {showProjectInfo && (
          <>
            <div className="text-xl font-medium text-gray-800 tracking-tight truncate">
              {selectedProject.name}
            </div>
            <div className="text-sm text-gray-700 font-light truncate">
              {selectedSubproject.name}
            </div>
          </>
        )}
      </div>
      
      {/* Timer Section */}
      <div className="flex flex-col items-center justify-center space-y-10 px-6 z-10">
        {/* Timer Display Container */}
        <div className="relative w-64 h-64 flex items-center justify-center overflow-hidden rounded-full shadow-lg border border-gray-100 bg-white">
          {/* Aurora Canvas Background */}
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 z-0"
          />
          
          {/* Fluid Canvas for blue line and water effects */}
          <canvas 
            ref={fluidCanvasRef} 
            className="absolute inset-0 z-10"
          />
          
          {/* Timer Display - Only show when running or has time */}
          {(isRunning || elapsedTime > 0) && (
            <div className="relative flex flex-col items-center justify-center z-20 w-full h-full">
              <div className="text-center w-full z-30">
                <div 
                  className="text-5xl font-medium text-gray-800 tracking-tighter font-mono px-4"
                  style={{ 
                    fontWeight: 400,
                    textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                  }}
                >
                  {formatTime(elapsedTime)}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Pixar-inspired Control Buttons */}
        <div className="flex items-center gap-4 z-10">
          {!isRunning ? (
            <button
              onClick={handleStart}
              disabled={!canStart}
              className="relative h-14 px-6 rounded-full bg-gradient-to-br from-[#34A853] to-[#2a8c43] text-white font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none overflow-hidden group"
              style={{
                minWidth: '120px',
                boxShadow: '0 5px 15px rgba(52, 168, 83, 0.3)',
                transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
              }}
            >
              <span className="relative z-10 flex items-center justify-center">
                <Play className="h-5 w-5 mr-2" strokeWidth={2.5} />
                Start
              </span>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              <span className="absolute inset-0 bg-gradient-to-br from-[#43b463] to-[#34A853] opacity-0 group-active:opacity-100 transition-opacity duration-200"></span>
            </button>
          ) : (
            <button
              onClick={handleStop}
              disabled={!canPauseOrStop}
              className="relative h-14 px-6 rounded-full bg-gradient-to-br from-[#EA4335] to-[#d03124] text-white font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none overflow-hidden group"
              style={{
                minWidth: '120px',
                boxShadow: '0 5px 15px rgba(234, 67, 53, 0.3)',
                transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
              }}
            >
              <span className="relative z-10 flex items-center justify-center">
                <Square className="h-5 w-5 mr-2" strokeWidth={2.5} />
                Stop
              </span>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              <span className="absolute inset-0 bg-gradient-to-br from-[#f55c47] to-[#EA4335] opacity-0 group-active:opacity-100 transition-opacity duration-200"></span>
            </button>
          )}
          
          <button
            onClick={handlePause}
            disabled={!canPauseOrStop}
            className="relative h-14 px-6 rounded-full bg-gradient-to-br from-[#4285F4] to-[#3367d6] text-white font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none overflow-hidden group"
            style={{
              minWidth: '120px',
              boxShadow: '0 5px 15px rgba(66, 133, 244, 0.3)',
              transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
            }}
          >
            <span className="relative z-10 flex items-center justify-center">
              <Pause className="h-5 w-5 mr-2" strokeWidth={2.5} />
              Pause
            </span>
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
            <span className="absolute inset-0 bg-gradient-to-br from-[#5a95f5] to-[#4285F4] opacity-0 group-active:opacity-100 transition-opacity duration-200"></span>
          </button>
        </div>
      </div>

      {/* Description Dialog */}
      <Dialog open={showDescriptionDialog} onOpenChange={() => {}}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6 border border-gray-200 shadow-2xl z-50">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium text-gray-800 tracking-tight">
              Log Time Entry
            </DialogTitle>
          </DialogHeader>
          {pendingLogData && (
            <div className="space-y-6 py-2">
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="font-medium text-gray-800">{selectedProject?.name}</div>
                <div className="text-sm text-gray-600">{selectedSubproject?.name}</div>
                <div className="text-lg font-mono mt-2 text-gray-700 font-medium">
                  {formatTime(pendingLogData.duration)}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What did you work on?"
                  rows={3}
                  className="mt-1 border-gray-300 bg-white text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleConfirmLog}
                  className="flex-1 py-4 bg-gradient-to-r from-[#34A853] to-[#2a8c43] text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none"
                >
                  Save Entry
                </button>
                <button 
                  onClick={handleCancelLog}
                  className="py-4 px-6 border border-gray-300 text-gray-700 font-medium rounded-xl transition-all duration-300 hover:bg-gray-50 hover:shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StopwatchPanel;