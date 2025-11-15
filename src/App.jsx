import React, { useState } from "react";
import "./App.css";

import PackageList from "./components/PackageList.jsx";
import PackageInfo from "./components/PackageInfo.jsx";
import DriverMap from "./components/DriverMap.jsx";
import AddPackageModal from "./components/AddPackageModal.jsx";

const dummyPackages = [
  { id: 1, name: "Package #1", status: "Out for delivery" },
  { id: 2, name: "Package #2", status: "In transit" },
  { id: 3, name: "Package #3", status: "Delivered" },
];

export default function App() {
  const [selectedId, setSelectedId] = useState(dummyPackages[0].id);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const selectedPackage = dummyPackages.find((p) => p.id === selectedId);

  function handleAddClick() {
    setIsAddModalOpen(true);
  }

  function handleAddPackage(packageId) {
    console.log("New package ID:", packageId);
    setIsAddModalOpen(false);
  }

  return (
    <div className="app">
      <main className="layout">
        <PackageList
          packages={dummyPackages}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAddClick={handleAddClick}
        />

        <PackageInfo pkg={selectedPackage} />
        <DriverMap />
      </main>

      {isAddModalOpen && (
        <AddPackageModal
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddPackage}
        />
      )}
    </div>
  );
}
