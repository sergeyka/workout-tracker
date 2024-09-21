import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import { Exercise, NewDayExercise } from '../types';
import * as api from '../services/api';


const API_URL = process.env.REACT_APP_API_URL;

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExercise: (exercise: NewDayExercise) => void;
  currentDayId: number;
}

const SearchDialog: React.FC<SearchDialogProps> = ({ isOpen, onClose, onAddExercise, currentDayId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);

  const debouncedSearch = useCallback(
    (term: string) => {
      if (term.trim() === '') {
        setSearchResults([]);
        return;
      }

      const fetchResults = async () => {
        try {
          const exercises = await api.searchExercises(term);
          setSearchResults(exercises);
        } catch (error) {
          console.error('Error searching exercises:', error);
        }
      };
      
      fetchResults();
    },
    []
  );

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSearchResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = debounce(debouncedSearch, 300);
    handler(searchTerm);
    return () => handler.cancel();
  }, [searchTerm, debouncedSearch]);

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddNewExercise = async () => {
    try {
      const exercise = await api.createExercise({ name: searchTerm });
      const newDayExercise: NewDayExercise = {
        day_id: currentDayId,
        exercise_id: exercise.id
      };
      onAddExercise(newDayExercise);
      onClose();
    } catch (error) {
      console.error('Error adding new exercise:', error);
    }
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    const newDayExercise: NewDayExercise = {
      day_id: currentDayId,
      exercise_id: exercise.id
    };
    onAddExercise(newDayExercise);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-11/12 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Add Exercise</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-400 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchTermChange}
          placeholder="Search for exercises..."
          className="bg-gray-700 text-white border border-gray-600 rounded-md px-4 py-2 w-full mb-4 focus:outline-none focus:border-blue-500"
        />
        <ul className="max-h-48 overflow-y-auto mb-4">
          {searchResults.map((exercise) => (
            <li
              key={exercise.id}
              onClick={() => handleExerciseSelect(exercise)}
              className="cursor-pointer hover:bg-gray-700 rounded-md px-2 py-1 text-white"
            >
              {exercise.name}
            </li>
          ))}
        </ul>
        {searchResults.length === 0 && searchTerm.trim() !== '' && (
          <button
            onClick={handleAddNewExercise}
            className="bg-green-600 text-white rounded-md px-4 py-2 w-full hover:bg-green-700 transition-colors"
          >
            Add "{searchTerm}" as new exercise
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchDialog;