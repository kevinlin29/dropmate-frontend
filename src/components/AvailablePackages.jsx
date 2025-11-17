import React, { useState, useEffect } from "react";
import { driverAPI } from "../services/api";

export default function AvailablePackages({ onPackageClaimed }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimingId, setClaimingId] = useState(null);

  useEffect(() => {
    fetchAvailablePackages();
  }, []);

  async function fetchAvailablePackages() {
    try {
      setLoading(true);
      const data = await driverAPI.getAvailablePackages();
      setPackages(data.packages || []);
    } catch (err) {
      console.error("Failed to fetch available packages:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleClaimPackage(packageId) {
    try {
      setClaimingId(packageId);
      await driverAPI.claimPackage(packageId);

      // Remove from available packages list
      setPackages((prev) => prev.filter((pkg) => pkg.id !== packageId));

      // Notify parent component
      if (onPackageClaimed) {
        onPackageClaimed();
      }

      alert("Package claimed successfully!");
    } catch (err) {
      console.error("Failed to claim package:", err);
      alert(`Failed to claim package: ${err.message}`);
    } finally {
      setClaimingId(null);
    }
  }

  if (loading) {
    return (
      <div className="available-packages">
        <div className="packages-header">
          <h2>Available Packages</h2>
          <button className="refresh-button" onClick={fetchAvailablePackages}>
            Refresh
          </button>
        </div>
        <p className="loading">Loading available packages...</p>

        <style jsx>{`
          .available-packages {
            grid-column: 1 / -1;
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .packages-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          h2 {
            margin: 0;
            font-size: 20px;
            color: #333;
          }
          .loading {
            text-align: center;
            color: #666;
            padding: 40px;
          }
          .refresh-button {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            background: #667eea;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .refresh-button:hover {
            background: #5568d3;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="available-packages">
        <div className="packages-header">
          <h2>Available Packages</h2>
          <button className="refresh-button" onClick={fetchAvailablePackages}>
            Refresh
          </button>
        </div>
        <p className="error">Error: {error}</p>

        <style jsx>{`
          .available-packages {
            grid-column: 1 / -1;
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .packages-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          h2 {
            margin: 0;
            font-size: 20px;
            color: #333;
          }
          .error {
            color: #c33;
            padding: 40px;
            text-align: center;
          }
          .refresh-button {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            background: #667eea;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .refresh-button:hover {
            background: #5568d3;
          }
        `}</style>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="available-packages">
        <div className="packages-header">
          <h2>Available Packages</h2>
          <button className="refresh-button" onClick={fetchAvailablePackages}>
            Refresh
          </button>
        </div>
        <div className="empty-state">
          <p className="empty-icon">📦</p>
          <p className="empty-text">No packages available at the moment</p>
          <p className="empty-hint">Check back later for new delivery opportunities!</p>
        </div>

        <style jsx>{`
          .available-packages {
            grid-column: 1 / -1;
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .packages-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          h2 {
            margin: 0;
            font-size: 20px;
            color: #333;
          }
          .empty-state {
            text-align: center;
            padding: 60px 20px;
          }
          .empty-icon {
            font-size: 64px;
            margin: 0 0 20px 0;
          }
          .empty-text {
            color: #666;
            font-size: 18px;
            margin: 0 0 10px 0;
          }
          .empty-hint {
            color: #999;
            font-size: 14px;
          }
          .refresh-button {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            background: #667eea;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .refresh-button:hover {
            background: #5568d3;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="available-packages">
      <div className="packages-header">
        <h2>Available Packages ({packages.length})</h2>
        <button className="refresh-button" onClick={fetchAvailablePackages}>
          Refresh
        </button>
      </div>

      <div className="packages-grid">
        {packages.map((pkg) => (
          <div key={pkg.id} className="package-card">
            <div className="package-header">
              <span className="tracking-number">{pkg.tracking_number}</span>
              <span className="package-amount">${pkg.total_amount}</span>
            </div>

            <div className="package-body">
              <div className="package-section">
                <label>Customer</label>
                <p>{pkg.customer_name}</p>
                {pkg.customer_phone && <p className="phone">{pkg.customer_phone}</p>}
              </div>

              <div className="package-section">
                <label>Pickup</label>
                <p>{pkg.pickup_address}</p>
              </div>

              <div className="package-section">
                <label>Delivery</label>
                <p>{pkg.delivery_address}</p>
              </div>

              <div className="package-footer">
                <span className="created-at">
                  Created: {new Date(pkg.created_at).toLocaleDateString()}
                </span>
                <button
                  className="claim-button"
                  onClick={() => handleClaimPackage(pkg.id)}
                  disabled={claimingId === pkg.id}
                >
                  {claimingId === pkg.id ? "Claiming..." : "Claim Package"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .available-packages {
          grid-column: 1 / -1;
          background: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow-y: auto;
        }

        .packages-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        h2 {
          margin: 0;
          font-size: 20px;
          color: #333;
        }

        .refresh-button {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          background: #667eea;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .refresh-button:hover {
          background: #5568d3;
        }

        .packages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .package-card {
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          overflow: hidden;
          transition: all 0.2s;
        }

        .package-card:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
          transform: translateY(-2px);
        }

        .package-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tracking-number {
          font-weight: 600;
          font-size: 14px;
        }

        .package-amount {
          font-weight: 700;
          font-size: 16px;
        }

        .package-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .package-section {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .package-section label {
          font-size: 12px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .package-section p {
          margin: 0;
          color: #333;
          font-size: 14px;
        }

        .phone {
          color: #667eea;
          font-weight: 500;
        }

        .package-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 15px;
          border-top: 1px solid #e0e0e0;
        }

        .created-at {
          font-size: 12px;
          color: #999;
        }

        .claim-button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .claim-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
        }

        .claim-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
