import React, { Component } from "react";
import axios from "axios";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

import "./App.modules.scss";
import Form from "../../components/weather/Form/Form";
import Result from "../../components/weather/Result/Result";
import Footer from "../../components/layout/Footer/Footer";

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
    fullRequestDate: undefined,
    requestDate: undefined,
    error: undefined
  };
  componentDidMount() {
    this.initialSetup();
  }

  initialSetup = () => {
    const service = localStorage.getItem("service");
    const city = localStorage.getItem("city");

    if (service && this.state.currentService !== service)
      this.setState({ currentService: service });

    if (service && city) {
      this.fixState(service, city);
      this.updateStorage(service, city);
    } else {
      this.findLocation();
    }
  };

  // if service and location aren't stored
  findLocation = () => {
    axios
      .get(`https://get.geojs.io/v1/ip/geo.json`)
      .then(response => {
        this.autoWeatherRequest(null, [
          response.data.latitude,
          response.data.longitude
        ]);
      })
      .catch(() => {
        this.setState({
          error: `We couldn't find your city automatically, 
            you can still look for it manually.`
        });
      });
  };

  // if service and location are stored and app is reloaded
  fixState = (service, city) => {
    const storedWeather = localStorage.getItem(`${service}, ${city}`);

    if (storedWeather) {
      this.updateState(storedWeather);
    } else {
      this.autoWeatherRequest(city);
    }
  };

  // if service and location are stored, removes expired data
  updateStorage(service, city) {
    for (let key in localStorage) {
      if (typeof localStorage[key] === "string") {
        const storedWeather = localStorage[key].split(",");

        if (storedWeather[7] && this.checkIfExpired(storedWeather[7])) {
          if (`${service}, ${city}` !== key) {
            localStorage.removeItem(key);
          } else {
            this.autoWeatherRequest(city);
          }
        } else continue;
      } else continue;
    }
  }

  // when app is reloaded
  autoWeatherRequest = (storedCity, coordinates) => {
    let url = "";

    if (coordinates) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${
        coordinates[0]
      }&lon=${coordinates[1]}&appid=${OPENWEATHERMAP_KEY}&units=metric`;
    } else {
      url = this.chooseURL(storedCity);
    }
    this.getWeather(url);
  };

  manualWeatherRequest = event => {
    event.preventDefault();

    const inputValue = document.forms.searchForm.city.value.trim();
    if (!inputValue) return;

    const currentService = this.state.currentService;
    const searchedCity = inputValue.toLowerCase();
    const storedWeather = localStorage.getItem(
      `${currentService}, ${searchedCity}`
    );

    if (!storedWeather || this.checkIfExpired(storedWeather.split(",")[7])) {
      const weather = this.lookForVariation(currentService, searchedCity);
      if (weather && !this.checkIfExpired(weather.split(",")[7])) {
        this.updateState(weather);
      } else {
        const url = this.chooseURL(searchedCity);
        this.getWeather(url);
      }
    } else {
      this.updateState(storedWeather);
    }
  };

  lookForVariation(service, city) {
    for (let key in localStorage) {
      if (typeof localStorage[key] === "string") {
        const weather = localStorage[key].split(",");
        if (weather.length > 8 && weather[0] === service) {
          const variations = weather.slice(8);
          const index = variations.indexOf(city);

          if (index !== -1 && variations[index].length === city.length) {
            return localStorage.getItem(
              `${service}, ${weather[1].toLowerCase()}`
            );
          } else continue;
        } else continue;
      } else continue;
    }
  }

  checkIfExpired(requestDate) {
    const currentDate = new Date().getTime();
    const expirationDate = 7.2e6;
    const isExpired = currentDate - requestDate > expirationDate;

    return isExpired;
  }

  chooseURL(searchedCity) {
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${searchedCity}&appid=${OPENWEATHERMAP_KEY}&units=metric`;

    if (this.state.currentService === "APIXU") {
      url = `https://api.apixu.com/v1/current.json?key=${APIXU_KEY}&q=${searchedCity}`;
    }

    return url;
  }

  getWeather = url => {
    const isAltService = this.state.currentService !== this.state.services[0];

    axios
      .get(url)
      .then(response => {
        if (isAltService) {
          this.setWeather(
            response.data.location.name,
            response.data.location.country,
            response.data.current.temp_c,
            response.data.current.humidity,
            response.data.current.condition.text
          );
        } else {
          this.setWeather(
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
          fullRequestDate: undefined,
          requestDate: undefined,
          error: `Requested city can't be found. Please, check if the name 
            is correct, change service or try again later.`
        });
      });
  };

  setWeather = (...responseData) => {
    const isServiceStored = Boolean(localStorage.getItem("service"));
    const isCityStored = Boolean(localStorage.getItem("city"));
    const currentService = this.state.currentService;
    const receivedCity = responseData[0].toLowerCase();
    const storedWeather = localStorage.getItem(
      `${currentService}, ${receivedCity}`
    );

    if (!storedWeather || this.checkIfExpired(storedWeather.split(",")[7])) {
      if (!(isServiceStored && isCityStored)) {
        localStorage.setItem("service", currentService);
        localStorage.setItem("city", receivedCity);
      }

      const fullRequestDate = String(new Date());
      const requestDate = new Date().getTime();

      let description = responseData[4];
      if (responseData[4] === responseData[4].toLowerCase()) {
        description =
          responseData[4][0].toUpperCase() + responseData[4].slice(1);
      }

      this.setState({
        city: responseData[0],
        country: responseData[1],
        temperature: responseData[2],
        humidity: responseData[3],
        description,
        fullRequestDate,
        requestDate,
        error: undefined
      });

      localStorage.setItem(`${currentService}, ${receivedCity}`, [
        currentService,
        responseData[0],
        responseData[1],
        responseData[2],
        responseData[3],
        description,
        fullRequestDate,
        requestDate
      ]);
    } else {
      this.updateState(storedWeather);
    }
    this.addVariation(currentService, receivedCity);
  };

  // if a variation of a city name is entered
  addVariation = (service, city) => {
    const searchedCity = document.forms.searchForm.city.value
      .trim()
      .toLowerCase();

    if (searchedCity && searchedCity !== city) {
      const weather = localStorage.getItem(`${service}, ${city}`);
      const slicedWeather = weather.slice(0, weather.length);

      localStorage.setItem(`${service}, ${city}`, [
        slicedWeather,
        searchedCity
      ]);
    }
  };

  // if weather is stored
  updateState = storedWeather => {
    const weather = storedWeather.split(",");

    this.setState({
      currentService: weather[0],
      city: weather[1],
      country: weather[2],
      temperature: weather[3],
      humidity: weather[4],
      description: weather[5],
      fullRequestDate: weather[6],
      requestDate: weather[7],
      error: undefined
    });
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
    localStorage.setItem("city", this.state.city.toLowerCase());
    this.setState(this.state);
  };

  render() {
    return (
      <div className="App">
        <header>
          <h1>Weathero</h1>
        </header>

        <main>
          <Form
            manualWeatherRequest={this.manualWeatherRequest}
            currentService={this.state.currentService}
            changeService={this.changeService}
          />

          <Result
            city={this.state.city}
            country={this.state.country}
            changeCity={this.changeCity}
            temperature={this.state.temperature}
            humidity={this.state.humidity}
            description={this.state.description}
            fullRequestDate={this.state.fullRequestDate}
            error={this.state.error}
          />
        </main>

        <Footer />
      </div>
    );
  }
}

export default App;
