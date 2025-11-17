import React, { useState, useCallback } from "react";
import AddressAutocomplete from "./AddressAutocomplete";

export default function AddPackageModal({ onClose, onSubmit, onCreate }) {
  const [mode, setMode] = useState("track"); // 'track' or 'create'
  const [loading, setLoading] = useState(false);

  // Track mode state
  const [trackingNumber, setTrackingNumber] = useState("");

  // Create mode state
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCoordinates, setDeliveryCoordinates] = useState(null);
  const [totalAmount, setTotalAmount] = useState("");

  // Stable callback for pickup address changes
  const handlePickupChange = useCallback((address, place) => {
    console.log("[AddPackageModal] Pickup address changed:", {
      address,
      hasPlace: !!place,
      placeData: place ? {
        formatted_address: place.formatted_address,
        hasGeometry: !!place.geometry
      } : null
    });

    setPickupAddress(address);

    // Extract coordinates only if place object with geometry is provided
    if (place?.geometry?.location) {
      const coords = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      console.log("[AddPackageModal] Pickup coordinates set:", coords);
      setPickupCoordinates(coords);
    } else {
      // Clear coordinates when manually typing
      console.log("[AddPackageModal] Pickup coordinates cleared");
      setPickupCoordinates(null);
    }
  }, []);

  // Stable callback for delivery address changes
  const handleDeliveryChange = useCallback((address, place) => {
    console.log("[AddPackageModal] Delivery address changed:", {
      address,
      hasPlace: !!place,
      placeData: place ? {
        formatted_address: place.formatted_address,
        hasGeometry: !!place.geometry
      } : null
    });

    setDeliveryAddress(address);

    // Extract coordinates only if place object with geometry is provided
    if (place?.geometry?.location) {
      const coords = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      console.log("[AddPackageModal] Delivery coordinates set:", coords);
      setDeliveryCoordinates(coords);
    } else {
      // Clear coordinates when manually typing
      console.log("[AddPackageModal] Delivery coordinates cleared");
      setDeliveryCoordinates(null);
    }
  }, []);

  async function handleTrackSubmit(e) {
    e.preventDefault();
    const trimmed = trackingNumber.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      await onSubmit(trimmed);
      setTrackingNumber("");
    } catch (err) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSubmit(e) {
    e.preventDefault();

    const trimmedPickup = pickupAddress.trim();
    const trimmedDelivery = deliveryAddress.trim();

    console.log("[AddPackageModal] Form submitted:", {
      pickupAddress: trimmedPickup,
      deliveryAddress: trimmedDelivery,
      pickupCoordinates,
      deliveryCoordinates
    });

    // Validation
    if (!trimmedPickup || !trimmedDelivery) {
      console.error("[AddPackageModal] Validation failed - addresses required");
      alert("Please provide both pickup and delivery addresses");
      return;
    }

    // Warn if coordinates are missing (user didn't select from autocomplete)
    if (!pickupCoordinates || !deliveryCoordinates) {
      console.warn("[AddPackageModal] Missing coordinates - user may not have selected from autocomplete");
      if (!confirm("Addresses may be incomplete. Did you select from the dropdown suggestions? Continue anyway?")) {
        return;
      }
    }

    setLoading(true);
    try {
      // Build shipment data with coordinate format
      const shipmentData = {
        pickupAddress: pickupCoordinates
          ? {
              address: trimmedPickup,
              latitude: pickupCoordinates.lat,
              longitude: pickupCoordinates.lng,
            }
          : trimmedPickup, // Fallback if no coordinates
        deliveryAddress: deliveryCoordinates
          ? {
              address: trimmedDelivery,
              latitude: deliveryCoordinates.lat,
              longitude: deliveryCoordinates.lng,
            }
          : trimmedDelivery, // Fallback if no coordinates
        totalAmount: totalAmount ? parseFloat(totalAmount) : 0,
      };

      console.log("[AddPackageModal] Sending shipment data:", shipmentData);
      await onCreate(shipmentData);

      // Reset form after successful creation
      setPickupAddress("");
      setPickupCoordinates(null);
      setDeliveryAddress("");
      setDeliveryCoordinates(null);
      setTotalAmount("");
    } catch (err) {
      console.error("[AddPackageModal] Failed to create shipment:", err);
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add Package</h2>

        {/* Mode Toggle */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button
            type="button"
            onClick={() => setMode("track")}
            className={mode === "track" ? "primary-button" : "secondary-button"}
            style={{ flex: 1 }}
          >
            Track Existing
          </button>
          <button
            type="button"
            onClick={() => setMode("create")}
            className={mode === "create" ? "primary-button" : "secondary-button"}
            style={{ flex: 1 }}
          >
            Create New
          </button>
        </div>

        {/* Track Mode */}
        {mode === "track" && (
          <form onSubmit={handleTrackSubmit}>
            <p>Enter the tracking number of an existing package.</p>
            <label className="modal-label">
              Tracking Number
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="modal-input"
                placeholder="e.g. DM-20251116-A3X9F2"
                autoFocus
                disabled={loading}
              />
            </label>

            <div className="modal-buttons">
              <button
                type="button"
                onClick={onClose}
                className="secondary-button"
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? "Tracking..." : "Track Package"}
              </button>
            </div>
          </form>
        )}

        {/* Create Mode */}
        {mode === "create" && (
          <form onSubmit={handleCreateSubmit}>
            <p>Create a new shipment with pickup and delivery addresses.</p>

            <label className="modal-label">
              Pickup Address
              <AddressAutocomplete
                value={pickupAddress}
                onChange={handlePickupChange}
                placeholder="Start typing and select from dropdown..."
                autoFocus
                disabled={loading}
                required
              />
            </label>

            <label className="modal-label">
              Delivery Address
              <AddressAutocomplete
                value={deliveryAddress}
                onChange={handleDeliveryChange}
                placeholder="Start typing and select from dropdown..."
                disabled={loading}
                required
              />
            </label>

            <label className="modal-label">
              Total Amount (optional)
              <input
                type="number"
                step="0.01"
                min="0"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="modal-input"
                placeholder="e.g. 29.99"
                disabled={loading}
              />
            </label>

            <div className="modal-buttons">
              <button
                type="button"
                onClick={onClose}
                className="secondary-button"
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? "Creating..." : "Create Shipment"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
