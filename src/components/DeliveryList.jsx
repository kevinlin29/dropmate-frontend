import React from "react";

export default function DeliveryList({ deliveries, selectedId, onSelect, loading, error }) {
  if (loading) {
    return (
      <div className="delivery-list">
        <h2>My Deliveries</h2>
        <p className="loading">Loading deliveries...</p>

        <style jsx>{`
          .delivery-list {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow-y: auto;
          }
          .loading {
            text-align: center;
            color: #666;
            padding: 20px;
          }
          h2 {
            margin: 0 0 20px 0;
            font-size: 18px;
            color: #333;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="delivery-list">
        <h2>My Deliveries</h2>
        <p className="error">Error: {error}</p>

        <style jsx>{`
          .delivery-list {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .error {
            color: #c33;
            padding: 20px;
            text-align: center;
          }
          h2 {
            margin: 0 0 20px 0;
            font-size: 18px;
            color: #333;
          }
        `}</style>
      </div>
    );
  }

  if (!deliveries || deliveries.length === 0) {
    return (
      <div className="delivery-list">
        <h2>My Deliveries</h2>
        <p className="empty">No deliveries assigned yet.</p>
        <p className="empty-hint">Check the Available Packages tab to claim a delivery!</p>

        <style jsx>{`
          .delivery-list {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .empty {
            text-align: center;
            color: #999;
            padding: 20px 10px 10px;
          }
          .empty-hint {
            text-align: center;
            color: #667eea;
            font-size: 14px;
          }
          h2 {
            margin: 0 0 20px 0;
            font-size: 18px;
            color: #333;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="delivery-list">
      <h2>My Deliveries ({deliveries.length})</h2>

      <div className="delivery-items">
        {deliveries.map((delivery) => (
          <div
            key={delivery.id}
            className={`delivery-item ${selectedId === delivery.id ? "selected" : ""}`}
            onClick={() => onSelect(delivery.id)}
          >
            <div className="delivery-header">
              <span className="tracking-number">{delivery.tracking_number}</span>
              <span className={`status status-${delivery.status}`}>
                {delivery.status}
              </span>
            </div>

            <div className="delivery-info">
              <div className="info-row">
                <span className="label">From:</span>
                <span className="value">{delivery.pickup_address}</span>
              </div>
              <div className="info-row">
                <span className="label">To:</span>
                <span className="value">{delivery.delivery_address}</span>
              </div>
              {delivery.customer_name && (
                <div className="info-row">
                  <span className="label">Customer:</span>
                  <span className="value">{delivery.customer_name}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .delivery-list {
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        h2 {
          margin: 0 0 20px 0;
          font-size: 18px;
          color: #333;
        }

        .delivery-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
        }

        .delivery-item {
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .delivery-item:hover {
          border-color: #667eea;
          background: #f8f9ff;
        }

        .delivery-item.selected {
          border-color: #667eea;
          background: linear-gradient(135deg, #e8eeff 0%, #f0e8ff 100%);
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
        }

        .delivery-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .tracking-number {
          font-weight: 600;
          font-size: 14px;
          color: #333;
        }

        .status {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-pending {
          background: #fff3cd;
          color: #856404;
        }

        .status-assigned {
          background: #d1ecf1;
          color: #0c5460;
        }

        .status-in_transit {
          background: #d4edda;
          color: #155724;
        }

        .status-delivered {
          background: #e2e3e5;
          color: #383d41;
        }

        .delivery-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-row {
          display: flex;
          gap: 8px;
          font-size: 13px;
        }

        .label {
          color: #666;
          font-weight: 500;
          min-width: 70px;
        }

        .value {
          color: #333;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
