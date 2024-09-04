import React, {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import WeekView from './WeekView';
import DayView from './DayView';
import SearchDialog from './SearchDialog';
import {Day, DayExerciseDetails, NewDayExercise} from './types';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL;

const App: React.FC = () => {
    const [selectedDay, setSelectedDay] = useState<Day | null>(null);
    const [exercises, setExercises] = useState<DayExerciseDetails[]>([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const loadExercises = useCallback(async (dayId: number) => {
        try {
            const response = await axios.get<DayExerciseDetails[]>(`${API_URL}/days/${dayId}/exercises`);
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
            await axios.post(`${API_URL}/days/${newExercise.day_id}/exercises`, newExercise);
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
            await axios.delete(`${API_URL}/dayExercises/${dayExerciseId}`);
            if (selectedDay) {
                loadExercises(selectedDay.id);
            }
        } catch (error) {
            console.error('Error deleting exercise:', error);
        }
    };

    const handleWeightUpdate = useCallback(async (exerciseId: number, newWeight: number | null): Promise<void> => {
        try {
            await axios.put(`${API_URL}/exercises/${exerciseId}`, {weight: newWeight});
            setExercises(prevExercises =>
                prevExercises.map(exercise =>
                    exercise.id === exerciseId ? {...exercise, weight: newWeight} : exercise
                )
            );
        } catch (error) {
            console.error('Error updating weight:', error);
            throw error; // Rethrow the error so the WeightInput component can handle it
        }
    }, []);

    const handleExercisesReorder = useCallback(async (reorderedExercises: DayExerciseDetails[]) => {
        try {
            setExercises(reorderedExercises);
            await axios.put(`${API_URL}/days/${selectedDay?.id}/exercises/reorder`, reorderedExercises);
        } catch (error) {
            console.error('Error reordering exercises:', error);
        }
    }, [selectedDay]);

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col">
            {selectedDay ? (
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
                                onClick={handleBackToSchedule}
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
            ) : (
                <WeekView onDaySelect={handleDaySelect}/>
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