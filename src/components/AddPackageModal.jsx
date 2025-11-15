import React, { useState } from "react";

export default function AddPackageModal({ onClose, onSubmit }) {
  const [packageId, setPackageId] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = packageId.trim();
    if (!trimmed) return; // simple validation
    onSubmit(trimmed); // send value to parent
    setPackageId("");
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add Tracking Package</h2>
        <p>Enter the ID of the package you want to track.</p>

        <form onSubmit={handleSubmit}>
          <label className="modal-label">
            Package ID
            <input
              type="text"
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              className="modal-input"
              placeholder="e.g. PKG123456"
            />
          </label>

          <div className="modal-buttons">
            <button
              type="button"
              onClick={onClose}
              className="secondary-button"
            >
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
