/* @refresh reload */
import { render } from "solid-js/web";

import "./style.css";
// import App from "./App";
import { Main } from "./Main";
import { Router } from "@solidjs/router";

render(() =>
  <>
    <Router>
      <Main />
    </Router>
  </>,
  document.getElementById("root") as HTMLElement);
