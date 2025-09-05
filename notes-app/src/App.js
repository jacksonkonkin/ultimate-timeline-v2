import React, { useState, useEffect } from 'react';
import './App.css';
import { supabase } from './utils/supabase';

function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Load notes from Supabase on component mount
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      alert('Failed to load notes. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Create or Update note
  const handleSaveNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    try {
      if (editingId) {
        // Update existing note
        const { error } = await supabase
          .from('notes')
          .update({
            title: newNote.title,
            content: newNote.content,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;
        
        setEditingId(null);
      } else {
        // Create new note
        const { error } = await supabase
          .from('notes')
          .insert([
            {
              title: newNote.title,
              content: newNote.content,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);

        if (error) throw error;
      }
      
      setNewNote({ title: '', content: '' });
      await fetchNotes(); // Refresh the notes list
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  // Delete note
  const handleDeleteNote = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        if (editingId === id) {
          setEditingId(null);
          setNewNote({ title: '', content: '' });
        }
        
        await fetchNotes(); // Refresh the notes list
      } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note. Please try again.');
      }
    }
  };

  // Edit note
  const handleEditNote = (note) => {
    setNewNote({ title: note.title, content: note.content });
    setEditingId(note.id);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setNewNote({ title: '', content: '' });
  };

  // Filter notes based on search term
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="App">
        <div className="loading">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>📝 My Notes App</h1>
      </header>
      
      <div className="container">
        <div className="note-editor">
          <h2>{editingId ? 'Edit Note' : 'Create New Note'}</h2>
          <input
            type="text"
            placeholder="Note title..."
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            className="note-title-input"
          />
          <textarea
            placeholder="Note content..."
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            className="note-content-input"
            rows="6"
          />
          <div className="button-group">
            <button onClick={handleSaveNote} className="btn btn-primary">
              {editingId ? 'Update Note' : 'Save Note'}
            </button>
            {editingId && (
              <button onClick={handleCancelEdit} className="btn btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="notes-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="notes-list">
            {filteredNotes.length === 0 ? (
              <p className="no-notes">No notes found. Create your first note!</p>
            ) : (
              filteredNotes.map(note => (
                <div key={note.id} className={`note-card ${editingId === note.id ? 'editing' : ''}`}>
                  <h3>{note.title}</h3>
                  <p>{note.content}</p>
                  <div className="note-footer">
                    <span className="note-date">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </span>
                    <div className="note-actions">
                      <button onClick={() => handleEditNote(note)} className="btn-icon edit">
                        ✏️
                      </button>
                      <button onClick={() => handleDeleteNote(note.id)} className="btn-icon delete">
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;