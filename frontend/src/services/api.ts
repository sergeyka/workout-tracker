import axios from 'axios';
import { supabase } from '../supabaseClient';
import { Day, DayExerciseDetails, NewDayExercise, Exercise, WeightUpdate, ReorderExercise } from '../types';

const API_URL = process.env.REACT_APP_API_URL;

let cachedSession: any = null;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  if (!cachedSession) {
    const { data: { session } } = await supabase.auth.getSession();
    cachedSession = session;
  }
  
  if (cachedSession) {
    config.headers.Authorization = `Bearer ${cachedSession.access_token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add a listener for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  cachedSession = session;
});

// Day related API calls
export const getDays = () => api.get<Day[]>('/days');

export const getDayExercises = (dayId: number) => 
  api.get<DayExerciseDetails[]>(`/days/${dayId}/exercises`);

export const addExerciseToDay = (newExercise: NewDayExercise) =>
  api.post(`/days/${newExercise.day_id}/exercises`, newExercise);

export const reorderExercises = (dayId: number, reorderedExercises: ReorderExercise[]) =>
  api.put(`/days/${dayId}/exercises/reorder`, reorderedExercises);

// Exercise related API calls
export const getAllExercises = async () => {
    const response = await api.get<Exercise[]>('/exercises');
    return response.data;
}

export const getExercise = (id: number) => api.get<Exercise>(`/exercises/${id}`);

export const createExercise = async (exercise: Partial<Exercise>): Promise<Exercise> => {
  const response = await api.post<Exercise>(`/exercises`, exercise);
  return response.data;
};

export const updateExercise = (id: number, exercise: Partial<Exercise>) =>
  api.put<Exercise>(`/exercises/${id}`, exercise);

export const deleteExercise = (id: number) => api.delete(`/exercises/${id}`);

export const searchExercises = async (query: string): Promise<Exercise[]> => {
  const response = await api.get<Exercise[]>('/exercises/search', { params: { query } });
  return response.data;
};

export const updateExerciseWeight = (exerciseId: number, weight: number | null) =>
  api.put<Exercise>(`/exercises/${exerciseId}`, { weight });

// DayExercise related API calls
export const deleteDayExercise = (dayExerciseId: number) =>
  api.delete(`/dayExercises/${dayExerciseId}`);

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