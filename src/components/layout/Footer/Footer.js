import React from "react";

import classes from "./Footer.module.scss";

const footer = () => {
  return (
    <footer className={classes.Footer}>
      <p>
        By{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/Awfj"
        >
          github.com/Awfj
        </a>
      </p>
    </footer>
  );
};

export default footer;
