
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const weeklyForecast = document.getElementById("weeklyForecast");
const errorMessage = document.getElementById("errorMessage");

const API = "https://api.open-meteo.com/v1/forecast";
const GEO = "https://geocoding-api.open-meteo.com/v1/search";


// Current Date
document.getElementById("currentDate").textContent =
    new Date().toDateString();


// Weather Information
function getWeather(code) {

    if (code === 0) return ["Clear Sky", "fa-sun"];

    if (code <= 2) return ["Partly Cloudy", "fa-cloud-sun"];

    if (code === 3) return ["Cloudy", "fa-cloud"];

    if ([45, 48].includes(code)) return ["Foggy", "fa-smog"];

    if (code >= 51 && code <= 67) return ["Rainy", "fa-cloud-rain"];

    if (code >= 71 && code <= 86) return ["Snowy", "fa-snowflake"];

    if (code >= 95) return ["Thunderstorm", "fa-cloud-bolt"];

    return ["Cloudy", "fa-cloud"];
}


// Search City
async function searchCity() {

    const city = cityInput.value.trim() || "Chennai";

    try {

        errorMessage.textContent = "";
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        // Get Location
        const geoResponse = await fetch(
            `${GEO}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        const geoData = await geoResponse.json();

        if (!geoData.results) {
            throw new Error("City not found!");
        }

        const location = geoData.results[0];

        // Get Weather
        const url = `${API}?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m&hourly=visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=7`;

        const response = await fetch(url);
        const data = await response.json();

        // Display Current Weather
        document.getElementById("cityName").textContent = location.name;
        document.getElementById("countryName").textContent = location.country || "";

        document.getElementById("temperature").textContent =
            Math.round(data.current.temperature_2m) + "°";

        document.getElementById("feelsLike").textContent =
            Math.round(data.current.apparent_temperature) + "°";

        document.getElementById("humidity").textContent =
            data.current.relative_humidity_2m + "%";

        document.getElementById("windSpeed").textContent =
            data.current.wind_speed_10m + " km/h";

        document.getElementById("pressure").textContent =
            Math.round(data.current.surface_pressure) + " hPa";


        // Weather Icon
        const weather = getWeather(data.current.weather_code);

        document.getElementById("weatherDescription").textContent = weather[0];

        document.getElementById("weatherIcon").innerHTML =
            `<i class="fa-solid ${weather[1]}"></i>`;


        // Visibility
        let index = data.hourly.time.findIndex(time =>
            time >= data.current.time
        );

        if (index === -1) index = 0;

        document.getElementById("visibility").textContent =
            (data.hourly.visibility[index] / 1000).toFixed(1) + " km";


        // Sunrise & Sunset
        document.getElementById("sunrise").textContent =
            formatTime(data.daily.sunrise[0]);

        document.getElementById("sunset").textContent =
            formatTime(data.daily.sunset[0]);


        // Weekly Forecast
        weeklyForecast.innerHTML = "";

        data.daily.time.forEach((date, i) => {

            const day = new Date(date + "T12:00:00").toLocaleDateString(
                "en-IN", { weekday: "long" }
            );

            const info = getWeather(data.daily.weather_code[i]);

            const max = Math.round(data.daily.temperature_2m_max[i]);
            const min = Math.round(data.daily.temperature_2m_min[i]);

            const card = document.createElement("div");

            card.className = "day-card";

            card.innerHTML = `
                <p class="day-name">${i === 0 ? "Today" : day}</p>
                <i class="fa-solid ${info[1]}"></i>
                <p class="day-condition">${info[0]}</p>
                <p class="day-temp">${max}° <span>${min}°</span></p>
            `;

            weeklyForecast.appendChild(card);

        });

    }

    catch (error) {

        errorMessage.textContent = error.message || "Something went wrong!";

    }

    finally {

        searchBtn.disabled = false;

        searchBtn.innerHTML =
            '<i class="fa-solid fa-magnifying-glass"></i> Search';

    }

}


// Format Sunrise & Sunset
function formatTime(value) {

    const [hour, minute] = value.split("T")[1].split(":");

    const time = Number(hour) % 12 || 12;

    const period = Number(hour) >= 12 ? "PM" : "AM";

    return `${time}:${minute} ${period}`;

}


// Search Button
searchBtn.addEventListener("click", searchCity);


// Enter Key
cityInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {
        searchCity();
    }

});


// Default Weather
searchCity();
