import React, { Component } from "react";
import axios from "axios";

import "./App.css";

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
    location: undefined,
    search: {
      city: "",
      country: ""
    }
  };
  componentDidMount() {
    if (localStorage.getItem("location")) {
      this.getStoredLocation();
    } else {
      this.findLocation();
    }
  }

  getStoredLocation() {
    const search = { ...this.state.search };

    const [city, country] = localStorage.getItem("location").split(",");

    search.city = city;
    search.country = country;

    const storedSearchedData = localStorage
      .getItem(`${city}, ${country}`)
      .split(",");

    this.updateState(storedSearchedData, search);

    this.setState({
      search
    });
  }

  findLocation() {
    axios
      .get(`https://get.geojs.io/v1/ip/geo.json`)
      .then(response => {
        this.getWeather("", response.data.latitude, response.data.longitude);
      })
      .catch(error => console.log(error));
  }

  getWeather = (event, latitude, longitude) => {
    if (event) event.preventDefault();

    const search = { ...this.state.search };

    // console.log(new Date().getTime());

    let url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_KEY}&units=metric`;
    if (localStorage.getItem("location")) {
      const searchedCity = this.state.search.city;
      const searchedCountry = this.state.search.country;

      url = `https://api.openweathermap.org/data/2.5/weather?q=${searchedCity},${searchedCountry}&appid=${OPENWEATHERMAP_KEY}&units=metric`;
    }

    if (
      !localStorage.getItem(
        `${this.state.search.city}, ${this.state.search.country}`
      )
    ) {
      axios
        .get(url)
        .then(response => {
          if (!localStorage.getItem("location")) {
            localStorage.setItem("location", [
              `${response.data.name},${response.data.sys.country}`
            ]);
          }

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

          localStorage.setItem(`${this.state.city}, ${this.state.country}`, [
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
    } else {
      this.getStoredData();
    }
  };

  getStoredData() {
    const search = { ...this.state.search };

    const storedSearchedData = localStorage
      .getItem(`${this.state.search.city}, ${this.state.search.country}`)
      .split(",");

    search.city = storedSearchedData[1];
    search.country = storedSearchedData[2];

    this.updateState(storedSearchedData, search);
  }

  updateState(storedData, search) {
    const [
      serviceName,
      city,
      country,
      temperature,
      humidity,
      description,
      requestDate
    ] = storedData;

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

  changeInputValue = event => {
    const search = { ...this.state.search };
    const value = event.target.value;

    event.target.name === "city"
      ? (search.city = value)
      : (search.country = value);

    this.setState({ search });
  };

  render() {
    // console.log(this.state);
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
