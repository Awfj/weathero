import React, { Component } from "react";
import axios from "axios";

import "./App.css";

const OPENWEATHERMAP_KEY = process.env.REACT_APP_OPENWEATHERMAP_KEY;
const APIXU_KEY = process.env.REACT_APP_APIXU_KEY;

class App extends Component {
  state = {
    services: ["OpenWeatherMap", "APIXU"],
    currentService: "OpenWeatherMap",
    city: undefined,
    country: undefined,
    temperature: undefined,
    humidity: undefined,
    description: undefined,
    error: undefined,
    requestDate: undefined,
    requestDateInMs: undefined,
    location: undefined,
    searchedCity: ""
  };
  componentDidMount() {
    // axios
    //   .get(`https://api.apixu.com/v1/current.json?key=${APIXU_KEY}&q=Paris`)
    //   .then(request => console.log(request.data))
    //   .catch(error => console.log(error));

    if (localStorage.getItem("service, location")) {
      this.getStoredLocation();
      this.updateLocalStorage();
    } else {
      this.findLocation();
    }
  }

  // if service and location are stored and app is reloaded, fixes the state
  getStoredLocation = () => {
    const [currentService, city] = localStorage
      .getItem("service, location")
      .split(",");

    const storedSearchedData = localStorage
      .getItem(`${currentService}, ${city}`)
      .split(",");

    this.updateState(storedSearchedData, city);

    this.setState({
      searchedCity: city
    });
  };

  // if service and location are stored, removes expired data
  updateLocalStorage() {
    const [currentService, city] = localStorage
      .getItem("service, location")
      .split(",");

    for (let key in localStorage) {
      if (typeof localStorage[key] === "string") {
        const storedData = localStorage[key].split(",");
        const currentDateInMs = new Date().getTime();
        const expirationDateInMs = 7.2e6;

        if (
          storedData[7] &&
          currentDateInMs - storedData[7] > expirationDateInMs
        ) {
          if (`${currentService}, ${city}` !== key) {
            localStorage.removeItem(key);
          } else {
            this.getWeather("", city);
          }
        } else {
          continue;
        }
      } else {
        continue;
      }
    }
  }

  // if service and location aren't stored
  findLocation = () => {
    axios
      .get(`https://get.geojs.io/v1/ip/geo.json`)
      .then(response => {
        this.getWeather("", response.data.latitude, response.data.longitude);
      })
      .catch(error => console.log(error));
  };

  getWeather = (event, ...args) => {
    if (event) event.preventDefault();

    const isItemStored = localStorage.getItem(
      `${this.state.currentService}, ${this.state.searchedCity}`
    );
    console.log(document.forms.searchForm.city.value)
    if (!isItemStored) {
      const isLocationStored = localStorage.getItem("service, location");
      let searchedCity = this.state.searchedCity;

      if (isLocationStored && args[0]) {
        searchedCity = args[0];
      }

      let url = `https://api.openweathermap.org/data/2.5/weather?q=${searchedCity}&appid=${OPENWEATHERMAP_KEY}&units=metric`;

      const isAPIXU = this.state.currentService === "APIXU";
      if (isAPIXU) {
        url = `https://api.apixu.com/v1/current.json?key=${APIXU_KEY}&q=${searchedCity}`;
      }
      if (!isLocationStored) {
        const latitude = args[0];
        const longitude = args[1];
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_KEY}&units=metric`;
      }

      axios
        .get(url)
        .then(response => {
          if (isAPIXU) {
            this.setRequestedData(
              response.data.location.name,
              response.data.location.country,
              response.data.current.temp_c,
              response.data.current.humidity,
              response.data.current.condition.text,
            );
          } else {
            if (!isLocationStored) {
              localStorage.setItem("service, location", [
                `${this.state.currentService},${response.data.name}`
              ]);
            }

            this.setRequestedData(
              response.data.name,
              response.data.sys.country,
              response.data.main.temp,
              response.data.main.humidity,
              response.data.weather[0].description,
            );
          }
        })
        .catch(error => console.log(error));
    } else {
      this.getStoredData();
    }
  };

  setRequestedData = (...args) => {
    const requestDate = String(new Date());
    const requestDateInMs = new Date().getTime();

    this.setState({
      city: args[0],
      country: args[1],
      temperature: args[2],
      humidity: args[3],
      description: args[4],
      requestDate,
      requestDateInMs,
      searchedCity: args[0]
    });

    localStorage.setItem(`${this.state.currentService}, ${this.state.city}`, [
      this.state.currentService,
      this.state.city,
      this.state.country,
      this.state.temperature,
      this.state.humidity,
      this.state.description,
      this.state.requestDate,
      this.state.requestDateInMs
    ]);
  };

  getStoredData = () => {
    const storedSearchedData = localStorage
      .getItem(`${this.state.currentService}, ${this.state.searchedCity}`)
      .split(",");

    this.updateState(storedSearchedData, storedSearchedData[1]);
  };

  updateState = (storedData, searchedCity) => {
    const [
      currentService,
      city,
      country,
      temperature,
      humidity,
      description,
      requestDate,
      requestDateInMs
    ] = storedData;

    this.setState({
      currentService,
      city,
      country,
      temperature,
      humidity,
      description,
      requestDate,
      requestDateInMs,
      searchedCity
    });
  };

  changeInputValue = event => {
    const value = event.target.value;
    this.setState({ searchedCity: value });
  };

  changeService = () => {
    const currentService =
      this.state.currentService === this.state.services[0]
        ? this.state.services[1]
        : this.state.services[0];

    localStorage.setItem("service, location", [
      currentService,
      this.state.city
    ]);

    this.setState({ currentService });
  };

  render() {
    // console.log(this.state.currentService);
    return (
      <div className="App">
        <header className="App-header">
          <h1>Weathero</h1>

          <h3>{this.state.currentService}</h3>
          <button onClick={this.changeService}>Change Service</button>

          <form name='searchForm' onSubmit={this.getWeather}>
            <input
              onChange={this.changeInputValue}
              type="text"
              name="city"
              placeholder="City..."
              value={this.state.searchedCity}
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
              <p>
                The data was requested on {this.state.requestDate}. It can be
                updated after 2 hours since the request was made.
              </p>
            )}
          </div>
        </header>
      </div>
    );
  }
}

export default App;
