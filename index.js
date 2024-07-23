const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const axios = require("axios");

const app = express();
const api_key = process.env.OPENWEATHERMAP_API_KEY;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const port = 3000;

app.get("/", (req, res) => {
  res.render("index", { weather: null, error: null });
});
app.get("/about", (req, res) => {
  res.render("about");
});
app.get("/contact", (req, res) => {
  res.render("contact");
});
app.post("/", async (req, res) => {
  const city = req.body.city;
  const weatherurl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${api_key}`;
  const forecastUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${api_key}`;

  try {
    const response = await axios.get(weatherurl);
    const weather = {
      city: response.data.name,
      temperature: response.data.main.temp,
      weathercondition: response.data.weather[0].main,
      desc: response.data.weather[0].description,
      WeatherIcon: response.data.weather[0].icon,
      
    };

    // Fetch hourly forecast
    const forecastResponse = await axios.get(forecastUrl);
    const forecasts = forecastResponse.data.list;

    // Extract hourly forecasts for the next 12 hours
    const hourlyForecast = forecasts.slice(0, 12).map((item) => ({
      time: new Date(item.dt * 1000).toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      }),
      temperature: item.main.temp,
      desc: item.weather[0].description,
    }));

    // Extract 5-day forecast (daily forecasts)
    const fiveDayForecast = [];
    const uniqueDates = new Set();
    forecasts.forEach((item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString("en-uk", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      if (!uniqueDates.has(date)) {
        uniqueDates.add(date);
        fiveDayForecast.push({
          date: date,
          temperature: item.main.temp,
          desc: item.weather[0].description,
        });
      }
    });
    res.render("index", {
      weather,
      hourlyForecast,
      fiveDayForecast,
      error: null,
    });
  } catch (error) {
    res.render("index", { weather: null, error: "City not found" });
  }
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
