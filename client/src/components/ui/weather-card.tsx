import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Search, MapPin, Droplets, Wind, Thermometer, Eye, Loader2, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  visibility: number;
  icon: string;
  lastUpdated: string;
}

interface WeatherResponse {
  weather: WeatherData;
}

export function WeatherCard() {
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [cityName, setCityName] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);

  const { data: weatherData, isLoading, error, refetch } = useQuery<WeatherResponse>({
    queryKey: ['/api/weather', searchCity, coordinates?.lat, coordinates?.lon],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchCity) {
        params.append('city', searchCity);
      }
      if (coordinates?.lat && coordinates?.lon) {
        params.append('lat', coordinates.lat.toString());
        params.append('lon', coordinates.lon.toString());
      }
      
      const url = `/api/weather?${params.toString()}`;
      const response = await apiRequest('GET', url);
      
      return response.json();
    },
    enabled: Boolean(searchCity || coordinates),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleLocationToggle = (checked: boolean) => {
    setUseCurrentLocation(checked);
    if (checked) {
      getCurrentLocation();
    } else {
      setCoordinates(null);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setSearchCity(''); // Clear city search when using location
        },
        (error) => {
          console.error('Error getting location:', error);
          setUseCurrentLocation(false);
        }
      );
    } else {
      console.error('Geolocation is not supported');
      setUseCurrentLocation(false);
    }
  };

  const handleCitySearch = () => {
    if (cityName.trim()) {
      setSearchCity(cityName.trim());
      setCoordinates(null); // Clear coordinates when searching by city
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCitySearch();
    }
  };

  const getWeatherIcon = (iconCode: string) => {
    // Map weather condition codes to FontAwesome icons
    const iconMap: { [key: string]: string } = {
      '01d': 'fa-sun',
      '01n': 'fa-moon',
      '02d': 'fa-cloud-sun',
      '02n': 'fa-cloud-moon',
      '03d': 'fa-cloud',
      '03n': 'fa-cloud',
      '04d': 'fa-cloud',
      '04n': 'fa-cloud',
      '09d': 'fa-cloud-rain',
      '09n': 'fa-cloud-rain',
      '10d': 'fa-cloud-sun-rain',
      '10n': 'fa-cloud-moon-rain',
      '11d': 'fa-bolt',
      '11n': 'fa-bolt',
      '13d': 'fa-snowflake',
      '13n': 'fa-snowflake',
      '50d': 'fa-smog',
      '50n': 'fa-smog'
    };
    return iconMap[iconCode] || 'fa-cloud';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Weather Information</h2>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Current Location</span>
            <Switch 
              checked={useCurrentLocation}
              onCheckedChange={handleLocationToggle}
              data-testid="toggle-location"
            />
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        {/* City Input Section */}
        {!useCurrentLocation && (
          <div className="mb-6">
            <div className="flex space-x-3">
              <Input
                type="text"
                placeholder="Enter city name..."
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                data-testid="input-city"
              />
              <Button 
                onClick={handleCitySearch}
                disabled={!cityName.trim()}
                data-testid="button-search"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8" data-testid="loading-state">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Loading weather data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8" data-testid="error-state">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
            <p className="text-red-600 dark:text-red-400">
              Unable to fetch weather data. Please check the city name and try again.
            </p>
          </div>
        )}

        {/* Weather Display */}
        {weatherData && !isLoading && !error && (
          <div data-testid="weather-display">
            {/* Current Weather */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white" data-testid="text-city">
                  {weatherData.weather.city}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-country">
                  {weatherData.weather.country}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2" data-testid="text-temperature">
                  {weatherData.weather.temperature}°C
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-description">
                  {weatherData.weather.description}
                </p>
              </div>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <i className={`fas ${getWeatherIcon(weatherData.weather.icon)} text-3xl text-blue-600 dark:text-blue-400`}></i>
              </div>
            </div>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4" data-testid="card-humidity">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Humidity</p>
                    <p className="font-semibold text-gray-900 dark:text-white" data-testid="text-humidity">
                      {weatherData.weather.humidity}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4" data-testid="card-wind">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Wind className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Wind Speed</p>
                    <p className="font-semibold text-gray-900 dark:text-white" data-testid="text-wind-speed">
                      {weatherData.weather.windSpeed} km/h
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4" data-testid="card-feels-like">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Thermometer className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Feels Like</p>
                    <p className="font-semibold text-gray-900 dark:text-white" data-testid="text-feels-like">
                      {weatherData.weather.feelsLike}°C
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4" data-testid="card-visibility">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Visibility</p>
                    <p className="font-semibold text-gray-900 dark:text-white" data-testid="text-visibility">
                      {weatherData.weather.visibility} km
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400" data-testid="text-last-updated">
                {weatherData.weather.lastUpdated}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!weatherData && !isLoading && !error && (
          <div className="text-center py-8" data-testid="empty-state">
            <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">
              {useCurrentLocation 
                ? "Enable location access to see current weather" 
                : "Enter a city name to see weather information"
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
