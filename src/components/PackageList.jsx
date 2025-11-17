import React from "react";

export default function PackageList({
  packages,
  selectedId,
  onSelect,
  onAddClick,
  onDelete,
  loading,
  error,
}) {
  return (
    <aside className="panel panel-left">
      <h2>User Dashboard</h2>
      <p className="subtitle">Package list of current user</p>

      <h3>Packages</h3>
      <div className="package-list">
        {loading ? (
          <div className="loading-state">Loading packages...</div>
        ) : error ? (
          <div className="error-state">
            Error: {error}
            <br />
            <small>Make sure the backend is running on port 8080</small>
          </div>
        ) : packages.length === 0 ? (
          <div className="empty-state">
            No packages yet. Click "Add Tracking / Package" to get started.
          </div>
        ) : (
          packages.map((pkg) => (
            <div
              key={pkg.id}
              className={
                "package-item-wrapper" + (pkg.id === selectedId ? " selected" : "")
              }
            >
              <button
                className="package-item"
                onClick={() => onSelect(pkg.id)}
              >
                <div className="package-name">
                  {pkg.tracking_number || `Package #${pkg.id}`}
                </div>
                <div className="package-status">{pkg.status || "Unknown"}</div>
              </button>
              {onDelete && (
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(pkg.id);
                  }}
                  title="Delete package"
                  aria-label="Delete package"
                >
                  ×
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <button className="primary-button" onClick={onAddClick}>
        Add Tracking / Package
      </button>
    </aside>
  );
}
