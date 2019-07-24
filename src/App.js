import React, { Component } from "react";
import axios from "axios";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

import "./App.css";
import Form from "./components/weather/Form/Form";
import Result from "./components/weather/Result/Result";

const OPENWEATHERMAP_KEY = process.env.REACT_APP_OPENWEATHERMAP_KEY;
const APIXU_KEY = process.env.REACT_APP_APIXU_KEY;
library.add(fas);

class App extends Component {
  state = {
    services: ["OpenWeatherMap", "APIXU"],
    currentService: "OpenWeatherMap",
    city: undefined,
    country: undefined,
    temperature: undefined,
    humidity: undefined,
    description: undefined,
    requestDate: undefined,
    requestDateInMs: undefined,
    error: undefined
  };
  componentDidMount() {
    this.initialSetup();
  }

  initialSetup = () => {
    const storedService = localStorage.getItem("service");
    const storedCity = localStorage.getItem("city");

    if (storedService && this.state.currentService !== storedService)
      this.setState({ currentService: storedService });

    if (storedService && storedCity) {
      this.fixRefreshedState();
      this.updateLocalStorage();
    } else {
      this.findLocation();
    }
  };

  // if service and location are stored and app is reloaded
  fixRefreshedState = () => {
    const storedService = localStorage.getItem("service");
    const storedCity = localStorage.getItem("city");
    const storedWeather = localStorage.getItem(
      `${storedService}, ${storedCity}`
    );

    if (storedWeather) {
      this.updateState(storedWeather.split(","));
    } else {
      this.getWeather("", storedCity);
    }
  };

  // if service and location are stored, removes expired data
  updateLocalStorage() {
    const storedService = localStorage.getItem("service");
    const storedCity = localStorage.getItem("city");

    for (let key in localStorage) {
      if (typeof localStorage[key] === "string") {
        const storedData = localStorage[key].split(",");
        const currentDateInMs = new Date().getTime();
        const expirationDateInMs = 7.2e6;
        if (
          storedData[7] &&
          currentDateInMs - storedData[7] > expirationDateInMs
        ) {
          if (`${storedService}, ${storedCity}` !== key) {
            localStorage.removeItem(key);
          } else {
            this.getWeather("", storedCity);
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
      .catch(() => {
        this.setState({
          error:
            "We couldn't find your city automatically, you can still look for it manually."
        });
      });
  };

  getWeather = (event, ...args) => {
    if (event) event.preventDefault();

    let searchedCity = this.handleInputValue();
    const storedWeather = localStorage.getItem(
      `${this.state.currentService}, ${searchedCity}`
    );
    if (!storedWeather) {
      if (!searchedCity && !args[1]) {
        return;
      }

      const storedService = localStorage.getItem("service");
      const storedCity = localStorage.getItem("city");

      if (storedService && storedCity && args[0]) {
        searchedCity = args[0];
      }

      let url = `https://api.openweathermap.org/data/2.5/weather?q=${searchedCity}&appid=${OPENWEATHERMAP_KEY}&units=metric`;

      if (!(storedService && storedCity) && !this.state.error) {
        const latitude = args[0];
        const longitude = args[1];
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_KEY}&units=metric`;
      }

      const isAPIXU = this.state.currentService === "APIXU";
      if (isAPIXU) {
        url = `https://api.apixu.com/v1/current.json?key=${APIXU_KEY}&q=${searchedCity}`;
      }

      axios
        .get(url)
        .then(response => {
          if (isAPIXU) {
            if (!(storedService && storedCity) && this.state.error) {
              localStorage.setItem("service", this.state.currentService);
              localStorage.setItem("city", response.data.location.name);
            }

            this.setRequestedData(
              response.data.location.name,
              response.data.location.country,
              response.data.current.temp_c,
              response.data.current.humidity,
              response.data.current.condition.text
            );
          } else {
            if (!(storedService && storedCity)) {
              localStorage.setItem("service", this.state.currentService);
              localStorage.setItem("city", response.data.name);
            }

            this.setRequestedData(
              response.data.name,
              response.data.sys.country,
              response.data.main.temp,
              response.data.main.humidity,
              response.data.weather[0].description
            );
          }
        })
        .catch(() => {
          this.setState({
            city: undefined,
            country: undefined,
            temperature: undefined,
            humidity: undefined,
            description: undefined,
            requestDate: undefined,
            requestDateInMs: undefined,
            error:
              "Requested city can't be found. Check if the name is correct, change service or try again later."
          });
        });
    } else {
      this.getStoredWeather();
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
      error: undefined
    });

    localStorage.setItem(`${this.state.currentService}, ${args[0]}`, [
      this.state.currentService,
      args[0],
      args[1],
      args[2],
      args[3],
      args[4],
      requestDate,
      requestDateInMs
    ]);
  };

  getStoredWeather = () => {
    const searchedCity = this.handleInputValue();

    const storedWeather = localStorage
      .getItem(`${this.state.currentService}, ${searchedCity}`)
      .split(",");

    this.updateState(storedWeather);
  };

  updateState = storedData => {
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
      error: undefined
    });
  };

  handleInputValue() {
    const inputValue = document.forms.searchForm.city.value
      .trim()
      .toLowerCase();

    let searchedCity = "";
    if (inputValue) {
      searchedCity = inputValue[0].toUpperCase() + inputValue.slice(1);
    }

    return searchedCity;
  }

  onInputChange = () => {
    this.setState(this.state);
  };

  clearInputField = () => {
    document.forms.searchForm.city.value = "";
    this.setState(this.state);
  };

  changeService = () => {
    const currentService =
      this.state.currentService === this.state.services[0]
        ? this.state.services[1]
        : this.state.services[0];

    localStorage.setItem("service", currentService);

    this.setState({ currentService });
  };

  changeCity = () => {
    const searchedCity = this.state.city;

    localStorage.setItem("city", searchedCity);
    this.setState(this.state);
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Weathero</h1>

          <Form
            getWeather={this.getWeather}
            currentService={this.state.currentService}
            changeService={this.changeService}
            onInputChange={this.onInputChange}
            clearInputField={this.clearInputField}
          />

          <Result
            city={this.state.city}
            country={this.state.country}
            changeCity={this.changeCity}
            temperature={this.state.temperature}
            humidity={this.state.humidity}
            description={this.state.description}
            requestDate={this.state.requestDate}
            error={this.state.error}
          />
        </header>
      </div>
    );
  }
}

export default App;
