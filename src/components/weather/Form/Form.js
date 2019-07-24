import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import classes from "./Form.module.scss";

const form = props => {
  return (
    <form
      name="searchForm"
      onSubmit={props.getWeather}
      className={classes.Form}
    >
      <p>
        Service: {props.currentService}
        <button
          type="button"
          title="Change service"
          className={classes.changeServiceBtn}
          onClick={props.changeService}
        >
          <FontAwesomeIcon icon={["fas", "exchange-alt"]} />
        </button>
      </p>
      <div>
        <input type="text" name="city" placeholder="Type a city name..." />
        <button type="submit" className={classes.getWeatherBtn}>
          Get Weather
        </button>
      </div>
    </form>
  );
};

export default form;
