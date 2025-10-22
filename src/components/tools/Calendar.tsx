import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { GlassCard, GlassButton, GlassInput, GlassModal } from '../ui/GlassComponents';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  location?: string;
  description?: string;
}

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    time: '',
    location: '',
    description: ''
  });

  // Load events from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar-events');
    if (savedEvents) {
      const parsed = JSON.parse(savedEvents);
      setEvents(parsed.map((e: any) => ({ ...e, date: new Date(e.date) })));
    }
  }, []);

  // Save events to localStorage
  const saveEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem('calendar-events', JSON.stringify(newEvents));
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isSameDate = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDate(event.date, date));
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setEventForm({ title: '', time: '', location: '', description: '' });
    setShowEventModal(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      time: event.time || '',
      location: event.location || '',
      description: event.description || ''
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = () => {
    if (!eventForm.title.trim()) return;
    
    const eventDate = selectedDate || new Date();
    
    if (editingEvent) {
      const updatedEvents = events.map(event =>
        event.id === editingEvent.id
          ? {
              ...event,
              title: eventForm.title,
              time: eventForm.time,
              location: eventForm.location,
              description: eventForm.description
            }
          : event
      );
      saveEvents(updatedEvents);
    } else {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: eventForm.title,
        date: eventDate,
        time: eventForm.time,
        location: eventForm.location,
        description: eventForm.description
      };
      saveEvents([...events, newEvent]);
    }
    
    setShowEventModal(false);
    setEventForm({ title: '', time: '', location: '', description: '' });
  };

  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    saveEvents(updatedEvents);
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();
    const isCurrentMonth = 
      currentDate.getMonth() === today.getMonth() && 
      currentDate.getFullYear() === today.getFullYear();

    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Day headers
    dayNames.forEach(day => {
      days.push(
        <div key={day} className="text-sm text-white/60 font-medium text-center p-3 border-b border-white/10">
          {day}
        </div>
      );
    });

    // Empty cells for days before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-3 border-b border-r border-white/5" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = isCurrentMonth && day === today.getDate();
      const isSelected = selectedDate && isSameDate(date, selectedDate);
      const dayEvents = getEventsForDate(date);
      const hasEvents = dayEvents.length > 0;

      days.push(
        <div
          key={day}
          className={`p-3 border-b border-r border-white/5 cursor-pointer transition-colors min-h-[80px] ${
            isSelected
              ? 'bg-indigo-500/30'
              : 'hover:bg-white/5'
          }`}
          onClick={() => handleDateClick(day)}
        >
          <div className={`text-sm font-medium mb-1 ${
            isToday
              ? 'text-indigo-300 font-bold'
              : 'text-white/80'
          }`}>
            {day}
          </div>
          
          {hasEvents && (
            <div className="space-y-1">
              {dayEvents.slice(0, 2).map(event => (
                <div
                  key={event.id}
                  className="text-xs bg-indigo-500/20 text-indigo-200 px-1 py-0.5 rounded truncate"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditEvent(event);
                  }}
                >
                  {event.time && <span className="font-mono">{event.time} </span>}
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-xs text-white/50">
                  +{dayEvents.length - 2} more
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 border-l border-t border-white/10">
        {days}
      </div>
    );
  };

  const renderEventsList = () => {
    if (!selectedDate) return null;

    const dayEvents = getEventsForDate(selectedDate);
    const dateStr = selectedDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    return (
      <GlassCard className="mt-4">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">{dateStr}</h3>
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={handleAddEvent}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Event
            </GlassButton>
          </div>
          
          {dayEvents.length === 0 ? (
            <p className="text-white/60 text-center py-8">No events scheduled</p>
          ) : (
            <div className="space-y-3">
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  className="p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => handleEditEvent(event)}
                >
                  <h4 className="text-white font-medium">{event.title}</h4>
                  {event.time && (
                    <div className="flex items-center text-white/60 text-sm mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {event.time}
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center text-white/60 text-sm mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {event.location}
                    </div>
                  )}
                  {event.description && (
                    <p className="text-white/70 text-sm mt-2">{event.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <CalendarIcon className="w-8 h-8 text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">Calendar</h1>
            <p className="text-white/60">Manage your events and schedule</p>
          </div>
        </div>
        <GlassButton onClick={handleAddEvent}>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </GlassButton>
      </div>

      <GlassCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex space-x-2">
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={handlePreviousMonth}
              >
                <ChevronLeft className="w-4 h-4" />
              </GlassButton>
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  setCurrentDate(new Date());
                  setSelectedDate(new Date());
                }}
              >
                Today
              </GlassButton>
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={handleNextMonth}
              >
                <ChevronRight className="w-4 h-4" />
              </GlassButton>
            </div>
          </div>
          
          {renderCalendarGrid()}
        </div>
      </GlassCard>

      {renderEventsList()}

      {/* Event Modal */}
      <GlassModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setEventForm({ title: '', time: '', location: '', description: '' });
        }}
        title={editingEvent ? 'Edit Event' : 'Add New Event'}
      >
        <div className="space-y-4">
          <GlassInput
            label="Event Title"
            placeholder="Enter event title..."
            value={eventForm.title}
            onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
          />
          
          <GlassInput
            label="Time (optional)"
            placeholder="e.g., 2:00 PM or 14:00"
            value={eventForm.time}
            onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
          />
          
          <GlassInput
            label="Location (optional)"
            placeholder="Enter location..."
            value={eventForm.location}
            onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
          />
          
          <GlassInput
            label="Description (optional)"
            placeholder="Enter event description..."
            value={eventForm.description}
            onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
          />
          
          <div className="flex space-x-3 pt-4">
            {editingEvent && (
              <GlassButton
                variant="secondary"
                className="text-red-300 hover:text-red-200"
                onClick={() => {
                  handleDeleteEvent(editingEvent.id);
                  setShowEventModal(false);
                }}
              >
                Delete
              </GlassButton>
            )}
            <div className="flex-1" />
            <GlassButton
              variant="secondary"
              onClick={() => setShowEventModal(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton onClick={handleSaveEvent}>
              {editingEvent ? 'Update' : 'Create'}
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
};