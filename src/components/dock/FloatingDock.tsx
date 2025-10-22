import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';

export interface DockItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  active?: boolean;
}

interface FloatingDockProps {
  items: DockItem[];
  activeItemId?: string;
  onItemClick: (itemId: string) => void;
  position?: 'bottom' | 'left' | 'right';
  className?: string;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({
  items,
  activeItemId,
  onItemClick,
  position = 'bottom',
  className = ''
}) => {
  const [showOverflow, setShowOverflow] = useState(false);

  // Responsive breakpoints for item display
  const getMaxVisibleItems = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 4; // Mobile: show 4 main items
      if (window.innerWidth < 768) return 6; // Small tablet: show 6 items  
      if (window.innerWidth < 1024) return 8; // Tablet: show 8 items
      return items.length; // Desktop: show all items
    }
    return items.length;
  };

  const maxVisible = getMaxVisibleItems();
  const visibleItems = items.slice(0, maxVisible - (items.length > maxVisible ? 1 : 0));
  const overflowItems = items.slice(maxVisible - (items.length > maxVisible ? 1 : 0));
  const hasOverflow = overflowItems.length > 0;

  const positionClasses = {
    bottom: 'fixed bottom-4 left-1/2 transform -translate-x-1/2 flex-row',
    left: 'fixed left-4 top-1/2 transform -translate-y-1/2 flex-col',
    right: 'fixed right-4 top-1/2 transform -translate-y-1/2 flex-col'
  };

  const baseClasses = 'backdrop-blur-md bg-black/20 border border-white/10 shadow-2xl';

  const renderDockItem = (item: DockItem, isInOverflow = false) => {
    const Icon = item.icon;
    const isActive = activeItemId === item.id;
    
    return (
      <div key={item.id} className="relative group">
        <button
          onClick={() => {
            onItemClick(item.id);
            if (isInOverflow) setShowOverflow(false);
          }}
          className={`
            dock-item relative flex items-center justify-center rounded-xl 
            transition-all duration-300 hover:scale-110 
            ${isInOverflow ? 'w-10 h-10' : 'w-12 h-12 sm:w-14 sm:h-14'}
            ${isActive 
              ? 'bg-white/30 scale-110 shadow-lg' 
              : 'hover:bg-white/20'
            }
          `}
          title={item.label}
        >
          <Icon className={`text-white ${isInOverflow ? 'w-4 h-4' : 'w-5 h-5 sm:w-6 sm:h-6'}`} />
          
          {/* Badge */}
          {item.badge && item.badge > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold">
              {item.badge > 99 ? '99+' : item.badge}
            </div>
          )}
          
          {/* Active indicator */}
          {isActive && (
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
          )}
        </button>
        
        {/* Tooltip */}
        <div className={`
          absolute z-10 px-2 py-1 bg-black/90 text-white text-xs rounded 
          opacity-0 pointer-events-none transition-all duration-200 
          whitespace-nowrap group-hover:opacity-100 group-hover:translate-y-0
          ${position === 'bottom' 
            ? 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 mb-2' 
            : 'left-full top-1/2 transform -translate-y-1/2 translate-x-1 ml-2'
          }
        `}>
          {item.label}
          <div className={`
            absolute w-1 h-1 bg-black/90 rotate-45
            ${position === 'bottom' 
              ? 'top-full left-1/2 transform -translate-x-1/2 -translate-y-0.5' 
              : 'right-full top-1/2 transform translate-x-0.5 -translate-y-1/2'
            }
          `} />
        </div>
      </div>
    );
  };

  return (
    <div className={`${positionClasses[position]} z-50 ${className}`}>
      <div className={`
        ${baseClasses} 
        flex ${position === 'bottom' ? 'flex-row' : 'flex-col'} 
        p-2 sm:p-3 rounded-2xl
        ${position === 'bottom' ? 'space-x-1 sm:space-x-2' : 'space-y-1 sm:space-y-2'}
      `}>
        {/* Main visible items */}
        {visibleItems.map(item => renderDockItem(item))}
        
        {/* Overflow menu button */}
        {hasOverflow && (
          <div className="relative">
            <button
              onClick={() => setShowOverflow(!showOverflow)}
              className={`
                w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl 
                transition-all duration-300 hover:scale-110 
                ${showOverflow ? 'bg-white/30 scale-110' : 'hover:bg-white/20'}
              `}
            >
              <MoreHorizontal className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
            
            {/* Overflow menu */}
            {showOverflow && (
              <div className={`
                absolute z-20 backdrop-blur-md bg-black/20 border border-white/10 
                rounded-xl p-2 shadow-2xl
                ${position === 'bottom' 
                  ? 'bottom-full mb-2 right-0 flex flex-col space-y-1' 
                  : 'left-full ml-2 top-0 flex flex-row space-x-1'
                }
              `}>
                {overflowItems.map(item => renderDockItem(item, true))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Backdrop for overflow menu */}
      {showOverflow && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => setShowOverflow(false)}
        />
      )}
    </div>
  );
};

interface DockTooltipProps {
  children: React.ReactNode;
  label: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const DockTooltip: React.FC<DockTooltipProps> = ({
  children,
  label,
  position = 'top'
}) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative group">
      {children}
      <div className={`
        absolute ${positionClasses[position]} 
        px-2 py-1 bg-black/90 text-white text-xs rounded 
        opacity-0 pointer-events-none transition-opacity duration-200 
        whitespace-nowrap group-hover:opacity-100 z-10
      `}>
        {label}
      </div>
    </div>
  );
};