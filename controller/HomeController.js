import { getAllCrops } from "../model/CropModel.js";
import { getAllFields } from "../model/FieldModel.js";
import { getLogs } from "../model/LogModel.js";
import { getStaffCountByRoles } from "../model/StaffModel.js";
import { getVehicleAvailabilityCount } from "../model/VehicleModel.js";

$(document).ready(function () {
  setFieldMap();
  setCropTypes();
  setLogs();
  setVehicleCount();
  setStaffCount();
  fetchWeather("Colombo");
  setGreeting();
});

function initMap() {
  // Set the default map view to Colombo
  const map = L.map("map").setView([6.9271, 79.8612], 13); // Center map at Colombo, Sri Lanka

  // Add the TileLayer (the map background layer)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  return map;
}

async function setFieldMap() {
  const fieldData = await getAllFields();
  $("#field-count").text(
    fieldData.length > 1
      ? `${fieldData.length} Fields`
      : `${fieldData.length} Field`
  );
  let totalHec = 0;
  fieldData.forEach((field) => {
    totalHec += field.fieldSize;
  });
  $("#total-hec").text(
    totalHec > 1 ? `${totalHec} Hectares` : `${totalHec} Hectare`
  );

  // initialize the map
  const map = initMap();
  // create an array to store rhe field coordinates
  const latLngs = [];

  fieldData.forEach((field) => {
    const lat = field.fieldLocation.y;
    const lon = field.fieldLocation.x;
    const fieldName = field.fieldName;

    // create a marker
    const marker = L.marker([lat, lon]).addTo(map);

    // bind popup with field name
    marker.bindPopup(fieldName);

    // Add field location to latLngs array for map bounds
    latLngs.push([lat, lon]);

    // Optionally, add hover effect to display the field name on hover
    marker.on("mouseover", function () {
      this.openPopup();
    });
    marker.on("mouseout", function () {
      this.closePopup();
    });
  });

  // Fit the map view to show all markers (this adjusts zoom and bounds)
  if (latLngs.length > 0) {
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds);
  }
}

async function setCropTypes() {
  const cropData = await getAllCrops();
  // Count the number of crops in each category
  const categoryCount = cropData.reduce(function (acc, crop) {
    acc[crop.category] = (acc[crop.category] || 0) + 1;
    return acc;
  }, {});

  const categories = Object.keys(categoryCount);
  const counts = Object.values(categoryCount);

  // Render Chart.js Doughnut Chart
  const ctx = $("#cropChart")[0].getContext("2d");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: categories,
      datasets: [
        {
          label: "Crop Categories",
          data: counts,
          backgroundColor: [
            "#4CAF50", // Green
            "#36A2EB", // Blue
            "#FFCE56", // Yellow
            "#81C784", // Light Green
            "#FF9F40", // Orange
            "#A5D6A7", // Pale Green
            "#9966FF", // Purple
            "#69F0AE", // Aqua Green
            "#F44336", // Red
            "#03A9F4", // Light Blue
            "#FFC107", // Amber
          ],
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        legend: false,
      },
    },
  });
}

async function setLogs() {
  const logs = await getLogs();

  const today = new Date().toISOString().split("T")[0];
  const todayLogs = logs.filter((log) => log.logDate.split("T")[0] === today);
  const logCount = todayLogs.length;
  $("#log-count").text(logCount > 1 ? `${logCount} Logs` : `${logCount} Log`);

  todayLogs.forEach((log) => {
    const logElement = `<div class="bg-green-100 text-green-800 p-3 rounded">${log.observation}</div>`;
    $("#today-log-container").append(logElement);
  });
  if (logCount === 0) {
    $("#today-log-container").append(
      '<div class="text-gray-500 p-3 rounded">No logs for today.</div>'
    );
  }
}

async function setVehicleCount() {
  const vehicleCount = await getVehicleAvailabilityCount();

  $("#available-vehicle-count").text(vehicleCount.availableVehicleCount);
  $("#unAvailable-vehicle-count").text(vehicleCount.unavailableVehicleCount);
}

async function setStaffCount() {
  const countByRoles = await getStaffCountByRoles();

  $("#manager-count").text(countByRoles.managers);
  $("#administrative-count").text(countByRoles.administrative);
  $("#scientist-count").text(countByRoles.scientists);
}

function fetchWeather(city) {
  const apiKey = "5a593323f691644a46c2653891b2a0bc";
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

  // Fetching weather data based on city name
  $.getJSON(apiUrl, function (data) {
    const temp = Math.round(data.main.temp); // Temperature in Celsius
    const description = data.weather[0].description; // Weather description
    const iconCode = data.weather[0].icon; // Weather icon code
    const weatherEmoji = getWeatherEmoji(iconCode);

    $("#weather-emoji").text(weatherEmoji);
    $("#weather-txt").text(`${temp}° | Today is ${description}`);
  }).fail(function () {
    $("#weather-txt").text("Unable to fetch weather data.");
  });
}

function getWeatherEmoji(iconCode) {
  if (iconCode.startsWith("01")) return "☀️"; // Clear sky
  if (
    iconCode.startsWith("02") ||
    iconCode.startsWith("03") ||
    iconCode.startsWith("04")
  )
    return "☁️"; // Cloudy
  if (iconCode.startsWith("09") || iconCode.startsWith("10")) return "🌧️"; // Rainy
  if (iconCode.startsWith("11")) return "⛈️"; // Thunderstorm
  if (iconCode.startsWith("13")) return "❄️"; // Snowy
  if (iconCode.startsWith("50")) return "🌫️"; // Foggy
  return "🌈"; // Default
}

function setGreeting() {
  const now = new Date();
  const hours = now.getHours();
  let greeting = "";

  if (hours >= 5 && hours < 12) {
    greeting = "Good Morning !";
  } else if (hours >= 12 && hours < 17) {
    greeting = "Good Afternoon !";
  } else if (hours >= 17 && hours < 21) {
    greeting = "Good Evening !";
  } else {
    greeting = "Good Night !";
  }

  $("#greeting-txt").text(greeting);
}
