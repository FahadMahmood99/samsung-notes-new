import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Search, Plus, Trash2, FileText } from 'lucide-react';
import { Note, SortOption } from '@/types/note';
import { formatDistanceToNow } from 'date-fns';

interface NotesListProps {
  notes: Note[];
  selectedNoteId?: string;
  searchQuery: string;
  sortBy: SortOption;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: SortOption) => void;
  onNoteSelect: (note: Note) => void;
  onNoteCreate: () => void;
  onNoteDelete: (id: string) => void;
}

const NotesList: React.FC<NotesListProps> = ({
  notes,
  selectedNoteId,
  searchQuery,
  sortBy,
  onSearchChange,
  onSortChange,
  onNoteSelect,
  onNoteCreate,
  onNoteDelete,
}) => {
  const stripHtml = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const getPreview = (content: string): string => {
    const text = stripHtml(content);
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  return (
    <div className="w-80 border-r bg-gray-50 dark:bg-gray-900 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Notes</h1>
          <Button onClick={onNoteCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(value: SortOption) => onSortChange(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="title">Title A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <FileText className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-center">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </p>
            {!searchQuery && (
              <p className="text-sm text-center mt-1">
                Create your first note to get started
              </p>
            )}
          </div>
        ) : (
          <div className="p-2">
            {notes.map((note) => (
              <Card
                key={note.id}
                className={`mb-2 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  selectedNoteId === note.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => onNoteSelect(note)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate mb-1">
                        {note.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {getPreview(note.content) || 'No content'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                      </p>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-2 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Note</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{note.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onNoteDelete(note.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesList;