import React, { useState, useCallback } from 'react';
import { useNotes } from '@/hooks/useNotes';
import NotesList from '@/components/NotesList';
import NoteEditor from '@/components/NoteEditor';
import { Note } from '@/types/note';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const {
    notes,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    createNote,
    updateNote,
    deleteNote,
    totalNotes,
  } = useNotes();

  const [selectedNote, setSelectedNote] = useState<Note | undefined>();
  const [showAutoSaveToast, setShowAutoSaveToast] = useState(false);
  const [savingNoteId, setSavingNoteId] = useState<string | undefined>();
  const [deletingNoteId, setDeletingNoteId] = useState<string | undefined>();
  const { toast } = useToast();

  const handleNoteSelect = useCallback((note: Note) => {
    setSelectedNote(note);
    setShowAutoSaveToast(false); // Reset auto-save toast flag
  }, []);

  const handleNoteCreate = useCallback(async () => {
    if (selectedNote) {
      setShowAutoSaveToast(true);
      setTimeout(async () => {
        const newNote = await createNote('Untitled Note', '');
        if (newNote) {
          setSelectedNote(newNote);
        }
        setShowAutoSaveToast(false);
        toast({
          title: "Note created",
          description: "A new note has been created successfully.",
        });
      }, 100);
    } else {
      const newNote = await createNote('Untitled Note', '');
      if (newNote) {
        setSelectedNote(newNote);
      }
      toast({
        title: "Note created",
        description: "A new note has been created successfully.",
      });
    }
  }, [createNote, selectedNote, toast]);

  const handleNoteSave = useCallback(async (title: string, content: string) => {
    if (selectedNote) {
      const noteId = selectedNote.id ?? (selectedNote as any)?._id;
      if (!noteId) return; // Guard against undefined IDs
      setSavingNoteId(noteId);
      try {
        await updateNote(noteId, title, content);
      } finally {
        setSavingNoteId(undefined);
      }
    }
  }, [selectedNote, updateNote]);

  const handleNoteDelete = useCallback(async (id: string) => {
    setDeletingNoteId(id);
    try {
      await deleteNote(id);
      if (selectedNote && selectedNote.id === id) {
        setSelectedNote(undefined);
      }
      toast({
        title: "Note deleted",
        description: "The note has been deleted successfully.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete the note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingNoteId(undefined);
    }
  }, [deleteNote, selectedNote, toast]);

  const handleTitleChange = useCallback((title: string) => {
    // This is called for real-time title updates in the sidebar
    // The actual saving is handled by the auto-save in NoteEditor
  }, []);

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* Sidebar with notes list */}
      <NotesList
        notes={notes}
        selectedNoteId={selectedNote?.id}
        searchQuery={searchQuery}
        sortBy={sortBy}
        onSearchChange={setSearchQuery}
        onSortChange={setSortBy}
        onNoteSelect={handleNoteSelect}
        onNoteCreate={handleNoteCreate}
        onNoteDelete={handleNoteDelete}
        savingNoteId={savingNoteId}
        deletingNoteId={deletingNoteId}
      />

      {/* Main editor area */}
      <NoteEditor
        note={selectedNote}
        onSave={handleNoteSave}
        onTitleChange={handleTitleChange}
        showAutoSaveToast={showAutoSaveToast}
      />

      {/* Status bar */}
      <div className="fixed bottom-0 right-0 p-2 text-xs text-gray-500 bg-white dark:bg-gray-950 border-t">
        {totalNotes} {totalNotes === 1 ? 'note' : 'notes'} total
        {searchQuery && ` • ${notes.length} shown`}
      </div>
    </div>
  );
};

export default Index;