import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { driverAPI } from "../services/api";

export default function DriverRegistration() {
  const navigate = useNavigate();
  const { refreshUserProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    vehicleType: "",
    licenseNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.vehicleType.trim() || !formData.licenseNumber.trim()) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const response = await driverAPI.register(formData);
      console.log("Driver registration successful:", response);

      // Refresh user profile to update role
      await refreshUserProfile();

      // Redirect to driver dashboard
      alert(`Driver registration successful! Welcome, ${formData.name}`);
      navigate("/driver");
    } catch (err) {
      console.error("Driver registration failed:", err);
      setError(err.message || "Failed to register as driver");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Register as Driver</h1>
        <p style={{ marginBottom: "20px", color: "#666" }}>
          Complete your driver profile to start accepting deliveries.
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Driver"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="vehicleType">Vehicle Type</label>
            <select
              id="vehicleType"
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              disabled={loading}
              required
            >
              <option value="">Select vehicle type</option>
              <option value="Bike">Bike</option>
              <option value="Scooter">Scooter</option>
              <option value="Car">Car</option>
              <option value="Van">Van</option>
              <option value="Truck">Truck</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="licenseNumber">Driver's License Number</label>
            <input
              id="licenseNumber"
              name="licenseNumber"
              type="text"
              value={formData.licenseNumber}
              onChange={handleChange}
              placeholder="DL12345678"
              disabled={loading}
              required
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="secondary-button"
              disabled={loading}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? "Registering..." : "Register as Driver"}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .auth-box {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 450px;
        }

        h1 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 28px;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 5px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          color: #555;
          font-weight: 500;
        }

        input,
        select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
          box-sizing: border-box;
        }

        input:focus,
        select:focus {
          outline: none;
          border-color: #667eea;
        }

        input:disabled,
        select:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .primary-button,
        .secondary-button {
          padding: 12px 24px;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .primary-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .primary-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .primary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .secondary-button {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }

        .secondary-button:hover:not(:disabled) {
          background: #f8f9ff;
        }

        .secondary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
