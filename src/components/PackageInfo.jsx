import React, { useState, useEffect } from "react";

export default function PackageInfo({ shipment }) {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Fetch shipment events when shipment changes
  useEffect(() => {
    if (!shipment) {
      setEvents([]);
      return;
    }

    async function fetchEvents() {
      setLoadingEvents(true);
      try {
        const API_BASE_URL =
          import.meta.env.VITE_API_URL || "http://localhost:8080/api";
        const response = await fetch(
          `${API_BASE_URL}/shipments/${shipment.id}/events`
        );

        if (response.ok) {
          const data = await response.json();
          // Handle both old (array) and new (object with events array) response formats
          if (Array.isArray(data)) {
            setEvents(data);
          } else if (data && Array.isArray(data.events)) {
            setEvents(data.events);
          } else {
            console.warn("Unexpected events data format:", data);
            setEvents([]);
          }
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error("Failed to fetch shipment events:", err);
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    }

    fetchEvents();
  }, [shipment?.id]);

  if (!shipment) {
    return (
      <section className="panel panel-center">
        <h2>Package Info</h2>
        <div className="card current-status">
          <p className="empty-state">Select a package from the list.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel panel-center">
      <h2>Package Info</h2>

      <div className="card current-status">
        <h3>Current Status</h3>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
          <p className={`status-badge status-${shipment.status || 'unknown'}`}>
            {shipment.status?.toUpperCase() || "UNKNOWN"}
          </p>
          {shipment.package_status && (
            <p className="status-badge package-status-badge" style={{
              background: "#e8eeff",
              color: "#667eea",
              fontSize: "0.8rem"
            }}>
              📦 {shipment.package_status.replace(/_/g, ' ').toUpperCase()}
            </p>
          )}
        </div>

        <div className="shipment-details">
          <div className="detail-row">
            <span className="detail-label">Tracking Number:</span>
            <span className="detail-value">{shipment.tracking_number}</span>
          </div>

          {shipment.package_status && (
            <div className="detail-row">
              <span className="detail-label">Package Status:</span>
              <span className="detail-value" style={{ color: "#667eea", fontWeight: "500" }}>
                {shipment.package_status.replace(/_/g, ' ')}
              </span>
            </div>
          )}

          {shipment.driver_name && (
            <div className="detail-row">
              <span className="detail-label">Driver:</span>
              <span className="detail-value">
                {shipment.driver_name} ({shipment.vehicle_type || "N/A"})
              </span>
            </div>
          )}

          {shipment.pickup_address && (
            <div className="detail-row">
              <span className="detail-label">Pickup:</span>
              <span className="detail-value">{shipment.pickup_address}</span>
            </div>
          )}

          {shipment.delivery_address && (
            <div className="detail-row">
              <span className="detail-label">Delivery:</span>
              <span className="detail-value">{shipment.delivery_address}</span>
            </div>
          )}
        </div>
      </div>

      <div className="card history">
        <h3>History (status updates)</h3>
        {loadingEvents ? (
          <div className="loading-state">Loading history...</div>
        ) : events.length === 0 ? (
          <div className="empty-state">No status updates yet.</div>
        ) : (
          <ul className="timeline">
            {events.map((event) => (
              <li key={event.id} className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <strong>{event.event_type.replace(/_/g, ' ').toUpperCase()}</strong>
                  {event.description && <p>{event.description}</p>}
                  <small className="timestamp">
                    {new Date(event.occurred_at).toLocaleString()}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
