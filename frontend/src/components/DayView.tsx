import React, { useState, useRef, useEffect } from 'react';
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

  return (
    <div className="bg-gray-900 text-white h-full" ref={containerRef}>
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
                        className={`bg-gray-800 py-3 px-4 rounded-sm flex justify-between items-center relative overflow-hidden ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                      >
                        <div className="flex-grow">
                          <span className="text-sm">
                            <span className="text-xs text-gray-400 ml-2">{exercise.exercise_order}.</span> {exercise.name}
                          </span>
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
                            className="ml-2 text-red-500 hover:text-red-400 focus:outline-none"
                          >
                            ✕
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