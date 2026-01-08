import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // <--- Add this line if it's missing

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
}
