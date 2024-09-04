import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Day } from './types';

const API_URL = process.env.REACT_APP_API_URL; // || 'http://localhost:5001/api';

interface WeekViewProps {
  onDaySelect: (day: Day) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ onDaySelect }) => {
  const [days, setDays] = useState<Day[]>([]);

  useEffect(() => {
    const loadDays = async () => {
      try {
        const response = await axios.get<Day[]>(`${API_URL}/days`);
        setDays(response.data);
      } catch (error) {
        console.error('Error loading days:', error);
      }
    };

    loadDays();
  }, []);

  const handleDayClick = (week: number, day_of_week: string) => {
    const selectedDay = days.find(d => d.week === week && d.day_of_week === day_of_week);
    if (selectedDay) {
      onDaySelect(selectedDay);
    } else {
      alert(`Day not created yet for Week ${week}, ${day_of_week}`);
    }
  };

  return (
    <div className="bg-gray-900 text-white p-4">
      {[1, 2, 3, 4].map((week) => (
        <div key={week} className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-400">Week {week}</h3>
          <div className="flex justify-between lg:justify-start space-x-2">
            {['Tue', 'Thu', 'Sat'].map((day) => (
              <button
                key={day}
                onClick={() => handleDayClick(week, day)}
                className="flex-1 sm:flex-none bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors text-sm"
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

export default WeekView;