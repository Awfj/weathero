import React from "react";

// import classes from "./Result.module.scss";

const result = props => {
  const searchedCity = props.city;
  const storedCity = localStorage.getItem("city");
  const changeCityBtn =
    searchedCity !== storedCity ? (
      <button type="button" onClick={props.changeCity}>
        Is your city?
      </button>
    ) : null;

  return (
    <div>
      {props.city && (
        <p>
          Location: {props.city}, {props.country} {changeCityBtn}
        </p>
      )}
      {props.temperature && <p>Temperature: {props.temperature}&#8451;</p>}
      {props.humidity && <p>Humidity: {props.humidity}%</p>}
      {props.description && <p>Condition: {props.description}</p>}
      {props.requestDate && (
        <p>
          The data was requested on {props.requestDate}. It can be updated after
          2 hours since the request was made.
        </p>
      )}
      {props.error && <p>{props.error}</p>}
    </div>
  );
};

export default result;
