import React, { useState, useEffect } from 'react';
import { Plus, Search, Check, X, Calendar, Flag, AlertCircle, Clock } from 'lucide-react';
import { GlassCard, GlassButton, GlassInput, GlassModal } from '../ui/GlassComponents';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  completedAt?: Date;
  category: string;
}

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-green-400', bg: 'bg-green-500/20' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  { value: 'high', label: 'High', color: 'text-red-400', bg: 'bg-red-500/20' }
];

const DEFAULT_CATEGORIES = ['Work', 'Personal', 'Shopping', 'Health', 'Learning'];

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    dueDate: '',
    category: ''
  });

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      const parsed = JSON.parse(savedTasks);
      setTasks(parsed.map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
        completedAt: t.completedAt ? new Date(t.completedAt) : undefined
      })));
    }
  }, []);

  // Save tasks to localStorage
  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem('tasks', JSON.stringify(newTasks));
  };

  const allCategories = Array.from(new Set([
    ...DEFAULT_CATEGORIES,
    ...tasks.map(task => task.category).filter(Boolean)
  ])).sort();

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && !task.completed) ||
                         (filterStatus === 'completed' && task.completed);
    const matchesCategory = !filterCategory || task.category === filterCategory;
    const matchesPriority = !filterPriority || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  }).sort((a, b) => {
    // Sort: incomplete tasks first, then by priority, then by due date, then by creation date
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    active: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => !t.completed && t.dueDate && t.dueDate < new Date()).length
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      category: ''
    });
    setShowTaskModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
      category: task.category
    });
    setShowTaskModal(true);
  };

  const handleSaveTask = () => {
    if (!taskForm.title.trim()) return;

    const now = new Date();
    const dueDate = taskForm.dueDate ? new Date(taskForm.dueDate) : undefined;

    if (editingTask) {
      const updatedTasks = tasks.map(task =>
        task.id === editingTask.id
          ? {
              ...task,
              title: taskForm.title.trim(),
              description: taskForm.description.trim(),
              priority: taskForm.priority,
              dueDate,
              category: taskForm.category.trim()
            }
          : task
      );
      saveTasks(updatedTasks);
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        completed: false,
        priority: taskForm.priority,
        dueDate,
        createdAt: now,
        category: taskForm.category.trim()
      };
      saveTasks([newTask, ...tasks]);
    }

    setShowTaskModal(false);
    setTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      category: ''
    });
  };

  const handleToggleTask = (taskId: string) => {
    const now = new Date();
    const updatedTasks = tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            completed: !task.completed,
            completedAt: !task.completed ? now : undefined
          }
        : task
    );
    saveTasks(updatedTasks);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(updatedTasks);
  };

  const isOverdue = (task: Task) => {
    return !task.completed && task.dueDate && task.dueDate < new Date();
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getPriorityConfig = (priority: Task['priority']) => {
    return PRIORITIES.find(p => p.value === priority) || PRIORITIES[1];
  };

  const renderTaskCard = (task: Task) => {
    const priorityConfig = getPriorityConfig(task.priority);
    const overdue = isOverdue(task);

    return (
      <div
        key={task.id}
        className={`group p-4 rounded-lg transition-all duration-200 ${
          task.completed
            ? 'bg-white/5 opacity-75'
            : overdue
            ? 'bg-red-500/10 border border-red-500/30'
            : 'bg-white/10 hover:bg-white/15'
        }`}
      >
        <div className="flex items-start space-x-3">
          <button
            onClick={() => handleToggleTask(task.id)}
            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.completed
                ? 'bg-green-500 border-green-500'
                : 'border-white/30 hover:border-white/50'
            }`}
          >
            {task.completed && <Check className="w-3 h-3 text-white" />}
          </button>

          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold ${
              task.completed 
                ? 'text-white/60 line-through' 
                : 'text-white'
            }`}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className={`text-sm mt-1 ${
                task.completed ? 'text-white/40' : 'text-white/70'
              }`}>
                {task.description}
              </p>
            )}

            <div className="flex items-center flex-wrap gap-2 mt-3">
              <span className={`px-2 py-1 text-xs rounded-full ${priorityConfig.bg} ${priorityConfig.color}`}>
                <Flag className="w-3 h-3 inline mr-1" />
                {priorityConfig.label}
              </span>

              {task.category && (
                <span className="px-2 py-1 text-xs bg-indigo-500/20 text-indigo-200 rounded-full">
                  {task.category}
                </span>
              )}

              {task.dueDate && (
                <span className={`px-2 py-1 text-xs rounded-full flex items-center ${
                  overdue
                    ? 'bg-red-500/20 text-red-300'
                    : task.completed
                    ? 'bg-white/10 text-white/60'
                    : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {overdue ? <AlertCircle className="w-3 h-3 mr-1" /> : <Calendar className="w-3 h-3 mr-1" />}
                  {formatDate(task.dueDate)}
                </span>
              )}

              {task.completedAt && (
                <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded-full flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Completed {formatDate(task.completedAt)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleEditTask(task)}
              className="p-1 rounded text-white/60 hover:text-white transition-colors"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteTask(task.id)}
              className="p-1 rounded text-white/60 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Check className="w-8 h-8 text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">Tasks</h1>
            <p className="text-white/60">Organize and track your todos</p>
          </div>
        </div>
        <GlassButton onClick={handleAddTask}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </GlassButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <GlassCard size="sm" className="text-center">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-white/60 text-sm">Total</div>
        </GlassCard>
        <GlassCard size="sm" className="text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.active}</div>
          <div className="text-white/60 text-sm">Active</div>
        </GlassCard>
        <GlassCard size="sm" className="text-center">
          <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
          <div className="text-white/60 text-sm">Completed</div>
        </GlassCard>
        <GlassCard size="sm" className="text-center">
          <div className="text-2xl font-bold text-red-400">{stats.overdue}</div>
          <div className="text-white/60 text-sm">Overdue</div>
        </GlassCard>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
            <GlassInput
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm backdrop-blur-md"
          >
            <option value="all" className="bg-black/80">All Tasks</option>
            <option value="active" className="bg-black/80">Active</option>
            <option value="completed" className="bg-black/80">Completed</option>
          </select>

          {allCategories.length > 0 && (
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm backdrop-blur-md"
            >
              <option value="" className="bg-black/80">All Categories</option>
              {allCategories.map(category => (
                <option key={category} value={category} className="bg-black/80">
                  {category}
                </option>
              ))}
            </select>
          )}

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm backdrop-blur-md"
          >
            <option value="" className="bg-black/80">All Priorities</option>
            {PRIORITIES.map(priority => (
              <option key={priority.value} value={priority.value} className="bg-black/80">
                {priority.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <Check className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl text-white/60 mb-2">
            {tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
          </h3>
          <p className="text-white/40 mb-6">
            {tasks.length === 0 
              ? 'Create your first task to get started'
              : 'Try adjusting your search or filters'
            }
          </p>
          {tasks.length === 0 && (
            <GlassButton onClick={handleAddTask}>
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </GlassButton>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(renderTaskCard)}
        </div>
      )}

      {/* Task Modal */}
      <GlassModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setTaskForm({
            title: '',
            description: '',
            priority: 'medium',
            dueDate: '',
            category: ''
          });
        }}
        title={editingTask ? 'Edit Task' : 'New Task'}
      >
        <div className="space-y-4">
          <GlassInput
            label="Title"
            placeholder="Enter task title..."
            value={taskForm.title}
            onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
          />
          
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              placeholder="Enter task description..."
              value={taskForm.description}
              onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 rounded-lg backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none resize-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Priority
              </label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm backdrop-blur-md"
              >
                {PRIORITIES.map(priority => (
                  <option key={priority.value} value={priority.value} className="bg-black/80">
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
            
            <GlassInput
              label="Due Date"
              type="date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Category
            </label>
            <input
              list="categories"
              placeholder="Select or create category..."
              value={taskForm.category}
              onChange={(e) => setTaskForm(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none"
            />
            <datalist id="categories">
              {allCategories.map(category => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </div>
          
          <div className="flex space-x-3 pt-4">
            {editingTask && (
              <GlassButton
                variant="secondary"
                className="text-red-300 hover:text-red-200"
                onClick={() => {
                  handleDeleteTask(editingTask.id);
                  setShowTaskModal(false);
                }}
              >
                Delete
              </GlassButton>
            )}
            <div className="flex-1" />
            <GlassButton
              variant="secondary"
              onClick={() => setShowTaskModal(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton onClick={handleSaveTask}>
              {editingTask ? 'Update' : 'Create'}
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
};