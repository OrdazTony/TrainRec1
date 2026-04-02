import React, { useState } from "react";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city) return;

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      // Step 1: Search for the city coordinates
      const geoUrl = `https://open-meteo.com{encodeURIComponent(city)}&count=1&language=en&format=json`;
      console.log("Fetching Geocoding from:", geoUrl); // Check this in your Console!

      const geoRes = await fetch(geoUrl, { mode: 'cors' });
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found. Try another name.");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, admin1 } = geoData.results[0];

      // Step 2: Get weather using those coordinates
      const weatherUrl = `https://open-meteo.com{latitude}&longitude=${longitude}&current_weather=true&temperature_unit=celsius`;
      console.log("Fetching Weather from:", weatherUrl);

      const weatherRes = await fetch(weatherUrl, { mode: 'cors' });
      const weatherData = await weatherRes.json();

      setWeather({
        ...weatherData.current_weather,
        cityName: `${name}, ${admin1 || ""}`,
      });
    } catch (err) {
      console.error("DEBUG ERROR:", err);
      setError("Connection blocked. Try disabling ad-blockers or check your internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" style={{ padding: "20px" }}>
      <h1>Weather</h1>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter city (e.g. New York)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{ padding: "10px", width: "200px", borderRadius: "4px", border: "1px solid #ddd" }}
        />
        <button type="submit" style={{ padding: "10px 20px", marginLeft: "10px", cursor: "pointer" }}>
          Search
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

      {weather && (
        <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
          <h2>{weather.cityName}</h2>
          <p><strong>Temperature:</strong> {weather.temperature}°C</p>
          <p><strong>Wind Speed:</strong> {weather.windspeed} km/h</p>
        </div>
      )}
    </div>
  );
};

export default Weather;
//*/

//Open-Meteo Fixed version second day 
/*
import React, { useState } from "react";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city) return;

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      // Step 1: Search for the city coordinates
      const geoUrl = `https://open-meteo.com{encodeURIComponent(city)}&count=1&language=en&format=json`;
      console.log("Fetching Geocoding from:", geoUrl); // Check this in your Console!

      const geoRes = await fetch(geoUrl, { mode: 'cors' });
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found. Try another name.");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, admin1 } = geoData.results[0];

      // Step 2: Get weather using those coordinates
      const weatherUrl = `https://open-meteo.com{latitude}&longitude=${longitude}&current_weather=true&temperature_unit=celsius`;
      console.log("Fetching Weather from:", weatherUrl);

      const weatherRes = await fetch(weatherUrl, { mode: 'cors' });
      const weatherData = await weatherRes.json();

      setWeather({
        ...weatherData.current_weather,
        cityName: `${name}, ${admin1 || ""}`,
      });
    } catch (err) {
      console.error("DEBUG ERROR:", err);
      setError("Connection blocked. Try disabling ad-blockers or check your internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" style={{ padding: "20px" }}>
      <h1>Weather</h1>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter city (e.g. New York)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{ padding: "10px", width: "200px", borderRadius: "4px", border: "1px solid #ddd" }}
        />
        <button type="submit" style={{ padding: "10px 20px", marginLeft: "10px", cursor: "pointer" }}>
          Search
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

      {weather && (
        <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
          <h2>{weather.cityName}</h2>
          <p><strong>Temperature:</strong> {weather.temperature}°C</p>
          <p><strong>Wind Speed:</strong> {weather.windspeed} km/h</p>
        </div>
      )}
    </div>
  );
};

export default Weather;
*/

//wttrt.in API 2nd choice option
/*
import React, { useState } from "react";

const WeatherWttr = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // format=j1 returns full JSON data
      const res = await fetch(`https://wttr.in{encodeURIComponent(city)}?format=j1`);
      if (!res.ok) throw new Error("Could not find that location.");
      const data = await res.json();

      setWeather({
        cityName: data.nearest_area[0].areaName[0].value,
        temperature: data.current_condition[0].temp_C,
        windspeed: data.current_condition[0].windspeedKmph,
        desc: data.current_condition[0].weatherDesc[0].value
      });
    } catch (err) {
      setError("wttr.in error. Try a different city.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>wttr.in Weather</h1>
      <form onSubmit={handleSearch}>
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City name..." style={{ padding: "8px" }} />
        <button type="submit">Search</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {weather && (
        <div style={{ marginTop: "20px", background: "#f0f8ff", padding: "15px" }}>
          <h2>{weather.cityName}</h2>
          <p>Condition: {weather.desc}</p>
          <p>Temp: {weather.temperature}°C</p>
          <p>Wind: {weather.windspeed} km/h</p>
        </div>
      )}
    </div>
  );
};

export default WeatherWttr;
*/

//bright sky api
/*
import React, { useState } from "react";

const WeatherBrightSky = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Get lat/lon (Using OpenStreetMap Nominatim for Geocoding)
      const geoRes = await fetch(`https://openstreetmap.org{city}&format=json&limit=1`);
      const geoData = await geoRes.json();
      if (geoData.length === 0) throw new Error("Location not found.");
      
      const { lat, lon, display_name } = geoData[0];

      // 2. Get Weather via BrightSky
      const weatherRes = await fetch(`https://brightsky.dev{lat}&lon=${lon}`);
      const weatherData = await weatherRes.json();

      setWeather({
        cityName: display_name.split(',')[0],
        temperature: weatherData.weather.temperature,
        windspeed: weatherData.weather.wind_speed,
      });
    } catch (err) {
      setError("BrightSky connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>BrightSky Weather</h1>
      <form onSubmit={handleSearch}>
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" style={{ padding: "8px" }} />
        <button type="submit">Search</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {weather && (
        <div style={{ marginTop: "20px", background: "#e8f5e9", padding: "15px" }}>
          <h2>{weather.cityName}</h2>
          <p>Temp: {weather.temperature}°C</p>
          <p>Wind: {weather.windspeed} km/h</p>
        </div>
      )}
    </div>
  );
};

export default WeatherBrightSky;

*/