import React, { useState, useEffect } from 'react';

const ScheduleComponent = () => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [workoutData, setWorkoutData] = useState([]);
  const weeks = [1, 2, 3, 4];
  const days = ['Tue', 'Thu', 'Sat'];

  useEffect(() => {
    if (selectedDay && selectedWeek) {
      fetchExercises(selectedDay, selectedWeek);
    }
  }, [selectedDay, selectedWeek]);

  const fetchExercises = async (day, week) => {
    try {
      const response = await fetch(`http://localhost:3001/api/exercises?day=${day}&week=${week}`);
      if (!response.ok) throw new Error('Failed to fetch exercises');
      const data = await response.json();
      setWorkoutData(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const handleDayClick = (day, week) => {
    setSelectedDay(day);
    setSelectedWeek(week);
  };

  const handleBack = () => {
    setSelectedDay(null);
    setSelectedWeek(null);
    setWorkoutData([]);
  };

  const handleWeightChange = async (id, weight) => {
    try {
      const response = await fetch(`http://localhost:3001/api/exercises/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight: weight === '' ? null : weight })
      });
      if (!response.ok) throw new Error('Failed to update weight');
      
      const updatedWorkoutData = workoutData.map(exercise => 
        exercise.id === id ? { ...exercise, current_weight: weight === '' ? null : weight } : exercise
      );
      setWorkoutData(updatedWorkoutData);
    } catch (error) {
      console.error('Error updating weight:', error);
    }
  };

  if (selectedDay && selectedWeek) {
    return (
      <div className="bg-gray-800 text-gray-300 p-6 font-mono min-h-screen">
        <h2 className="text-2xl mb-6 text-white font-bold">Workout for Week {selectedWeek}, {selectedDay}</h2>
        <ul className="space-y-4 mb-6">
          {workoutData.map((item) => (
            <li key={item.id} className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
              <span className="text-lg">{item.name}</span>
              <div>
                <input
                  type="number"
                  value={item.current_weight ?? ''}
                  onChange={(e) => handleWeightChange(item.id, e.target.value)}
                  className="bg-gray-600 text-white px-3 py-2 rounded w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="kg"
                />
                {item.notes && <span className="ml-2 text-sm text-gray-400">{item.notes}</span>}
              </div>
            </li>
          ))}
        </ul>
        <button 
          onClick={handleBack}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
        >
          Back to Schedule
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 text-gray-300 p-6 font-mono min-h-screen">
      <h2 className="text-2xl mb-6 text-white font-bold">Weekly Schedule</h2>
      {weeks.map((week) => (
        <div key={week} className="mb-4">
          <h3 className="text-xl mb-2 text-white">Week {week}</h3>
          <div className="flex space-x-4">
            {days.map((day) => (
              <button 
                key={day} 
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                onClick={() => handleDayClick(day, week)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScheduleComponent;