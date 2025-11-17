import React, { useState, useEffect, useMemo } from "react";
import { GoogleMap, useLoadScript, Marker, InfoWindow, DirectionsRenderer } from "@react-google-maps/api";
import { shipmentsAPI } from "../services/api.js";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const libraries = ["places"];

// Default map center (San Francisco)
const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "12px",
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

const COOLDOWN_SECONDS = 10;

export default function DriverMap({ shipmentId }) {
  const [location, setLocation] = useState(null);
  const [shipmentDetails, setShipmentDetails] = useState(null);
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Fetch shipment details for pickup/dropoff coordinates
  useEffect(() => {
    if (!shipmentId) {
      setShipmentDetails(null);
      setDirections(null);
      return;
    }

    async function fetchShipmentDetails() {
      try {
        const data = await shipmentsAPI.getById(shipmentId);
        setShipmentDetails(data.shipment || data);
      } catch (err) {
        console.error("Failed to fetch shipment details:", err);
      }
    }

    fetchShipmentDetails();
  }, [shipmentId]);

  // Fetch route directions when we have pickup and dropoff coordinates
  useEffect(() => {
    if (!isLoaded || !window.google || !shipmentDetails) {
      return;
    }

    const hasPickup = shipmentDetails.pickup_latitude && shipmentDetails.pickup_longitude;
    const hasDropoff = shipmentDetails.delivery_latitude && shipmentDetails.delivery_longitude;

    if (!hasPickup || !hasDropoff) {
      setDirections(null);
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();

    const origin = {
      lat: parseFloat(shipmentDetails.pickup_latitude),
      lng: parseFloat(shipmentDetails.pickup_longitude),
    };

    const destination = {
      lat: parseFloat(shipmentDetails.delivery_latitude),
      lng: parseFloat(shipmentDetails.delivery_longitude),
    };

    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error("Directions request failed:", status);
          setDirections(null);
        }
      }
    );
  }, [isLoaded, shipmentDetails]);

  // Initial fetch when shipment changes
  useEffect(() => {
    if (!shipmentId) {
      setLocation(null);
      setLastUpdate(null);
      setCooldown(0);
      return;
    }

    // Fetch location immediately on mount
    fetchLocation();
  }, [shipmentId]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  async function fetchLocation() {
    if (!shipmentId || cooldown > 0) return;

    try {
      setLoading(true);
      const data = await shipmentsAPI.getLocation(shipmentId);

      if (data.current_location) {
        setLocation({
          latitude: parseFloat(data.current_location.latitude),
          longitude: parseFloat(data.current_location.longitude),
          accuracy: data.current_location.accuracy,
          timestamp: data.current_location.timestamp,
          driverName: data.driver_name,
        });
        setLastUpdate(new Date());
        setCooldown(COOLDOWN_SECONDS);
      } else {
        setLocation(null);
      }
    } catch (err) {
      console.error("Failed to fetch driver location:", err);
    } finally {
      setLoading(false);
    }
  }

  function getTimeSinceUpdate() {
    if (!lastUpdate) return null;

    const seconds = Math.floor((new Date() - lastUpdate) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }

  const mapCenter = useMemo(() => {
    // Calculate center based on available markers
    const points = [];

    if (location) {
      points.push({ lat: location.latitude, lng: location.longitude });
    }
    if (shipmentDetails?.pickup_latitude && shipmentDetails?.pickup_longitude) {
      points.push({
        lat: parseFloat(shipmentDetails.pickup_latitude),
        lng: parseFloat(shipmentDetails.pickup_longitude)
      });
    }
    if (shipmentDetails?.delivery_latitude && shipmentDetails?.delivery_longitude) {
      points.push({
        lat: parseFloat(shipmentDetails.delivery_latitude),
        lng: parseFloat(shipmentDetails.delivery_longitude)
      });
    }

    if (points.length === 0) return DEFAULT_CENTER;
    if (points.length === 1) return points[0];

    // Calculate center of all points
    const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
    const avgLng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;

    return { lat: avgLat, lng: avgLng };
  }, [location, shipmentDetails]);

  return (
    <section className="panel panel-right">
      <div className="panel-header-with-action">
        <div>
          <h2>Driver Location</h2>
          <p className="subtitle">
            {location
              ? `Tracking ${location.driverName || "driver"}`
              : "Select a package to track driver"}
          </p>
        </div>
        {shipmentId && (
          <button
            className="update-button"
            onClick={fetchLocation}
            disabled={loading || cooldown > 0}
            title={cooldown > 0 ? `Wait ${cooldown}s before next update` : "Update location"}
          >
            {loading ? (
              <>
                <span className="spinner">⟳</span> Updating...
              </>
            ) : cooldown > 0 ? (
              <>🕐 {cooldown}s</>
            ) : (
              <>🔄 Update</>
            )}
          </button>
        )}
      </div>

      {lastUpdate && (
        <div className="last-update-info">
          Last updated: {getTimeSinceUpdate()} • {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      <div className="map-container">
        {loadError ? (
          <div className="map-error">
            <p>⚠️ Error loading Google Maps</p>
            <small>{loadError.message}</small>
          </div>
        ) : !GOOGLE_MAPS_API_KEY ? (
          <div className="map-error">
            <p>⚠️ Google Maps API Key Required</p>
            <small>Add VITE_GOOGLE_MAPS_API_KEY to your .env file</small>
          </div>
        ) : !shipmentId ? (
          <div className="map-empty">
            <p>📦 Select a package to view driver location</p>
          </div>
        ) : !isLoaded ? (
          <div className="map-loading">
            <div className="spinner">⟳</div>
            <p>Loading map...</p>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={location || shipmentDetails ? 13 : 12}
            options={mapOptions}
          >
            {/* Route between pickup and dropoff */}
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: true, // We'll use our own custom markers
                  polylineOptions: {
                    strokeColor: "#4F46E5",
                    strokeWeight: 4,
                    strokeOpacity: 0.7,
                  },
                }}
              />
            )}

            {/* Pickup Location Marker */}
            {shipmentDetails?.pickup_latitude && shipmentDetails?.pickup_longitude && (
              <Marker
                position={{
                  lat: parseFloat(shipmentDetails.pickup_latitude),
                  lng: parseFloat(shipmentDetails.pickup_longitude),
                }}
                title="Pickup Location"
                label={{
                  text: "P",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
                icon={{
                  url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%2310b981'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
              />
            )}

            {/* Dropoff Location Marker */}
            {shipmentDetails?.delivery_latitude && shipmentDetails?.delivery_longitude && (
              <Marker
                position={{
                  lat: parseFloat(shipmentDetails.delivery_latitude),
                  lng: parseFloat(shipmentDetails.delivery_longitude),
                }}
                title="Delivery Location"
                label={{
                  text: "D",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
                icon={{
                  url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23ef4444'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
              />
            )}

            {/* Driver Location Marker */}
            {location && (
              <>
                <Marker
                  position={{ lat: location.latitude, lng: location.longitude }}
                  title={location.driverName || "Driver Location"}
                  onClick={() => setShowInfo(!showInfo)}
                  icon={{
                    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%232563eb'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
                    scaledSize: new window.google.maps.Size(40, 40),
                  }}
                />
                {showInfo && (
                  <InfoWindow
                    position={{ lat: location.latitude, lng: location.longitude }}
                    onCloseClick={() => setShowInfo(false)}
                  >
                    <div className="map-info-window">
                      <h4>{location.driverName || "Driver"}</h4>
                      <p>
                        <strong>Last Updated:</strong>{" "}
                        {new Date(location.timestamp).toLocaleTimeString()}
                      </p>
                      {location.accuracy && (
                        <p>
                          <strong>Accuracy:</strong> ±{location.accuracy}m
                        </p>
                      )}
                      <p className="coordinates">
                        {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </p>
                    </div>
                  </InfoWindow>
                )}
              </>
            )}
          </GoogleMap>
        )}
      </div>

      {location && (
        <div className="location-summary">
          <div className="summary-row">
            <span className="summary-icon">📍</span>
            <span className="summary-text">
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </span>
          </div>
          {location.accuracy && (
            <div className="summary-row">
              <span className="summary-icon">🎯</span>
              <span className="summary-text">±{location.accuracy}m accuracy</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
