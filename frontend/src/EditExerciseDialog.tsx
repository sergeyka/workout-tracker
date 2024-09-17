import React, { useState, useEffect, useRef } from 'react';
import { Exercise } from './types';

interface EditExerciseDialogProps {
  exercise: Exercise;
  onSave: (exerciseId: number, newName: string) => void;
  onCancel: () => void;
}

const EditExerciseDialog: React.FC<EditExerciseDialogProps> = ({ exercise, onSave, onCancel }) => {
  const [newName, setNewName] = useState(exercise.name);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(newName.length, newName.length);
    }
  }, []);

  const handleSave = () => {
    onSave(exercise.id, newName);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewName(e.target.value);
    adjustTextareaHeight(e.target);
  };

  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Exercise</h2>
        <textarea
          ref={textareaRef}
          value={newName}
          onChange={handleTextareaChange}
          className="w-full bg-gray-700 text-white px-3 py-2 rounded mb-4 resize-none overflow-hidden"
          rows={3}
          style={{ minHeight: '6rem' }}
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditExerciseDialog;