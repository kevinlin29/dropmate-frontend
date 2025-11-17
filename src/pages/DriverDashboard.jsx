import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { driverAPI } from "../services/api";
import DeliveryList from "../components/DeliveryList";
import DeliveryDetails from "../components/DeliveryDetails";
import DriverMapView from "../components/DriverMapView";
import AvailablePackages from "../components/AvailablePackages";

export default function DriverDashboard() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("myDeliveries"); // 'myDeliveries' or 'available'

  const selectedDelivery = deliveries.find((d) => d.id === selectedId);

  // Fetch driver's deliveries on mount
  useEffect(() => {
    if (activeTab === "myDeliveries") {
      fetchDeliveries();
    }
  }, [activeTab]);

  async function fetchDeliveries() {
    try {
      setLoading(true);
      const data = await driverAPI.getDeliveries();
      setDeliveries(data.deliveries || data);

      // Select first delivery by default
      if (data.deliveries && data.deliveries.length > 0 && !selectedId) {
        setSelectedId(data.deliveries[0].id);
      } else if (Array.isArray(data) && data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch deliveries:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(deliveryId, newStatus) {
    try {
      await driverAPI.updateDeliveryStatus(deliveryId, newStatus);

      // Update local state
      setDeliveries((prev) =>
        prev.map((d) => (d.id === deliveryId ? { ...d, status: newStatus } : d))
      );

      alert(`Delivery status updated to: ${newStatus}`);
    } catch (err) {
      console.error("Failed to update delivery status:", err);
      alert(`Failed to update status: ${err.message}`);
    }
  }

  function handlePackageClaimed() {
    // Switch to "My Deliveries" tab and refresh
    setActiveTab("myDeliveries");
    fetchDeliveries();
  }

  return (
    <div className="driver-dashboard">
      <header className="driver-header">
        <h1>Driver Dashboard</h1>
        <div className="driver-info">
          <span>Welcome, {user?.name}</span>
        </div>
      </header>

      <div className="tab-navigation">
        <button
          className={activeTab === "myDeliveries" ? "tab-active" : "tab-inactive"}
          onClick={() => setActiveTab("myDeliveries")}
        >
          My Deliveries
        </button>
        <button
          className={activeTab === "available" ? "tab-active" : "tab-inactive"}
          onClick={() => setActiveTab("available")}
        >
          Available Packages
        </button>
      </div>

      <main className="driver-layout">
        {activeTab === "myDeliveries" && (
          <>
            <DeliveryList
              deliveries={deliveries}
              selectedId={selectedId}
              onSelect={setSelectedId}
              loading={loading}
              error={error}
            />

            <DeliveryDetails
              delivery={selectedDelivery}
              onStatusUpdate={handleStatusUpdate}
            />

            <DriverMapView delivery={selectedDelivery} />
          </>
        )}

        {activeTab === "available" && (
          <AvailablePackages onPackageClaimed={handlePackageClaimed} />
        )}
      </main>

      <style jsx>{`
        .driver-dashboard {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #f5f5f5;
        }

        .driver-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .driver-header h1 {
          margin: 0;
          font-size: 24px;
        }

        .driver-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .tab-navigation {
          background: white;
          display: flex;
          gap: 10px;
          padding: 15px 30px;
          border-bottom: 1px solid #e0e0e0;
        }

        .tab-active,
        .tab-inactive {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .tab-inactive {
          background: #f5f5f5;
          color: #666;
        }

        .tab-inactive:hover {
          background: #e8e8e8;
        }

        .driver-layout {
          display: grid;
          grid-template-columns: 350px 400px 1fr;
          gap: 20px;
          padding: 20px 30px;
          flex: 1;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
