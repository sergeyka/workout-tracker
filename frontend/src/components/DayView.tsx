import React, { useState, useRef, useCallback } from 'react';
import { DragDropContext, Draggable, DropResult } from 'react-beautiful-dnd';
import WeightInput from "./WeightInput";
import { Day, DayExerciseDetails } from '../types';
import { StrictModeDroppable } from '../utils/StrictModeDroppable';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [swipedExerciseId, setSwipedExerciseId] = useState<number | null>(null);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const reorderedExercises = Array.from(exercises);
    const [reorderedItem] = reorderedExercises.splice(result.source.index, 1);
    reorderedExercises.splice(result.destination.index, 0, reorderedItem);

    onExercisesReorder(reorderedExercises.map((ex, index) => ({
      ...ex,
      exercise_order: index + 1
    })));
  };

  const handleTouchStart = (e: React.TouchEvent, exerciseId: number) => {
    const touch = e.touches[0];
    (e.target as HTMLElement).dataset.start = touch.clientX.toString();
    (e.target as HTMLElement).dataset.exerciseId = exerciseId.toString();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const start = parseInt((e.target as HTMLElement).dataset.start || '0', 10);
    const exerciseId = parseInt((e.target as HTMLElement).dataset.exerciseId || '0', 10);
    const diff = start - touch.clientX;

    if (diff > 50) {
      setSwipedExerciseId(exerciseId);
    }
  };

  const handleTouchEnd = () => {
    // Do nothing on touch end to keep the submenu open
  };

  const closeSubmenu = useCallback(() => {
    setSwipedExerciseId(null);
  }, []);

  const handleDeleteClick = useCallback((e: React.MouseEvent, dayExerciseId: number) => {
    e.stopPropagation();
    onDeleteExercise(dayExerciseId);
    closeSubmenu();
  }, [onDeleteExercise, closeSubmenu]);

  return (
    <div className="bg-gray-900 text-white h-full" ref={containerRef} onClick={closeSubmenu}>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-400">Week {day.week}, {day.day_of_week}</h2>
        <DragDropContext onDragEnd={onDragEnd}>
          <StrictModeDroppable droppableId="exercises">
            {(provided, snapshot) => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {exercises.map((exercise, index) => (
                  <Draggable key={exercise.dayExerciseId.toString()} draggableId={exercise.dayExerciseId.toString()} index={index}>
                    {(provided, snapshot) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`bg-gray-800 rounded-sm flex items-center relative overflow-hidden ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                        onTouchStart={(e) => handleTouchStart(e, exercise.dayExerciseId)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        <div className="flex-grow py-3 px-4 flex justify-between items-center">
                          <div className="flex-grow">
                            <span className="text-sm">
                              <span className="text-xs text-gray-400 mr-2">{exercise.exercise_order}.</span>
                              {exercise.name}
                            </span>
                            {exercise.notes && (
                              <span className="text-xs text-gray-400 ml-2">({exercise.notes})</span>
                            )}
                          </div>
                          <div className="ml-4 flex items-center">
                            <WeightInput
                              exerciseId={exercise.id}
                              initialWeight={exercise.weight}
                              onWeightUpdate={onWeightUpdate}
                            />
                            <button
                              onClick={(e) => handleDeleteClick(e, exercise.dayExerciseId)}
                              className="ml-2 text-red-500 hover:text-red-400 focus:outline-none hidden sm:block"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <div 
                          className={`absolute right-0 top-0 bottom-0 bg-red-500 flex items-center transition-all duration-300 ease-in-out overflow-hidden sm:hidden ${
                            swipedExerciseId === exercise.dayExerciseId ? 'w-20' : 'w-0'
                          }`}
                        >
                          <button
                            onClick={(e) => handleDeleteClick(e, exercise.dayExerciseId)}
                            className="w-full h-full flex items-center justify-center text-white whitespace-nowrap"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </StrictModeDroppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default DayView;