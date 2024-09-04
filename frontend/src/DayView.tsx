import React, { useState, useRef, useEffect } from 'react';
import WeightInput from "./WeightInput";
import { Day, DayExerciseDetails } from './types';

interface DayViewProps {
  day: Day;
  exercises: DayExerciseDetails[];
  onDeleteExercise: (dayExerciseId: number) => void;
  onWeightUpdate: (exerciseId: number, newWeight: number | null) => Promise<void>;
  onExercisesReorder: (reorderedExercises: DayExerciseDetails[]) => void;
}

const DayView: React.FC<DayViewProps> = ({
  day,
  exercises,
  onDeleteExercise,
  onWeightUpdate,
  onExercisesReorder
}) => {
  const [swipedExerciseId, setSwipedExerciseId] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedExercise, setDraggedExercise] = useState<DayExerciseDetails | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const exerciseRefs = useRef<(HTMLLIElement | null)[]>([]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent, exerciseId: number) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.touches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) { // Threshold for considering it a swipe
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

  const handleDragStart = (e: React.DragEvent, exercise: DayExerciseDetails) => {
    e.dataTransfer.setData('text/plain', exercise.dayExerciseId.toString());
    setDraggedExercise(exercise);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetExercise: DayExerciseDetails) => {
    e.preventDefault();
    if (!draggedExercise) return;
    
    const reorderedExercises = reorderExercises(draggedExercise, targetExercise);
    onExercisesReorder(reorderedExercises);
    setDraggedExercise(null);
  };

  const handleTouchStartDrag = (e: React.TouchEvent, exercise: DayExerciseDetails) => {
    setTouchStartY(e.touches[0].clientY);
    setDraggedExercise(exercise);
  };

  const handleTouchMoveDrag = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!draggedExercise || touchStartY === null) return;

    const touchY = e.touches[0].clientY;
    const draggedIndex = exercises.findIndex(ex => ex.dayExerciseId === draggedExercise.dayExerciseId);
    
    exerciseRefs.current.forEach((ref, index) => {
      if (ref && index !== draggedIndex) {
        const rect = ref.getBoundingClientRect();
        if (touchY > rect.top && touchY < rect.bottom) {
          const reorderedExercises = reorderExercises(draggedExercise, exercises[index]);
          onExercisesReorder(reorderedExercises);
        }
      }
    });
  };

  const handleTouchEndDrag = () => {
    setTouchStartY(null);
    setDraggedExercise(null);
  };

  const reorderExercises = (draggedExercise: DayExerciseDetails, targetExercise: DayExerciseDetails) => {
    const updatedExercises = [...exercises];
    const draggedIndex = updatedExercises.findIndex(ex => ex.dayExerciseId === draggedExercise.dayExerciseId);
    const targetIndex = updatedExercises.findIndex(ex => ex.dayExerciseId === targetExercise.dayExerciseId);

    updatedExercises.splice(draggedIndex, 1);
    updatedExercises.splice(targetIndex, 0, draggedExercise);

    return updatedExercises.map((ex, index) => ({
      ...ex,
      exercise_order: index + 1
    }));
  };

  return (
    <div className="bg-gray-900 text-white h-full" ref={containerRef}>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-400">Week {day.week}, {day.day_of_week}</h2>
        <ul className="space-y-2">
          {exercises.map((exercise, index) => (
            <li
              key={`day-exercise-${exercise.dayExerciseId}`}
              ref={el => exerciseRefs.current[index] = el}
              className="bg-gray-800 py-3 px-4 rounded-sm flex justify-between items-center relative overflow-hidden cursor-move"
              draggable="true"
              onDragStart={(e) => handleDragStart(e, exercise)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, exercise)}
              onTouchStart={(e) => {
                handleTouchStart(e);
                handleTouchStartDrag(e, exercise);
              }}
              onTouchMove={(e) => {
                handleTouchMove(e, exercise.dayExerciseId);
                handleTouchMoveDrag(e);
              }}
              onTouchEnd={() => {
                handleTouchEnd();
                handleTouchEndDrag();
              }}
            >
              <div className="flex-grow">
                <span className="text-sm"><span className="text-xs text-gray-400 ml-2">{exercise.exercise_order}.</span> {exercise.name}</span>
                {exercise.notes && (
                  <span className="text-xs text-gray-400 ml-2">({exercise.notes})</span>
                )}
              </div>
              <div className="flex items-center">
                <WeightInput
                  exerciseId={exercise.id}
                  initialWeight={exercise.weight}
                  onWeightUpdate={onWeightUpdate}
                />
                <button
                  onClick={() => onDeleteExercise(exercise.dayExerciseId)}
                  className={`ml-2 text-white font-bold hover:bg-red-700 focus:outline-none transition-transform duration-300
                    md:text-red-500 md:hover:text-red-400 md:bg-transparent md:hover:bg-transparent
                    ${swipedExerciseId === exercise.dayExerciseId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
                    absolute right-0 top-0 bottom-0 bg-red-600 flex items-center px-4
                    md:static md:bg-transparent md:px-2`}
                >
                  <span className="md:hidden">Delete</span>
                  <span className="hidden md:inline">✕</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DayView;