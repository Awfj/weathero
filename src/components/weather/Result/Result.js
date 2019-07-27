import React from "react";

import classes from "./Result.module.scss";

const result = props => {
  const searchedCity = props.city ? props.city.toLowerCase() : props.city;
  const storedCity = localStorage.getItem("city");
  const changeCityBtn =
    searchedCity !== storedCity ? (
      <button
        type="button"
        className={classes.changeCityBtn}
        onClick={props.changeCity}
      >
        Make Default
      </button>
    ) : null;

  return (
    <div className={classes.Result}>
      <hr />
      {props.city && (
        <p>
          Location: {props.city}, {props.country} {changeCityBtn}
        </p>
      )}
      {props.temperature && <p>Temperature: {props.temperature}&#8451;</p>}
      {props.humidity && <p>Humidity: {props.humidity}%</p>}
      {props.description && <p>Condition: {props.description}</p>}
      {props.fullRequestDate && (
        <div>
          <hr />
          <p>
            The weather was requested on {props.fullRequestDate}. It can be updated
            after 2 hours since the request was made.
          </p>
        </div>
      )}
      {props.error && <p>{props.error}</p>}
    </div>
  );
};

export default result;
