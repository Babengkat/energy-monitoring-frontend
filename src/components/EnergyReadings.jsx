import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import EnergyReadings from './components/EnergyReadings';


const EnergyReadings = () => {
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    axiosInstance.get('energy-readings/')
      .then(response => {
        setReadings(response.data);
      })
      .catch(error => {
        console.error('Error fetching energy readings:', error);
      });
  }, []);

  return (
    <div>
      <h2>Energy Readings</h2>
      <ul>
        {readings.map(reading => (
          <li key={reading.id}>
            {reading.device_name} - {reading.energy_consumed} kWh at {reading.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EnergyReadings;
