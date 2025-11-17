// API configuration and service functions for backend communication
import { auth } from "../firebase/config";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Generic fetch wrapper with error handling
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get Firebase ID token if user is authenticated
  let token = null;
  if (auth.currentUser) {
    try {
      token = await auth.currentUser.getIdToken();
    } catch (error) {
      console.error("Failed to get Firebase token:", error);
    }
  }

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Shipment API functions
export const shipmentsAPI = {
  // Get all shipments for the current user (authenticated)
  list: () => apiFetch("/users/me/shipments"),

  // Get shipment by ID (authenticated, with ownership check)
  getById: (id) => apiFetch(`/users/me/shipments/${id}`),

  // Create new shipment (authenticated)
  create: (shipmentData) =>
    apiFetch("/users/me/shipments", {
      method: "POST",
      body: JSON.stringify(shipmentData),
    }),

  // Track shipment by tracking number (public)
  track: (trackingNumber) => apiFetch(`/shipments/track/${trackingNumber}`),

  // Get shipment with live driver location
  getLocation: (id) => apiFetch(`/shipments/${id}/location`),

  // Get shipment event history
  getEvents: (id) => apiFetch(`/shipments/${id}/events`),

  // Assign driver to shipment
  assignDriver: (id, driverId) =>
    apiFetch(`/shipments/${id}/assign-driver`, {
      method: "POST",
      body: JSON.stringify({ driverId }),
    }),

  // Update shipment status
  updateStatus: (id, status) =>
    apiFetch(`/shipments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Delete shipment (authenticated, with ownership check)
  delete: (id) =>
    apiFetch(`/users/me/shipments/${id}`, {
      method: "DELETE",
    }),
};

// User API functions
export const usersAPI = {
  // Get current user profile
  getProfile: () => apiFetch("/users/me"),

  // Update user profile
  updateProfile: (profileData) =>
    apiFetch("/users/me", {
      method: "PATCH",
      body: JSON.stringify(profileData),
    }),

  // Get user statistics
  getStats: () => apiFetch("/users/me/stats"),

  // Get user orders
  getOrders: () => apiFetch("/users/me/orders"),
};

// Orders API functions
export const ordersAPI = {
  list: () => apiFetch("/orders"),
};

// Driver API functions (admin/general)
export const driversAPI = {
  // List all drivers
  list: () => apiFetch("/drivers"),

  // Get driver by ID
  getById: (id) => apiFetch(`/drivers/${id}`),

  // Update driver status
  updateStatus: (id, status) =>
    apiFetch(`/drivers/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Add driver location
  addLocation: (id, locationData) =>
    apiFetch(`/drivers/${id}/location`, {
      method: "POST",
      body: JSON.stringify(locationData),
    }),
};

// Driver-specific API functions (for authenticated drivers)
export const driverAPI = {
  // Register as driver
  register: (driverData) =>
    apiFetch("/users/me/register-driver", {
      method: "POST",
      body: JSON.stringify(driverData),
    }),

  // Update driver profile
  updateProfile: (updates) =>
    apiFetch("/users/me/driver-profile", {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  // Get available packages to claim
  getAvailablePackages: (limit = 50) =>
    apiFetch(`/users/me/available-packages?limit=${limit}`),

  // Claim a package
  claimPackage: (packageId) =>
    apiFetch(`/users/me/packages/${packageId}/claim`, {
      method: "POST",
    }),

  // Get my deliveries
  getDeliveries: (status = null) =>
    apiFetch(`/users/me/deliveries${status ? `?status=${status}` : ""}`),

  // Update delivery status
  updateDeliveryStatus: (deliveryId, status) =>
    apiFetch(`/users/me/deliveries/${deliveryId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// Location API (for location service on port 8081)
export const locationAPI = {
  // Update driver location
  updateLocation: async (driverId, locationData) => {
    const LOCATION_SERVICE_URL =
      import.meta.env.VITE_LOCATION_SERVICE_URL || "http://localhost:8081/api/location";

    const url = `${LOCATION_SERVICE_URL}/${driverId}`;

    // Get Firebase ID token
    let token = null;
    if (auth.currentUser) {
      try {
        token = await auth.currentUser.getIdToken();
      } catch (error) {
        console.error("Failed to get Firebase token:", error);
      }
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(locationData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Location API Error:`, error);
      throw error;
    }
  },
};
