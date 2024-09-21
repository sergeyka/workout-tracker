import React, { useState, useEffect, useCallback } from 'react';
import { WeekView, DayView, SearchDialog, ExercisesScreen, AuthForm } from './components';
import { Day, DayExerciseDetails, NewDayExercise } from './types';
import './App.css';
import * as api from './services/api';
import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [selectedDay, setSelectedDay] = useState<Day | null>(null);
    const [exercises, setExercises] = useState<DayExerciseDetails[]>([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [currentScreen, setCurrentScreen] = useState<'schedule' | 'day' | 'exercises'>('schedule');

    const loadExercises = useCallback(async (dayId: number) => {
        try {
            const response = await api.getDayExercises(dayId);
            setExercises(response.data);
        } catch (error) {
            console.error('Error loading exercises:', error);
        }
    }, []);

    useEffect(() => {
        if (selectedDay) {
            loadExercises(selectedDay.id);
        }
    }, [selectedDay, loadExercises]);

    const handleDaySelect = (day: Day) => {
        setSelectedDay(day);
    };

    const handleBackToSchedule = () => {
        setSelectedDay(null);
    };

    const handleOpenSearch = () => {
        setIsSearchOpen(true);
    };

    const handleCloseSearch = () => {
        setIsSearchOpen(false);
    };

    const handleAddExercise = async (newExercise: NewDayExercise) => {
        try {
            await api.addExerciseToDay(newExercise);
            if (selectedDay) {
                loadExercises(selectedDay.id);
            }
        } catch (error) {
            console.error('Error adding exercise:', error);
        }
        setIsSearchOpen(false);
    };

    const handleDeleteExercise = async (dayExerciseId: number) => {
        try {
            await api.deleteDayExercise(dayExerciseId);
            if (selectedDay) {
                loadExercises(selectedDay.id);
            }
        } catch (error) {
            console.error('Error deleting exercise:', error);
        }
    };

    const handleWeightUpdate = useCallback(async (exerciseId: number, newWeight: number | null): Promise<void> => {
        try {
            await api.updateExerciseWeight(exerciseId, newWeight);
            setExercises(prevExercises =>
                prevExercises.map(exercise =>
                    exercise.id === exerciseId ? {...exercise, weight: newWeight} : exercise
                )
            );
        } catch (error) {
            console.error('Error updating weight:', error);
            throw error;
        }
    }, []);

    const handleExercisesReorder = useCallback(async (reorderedExercises: DayExerciseDetails[]) => {
        try {
            setExercises(reorderedExercises);
            if (selectedDay) {
                await api.reorderExercises(selectedDay.id, reorderedExercises.map((exercise, index) => ({
                    id: exercise.dayExerciseId,
                    order: index + 1
                })));
            }
        } catch (error) {
            console.error('Error reordering exercises:', error);
        }
    }, [selectedDay]);

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
        });

        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    if (!user) {
        return <AuthForm />;
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col">
            <AuthForm />
            {currentScreen === 'schedule' && (
                <>
                    <WeekView onDaySelect={(day) => {
                        setSelectedDay(day);
                        setCurrentScreen('day');
                    }} />
                    <div className="p-4 bg-gray-800">
                        <button
                            onClick={() => setCurrentScreen('exercises')}
                            className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors"
                        >
                            View All Exercises
                        </button>
                    </div>
                </>
            )}
            {currentScreen === 'day' && selectedDay && (
                <>
                    <div className="flex-grow overflow-y-auto">
                        <DayView
                            day={selectedDay}
                            exercises={exercises}
                            onDeleteExercise={handleDeleteExercise}
                            onWeightUpdate={handleWeightUpdate}
                            onExercisesReorder={handleExercisesReorder}
                        />
                    </div>
                    <div className="p-4 bg-gray-800">
                        <div className="flex justify-between">
                            <button
                                onClick={() => setCurrentScreen('schedule')}
                                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                            >
                                ← Back to Schedule
                            </button>
                            <button
                                onClick={handleOpenSearch}
                                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
                            >
                                + Add Exercise
                            </button>
                        </div>
                    </div>
                </>
            )}
            {currentScreen === 'exercises' && (
                <div className="flex flex-col h-screen">
                    <div className="flex-grow overflow-y-auto">
                        <ExercisesScreen />
                    </div>
                    <div className="p-4 bg-gray-800">
                        <button
                            onClick={() => setCurrentScreen('schedule')}
                            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                        >
                            Back to Schedule
                        </button>
                    </div>
                </div>
            )}
            {selectedDay && (
                <SearchDialog
                    isOpen={isSearchOpen}
                    onClose={handleCloseSearch}
                    onAddExercise={handleAddExercise}
                    currentDayId={selectedDay.id}
                />
            )}
        </div>
    );
};

export default App;