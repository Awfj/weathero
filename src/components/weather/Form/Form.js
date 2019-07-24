import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// import classes from "./Form.module.scss";

const form = props => {
  let removeValueBtn = null;
  if (document.forms.searchForm) {
    if (document.forms.searchForm.city.value)
      removeValueBtn = (
        <button type="button" onClick={props.clearInputField}>
          <FontAwesomeIcon icon={["fas", "times"]} />
        </button>
      );
  }

  return (
    <form name="searchForm" onSubmit={props.getWeather}>
      <h3>{props.currentService}</h3>
      <button type="button" onClick={props.changeService}>
        <FontAwesomeIcon icon={["fas", "exchange-alt"]} />
      </button>
      <input
        onChange={props.onInputChange}
        type="text"
        name="city"
        placeholder="Type a city name..."
      />
      {removeValueBtn}
      <button type="submit">Get Weather</button>
    </form>
  );
};

export default form;
