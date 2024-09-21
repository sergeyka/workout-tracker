import axios from 'axios';
import { Day, DayExerciseDetails, NewDayExercise, Exercise, WeightUpdate, ReorderExercise } from '../types';

const API_URL = process.env.REACT_APP_API_URL;

// Day related API calls
export const getDays = () => axios.get<Day[]>(`${API_URL}/days`);

export const getDayExercises = (dayId: number) => 
  axios.get<DayExerciseDetails[]>(`${API_URL}/days/${dayId}/exercises`);

export const addExerciseToDay = (newExercise: NewDayExercise) =>
  axios.post(`${API_URL}/days/${newExercise.day_id}/exercises`, newExercise);

export const reorderExercises = (dayId: number, reorderedExercises: ReorderExercise[]) =>
  axios.put(`${API_URL}/days/${dayId}/exercises/reorder`, reorderedExercises);

// Exercise related API calls
export const getAllExercises = async () => {
    const response = await axios.get<Exercise[]>(`${API_URL}/exercises`);
    return response.data;
}

export const getExercise = (id: number) => axios.get<Exercise>(`${API_URL}/exercises/${id}`);

export const createExercise = async (exercise: Partial<Exercise>): Promise<Exercise> => {
  const response = await axios.post<Exercise>(`${API_URL}/exercises`, exercise);
  return response.data;
};

export const updateExercise = (id: number, exercise: Partial<Exercise>) =>
  axios.put<Exercise>(`${API_URL}/exercises/${id}`, exercise);

export const deleteExercise = (id: number) => axios.delete(`${API_URL}/exercises/${id}`);

export const searchExercises = async (query: string): Promise<Exercise[]> => {
  const response = await axios.get<Exercise[]>(`${API_URL}/exercises/search`, { params: { query } });
  return response.data;
};

export const updateExerciseWeight = (exerciseId: number, weight: number | null) =>
  axios.put<Exercise>(`${API_URL}/exercises/${exerciseId}`, { weight });

// DayExercise related API calls
export const deleteDayExercise = (dayExerciseId: number) =>
  axios.delete(`${API_URL}/dayExercises/${dayExerciseId}`);

// Example usage in a component:
// import * as api from '../services/api';
// 
// const fetchDays = async () => {
//   try {
//     const response = await api.getDays();
//     setDays(response.data);
//   } catch (error) {
//     console.error('Error fetching days:', error);
//   }
// };