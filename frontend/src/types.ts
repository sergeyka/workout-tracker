// Represents a basic exercise
export interface Exercise {
  id: number;
  name: string;
  weight?: number | null;
  notes?: string;
}

// Represents a day in the workout schedule
export interface Day {
  id: number;
  day_of_week: string;
  week: number;
}

export interface DayExerciseDetails {
  id: number;
  name: string;
  weight?: number | null;
  notes?: string;
  dayExerciseId: number;
  day_id: number;
  exercise_order: number;
}

// Represents the data structure for adding a new exercise to a day
export interface NewDayExercise {
  day_id: number;
  exercise_id: number;
}

// Represents the data structure for updating an exercise's weight
export interface WeightUpdate {
  exerciseId: number;
  weight: number | null;
}

// Represents the data structure for reordering exercises within a day
export interface ReorderExercise {
  id: number;
  order: number;
}