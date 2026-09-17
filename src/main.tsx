import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import  SiteThemeProvider  from "./components/SiteThemeProvider";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(
  document.getElementById('root')!,
).render(
  <React.StrictMode>
    <BrowserRouter>
      <SiteThemeProvider>
        <App />
      </SiteThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);