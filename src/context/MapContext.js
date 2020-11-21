import * as React from "react";

const MapStateContext = React.createContext();
const MapDispatchContext = React.createContext();

const initialState = {
  map: null,
  error: "",
};

// Oluşturduğumuz mapReducer
// Kendisini dispatch ile tetiklerken göndereceğimiz objenin içindeki type key’ine göre
// uygulayacağı yöntemi seçip context içerisindeki state’i güncelleyecektir.
// child component içerisinde INIT_MAP type’ini tetiklediğimizde, initial state’i alıp,
// ilk objesinin içerisindeki map'i actiondan gelen map nesnesi olarak değiştirmesini söylemiş oluyoruz.
const mapReducer = (state, action) => {
  switch (action.type) {
    case "INIT_MAP":
      return {
        ...state,
        map: action.payload,
      };

    case "INIT_MAP_ERROR":
      return {
        ...state,
        error: action.payload,
      };

    default:
      throw new Error("action not defined");
  }
};

function MapProvider({ children }) {
  // useReducer ile mapReducer adında oluşturduğumuz ve uygulamanın
  // en başında import ettiğimiz reducer’i ve initial state’i
  // state ve dispatch değerlerine atayıp Provider’a gönderiyoruz.
  const [state, dispatch] = React.useReducer(mapReducer, initialState);
  return (
    <MapStateContext.Provider value={state}>
      <MapDispatchContext.Provider value={dispatch}>
        {children}
      </MapDispatchContext.Provider>
    </MapStateContext.Provider>
  );
}

function useMapState() {
  const context = React.useContext(MapStateContext);
  if (context === undefined) {
    throw new Error("useMapState must be used within a MapProvider");
  }
  return context;
}
function useMapDispatch() {
  const context = React.useContext(MapDispatchContext);
  if (context === undefined) {
    throw new Error("useMapDispatch must be used within a MapProvider");
  }
  return context;
}
export { MapProvider, useMapState, useMapDispatch };
