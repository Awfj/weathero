import React, { Component } from "react";
import "./App.css";

import axios from "axios";

const OPENWEATHERMAP_KEY = process.env.REACT_APP_OPENWEATHERMAP_KEY;

class App extends Component {
  state = {
    serviceName: "OpenWeatherMap",
    city: undefined,
    country: undefined,
    temperature: undefined,
    humidity: undefined,
    description: undefined,
    error: undefined,
    requestDate: undefined,
    search: {
      city: "",
      country: ""
    }
  };
  componentDidMount() {
    this.findLocation();

    if (localStorage.getItem("weather")) this.getStoredData();
  }

  // fixes the state after reload, if weather data exists in the local storage
  getStoredData() {
    const storedWeatherData = localStorage.getItem("weather").split(",");
    const search = { ...this.state.search };

    search.city = storedWeatherData[1];
    search.country = storedWeatherData[2];

    const [
      serviceName,
      city,
      country,
      temperature,
      humidity,
      description,
      requestDate
    ] = storedWeatherData;

    this.setState({
      serviceName,
      city,
      country,
      temperature,
      humidity,
      description,
      requestDate,
      search
    });
  }

  // finds current location
  findLocation = () => {
    axios
      .get(`https://get.geojs.io/v1/ip/geo.json`)
      .then(response => {
        this.getWeather("", response.data.latitude, response.data.longitude);
      })
      .catch(error => console.log(error));
  };

  getWeather = (event, latitude, longitude) => {
    if (event) event.preventDefault();

    const search = { ...this.state.search };
    const searchedCity = this.state.search.city;
    const searchedCountry = this.state.search.country;
    console.log(new Date().getTime())

    let url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_KEY}&units=metric`;
    if (Boolean(this.state.search.city)) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${searchedCity},${searchedCountry}&appid=${OPENWEATHERMAP_KEY}&units=metric`;
    }

    if (
      !localStorage.getItem("weather") ||
      localStorage.getItem("weather").split(",")[1] !==
        this.state.search.city ||
      localStorage.getItem("weather").split(",")[2] !==
        this.state.search.country
    ) {
      axios
        .get(url)
        .then(response => {
          const requestDate = String(new Date());
          search.city = response.data.name;
          search.country = response.data.sys.country;

          this.setState({
            city: response.data.name,
            country: response.data.sys.country,
            temperature: response.data.main.temp,
            humidity: response.data.main.humidity,
            description: response.data.weather[0].description,
            requestDate,
            search
          });

          localStorage.setItem("weather", [
            this.state.serviceName,
            this.state.city,
            this.state.country,
            this.state.temperature,
            this.state.humidity,
            this.state.description,
            this.state.requestDate
          ]);
        })
        .catch(error => console.log(error));
    }
  };

  changeInputValue = event => {
    const search = { ...this.state.search };
    const value = event.target.value;

    event.target.name === "city"
      ? (search.city = value)
      : (search.country = value);

    this.setState({ search });
  };

  render() {
    // console.log("!!!", this.state);
    return (
      <div className="App">
        <header className="App-header">
          <h1>Weathero</h1>

          <form onSubmit={this.getWeather}>
            <input
              onChange={this.changeInputValue}
              type="text"
              name="city"
              placeholder="City..."
              value={this.state.search.city}
            />
            <input
              onChange={this.changeInputValue}
              type="text"
              name="country"
              placeholder="Country..."
              value={this.state.search.country}
            />
            <button>Get Weather</button>
          </form>

          <div>
            {this.state.city && this.state.city && (
              <p>
                Location: {this.state.city}, {this.state.country}
              </p>
            )}
            {this.state.temperature && (
              <p>Temperature: {this.state.temperature}</p>
            )}
            {this.state.humidity && <p>Humidity: {this.state.humidity}</p>}
            {this.state.description && (
              <p>Condition: {this.state.description}</p>
            )}
            {this.state.error && <p>{this.state.error}</p>}

            {this.state.requestDate && (
              <p>The data was requested on {this.state.requestDate}</p>
            )}
          </div>
        </header>
      </div>
    );
  }
}

export default App;
