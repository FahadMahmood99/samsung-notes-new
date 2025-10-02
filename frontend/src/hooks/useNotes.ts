import { useState, useEffect, useCallback } from 'react';
import { Note, SortOption } from '@/types/note';
import api from '@/utils/api';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedNotes = await api.getNotes(searchQuery, sortBy);
      setNotes(fetchedNotes);
      setError(null);
    } catch (err) {
      setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = useCallback(async (title: string, content: string): Promise<Note | null> => {
    try {
      const newNote = await api.createNote(title, content);
      const normalized = newNote ? { ...newNote, id: (newNote as any)?.id ?? (newNote as any)?._id } : null;
      await fetchNotes(); // Refetch to get the latest list
      return normalized as Note | null;
    } catch (err) {
      setError('Failed to create note');
      return null;
    }
  }, [fetchNotes]);

  const updateNote = useCallback(async (id: string, title: string, content: string) => {
    try {
      await api.updateNote(id, title, content);
      await fetchNotes(); // Refetch to update the list
      setError(null);
    } catch (err) {
      setError('Failed to update note');
      throw err; // Re-throw to allow caller to handle
    }
  }, [fetchNotes]);

  const deleteNote = useCallback(async (id: string) => {
    try {
      await api.deleteNote(id);
      await fetchNotes(); // Refetch to update the list
      setError(null);
    } catch (err) {
      setError('Failed to delete note');
      throw err; // Re-throw to allow caller to handle
    }
  }, [fetchNotes]);

  const getNote = useCallback(async (id: string): Promise<Note | undefined> => {
    try {
      return await api.getNote(id);
    } catch (err) {
      setError('Failed to fetch note');
      return undefined;
    }
  }, []);

  return {
    notes,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    createNote,
    updateNote,
    deleteNote,
    getNote,
    totalNotes: notes.length,
    loading,
    error,
    refetch: fetchNotes,
  };
};