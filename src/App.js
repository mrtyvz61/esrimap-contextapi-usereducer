import React from "react";
import Map from "./components/Map";

import { MapProvider } from "./context/MapContext";

function App() {
  return (
    <MapProvider>
      <Map />
    </MapProvider>
  );
}

export default App;
