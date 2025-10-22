import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, FileText, Star, StarOff } from 'lucide-react';
import { GlassCard, GlassButton, GlassInput, GlassModal } from '../ui/GlassComponents';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  tags: string[];
}

export const QuickNotes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [selectedTag, setSelectedTag] = useState('');

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('quick-notes');
    if (savedNotes) {
      const parsed = JSON.parse(savedNotes);
      setNotes(parsed.map((n: any) => ({
        ...n,
        createdAt: new Date(n.createdAt),
        updatedAt: new Date(n.updatedAt)
      })));
    }
  }, []);

  // Save notes to localStorage
  const saveNotes = (newNotes: Note[]) => {
    setNotes(newNotes);
    localStorage.setItem('quick-notes', JSON.stringify(newNotes));
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || note.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  }).sort((a, b) => {
    // Sort: pinned notes first, then by updatedAt descending
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags))).sort();

  const handleAddNote = () => {
    setEditingNote(null);
    setNoteForm({ title: '', content: '', tags: '' });
    setShowNoteModal(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', ')
    });
    setShowNoteModal(true);
  };

  const handleSaveNote = () => {
    if (!noteForm.title.trim()) return;

    const tags = noteForm.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const now = new Date();

    if (editingNote) {
      const updatedNotes = notes.map(note =>
        note.id === editingNote.id
          ? {
              ...note,
              title: noteForm.title.trim(),
              content: noteForm.content.trim(),
              tags,
              updatedAt: now
            }
          : note
      );
      saveNotes(updatedNotes);
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title: noteForm.title.trim(),
        content: noteForm.content.trim(),
        createdAt: now,
        updatedAt: now,
        isPinned: false,
        tags
      };
      saveNotes([newNote, ...notes]);
    }

    setShowNoteModal(false);
    setNoteForm({ title: '', content: '', tags: '' });
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    saveNotes(updatedNotes);
  };

  const handleTogglePin = (noteId: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId
        ? { ...note, isPinned: !note.isPinned }
        : note
    );
    saveNotes(updatedNotes);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderNoteCard = (note: Note) => (
    <div
      key={note.id}
      className="group relative"
    >
      <GlassCard className={`p-4 cursor-pointer hover:scale-105 transition-all duration-200 ${
        note.isPinned ? 'ring-2 ring-yellow-400/30' : ''
      }`}>
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-white font-semibold text-lg truncate flex-1 mr-2">
            {note.title}
          </h3>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleTogglePin(note.id);
              }}
              className={`p-1 rounded transition-colors ${
                note.isPinned 
                  ? 'text-yellow-400 hover:text-yellow-300' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {note.isPinned ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditNote(note);
              }}
              className="p-1 rounded text-white/60 hover:text-white transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteNote(note.id);
              }}
              className="p-1 rounded text-white/60 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {note.content && (
          <p className="text-white/70 text-sm mb-3 line-clamp-3">
            {note.content}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-indigo-500/20 text-indigo-200 rounded-full"
              >
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-white/50">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
          <span className="text-xs text-white/50">
            {formatDate(note.updatedAt)}
          </span>
        </div>
      </GlassCard>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <FileText className="w-8 h-8 text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">Quick Notes</h1>
            <p className="text-white/60">Capture your thoughts and ideas</p>
          </div>
        </div>
        <GlassButton onClick={handleAddNote}>
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </GlassButton>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
            <GlassInput
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        {allTags.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-white/60 text-sm">Filter:</span>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm backdrop-blur-md"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag} className="bg-black/80">
                  {tag}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl text-white/60 mb-2">
            {notes.length === 0 ? 'No notes yet' : 'No notes match your search'}
          </h3>
          <p className="text-white/40 mb-6">
            {notes.length === 0 
              ? 'Create your first note to get started'
              : 'Try adjusting your search or filters'
            }
          </p>
          {notes.length === 0 && (
            <GlassButton onClick={handleAddNote}>
              <Plus className="w-4 h-4 mr-2" />
              Create Note
            </GlassButton>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredNotes.map(renderNoteCard)}
        </div>
      )}

      {/* Note Modal */}
      <GlassModal
        isOpen={showNoteModal}
        onClose={() => {
          setShowNoteModal(false);
          setNoteForm({ title: '', content: '', tags: '' });
        }}
        title={editingNote ? 'Edit Note' : 'New Note'}
        size="lg"
      >
        <div className="space-y-4">
          <GlassInput
            label="Title"
            placeholder="Enter note title..."
            value={noteForm.title}
            onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
          />
          
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Content
            </label>
            <textarea
              placeholder="Write your note here..."
              value={noteForm.content}
              onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
              rows={6}
              className="w-full px-4 py-3 rounded-lg backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none resize-none"
            />
          </div>
          
          <GlassInput
            label="Tags (comma-separated)"
            placeholder="e.g., work, ideas, important"
            value={noteForm.tags}
            onChange={(e) => setNoteForm(prev => ({ ...prev, tags: e.target.value }))}
          />
          
          <div className="flex space-x-3 pt-4">
            {editingNote && (
              <GlassButton
                variant="secondary"
                className="text-red-300 hover:text-red-200"
                onClick={() => {
                  handleDeleteNote(editingNote.id);
                  setShowNoteModal(false);
                }}
              >
                Delete
              </GlassButton>
            )}
            <div className="flex-1" />
            <GlassButton
              variant="secondary"
              onClick={() => setShowNoteModal(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton onClick={handleSaveNote}>
              {editingNote ? 'Update' : 'Create'}
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
};