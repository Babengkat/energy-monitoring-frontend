import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import EnergyReadings from './components/EnergyReadings';

<Route path="/energy-readings" element={<EnergyReadings />} />

function App() {
  // User auth states
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Dashboard data states
  const [readings, setReadings] = useState([]);
  const [totalEnergy, setTotalEnergy] = useState(0);
  const [buildingData, setBuildingData] = useState({});
  const [applianceData, setApplianceData] = useState({});
  const [dateFilter, setDateFilter] = useState('');
  const [showTable, setShowTable] = useState(true);

  // Fetch data function for dashboard with token auth
  const fetchData = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoggedIn(false);
      return;
    }

    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/energy-readings/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        const data = response.data;

        const filteredData = dateFilter
          ? data.filter(reading => new Date(reading.timestamp).toISOString().split('T')[0] === dateFilter)
          : data;

        setReadings(filteredData);

        const total = filteredData.reduce((sum, reading) => sum + reading.energy, 0);
        setTotalEnergy(total);

        // Group energy by building and appliance
        const groupedBuildings = {};
        const groupedAppliances = {};

        filteredData.forEach(reading => {
          const b = reading.building;
          const a = reading.appliance;

          if (!groupedBuildings[b]) groupedBuildings[b] = 0;
          groupedBuildings[b] += reading.energy;

          if (!groupedAppliances[a]) groupedAppliances[a] = 0;
          groupedAppliances[a] += reading.energy;
        });

        setBuildingData(groupedBuildings);
        setApplianceData(groupedAppliances);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        if (error.response && error.response.status === 401) {
          alert('Session expired or unauthorized. Please login again.');
          handleLogout();
        }
      });
  };

  useEffect(() => {
    if (loggedIn) {
      fetchData();
      const interval = setInterval(fetchData, 10000); // Auto-refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [dateFilter, loggedIn]);

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();

    axios.post('http://127.0.0.1:8000/api/token/', {
      username: username,
      password: password
    })
      .then(response => {
        localStorage.setItem('accessToken', response.data.access);
        setLoggedIn(true);
        setUsername('');
        setPassword('');
        fetchData();
      })
      .catch(error => {
        alert('Invalid username or password');
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setLoggedIn(false);
  };

  if (!loggedIn) {
    // Login form
    return (
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>Username:</label><br />
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Password:</label><br />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button" style={{ marginTop: '15px' }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  // Dashboard UI
  return (
    <div className="container">
      <div className="header">
        <h1 className="title">Electricity Consumption Dashboard</h1>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>

      <div className="summary">
        <p>Total Energy Consumption: <strong>{totalEnergy.toFixed(2)}</strong> kWh</p>
      </div>

      <div className="filters">
        <label>Filter by Date: </label>
        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
        />
        <button onClick={() => setShowTable(!showTable)} className="toggle-button">
          {showTable ? 'Hide' : 'Show'} Table
        </button>
      </div>

      <div className="section">
        <h2>Energy per Building</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={Object.entries(buildingData).map(([name, energy]) => ({ name, energy }))}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="energy" fill="#8884d8" name="kWh" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="section">
        <h2>Energy per Appliance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={Object.entries(applianceData).map(([name, energy]) => ({ name, energy }))}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="energy" fill="#82ca9d" name="kWh" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {showTable && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Building</th>
              <th>Appliance</th>
              <th>Current (A)</th>
              <th>Power (W)</th>
              <th>Energy (kWh)</th>
            </tr>
          </thead>
          <tbody>
            {readings.map(reading => (
              <tr key={reading.id}>
                <td>{new Date(reading.timestamp).toLocaleString()}</td>
                <td>{reading.building}</td>
                <td>{reading.appliance}</td>
                <td>{reading.current.toFixed(2)}</td>
                <td>{reading.power.toFixed(2)}</td>
                <td>{reading.energy.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
