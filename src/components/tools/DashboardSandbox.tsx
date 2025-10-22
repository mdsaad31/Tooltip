import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  RotateCcw, 
  Save, 
  Grid3X3, 
  Move, 
  Maximize2,
  Minimize2,
  FileText,
  CheckSquare,
  Calculator,
  Timer
} from 'lucide-react';
import { GlassCard, GlassButton } from '../ui/GlassComponents';

interface Widget {
  id: string;
  icon: React.ComponentType<any>;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

interface DashboardSandboxProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (widgets: Widget[]) => void;
}



export const DashboardSandbox: React.FC<DashboardSandboxProps> = ({ 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: 'quick-notes', icon: FileText, position: { x: 50, y: 50 }, size: { width: 200, height: 150 }, zIndex: 1 },
    { id: 'todays-tasks', icon: CheckSquare, position: { x: 300, y: 50 }, size: { width: 200, height: 150 }, zIndex: 1 },
    { id: 'calculator', icon: Calculator, position: { x: 550, y: 50 }, size: { width: 150, height: 150 }, zIndex: 1 },
    { id: 'timer', icon: Timer, position: { x: 50, y: 250 }, size: { width: 150, height: 150 }, zIndex: 1 }
  ]);
  
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const sandboxRef = useRef<HTMLDivElement>(null);

  // Handle widget dragging
  const handleMouseDown = (e: React.MouseEvent, widgetId: string) => {
    if (e.button !== 0) return; // Only left click
    
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const sandboxRect = sandboxRef.current?.getBoundingClientRect();
    
    if (!sandboxRect) return;

    setDraggedWidget(widgetId);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    // Bring to front
    setWidgets(prev => prev.map(w => 
      w.id === widgetId 
        ? { ...w, zIndex: Math.max(...prev.map(widget => widget.zIndex)) + 1 }
        : w
    ));
  };

  // Handle mouse movement for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggedWidget || !sandboxRef.current) return;

      const sandboxRect = sandboxRef.current.getBoundingClientRect();
      const newX = e.clientX - sandboxRect.left - dragOffset.x;
      const newY = e.clientY - sandboxRect.top - dragOffset.y;

      setWidgets(prev => prev.map(w => 
        w.id === draggedWidget 
          ? { 
              ...w, 
              position: { 
                x: Math.max(0, Math.min(newX, sandboxRect.width - w.size.width)),
                y: Math.max(0, Math.min(newY, sandboxRect.height - w.size.height))
              }
            }
          : w
      ));
    };

    const handleMouseUp = () => {
      setDraggedWidget(null);
    };

    if (draggedWidget) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedWidget, dragOffset]);

  // Handle resize
  const handleResize = (widgetId: string, direction: 'grow' | 'shrink') => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId 
        ? {
            ...w,
            size: {
              width: direction === 'grow' 
                ? Math.min(w.size.width + 50, 400)
                : Math.max(w.size.width - 50, 100),
              height: direction === 'grow'
                ? Math.min(w.size.height + 50, 300)
                : Math.max(w.size.height - 50, 100)
            }
          }
        : w
    ));
  };

  // Reset layout
  const resetLayout = () => {
    setWidgets([
      { id: 'quick-notes', icon: FileText, position: { x: 50, y: 50 }, size: { width: 200, height: 150 }, zIndex: 1 },
      { id: 'todays-tasks', icon: CheckSquare, position: { x: 300, y: 50 }, size: { width: 200, height: 150 }, zIndex: 1 },
      { id: 'calculator', icon: Calculator, position: { x: 550, y: 50 }, size: { width: 150, height: 150 }, zIndex: 1 },
      { id: 'timer', icon: Timer, position: { x: 50, y: 250 }, size: { width: 150, height: 150 }, zIndex: 1 }
    ]);
  };

  // Auto-arrange widgets in grid
  const autoArrange = () => {
    const gridCols = 3;
    const widgetWidth = 200;
    const widgetHeight = 150;
    const padding = 20;

    setWidgets(prev => prev.map((widget, index) => ({
      ...widget,
      position: {
        x: (index % gridCols) * (widgetWidth + padding) + padding,
        y: Math.floor(index / gridCols) * (widgetHeight + padding) + padding
      },
      size: { width: widgetWidth, height: widgetHeight }
    })));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full h-full max-w-7xl max-h-[90vh] bg-white/10 rounded-2xl border border-white/20 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <Grid3X3 className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">Dashboard Layout Sandbox</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <GlassButton 
              variant="secondary" 
              size="sm"
              onClick={autoArrange}
              icon={<Grid3X3 className="w-4 h-4" />}
            >
              Auto Arrange
            </GlassButton>
            
            <GlassButton 
              variant="secondary" 
              size="sm"
              onClick={resetLayout}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Reset
            </GlassButton>
            
            <GlassButton 
              onClick={() => {
                onSave(widgets);
                onClose();
              }}
              icon={<Save className="w-4 h-4" />}
            >
              Save Layout
            </GlassButton>
            
            <GlassButton 
              variant="secondary" 
              size="sm"
              onClick={onClose}
              icon={<X className="w-4 h-4" />}
            >
              Close
            </GlassButton>
          </div>
        </div>

        {/* Instructions */}
        <div className="px-4 py-2 bg-white/5 border-b border-white/10">
          <p className="text-white/80 text-sm">
            <Move className="w-4 h-4 inline mr-2" />
            Drag widgets to reposition • Use resize controls to adjust size • Right-click for options
          </p>
        </div>

        {/* Sandbox Area */}
        <div 
          ref={sandboxRef}
          className="relative w-full h-full bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20 overflow-hidden"
          style={{ minHeight: '500px' }}
        >
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-12 grid-rows-8 w-full h-full">
              {Array.from({ length: 96 }).map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>

          {/* Widgets */}
          {widgets.map((widget) => {
            const IconComponent = widget.icon;
            return (
              <div
                key={widget.id}
                className={`absolute group cursor-move select-none ${
                  draggedWidget === widget.id ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                style={{
                  left: widget.position.x,
                  top: widget.position.y,
                  width: widget.size.width,
                  height: widget.size.height,
                  zIndex: widget.zIndex
                }}
                onMouseDown={(e) => handleMouseDown(e, widget.id)}
              >
                <GlassCard className="w-full h-full flex flex-col items-center justify-center relative group-hover:bg-white/15 transition-colors border-2 border-white/20 group-hover:border-white/40">
                  {/* Widget Icon */}
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-4 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100">
                      <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                      <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                      <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                    </div>
                  </div>

                  {/* Resize Controls */}
                  <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResize(widget.id, 'shrink');
                      }}
                      className="w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Minimize2 className="w-3 h-3 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResize(widget.id, 'grow');
                      }}
                      className="w-6 h-6 bg-green-500/80 hover:bg-green-500 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Maximize2 className="w-3 h-3 text-white" />
                    </button>
                  </div>

                  {/* Position indicator */}
                  <div className="absolute -top-8 left-0 text-xs text-white/60 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-2 py-1 rounded">
                    {Math.round(widget.position.x)}, {Math.round(widget.position.y)}
                  </div>
                </GlassCard>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};