import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user, logout, isAuthenticated, isDriver, isCustomer } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="app-logo" onClick={() => navigate(isDriver ? "/driver" : "/")} style={{ cursor: "pointer" }}>
          DropMate
        </h1>

        <nav className="header-nav">
          {isCustomer && (
            <button className="nav-link" onClick={() => navigate("/")}>
              My Packages
            </button>
          )}
          {isDriver && (
            <button className="nav-link" onClick={() => navigate("/driver")}>
              My Deliveries
            </button>
          )}
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <span className="user-info">
                {isDriver ? "🚗" : "👤"} {user?.name || user?.email}
                {user?.role && <span className="role-badge">{user.role}</span>}
              </span>

              {isCustomer && (
                <button className="register-driver-button" onClick={() => navigate("/register-driver")}>
                  Become a Driver
                </button>
              )}

              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <button className="login-button" onClick={() => navigate("/login")}>
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
