/*import React, { useState } from "react";

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
// ── Combined Weather + Gym Locator (Explore page) ──────────────────────────
import React, { useState, useEffect } from 'react';
import {
  Box, Card, Chip, CircularProgress, Container, Grid,
  Stack, Typography, alpha, LinearProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import AirRoundedIcon from '@mui/icons-material/AirRounded';
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';

// WMO weather interpretation code → description + emoji
function wmoInfo(code) {
  if (code === 0) return { desc: 'Clear Sky', emoji: '☀️' };
  if (code === 1) return { desc: 'Mainly Clear', emoji: '🌤️' };
  if (code === 2) return { desc: 'Partly Cloudy', emoji: '⛅' };
  if (code === 3) return { desc: 'Overcast', emoji: '🌥️' };
  if ([45, 48].includes(code)) return { desc: 'Foggy', emoji: '🌫️' };
  if ([51, 53, 55, 56, 57].includes(code)) return { desc: 'Drizzle', emoji: '🌦️' };
  if ([61, 63, 65, 66, 67].includes(code)) return { desc: 'Rain', emoji: '🌧️' };
  if ([71, 73, 75, 77].includes(code)) return { desc: 'Snow', emoji: '❄️' };
  if ([80, 81, 82].includes(code)) return { desc: 'Rain Showers', emoji: '🌧️' };
  if ([85, 86].includes(code)) return { desc: 'Snow Showers', emoji: '🌨️' };
  if (code === 95) return { desc: 'Thunderstorm', emoji: '⛈️' };
  if ([96, 99].includes(code)) return { desc: 'Thunderstorm + Hail', emoji: '⛈️' };
  return { desc: 'Unknown', emoji: '🌡️' };
}

const GMAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;
function GymPhoto({ gym }) {
  const H = 160;
  // Google Places photo
  if (gym.photoRef) {
    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${gym.photoRef}&key=${GMAPS_KEY}`;
    return (
      <Box sx={{ width: '100%', height: H, overflow: 'hidden', borderRadius: '12px 12px 0 0', position: 'relative', backgroundColor: '#1a1a2e' }}>
        <img src={url} alt={gym.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', zIndex: 1, pointerEvents: 'none' }} />
      </Box>
    );
  }
  // fallback: Street View
  const streetViewUrl = GMAPS_KEY ? `https://maps.googleapis.com/maps/api/streetview?size=600x${H}&location=${gym.lat},${gym.lon}&fov=90&pitch=0&key=${GMAPS_KEY}` : null;
  const [useFallback, setUseFallback] = useState(false);
  // fallback: OSM tile grid
  const ZOOM = 16;
  const TILE = 256;
  const xExact = (gym.lon + 180) / 360 * (1 << ZOOM);
  const latRad = gym.lat * Math.PI / 180;
  const yExact = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * (1 << ZOOM);
  const tx = Math.floor(xExact);
  const ty = Math.floor(yExact);
  const px = (xExact - tx) * TILE;
  const py = (yExact - ty) * TILE;
  const gridTop = H / 2 - (TILE + py);
  const tiles = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++)
      tiles.push({ dx, dy });
  return (
    <Box sx={{ width: '100%', height: H, overflow: 'hidden', borderRadius: '12px 12px 0 0', position: 'relative', backgroundColor: '#1a1a2e' }}>
      {!useFallback && streetViewUrl ? (
        <img src={streetViewUrl} alt={gym.name} onError={() => setUseFallback(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <Box sx={{ position: 'absolute', left: '50%', top: gridTop, width: TILE * 3, height: TILE * 3, transform: `translateX(calc(-50% + ${TILE - px}px - ${TILE}px))` }}>
          {tiles.map(({ dx, dy }) => (
            <img key={`${dx}-${dy}`} src={`https://tile.openstreetmap.org/${ZOOM}/${tx + dx}/${ty + dy}.png`} alt="" style={{ position: 'absolute', left: (dx + 1) * TILE, top: (dy + 1) * TILE, width: TILE, height: TILE, display: 'block' }} />
          ))}
        </Box>
      )}
      {useFallback && (<Box sx={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -100%)', fontSize: '24px', lineHeight: 1, zIndex: 2, pointerEvents: 'none', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.7))' }}>📍</Box>)}
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', zIndex: 1, pointerEvents: 'none' }} />
    </Box>
  );
}

// Haversine formula — returns distance in miles
function haversine(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Explore() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [coords, setCoords] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [weather, setWeather] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [geoError, setGeoError] = useState(null);
  const [gymsError, setGymsError] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [gymsLoading, setGymsLoading] = useState(true);

  // Step 1 — request browser geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setWeatherLoading(false);
      setGymsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => {
        setGeoError('Location access denied — please allow location access and refresh.');
        setWeatherLoading(false);
        setGymsLoading(false);
      }
    );
  }, []);

  // Step 2 — fetch weather + gyms once coords are ready
  useEffect(() => {
    if (!coords) return;
    const { lat, lon } = coords;

    // Reverse geocode for a human-readable location name (Nominatim / OSM)
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    )
      .then((r) => r.json())
      .then((d) => {
        const a = d.address || {};
        setLocationName(
          [a.city || a.town || a.village || a.county, a.state]
            .filter(Boolean)
            .join(', ') || 'Your Location'
        );
      })
      .catch(() => setLocationName('Your Location'));

    // Weather — Open-Meteo (free, no API key)
    fetch(
      `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}&longitude=${lon}` +
        `&current_weather=true` +
        `&hourly=relativehumidity_2m` +
        `&temperature_unit=fahrenheit` +
        `&windspeed_unit=mph` +
        `&timezone=auto`
    )
      .then((r) => r.json())
      .then((d) => {
        setWeather(d.current_weather);
        // Match humidity to the current hour slot returned by the API
        const ts = d.current_weather?.time;
        const idx = d.hourly?.time?.indexOf(ts);
        if (idx >= 0) setHumidity(d.hourly.relativehumidity_2m[idx]);
      })
      .catch(() => {})
      .finally(() => setWeatherLoading(false));

    // Gyms — Google Places Nearby Search
    const fetchGyms = async () => {
      try {
        const radius = 8000; // meters (5 miles)
        const type = 'gym';
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=${type}&key=${GMAPS_KEY}`;
        const proxy = 'https://corsproxy.io/?'; // CORS workaround for browser
        const r = await fetch(proxy + encodeURIComponent(url));
        const d = await r.json();
        if (!d.results) throw new Error('No results');
        const results = d.results.map((el) => ({
          id: el.place_id,
          name: el.name,
          lat: el.geometry.location.lat,
          lon: el.geometry.location.lng,
          address: el.vicinity || null,
          city: null,
          phone: null,
          website: null,
          dist: haversine(lat, lon, el.geometry.location.lat, el.geometry.location.lng),
          photoRef: el.photos?.[0]?.photo_reference || null,
        })).sort((a, b) => a.dist - b.dist);
        setGyms(results);
      } catch (e) {
        setGymsError('Could not reach gym data service. Please try again later.');
      } finally {
        setGymsLoading(false);
      }
    };
    fetchGyms();
  }, [coords]);

  const sectionCard = {
    borderRadius: 5,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
    background: isDark
      ? `linear-gradient(145deg, ${alpha('#1a1625', 0.9)} 0%, ${alpha('#231d35', 0.9)} 100%)`
      : `linear-gradient(145deg, ${alpha('#ffffff', 0.95)} 0%, ${alpha('#f8f4ff', 0.95)} 100%)`,
    boxShadow: isDark
      ? '0 4px 24px rgba(0,0,0,0.4)'
      : '0 4px 24px rgba(124,77,255,0.08)',
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: '80px',
        pb: 6,
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>



          {/* ── GYM LOCATOR ── */}
          <Typography
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 900,
              textAlign: 'center',
              mt: 2, mb: 1.5,
              letterSpacing: 1.5,
              color: theme.palette.primary.main,
              textShadow: '0 2px 16px rgba(124,77,255,0.10)',
            }}
          >
            Ready to show off the Gains
          </Typography>
          <Card sx={{ ...sectionCard, p: 0, overflow: 'hidden' }}>
            {/* Header strip */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #ff7a18 0%, #ff9f43 100%)',
                px: 3, py: 1.5,
                display: 'flex', alignItems: 'center', gap: 1,
              }}
            >
              <FitnessCenterRoundedIcon sx={{ color: '#fff', fontSize: { xs: 36, sm: 44, md: 52 } }} />
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    color: '#fff',
                    textShadow: '0 2px 16px rgba(255,122,24,0.25)',
                    lineHeight: 1.1,
                  }}
                >
                  Gyms Near You
                </Typography>

              {!gymsLoading && !geoError && (
                <Chip
                  label={`${gyms.length} found`}
                  size="small"
                  sx={{
                    ml: 'auto',
                    backgroundColor: alpha('#fff', 0.25),
                    color: '#fff', fontWeight: 700, fontSize: '0.75rem', height: 22,
                  }}
                />
              )}
            </Box>

            <Box sx={{ p: 3 }}>
              {geoError ? (
                <Typography color="error">{geoError}</Typography>
              ) : gymsLoading ? (
                <Box display="flex" alignItems="center" gap={2}>
                  <CircularProgress size={24} sx={{ color: '#ff9f43' }} />
                  <Typography sx={{ color: theme.palette.text.secondary }}>
                    Searching for gyms nearby…
                  </Typography>
                </Box>
              ) : gymsError ? (
                <Typography color="error" sx={{ py: 2, textAlign: 'center' }}>{gymsError}</Typography>
              ) : gyms.length === 0 ? (
                <Typography sx={{ color: theme.palette.text.secondary, py: 2, textAlign: 'center' }}>
                  No gyms found within 5 miles of your location.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {gyms.map((gym) => {
                    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gym.name)}&query_place_id=&ll=${gym.lat},${gym.lon}`;
                    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${gym.lat},${gym.lon}`;

                    return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={gym.id}>
                      <Card
                        component="a"
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          borderRadius: 4,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                          background: isDark
                            ? alpha('#2a1f3d', 0.6)
                            : alpha('#fff8f3', 0.9),
                          p: 0, height: '100%',
                          overflow: 'hidden',
                          textDecoration: 'none',
                          cursor: 'pointer',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          display: 'flex', flexDirection: 'column',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: isDark
                              ? '0 8px 24px rgba(0,0,0,0.5)'
                              : '0 8px 24px rgba(255,122,24,0.2)',
                          },
                        }}
                      >
                        <GymPhoto gym={gym} />
                        <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                            <Typography
                              fontWeight={700}
                              sx={{ fontSize: '0.95rem', flex: 1, pr: 1, color: theme.palette.text.primary }}
                            >
                              {gym.name}
                            </Typography>
                            <Chip
                              label={`${gym.dist < 0.1 ? '<0.1' : gym.dist.toFixed(1)} mi`}
                              size="small"
                              sx={{
                                background: 'linear-gradient(135deg, #ff7a18, #ff9f43)',
                                color: '#fff', fontWeight: 700, fontSize: '0.7rem',
                                flexShrink: 0, height: 20,
                              }}
                            />
                          </Box>

                          {gym.address && (
                            <Typography
                              sx={{
                                fontSize: '0.78rem', color: theme.palette.text.secondary,
                                mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5,
                              }}
                            >
                              <LocationOnRoundedIcon sx={{ fontSize: 13, color: '#ff9f43' }} />
                              {gym.address}{gym.city ? `, ${gym.city}` : ''}
                            </Typography>
                          )}

                          {gym.phone && (
                            <Typography sx={{ fontSize: '0.78rem', color: theme.palette.text.secondary, mb: 0.3 }}>
                              📞 {gym.phone}
                            </Typography>
                          )}

                          {gym.website && (
                            <Typography
                              component="span"
                              sx={{
                                fontSize: '0.78rem', color: '#7c4dff',
                                display: 'block', mt: 0.3,
                              }}
                            >
                              🌐 {gym.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                            </Typography>
                          )}

                          {/* Google Maps directions button */}
                          <Box
                            component="a"
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                              mt: 'auto', pt: 1.5,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              gap: 0.75,
                              background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
                              borderRadius: 2,
                              py: 0.8,
                              color: '#fff',
                              textDecoration: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              letterSpacing: 0.5,
                              transition: 'opacity 0.15s',
                              '&:hover': { opacity: 0.88 },
                            }}
                          >
                            <LocationOnRoundedIcon sx={{ fontSize: 14 }} />
                            Get Directions
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          </Card>

        </Stack>
      </Container>
    </Box>
  );
}
