import React from "react";

export default function DeliveryDetails({ delivery, onStatusUpdate }) {
  if (!delivery) {
    return (
      <div className="delivery-details">
        <h2>Delivery Details</h2>
        <p className="no-selection">Select a delivery to view details</p>

        <style jsx>{`
          .delivery-details {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            height: 30%;
            min-height: 200px;
          }
          h2 {
            margin: 0 0 20px 0;
            font-size: 18px;
            color: #333;
          }
          .no-selection {
            text-align: center;
            color: #999;
            padding: 40px 20px;
          }
        `}</style>
      </div>
    );
  }

  const canStartDelivery = delivery.status === "assigned";
  const canMarkDelivered = delivery.status === "in_transit";

  return (
    <div className="delivery-details">
      <div className="details-header">
        <h2>Delivery Details</h2>
        <span className={`status status-${delivery.status}`}>
          {delivery.status.replace("_", " ")}
        </span>
      </div>

      <div className="details-content">
        <div className="detail-section">
          <h3>Customer Information</h3>
          <div className="detail-row">
            <span className="label">Name:</span>
            <span className="value">{delivery.customer_name || "N/A"}</span>
          </div>
          <div className="detail-row">
            <span className="label">Phone:</span>
            <span className="value">{delivery.customer_phone || "N/A"}</span>
          </div>
        </div>

        <div className="detail-section">
          <h3>Addresses</h3>
          <div className="detail-row">
            <span className="label">Pickup:</span>
            <span className="value">{delivery.pickup_address}</span>
          </div>
          <div className="detail-row">
            <span className="label">Delivery:</span>
            <span className="value">{delivery.delivery_address}</span>
          </div>
        </div>

        <div className="detail-section">
          <h3>Package Info</h3>
          <div className="detail-row">
            <span className="label">Tracking #:</span>
            <span className="value">{delivery.tracking_number}</span>
          </div>
          {delivery.notes && (
            <div className="detail-row">
              <span className="label">Notes:</span>
              <span className="value">{delivery.notes}</span>
            </div>
          )}
        </div>
      </div>

      <div className="action-buttons">
        {canStartDelivery && (
          <button
            className="action-button start-button"
            onClick={() => onStatusUpdate(delivery.id, "in_transit")}
          >
            Start Delivery
          </button>
        )}
        {canMarkDelivered && (
          <button
            className="action-button delivered-button"
            onClick={() => onStatusUpdate(delivery.id, "delivered")}
          >
            Mark as Delivered
          </button>
        )}
        {delivery.status === "delivered" && (
          <div className="delivered-badge">
            ✓ Delivered
          </div>
        )}
      </div>

      <style jsx>{`
        .delivery-details {
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }

        h2 {
          margin: 0;
          font-size: 18px;
          color: #333;
        }

        h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #667eea;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status {
          padding: 6px 12px;
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

        .status-in_transit,
        .status-in-transit {
          background: #d4edda;
          color: #155724;
        }

        .status-delivered {
          background: #e2e3e5;
          color: #383d41;
        }

        .details-content {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .detail-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-row {
          display: flex;
          gap: 10px;
          font-size: 14px;
        }

        .label {
          color: #666;
          font-weight: 500;
          min-width: 80px;
        }

        .value {
          color: #333;
          flex: 1;
        }

        .action-buttons {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 2px solid #f0f0f0;
          display: flex;
          gap: 10px;
        }

        .action-button {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .start-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .start-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .delivered-button {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
        }

        .delivered-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
        }

        .delivered-badge {
          flex: 1;
          padding: 12px;
          background: #e2e3e5;
          color: #383d41;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
