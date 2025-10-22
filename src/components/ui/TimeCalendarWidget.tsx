import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { GlassCard } from './GlassComponents';

interface TimeCalendarWidgetProps {
  onCalendarClick?: () => void;
}

export const TimeCalendarWidget: React.FC<TimeCalendarWidgetProps> = ({ onCalendarClick }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showMiniCalendar, setShowMiniCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderMiniCalendar = () => {
    const daysInMonth = getDaysInMonth(calendarDate);
    const firstDay = getFirstDayOfMonth(calendarDate);
    const today = new Date();
    const isCurrentMonth = 
      calendarDate.getMonth() === today.getMonth() && 
      calendarDate.getFullYear() === today.getFullYear();

    const days = [];
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    // Add day headers
    dayNames.forEach(day => {
      days.push(
        <div key={day} className="text-xs text-white/60 font-medium text-center p-1">
          {day}
        </div>
      );
    });

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === today.getDate();
      days.push(
        <button
          key={day}
          className={`w-6 h-6 text-xs rounded-full transition-colors ${
            isToday
              ? 'bg-indigo-500 text-white font-bold'
              : 'text-white/80 hover:bg-white/10'
          }`}
          onClick={() => {
            if (onCalendarClick) {
              onCalendarClick();
            }
            setShowMiniCalendar(false);
          }}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="absolute top-full right-0 mt-2 z-50">
        <GlassCard size="sm" className="p-2 sm:p-3 w-56 sm:w-64">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="text-white font-medium text-xs sm:text-sm">
              {calendarDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex space-x-1">
              <button
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1))}
                className="p-0.5 sm:p-1 rounded hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
              </button>
              <button
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1))}
                className="p-0.5 sm:p-1 rounded hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {days}
          </div>
          
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/10">
            <button
              onClick={() => {
                if (onCalendarClick) {
                  onCalendarClick();
                }
                setShowMiniCalendar(false);
              }}
              className="w-full text-xs text-indigo-300 hover:text-indigo-200 transition-colors"
            >
              Open Full Calendar
            </button>
          </div>
        </GlassCard>
      </div>
    );
  };

  return (
    <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-40">
      <div className="relative">
        <div 
          className="cursor-pointer hover:scale-105 transition-transform duration-200"
          onClick={() => setShowMiniCalendar(!showMiniCalendar)}
        >
          <GlassCard size="sm" className="px-2 py-1.5 sm:px-3 sm:py-2">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="text-right">
                <div className="text-white font-mono text-sm sm:text-lg font-bold">
                  {formatTime(currentTime)}
                </div>
                <div className="text-white/70 text-xs hidden sm:block">
                  {formatDate(currentTime)}
                </div>
              </div>
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
            </div>
          </GlassCard>
        </div>
        
        {showMiniCalendar && renderMiniCalendar()}
      </div>
    </div>
  );
};