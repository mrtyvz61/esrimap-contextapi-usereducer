import React from "react";
import { useMapState, useMapDispatch } from "../context/MapContext";
import { loadModules } from "esri-loader";

import { makeStyles } from "@material-ui/core/styles";
import { SpeedDial, SpeedDialIcon, SpeedDialAction } from "@material-ui/lab";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import RemoveIcon from "@material-ui/icons/Remove";
import PolymerIcon from "@material-ui/icons/Polymer";
import DeleteIcon from "@material-ui/icons/Delete";

const useStyles = makeStyles((theme) => ({
  root: {
    transform: "translateZ(0px)",
    flexGrow: 1,
    position: "absolute",
    bottom: 10,
    left: 140,
    minWidth: "25ch",
  },
  speedDial: {
    position: "absolute",
    "&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft": {
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
    "&.MuiSpeedDial-directionDown, &.MuiSpeedDial-directionRight": {
      bottom: theme.spacing(2),
      left: theme.spacing(3),
    },
  },
}));

const actions = [
  { icon: <FiberManualRecordIcon />, name: "Point", operation: "point" },
  { icon: <RemoveIcon />, name: "Line", operation: "line" },
  { icon: <PolymerIcon />, name: "Polyline", operation: "polyline" },
  { icon: <DeleteIcon />, name: "Clear Graphics", operation: "clearall" },
];

export default function Map() {
  const classes = useStyles();

  const { map } = useMapState(); // MapContext içerisinden state metodunu çekeceğiz ve state içerisinde ki map nesnesi ile ilgili metodları fonksiyonları kullanacağız.
  const dispatch = useMapDispatch(); // MapContext içerisinden dispatch metodunu çekeceğiz ve state’i güncellemek için reducer’a erişmek için kullanacağız.

  const mapEl = React.useRef(); // dom elementine erişmek için useRef hook özelliğini kullanacağız.

  const [open, setOpen] = React.useState(false);
  const [toolbarState, setToolbarState] = React.useState(null);

  React.useEffect(() => {
    const options = {
      version: "3.34",
      css: true,
      url: "https://js.arcgis.com/3.34/",
    };

    loadModules(
      [
        "esri/map",
        "esri/toolbars/draw",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/CartographicLineSymbol",
        "esri/graphic",
        "esri/Color",
      ],
      options
    )
      .then(
        ([
          Map,
          Draw,
          SimpleMarkerSymbol,
          CartographicLineSymbol,
          Graphic,
          Color,
        ]) => {
          if (!mapEl.current.id) {
            return;
          }
          let esrimap = new Map(mapEl.current.id, {
            center: [29, 41],
            zoom: 12,
            basemap: "dark-gray",
          });
          // Yaptığımız şey sayfa ilk yüklendiğinde (React.useEffetc hook kullandık) useMapDispatch'ten çektiğimiz dispatch’i INIT_MAP() isimli action ile birlikte çalıştırmak.
          // Böylelikle reducer’a bir type göndermiş oluyoruz ve reducer daha önce oluşturduğumuz yönergeler doğrultusunda state’i güncellemiş oluyor.
          dispatch({ type: "INIT_MAP", payload: esrimap });

          const tb = new Draw(esrimap);
          setToolbarState(tb);
          tb.on("draw-end", (evt) => {
            tb.deactivate();
            esrimap.enableMapNavigation();
            let symbol;
            if (
              evt.geometry.type === "point" ||
              evt.geometry.type === "multipoint"
            ) {
              symbol = markerSymbol;
            } else if (
              evt.geometry.type === "line" ||
              evt.geometry.type === "polyline"
            ) {
              symbol = lineSymbol;
            } else {
              symbol = "";
            }

            esrimap.graphics.add(new Graphic(evt.geometry, symbol));
          });

          var markerSymbol = new SimpleMarkerSymbol({
            color: [255, 255, 255, 64],
            size: 12,
            angle: -30,
            xoffset: 0,
            yoffset: 0,
            type: "esriSMS",
            style: "esriSMSCircle",
            outline: {
              color: [0, 0, 0, 255],
              width: 1,
              type: "esriSLS",
              style: "esriSLSSolid",
            },
          });

          const lineSymbol = new CartographicLineSymbol(
            CartographicLineSymbol.STYLE_SOLID,
            new Color([255, 0, 0]),
            10,
            CartographicLineSymbol.CAP_ROUND,
            CartographicLineSymbol.JOIN_MITER,
            5
          );
        }
      )
      .catch((err) => {
        dispatch({ type: "INIT_MAP_ERROR", payload: err });
      });
  }, [dispatch]);

  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClick = (e, operation) => {
    e.preventDefault();
    if (operation === "point") {
      toolbarState.activate("point");
    } else if (operation === "line") {
      toolbarState.activate("line");
    } else if (operation === "polyline") {
      toolbarState.activate("polyline");
    } else if (operation === "clearall") {
      console.log("map", map);
      map.graphics.clear();
    }
    setOpen(!open);
  };

  return (
    <React.Fragment>
      <SpeedDial
        ariaLabel="SpeedDial example"
        className={classes.speedDial}
        hidden={false}
        icon={<SpeedDialIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        direction="right"
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={(e) => {
              handleClick(e, action.operation);
            }}
          />
        ))}
      </SpeedDial>

      <div
        id="mapNode"
        ref={mapEl}
        style={{
          height: "100%",
          width: "100%",
          position: "absolute",
        }}
      />
    </React.Fragment>
  );
}
