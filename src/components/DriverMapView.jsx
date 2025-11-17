import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, useLoadScript, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { useAuth } from "../contexts/AuthContext";
import { locationAPI } from "../services/api";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const libraries = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};

export default function DriverMapView({ delivery }) {
  const { user } = useAuth();
  const [myLocation, setMyLocation] = useState(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [error, setError] = useState(null);
  const [directions, setDirections] = useState(null);
  const locationIntervalRef = useRef(null);

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: API_KEY,
    libraries,
  });

  // Get current location
  function getCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setMyLocation(location);
        setError(null);
      },
      (error) => {
        setError(`Location error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }

  // Send location update to server
  async function updateDriverLocation() {
    if (!myLocation || !user?.driverId) return;

    try {
      await locationAPI.updateLocation(user.driverId, {
        latitude: myLocation.lat,
        longitude: myLocation.lng,
        accuracy: 10,
      });
      console.log("Location updated successfully");
    } catch (error) {
      console.error("Failed to update location:", error);
    }
  }

  // Start location tracking
  function startTracking() {
    if (!delivery || delivery.status === "delivered") {
      alert("No active delivery to track");
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setTrackingActive(true);
    getCurrentLocation();

    // Update location every 30 seconds
    locationIntervalRef.current = setInterval(() => {
      getCurrentLocation();
    }, 30000);
  }

  // Stop location tracking
  function stopTracking() {
    setTrackingActive(false);
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
  }

  // Update location when myLocation changes and tracking is active
  useEffect(() => {
    if (trackingActive && myLocation) {
      updateDriverLocation();
    }
  }, [myLocation, trackingActive]);

  // Stop tracking when component unmounts
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  // Auto-start tracking when delivery status changes to in_transit
  useEffect(() => {
    if (delivery?.status === "in_transit" && !trackingActive) {
      startTracking();
    } else if (delivery?.status === "delivered" && trackingActive) {
      stopTracking();
    }
  }, [delivery?.status]);

  // Fetch route directions when delivery changes
  useEffect(() => {
    if (!isLoaded || !window.google || !delivery) {
      setDirections(null);
      return;
    }

    // Check if we have coordinate data
    const hasPickupCoords = delivery.pickup_latitude && delivery.pickup_longitude;
    const hasDeliveryCoords = delivery.delivery_latitude && delivery.delivery_longitude;

    // If no coordinates, try parsing from address string
    if (!hasPickupCoords && !hasDeliveryCoords) {
      console.log("[DriverMapView] No coordinates available for route");
      setDirections(null);
      return;
    }

    if (!hasPickupCoords || !hasDeliveryCoords) {
      console.warn("[DriverMapView] Missing pickup or delivery coordinates");
      setDirections(null);
      return;
    }

    console.log("[DriverMapView] Fetching route directions");

    const directionsService = new window.google.maps.DirectionsService();

    const origin = {
      lat: parseFloat(delivery.pickup_latitude),
      lng: parseFloat(delivery.pickup_longitude),
    };

    const destination = {
      lat: parseFloat(delivery.delivery_latitude),
      lng: parseFloat(delivery.delivery_longitude),
    };

    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          console.log("[DriverMapView] Route directions received");
          setDirections(result);
        } else {
          console.error("[DriverMapView] Directions request failed:", status);
          setDirections(null);
        }
      }
    );
  }, [isLoaded, delivery]);

  if (!delivery) {
    return (
      <div className="map-container">
        <div className="no-delivery">
          <p>Select a delivery to view map</p>
        </div>

        <style jsx>{`
          .map-container {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .no-delivery {
            text-align: center;
            color: #999;
          }
        `}</style>
      </div>
    );
  }

  // Calculate map center based on available markers
  const center = React.useMemo(() => {
    const points = [];

    if (myLocation) {
      points.push(myLocation);
    }
    if (delivery?.pickup_latitude && delivery?.pickup_longitude) {
      points.push({
        lat: parseFloat(delivery.pickup_latitude),
        lng: parseFloat(delivery.pickup_longitude)
      });
    }
    if (delivery?.delivery_latitude && delivery?.delivery_longitude) {
      points.push({
        lat: parseFloat(delivery.delivery_latitude),
        lng: parseFloat(delivery.delivery_longitude)
      });
    }

    if (points.length === 0) return defaultCenter;
    if (points.length === 1) return points[0];

    // Calculate center of all points
    const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
    const avgLng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;

    return { lat: avgLat, lng: avgLng };
  }, [myLocation, delivery]);

  // Handle loading states
  if (loadError) {
    return (
      <div className="map-container">
        <div className="map-header">
          <h3>Delivery Route</h3>
        </div>
        <div className="map-error">
          <p>Error loading Google Maps</p>
          <p className="error-detail">{loadError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      <div className="map-header">
        <h3>Delivery Route</h3>
        <div className="tracking-controls">
          {!trackingActive ? (
            <button className="tracking-button" onClick={startTracking}>
              Start Tracking
            </button>
          ) : (
            <button className="tracking-button stop" onClick={stopTracking}>
              Stop Tracking
            </button>
          )}
          {trackingActive && (
            <span className="tracking-indicator">
              ● Tracking Active (30s interval)
            </span>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="map-wrapper">
        {!API_KEY ? (
          <div className="map-placeholder">
            <p>Google Maps API key not configured</p>
            <p className="map-info">
              Pickup: {delivery.pickup_address}
            </p>
            <p className="map-info">
              Delivery: {delivery.delivery_address}
            </p>
            {myLocation && (
              <p className="map-info">
                Your Location: {myLocation.lat.toFixed(6)}, {myLocation.lng.toFixed(6)}
              </p>
            )}
          </div>
        ) : !isLoaded ? (
          <div className="map-loading">
            <div className="spinner">⟳</div>
            <p>Loading map...</p>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={13}
          >
            {/* Route between pickup and delivery */}
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: true, // Use custom markers
                  polylineOptions: {
                    strokeColor: "#667eea",
                    strokeWeight: 5,
                    strokeOpacity: 0.8,
                  },
                }}
              />
            )}

            {/* Pickup Location Marker */}
            {delivery?.pickup_latitude && delivery?.pickup_longitude && (
              <Marker
                position={{
                  lat: parseFloat(delivery.pickup_latitude),
                  lng: parseFloat(delivery.pickup_longitude),
                }}
                title={`Pickup: ${delivery.pickup_address}`}
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

            {/* Delivery Location Marker */}
            {delivery?.delivery_latitude && delivery?.delivery_longitude && (
              <Marker
                position={{
                  lat: parseFloat(delivery.delivery_latitude),
                  lng: parseFloat(delivery.delivery_longitude),
                }}
                title={`Delivery: ${delivery.delivery_address}`}
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

            {/* Driver's Current Location Marker */}
            {myLocation && (
              <Marker
                position={myLocation}
                title="Your Location"
                label={{
                  text: "📍",
                  color: "white",
                  fontSize: "18px",
                }}
                icon={{
                  url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%232563eb'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
              />
            )}
          </GoogleMap>
        )}
      </div>

      <style jsx>{`
        .map-container {
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
        }

        .map-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #f0f0f0;
        }

        h3 {
          margin: 0;
          font-size: 16px;
          color: #333;
        }

        .tracking-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tracking-button {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tracking-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .tracking-button.stop {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        }

        .tracking-button.stop:hover {
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
        }

        .tracking-indicator {
          color: #28a745;
          font-size: 12px;
          font-weight: 600;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 10px;
          font-size: 13px;
        }

        .map-wrapper {
          flex: 1;
          border-radius: 8px;
          overflow: hidden;
          min-height: 300px;
        }

        .map-placeholder {
          height: 100%;
          background: #f5f5f5;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #666;
          padding: 20px;
          text-align: center;
        }

        .map-info {
          margin: 5px 0;
          font-size: 14px;
        }

        .map-loading {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f9f9f9;
          color: #666;
        }

        .map-loading .spinner {
          font-size: 32px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .map-error {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #fee;
          color: #c33;
          padding: 20px;
        }

        .error-detail {
          font-size: 12px;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}
