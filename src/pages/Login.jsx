import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { driverAPI } from "../services/api";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Driver registration fields
  const [registerAsDriver, setRegisterAsDriver] = useState(false);
  const [vehicleType, setVehicleType] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const { user, login, register, refreshUserProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "driver") {
        navigate("/driver", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigate("/");
      } else {
        // Register new user
        await register(email, password, name);

        // If user chose to register as driver, create driver profile
        if (registerAsDriver) {
          if (!vehicleType || !licenseNumber) {
            setError("Please fill in vehicle type and license number");
            setLoading(false);
            return;
          }

          await driverAPI.register({
            name: name,
            vehicleType: vehicleType,
            licenseNumber: licenseNumber,
          });

          // Refresh user profile to update role
          await refreshUserProfile();

          // Redirect to driver dashboard
          navigate("/driver");
        } else {
          // Redirect to customer dashboard
          navigate("/");
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-logo">DROPMATE</h1>
          <p className="login-tagline">Package Tracking & Delivery Management</p>
        </div>

        <div className="login-box">
          <div className="login-tabs">
            <button
              className={`tab ${isLogin ? "active" : ""}`}
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
            >
              Login
            </button>
            <button
              className={`tab ${!isLogin ? "active" : ""}`}
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {!isLogin && (
              <>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={registerAsDriver}
                      onChange={(e) => setRegisterAsDriver(e.target.checked)}
                    />
                    <span>Register as Driver</span>
                  </label>
                  <p className="checkbox-hint">
                    Start accepting deliveries immediately
                  </p>
                </div>

                {registerAsDriver && (
                  <>
                    <div className="form-group">
                      <label htmlFor="vehicleType">Vehicle Type</label>
                      <select
                        id="vehicleType"
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        required={registerAsDriver}
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
                        type="text"
                        id="licenseNumber"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="DL12345678"
                        required={registerAsDriver}
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading
                ? "Please wait..."
                : isLogin
                ? "Login"
                : registerAsDriver
                ? "Sign Up as Driver"
                : "Sign Up"}
            </button>
          </form>

          <div className="login-footer">
            {isLogin ? (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                  }}
                >
                  Sign up here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                  }}
                >
                  Login here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
