import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "leaflet/dist/leaflet.css";
import "./styles/global.css";
import "./styles/control.css";
import "./styles/display.css";
import "./styles/debug.css";
import "./styles/projects.css";
import "./styles/map.css";
import "./styles/vrbo.css";
import "./styles/vrbo-v2.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
