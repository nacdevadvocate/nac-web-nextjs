import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Define a custom icon for the marker
const markerIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png", // Default marker icon
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

type Loc = {
  latitude: number;
  longitude: number;
};

interface MapProps {
  latitude: number;
  longitude: number;
  retrievedLocation: Loc | null;
  radius: number;
}

const MapVerification: React.FC<MapProps> = ({
  latitude,
  longitude,
  retrievedLocation,
  radius,
}) => {
  return (
    <div className="mt-8 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Map:</h2>
      <MapContainer
        center={[
          retrievedLocation?.latitude ?? latitude,
          retrievedLocation?.longitude ?? longitude,
        ]}
        zoom={10}
        className="leaflet-container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Circle
          center={[latitude, longitude]}
          radius={radius}
          pathOptions={{
            color: "blue",
            fillColor: "blue",
            fillOpacity: 0.3,
          }}
        />
        {retrievedLocation && (
          <Marker
            position={[retrievedLocation.latitude, retrievedLocation.longitude]}
            icon={markerIcon}
          >
            <Popup>
              <div>
                <p className="font-bold">
                  Retrieved Location (Inside/Outside Circle)
                </p>
                <p>Latitude: {retrievedLocation.latitude.toFixed(6)}</p>
                <p>Longitude: {retrievedLocation.longitude.toFixed(6)}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapVerification;
