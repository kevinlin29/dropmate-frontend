import React, { useState, useEffect } from "react";
import io from "socket.io-client";

import PackageList from "../components/PackageList.jsx";
import PackageInfo from "../components/PackageInfo.jsx";
import DriverMap from "../components/DriverMap.jsx";
import AddPackageModal from "../components/AddPackageModal.jsx";
import { shipmentsAPI } from "../services/api.js";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:8080";

export default function Dashboard() {
  const [shipments, setShipments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const selectedShipment = shipments.find((s) => s.id === selectedId);

  // Fetch shipments on mount
  useEffect(() => {
    async function fetchShipments() {
      try {
        setLoading(true);
        const data = await shipmentsAPI.list();
        setShipments(data);

        // Select first shipment by default
        if (data.length > 0 && !selectedId) {
          setSelectedId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch shipments:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchShipments();
  }, []);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log("WebSocket connected");
    });

    socket.on("shipment_updated", (data) => {
      console.log("Shipment updated:", data);
      setShipments((prev) =>
        prev.map((s) =>
          s.id === data.id ? { ...s, status: data.status } : s
        )
      );
    });

    socket.on("shipment_assigned", (data) => {
      console.log("Driver assigned:", data);
      setShipments((prev) =>
        prev.map((s) =>
          s.id === data.shipmentId ? { ...s, driver_id: data.driverId } : s
        )
      );
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  function handleAddClick() {
    setIsAddModalOpen(true);
  }

  async function handleAddPackage(trackingNumber) {
    try {
      const shipment = await shipmentsAPI.track(trackingNumber);

      // Add to list if not already present
      setShipments((prev) => {
        const exists = prev.some((s) => s.id === shipment.id);
        if (exists) return prev;
        return [...prev, shipment];
      });

      // Select the newly added shipment
      setSelectedId(shipment.id);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Failed to track shipment:", err);
      alert(`Failed to track shipment: ${err.message}`);
    }
  }

  async function handleCreatePackage(shipmentData) {
    try {
      const response = await shipmentsAPI.create(shipmentData);
      const newShipment = response.shipment;

      // Add to list
      setShipments((prev) => [...prev, newShipment]);

      // Select the newly created shipment
      setSelectedId(newShipment.id);
      setIsAddModalOpen(false);

      alert(`Shipment created! Tracking number: ${newShipment.tracking_number}`);
    } catch (err) {
      console.error("Failed to create shipment:", err);
      alert(`Failed to create shipment: ${err.message}`);
    }
  }

  async function handleDeletePackage(shipmentId) {
    // Confirm deletion
    const shipment = shipments.find((s) => s.id === shipmentId);
    const confirmMessage = `Are you sure you want to delete package ${
      shipment?.tracking_number || `#${shipmentId}`
    }?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await shipmentsAPI.delete(shipmentId);

      // Remove from list
      setShipments((prev) => prev.filter((s) => s.id !== shipmentId));

      // Clear selection if deleted shipment was selected
      if (selectedId === shipmentId) {
        const remaining = shipments.filter((s) => s.id !== shipmentId);
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      }

      alert("Package deleted successfully");
    } catch (err) {
      console.error("Failed to delete shipment:", err);

      // Handle specific error cases
      if (err.message.includes("403") || err.message.includes("Cannot delete")) {
        alert(`Cannot delete package: ${err.message}`);
      } else {
        alert(`Failed to delete package: ${err.message}`);
      }
    }
  }

  return (
    <>
      <main className="layout">
        <PackageList
          packages={shipments}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAddClick={handleAddClick}
          onDelete={handleDeletePackage}
          loading={loading}
          error={error}
        />

        <PackageInfo shipment={selectedShipment} />
        <DriverMap shipmentId={selectedId} />
      </main>

      {isAddModalOpen && (
        <AddPackageModal
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddPackage}
          onCreate={handleCreatePackage}
        />
      )}
    </>
  );
}
