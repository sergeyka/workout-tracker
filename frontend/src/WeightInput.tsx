import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';

interface WeightInputProps {
  exerciseId: number;
  initialWeight: number | null | undefined;
  onWeightUpdate: (exerciseId: number, newWeight: number | null) => Promise<void>;
}

const WeightInput: React.FC<WeightInputProps> = ({ exerciseId, initialWeight, onWeightUpdate }) => {
  const [weight, setWeight] = useState<string>(initialWeight != null ? initialWeight.toString() : '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => {
        setUpdateSuccess(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess]);

  const updateWeight = useCallback(async (weightToUpdate: string | null) => {
    if (weightToUpdate === (initialWeight != null ? initialWeight.toString() : null)) return;

    setIsUpdating(true);
    try {
      await onWeightUpdate(exerciseId, weightToUpdate ? parseFloat(weightToUpdate) : null);
      setUpdateSuccess(true);
    } catch (error) {
      console.error('Error updating weight:', error);
      alert('Failed to update weight. Please try again.');
    } finally {
        setIsUpdating(false);
    }
  }, [exerciseId, initialWeight, onWeightUpdate]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateWeight = useCallback(
    debounce((weightToUpdate: string) => {
      updateWeight(weightToUpdate === '' ? null : weightToUpdate);
    }, 1500),
    [updateWeight]
  );

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWeight = e.target.value;
    setWeight(newWeight);
    debouncedUpdateWeight(newWeight);
  };

  return (
    <div className="relative">
      <input
        type="number"
        value={weight}
        onChange={handleWeightChange}
        className={`bg-gray-700 text-white text-sm px-2 py-1 rounded w-16 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
          updateSuccess ? 'animate-border-blink' : ''
        }`}
      />
      {isUpdating && (
        <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <svg className="animate-spin h-3 w-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      )}
    </div>
  );
};

export default WeightInput;