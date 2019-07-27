import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import classes from "./Form.module.scss";

const form = props => {
  return (
    <form
      name="searchForm"
      className={classes.Form}
      onSubmit={props.manualWeatherRequest}
    >
      <p className={classes.service}>
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
      <p className={classes.hint}>
        It is advised to enter a full name of the city (e.g. Los Angeles, not
        LA)
      </p>
    </form>
  );
};

export default form;
