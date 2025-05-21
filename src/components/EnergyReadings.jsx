import { useEffect, useState } from "react";
import axios from "axios";

const EnergyReadings = () => {
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    axios.get("https://energy-monitoring-backend.onrender.com/api/energy-readings/")
      .then((response) => setReadings(response.data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <h1>Energy Readings</h1>
      <ul>
        {readings.map((reading) => (
          <li key={reading.id}>
            {reading.timestamp} - {reading.energy_consumed} kWh
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EnergyReadings;
