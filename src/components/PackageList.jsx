import React from "react";

export default function PackageList({
  packages,
  selectedId,
  onSelect,
  onAddClick,
}) {
  return (
    <aside className="panel panel-left">
      <h2>User Dashboard</h2>
      <p className="subtitle">Package list of current user</p>

      <h3>Packages</h3>
      <div className="package-list">
        {packages.map((pkg) => (
          <button
            key={pkg.id}
            className={
              "package-item" + (pkg.id === selectedId ? " selected" : "")
            }
            onClick={() => onSelect(pkg.id)}
          >
            <div className="package-name">{pkg.name}</div>
            <div className="package-status">{pkg.status}</div>
          </button>
        ))}
      </div>

      <button className="primary-button" onClick={onAddClick}>
        Add Tracking / Package
      </button>
    </aside>
  );
}
