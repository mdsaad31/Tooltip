import Dexie from 'dexie';
import type { Table } from 'dexie';

export interface Note {
  id?: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface Task {
  id?: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id?: number;
  theme: 'light' | 'dark' | 'auto';
  accentColor: 'azure' | 'mint' | 'lavender';
  transparency: number;
  soundEnabled: boolean;
}

export class TooltipDatabase extends Dexie {
  notes!: Table<Note>;
  tasks!: Table<Task>;
  settings!: Table<Settings>;

  constructor() {
    super('TooltipDatabase');
    this.version(1).stores({
      notes: '++id, title, content, createdAt, updatedAt, tags',
      tasks: '++id, title, description, completed, priority, dueDate, createdAt, updatedAt',
      settings: '++id, theme, accentColor, transparency, soundEnabled'
    });
  }
}

export const db = new TooltipDatabase();

// Initialize default settings
export const initializeDefaultSettings = async () => {
  const existingSettings = await db.settings.count();
  if (existingSettings === 0) {
    await db.settings.add({
      theme: 'auto',
      accentColor: 'azure',
      transparency: 0.2,
      soundEnabled: true
    });
  }
};

// Helper functions for common operations
export const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date();
  return await db.notes.add({
    ...note,
    createdAt: now,
    updatedAt: now
  });
};

export const updateNote = async (id: number, updates: Partial<Note>) => {
  return await db.notes.update(id, {
    ...updates,
    updatedAt: new Date()
  });
};

export const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date();
  return await db.tasks.add({
    ...task,
    createdAt: now,
    updatedAt: now
  });
};

export const toggleTask = async (id: number) => {
  const task = await db.tasks.get(id);
  if (task) {
    return await db.tasks.update(id, {
      completed: !task.completed,
      updatedAt: new Date()
    });
  }
};

export const getSettings = async (): Promise<Settings | undefined> => {
  return await db.settings.orderBy('id').first();
};

export const updateSettings = async (updates: Partial<Settings>) => {
  const settings = await getSettings();
  if (settings?.id) {
    return await db.settings.update(settings.id, updates);
  }
};