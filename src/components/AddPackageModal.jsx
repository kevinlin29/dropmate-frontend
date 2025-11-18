import React, { useState, useCallback } from "react";
import AddressAutocomplete from "./AddressAutocomplete";

export default function AddPackageModal({ onClose, onSubmit, onCreate }) {
  const [mode, setMode] = useState("track"); // 'track' or 'create'
  const [loading, setLoading] = useState(false);

  // Track mode state
  const [trackingNumber, setTrackingNumber] = useState("");

  // Create mode state - Sender information
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupCoordinates, setPickupCoordinates] = useState(null);

  // Receiver information
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCoordinates, setDeliveryCoordinates] = useState(null);

  // Package information
  const [packageWeight, setPackageWeight] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [packageDimensions, setPackageDimensions] = useState("");
  const [packageStatus, setPackageStatus] = useState("");
  const [isFragile, setIsFragile] = useState(false);
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
    const trimmedSenderName = senderName.trim();
    const trimmedSenderPhone = senderPhone.trim();
    const trimmedReceiverName = receiverName.trim();
    const trimmedReceiverPhone = receiverPhone.trim();

    console.log("[AddPackageModal] Form submitted:", {
      sender: { name: trimmedSenderName, phone: trimmedSenderPhone, address: trimmedPickup },
      receiver: { name: trimmedReceiverName, phone: trimmedReceiverPhone, address: trimmedDelivery },
      package: { weight: packageWeight, description: packageDescription },
      coordinates: { pickupCoordinates, deliveryCoordinates }
    });

    // Validation
    if (!trimmedSenderName || !trimmedSenderPhone) {
      alert("Please provide sender name and phone number");
      return;
    }

    if (!trimmedReceiverName || !trimmedReceiverPhone) {
      alert("Please provide receiver name and phone number");
      return;
    }

    if (!trimmedPickup || !trimmedDelivery) {
      alert("Please provide both pickup and delivery addresses");
      return;
    }

    if (!packageWeight || parseFloat(packageWeight) <= 0) {
      alert("Please provide package weight");
      return;
    }

    if (!packageDescription.trim()) {
      alert("Please provide package description");
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
      // Build shipment data with new enhanced format
      const shipmentData = {
        sender: {
          name: trimmedSenderName,
          phone: trimmedSenderPhone,
          address: trimmedPickup,
          latitude: pickupCoordinates?.lat,
          longitude: pickupCoordinates?.lng,
        },
        receiver: {
          name: trimmedReceiverName,
          phone: trimmedReceiverPhone,
          address: trimmedDelivery,
          latitude: deliveryCoordinates?.lat,
          longitude: deliveryCoordinates?.lng,
        },
        package: {
          weight: parseFloat(packageWeight),
          description: packageDescription.trim(),
          ...(packageStatus && { status: packageStatus }),
          details: {
            ...(packageDimensions && { dimensions: packageDimensions.trim() }),
            fragile: isFragile,
          },
        },
      };

      console.log("[AddPackageModal] Sending enhanced shipment data:", shipmentData);
      await onCreate(shipmentData);

      // Reset form after successful creation
      setSenderName("");
      setSenderPhone("");
      setPickupAddress("");
      setPickupCoordinates(null);
      setReceiverName("");
      setReceiverPhone("");
      setDeliveryAddress("");
      setDeliveryCoordinates(null);
      setPackageWeight("");
      setPackageDescription("");
      setPackageDimensions("");
      setPackageStatus("");
      setIsFragile(false);
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
            <p>Create a new shipment with complete sender, receiver, and package information.</p>

            {/* Sender Information */}
            <h3 style={{ marginTop: "20px", marginBottom: "10px", fontSize: "16px", color: "#667eea" }}>
              Sender Information
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <label className="modal-label">
                Sender Name *
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="modal-input"
                  placeholder="Full name"
                  disabled={loading}
                  required
                />
              </label>

              <label className="modal-label">
                Sender Phone *
                <input
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="modal-input"
                  placeholder="e.g. +1 234 567 8900"
                  disabled={loading}
                  required
                />
              </label>
            </div>

            <label className="modal-label">
              Pickup Address *
              <AddressAutocomplete
                value={pickupAddress}
                onChange={handlePickupChange}
                placeholder="Start typing and select from dropdown..."
                disabled={loading}
                required
              />
            </label>

            {/* Receiver Information */}
            <h3 style={{ marginTop: "20px", marginBottom: "10px", fontSize: "16px", color: "#667eea" }}>
              Receiver Information
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <label className="modal-label">
                Receiver Name *
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="modal-input"
                  placeholder="Full name"
                  disabled={loading}
                  required
                />
              </label>

              <label className="modal-label">
                Receiver Phone *
                <input
                  type="tel"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  className="modal-input"
                  placeholder="e.g. +1 234 567 8900"
                  disabled={loading}
                  required
                />
              </label>
            </div>

            <label className="modal-label">
              Delivery Address *
              <AddressAutocomplete
                value={deliveryAddress}
                onChange={handleDeliveryChange}
                placeholder="Start typing and select from dropdown..."
                disabled={loading}
                required
              />
            </label>

            {/* Package Information */}
            <h3 style={{ marginTop: "20px", marginBottom: "10px", fontSize: "16px", color: "#667eea" }}>
              Package Details
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <label className="modal-label">
                Weight (kg) *
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={packageWeight}
                  onChange={(e) => setPackageWeight(e.target.value)}
                  className="modal-input"
                  placeholder="e.g. 2.5"
                  disabled={loading}
                  required
                />
              </label>

              <label className="modal-label">
                Dimensions (optional)
                <input
                  type="text"
                  value={packageDimensions}
                  onChange={(e) => setPackageDimensions(e.target.value)}
                  className="modal-input"
                  placeholder="e.g. 30x20x15 cm"
                  disabled={loading}
                />
              </label>
            </div>

            <label className="modal-label">
              Package Status (optional)
              <select
                value={packageStatus}
                onChange={(e) => setPackageStatus(e.target.value)}
                className="modal-input"
                disabled={loading}
                style={{ cursor: "pointer" }}
              >
                <option value="">-- Select Status (optional) --</option>
                <option value="in_transit">In Transit</option>
                <option value="out_for_delivery">Out For Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="exceptions">Exceptions</option>
              </select>
            </label>

            <label className="modal-label">
              Description *
              <textarea
                value={packageDescription}
                onChange={(e) => setPackageDescription(e.target.value)}
                className="modal-input"
                placeholder="Describe the package contents..."
                rows="3"
                disabled={loading}
                required
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
            </label>

            <label className="modal-label" style={{ flexDirection: "row", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={isFragile}
                onChange={(e) => setIsFragile(e.target.checked)}
                disabled={loading}
                style={{ width: "auto", margin: 0 }}
              />
              <span>Fragile - Handle with care</span>
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
