document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const unitToggleBtn = document.getElementById('unit-toggle');
    const errorMsg = document.getElementById('error-message');
    const loader = document.getElementById('loader');
    const weatherDisplay = document.getElementById('weather-display');
    const defaultState = document.getElementById('default-state');
    
    const cityNameEl = document.getElementById('city-name');
    const dateTimeEl = document.getElementById('date-time');
    const weatherIconEl = document.getElementById('weather-icon');
    const tempEl = document.getElementById('temperature');
    const unitEl = document.querySelector('.unit');
    const descEl = document.getElementById('description');
    const humidityEl = document.getElementById('humidity');
    const windSpeedEl = document.getElementById('wind-speed');

    // State
    let currentUnit = 'C'; 
    let currentTempC = null; // Store Celsius value for conversion

    // Event Listeners
    searchBtn.addEventListener('click', handleSearch);

    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    unitToggleBtn.addEventListener('click', toggleUnit);

    // Main Handler
    async function handleSearch() {
        const city = cityInput.value.trim();
        if (!city) return;

        showLoader();
        try {
            // 1. Geocoding: Get coordinates
            const geoData = await fetchGeocoding(city);
            
            if (!geoData) {
                throw new Error("City not found");
            }

            const { name, latitude, longitude, country } = geoData;

            // 2. Weather: Get forecast
            const weatherData = await fetchWeather(latitude, longitude);

            // 3. Update UI
            updateUI(name, country, weatherData);

        } catch (error) {
            console.error(error);
            showError(error.message === "City not found" ? "City not found. Please try again." : "Network error. Please try again.");
            hideLoader();
            weatherDisplay.classList.add('hidden');
            defaultState.classList.remove('hidden');
        }
    }

    function toggleUnit() {
        if (currentUnit === 'C') {
            currentUnit = 'F';
            unitToggleBtn.textContent = '°C';
            unitEl.textContent = '°F';
        } else {
            currentUnit = 'C';
            unitToggleBtn.textContent = '°F';
            unitEl.textContent = '°C';
        }

        if (currentTempC !== null) {
            const displayTemp = currentUnit === 'C' ? currentTempC : (currentTempC * 9/5) + 32;
            tempEl.textContent = Math.round(displayTemp);
        }
    }

    // API Functions
    async function fetchGeocoding(city) {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Geocoding API error");
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            return null;
        }
        return data.results[0];
    }

    async function fetchWeather(lat, lon) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m&wind_speed_unit=kmh`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Weather API error");
        return await response.json();
    }

    // UI Updates
    function updateUI(city, country, data) {
        const current = data.current;
        
        // Update Text
        cityNameEl.textContent = `${city}, ${country}`;
        
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        dateTimeEl.textContent = now.toLocaleDateString('en-US', options);

        // Store and Display Temp
        currentTempC = current.temperature_2m;
        const displayTemp = currentUnit === 'C' ? currentTempC : (currentTempC * 9/5) + 32;
        tempEl.textContent = Math.round(displayTemp);
        
        // Ensure unit label matches state
        unitEl.textContent = `°${currentUnit}`;
        
        humidityEl.textContent = `${current.relative_humidity_2m}%`;
        windSpeedEl.textContent = `${current.wind_speed_10m} km/h`;

        // Weather Code Processing
        const weatherInfo = getWeatherInfo(current.weather_code, current.is_day);
        descEl.textContent = weatherInfo.description;
        
        // Update Icon
        weatherIconEl.src = `https://openweathermap.org/img/wn/${weatherInfo.icon}@4x.png`;
        weatherIconEl.alt = weatherInfo.description;
        weatherIconEl.classList.remove('hidden');

        // Update Background Theme
        updateBackground(weatherInfo.category);

        // Show Content
        loader.classList.add('hidden');
        defaultState.classList.add('hidden');
        weatherDisplay.classList.remove('hidden');
    }

    function updateBackground(category) {
        const body = document.body;
        let connection = '';
        
        switch (category) {
            case 'sunny':
                connection = 'var(--bg-gradient-sunny)';
                break;
            case 'cloudy':
                connection = 'var(--bg-gradient-cloudy)';
                break;
            case 'rain':
                connection = 'var(--bg-gradient-rain)';
                break;
            default:
                connection = 'var(--bg-gradient-default)';
        }
        body.style.background = connection;
    }

    // Utils
    function showLoader() {
        loader.classList.remove('hidden');
        weatherDisplay.classList.add('hidden');
        defaultState.classList.add('hidden');
        errorMsg.classList.add('hidden');
    }

    function hideLoader() {
        loader.classList.add('hidden');
    }

    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.classList.remove('hidden');
        setTimeout(() => {
            errorMsg.classList.add('hidden');
        }, 3000);
    }

    // WMO Weather Code Logic
    function getWeatherInfo(code, isDay) {
        // WMO Weather interpretation codes (WW)
        const suffix = isDay ? 'd' : 'n';
        
        const map = {
            0: { desc: 'Clear sky', icon: `01${suffix}`, cat: 'sunny' },
            1: { desc: 'Mainly clear', icon: `02${suffix}`, cat: 'sunny' },
            2: { desc: 'Partly cloudy', icon: `03${suffix}`, cat: 'cloudy' },
            3: { desc: 'Overcast', icon: `04${suffix}`, cat: 'cloudy' },
            45: { desc: 'Fog', icon: `50${suffix}`, cat: 'cloudy' },
            48: { desc: 'Depositing rime fog', icon: `50${suffix}`, cat: 'cloudy' },
            51: { desc: 'Light drizzle', icon: `09${suffix}`, cat: 'rain' },
            53: { desc: 'Moderate drizzle', icon: `09${suffix}`, cat: 'rain' },
            55: { desc: 'Dense drizzle', icon: `09${suffix}`, cat: 'rain' },
            61: { desc: 'Slight rain', icon: `10${suffix}`, cat: 'rain' },
            63: { desc: 'Moderate rain', icon: `10${suffix}`, cat: 'rain' },
            65: { desc: 'Heavy rain', icon: `10${suffix}`, cat: 'rain' },
            71: { desc: 'Slight snow fall', icon: `13${suffix}`, cat: 'cloudy' },
            73: { desc: 'Moderate snow fall', icon: `13${suffix}`, cat: 'cloudy' },
            75: { desc: 'Heavy snow fall', icon: `13${suffix}`, cat: 'cloudy' },
            80: { desc: 'Slight rain showers', icon: `09${suffix}`, cat: 'rain' },
            81: { desc: 'Moderate rain showers', icon: `09${suffix}`, cat: 'rain' },
            82: { desc: 'Violent rain showers', icon: `09${suffix}`, cat: 'rain' },
            95: { desc: 'Thunderstorm', icon: `11${suffix}`, cat: 'rain' },
            96: { desc: 'Thunderstorm with hail', icon: `11${suffix}`, cat: 'rain' },
            99: { desc: 'Thunderstorm with heavy hail', icon: `11${suffix}`, cat: 'rain' },
        };

        return map[code] || { desc: 'Unknown', icon: `03${suffix}`, cat: 'cloudy' };
    }
});
