import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Exercise } from './types';
import WeightInput from './WeightInput';
import EditExerciseDialog from './EditExerciseDialog';

const API_URL = process.env.REACT_APP_API_URL;

const ExercisesScreen: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [swipedExerciseId, setSwipedExerciseId] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await axios.get<Exercise[]>(`${API_URL}/exercises`);
      setExercises(response.data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const handleNameChange = async (exerciseId: number, newName: string) => {
    try {
      await axios.put(`${API_URL}/exercises/${exerciseId}`, { name: newName });
      setExercises(exercises.map(ex => ex.id === exerciseId ? { ...ex, name: newName } : ex));
      setEditingExercise(null);
    } catch (error) {
      console.error('Error updating exercise name:', error);
    }
  };

  const handleWeightUpdate = async (exerciseId: number, newWeight: number | null) => {
    try {
      await axios.put(`${API_URL}/exercises/${exerciseId}`, { weight: newWeight });
      setExercises(exercises.map(ex => ex.id === exerciseId ? { ...ex, weight: newWeight } : ex));
    } catch (error) {
      console.error('Error updating exercise weight:', error);
    }
  };

  const handleDeleteExercise = async (exerciseId: number) => {
    try {
      await axios.delete(`${API_URL}/exercises/${exerciseId}`);
      setExercises(exercises.filter(ex => ex.id !== exerciseId));
      setSwipedExerciseId(null);
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setSwipedExerciseId(null);
  };

  const handleSaveEdit = async (exerciseId: number, newName: string) => {
    try {
      await axios.put(`${API_URL}/exercises/${exerciseId}`, { name: newName });
      setExercises(exercises.map(ex => ex.id === exerciseId ? { ...ex, name: newName } : ex));
      setEditingExercise(null);
    } catch (error) {
      console.error('Error updating exercise name:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingExercise(null);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent, exerciseId: number) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.touches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      setSwipedExerciseId(exerciseId);
    } else {
      setSwipedExerciseId(null);
    }
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSwipedExerciseId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4" ref={containerRef}>
      <h1 className="text-2xl font-bold mb-4">Exercises</h1>
      <ul className="space-y-4">
        {exercises.map((exercise) => (
          <li
            key={exercise.id}
            className="bg-gray-800 p-4 rounded-lg flex justify-between items-center relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={(e) => handleTouchMove(e, exercise.id)}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex-grow">
              <span>{exercise.name}</span>
            </div>
            <WeightInput
              exerciseId={exercise.id}
              initialWeight={exercise.weight}
              onWeightUpdate={handleWeightUpdate}
            />
            <div
              className={`absolute right-0 top-0 bottom-0 flex transition-transform duration-300 ${
                swipedExerciseId === exercise.id ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <button
                onClick={() => handleEditExercise(exercise)}
                className="bg-blue-600 text-white px-4 flex items-center"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteExercise(exercise.id)}
                className="bg-red-600 text-white px-4 flex items-center"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {editingExercise && (
        <EditExerciseDialog
          exercise={editingExercise}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default ExercisesScreen;