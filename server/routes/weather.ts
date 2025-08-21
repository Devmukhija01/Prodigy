import express from 'express';

const router = express.Router();

// Weather API endpoint
router.get('/', async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    
    // For now, return mock data since we don't have a real weather API
    // In a real application, you would call a weather service like OpenWeatherMap
    
    if (city) {
      // Mock data for city search
      const mockWeatherData = {
        weather: {
          city: city as string,
          country: 'Unknown',
          temperature: Math.floor(Math.random() * 30) + 10, // Random temp between 10-40°C
          description: 'Partly cloudy',
          humidity: Math.floor(Math.random() * 40) + 40, // Random humidity 40-80%
          windSpeed: Math.floor(Math.random() * 20) + 5, // Random wind 5-25 km/h
          feelsLike: Math.floor(Math.random() * 30) + 10,
          visibility: Math.floor(Math.random() * 10) + 5, // Random visibility 5-15 km
          icon: '02d',
          lastUpdated: new Date().toLocaleString()
        }
      };
      
      return res.json(mockWeatherData);
    }
    
    if (lat && lon) {
      // Mock data for coordinates
      const mockWeatherData = {
        weather: {
          city: 'Current Location',
          country: 'Unknown',
          temperature: Math.floor(Math.random() * 30) + 10,
          description: 'Sunny',
          humidity: Math.floor(Math.random() * 40) + 40,
          windSpeed: Math.floor(Math.random() * 20) + 5,
          feelsLike: Math.floor(Math.random() * 30) + 10,
          visibility: Math.floor(Math.random() * 10) + 5,
          icon: '01d',
          lastUpdated: new Date().toLocaleString()
        }
      };
      
      return res.json(mockWeatherData);
    }
    
    return res.status(400).json({ message: 'Please provide either city name or coordinates' });
    
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 