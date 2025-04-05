import React, { useState, useRef, useEffect } from 'react';

interface CustomSelectProps {
  selectedHour: string;
  setSelectedHour: (hour: string) => void;
  hours: string[];
}

export const TimeSelect: React.FC<CustomSelectProps> = ({ selectedHour, setSelectedHour, hours }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (hourValue: string) => {
    setSelectedHour(`${hourValue.padStart(2, '0')}:00`);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={selectRef}>
      <label className="block text-md font-medium text-pink-300 mb-1">
        Termine:
      </label>
      <div className="relative">
        <button
          className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-pink-300 flex justify-between items-center"
          onClick={handleToggle}
        >
          {selectedHour || 'Seleziona un\'ora'}
          <svg
            className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <ul className="absolute z-10 mt-1 w-full rounded-md shadow-lg bg-gray-800 border border-gray-600 max-h-40 overflow-y-auto">
            {hours.map((hour) => (
              <li key={hour}>
                <button
                  className="w-full text-left p-3 hover:bg-gray-700 text-pink-300"
                  onClick={() => handleOptionClick(hour.split(':')[0])}
                >
                  {hour}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};