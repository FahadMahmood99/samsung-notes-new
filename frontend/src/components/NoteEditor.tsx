import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import RichTextEditor from './RichTextEditor';
import { Note } from '@/types/note';
import { FileText, Save, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NoteEditorProps {
  note?: Note;
  onSave: (title: string, content: string) => Promise<void>;
  onTitleChange?: (title: string) => void;
  showAutoSaveToast?: boolean;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onTitleChange, showAutoSaveToast = false }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Update local state when note prop changes
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [note]);

  // Auto-save functionality with debounce
  const debouncedSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return async (titleToSave: string, contentToSave: string, showToast: boolean = false) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (note && (titleToSave !== note.title || contentToSave !== note.content)) {
            setIsSaving(true);
            try {
              await onSave(titleToSave, contentToSave);
              if (showToast) {
                toast({
                  title: "Auto-saved",
                  description: "Your changes have been saved automatically.",
                  duration: 2000,
                });
              }
            } catch (error) {
              toast({
                title: "Save failed",
                description: "Failed to save your changes. Please try again.",
                variant: "destructive",
                duration: 3000,
              });
            } finally {
              setIsSaving(false);
            }
          }
        }, 1000); // 1 second delay
      };
    })(),
    [note, onSave, toast]
  );

  // Handle title changes
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onTitleChange?.(newTitle);
    if (note) {
      debouncedSave(newTitle, content, showAutoSaveToast);
    }
  };

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    if (note) {
      debouncedSave(title, newContent, showAutoSaveToast);
    }
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-gray-500">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-medium mb-2">No Note Selected</h2>
          <p>Select a note from the sidebar or create a new one to start editing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-950">
      {/* Header with title */}
      <div className="border-b p-4">
        <div className="flex items-center gap-2 mb-2">
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Note title..."
            className="text-lg font-medium border-none shadow-none px-0 focus-visible:ring-0 flex-1"
          />
          <div className="flex items-center gap-1 text-sm text-gray-500">
            {isSaving ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 text-green-500" />
                <span>Saved</span>
              </>
            )}
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          {note.createdAt && (
            <>Created: {new Date(note.createdAt).toLocaleDateString()} • </>
          )}
          {note.updatedAt && (
            <>Last modified: {new Date(note.updatedAt).toLocaleDateString()}</>
          )}
          {!note.createdAt && !note.updatedAt && (
            <>Note details</>
          )}
        </div>
      </div>

      {/* Rich text editor */}
      <div className="flex-1 relative">
        <RichTextEditor
          content={content}
          onChange={handleContentChange}
          placeholder="Start writing your note..."
        />
      </div>
    </div>
  );
};

export default NoteEditor;