import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { auth } from "../firebase/config";
import { usersAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in - fetch full profile from backend
          try {
            const profile = await usersAPI.getProfile();
            console.log("User profile from backend:", profile);

            // Use the appropriate name based on role
            let displayName = firebaseUser.displayName || firebaseUser.email;
            if (profile.role === "driver" && profile.driver_name) {
              displayName = profile.driver_name;
            } else if (profile.role === "customer" && profile.customer_name) {
              displayName = profile.customer_name;
            }

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: displayName,
              photoURL: firebaseUser.photoURL,
              role: profile.role || "customer", // 'customer' or 'driver'
              userId: profile.id || null,
              customerId: profile.customer_id || null,
              driverId: profile.driver_id || null,
            });
          } catch (error) {
            console.error("Failed to fetch user profile:", error);
            console.error("Error details:", error.response || error.message);
            // Fallback to Firebase user data if backend fails
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email,
              photoURL: firebaseUser.photoURL,
              role: "customer", // Default to customer
              userId: null,
              customerId: null,
              driverId: null,
            });
          }
        } else {
          // User is signed out
          setUser(null);
        }
      } catch (error) {
        console.error("Critical error in auth state change:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  const register = async (email, password, name) => {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Update local user state with the name
      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: name,
        photoURL: userCredential.user.photoURL,
      });

      return userCredential.user;
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw new Error("Failed to logout");
    }
  };

  const getToken = async () => {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return null;
  };

  const refreshUserProfile = async () => {
    if (!auth.currentUser) return;

    try {
      const profile = await usersAPI.getProfile();

      // Use the appropriate name based on role
      let displayName = auth.currentUser.displayName || auth.currentUser.email;
      if (profile.role === "driver" && profile.driver_name) {
        displayName = profile.driver_name;
      } else if (profile.role === "customer" && profile.customer_name) {
        displayName = profile.customer_name;
      }

      setUser((prev) => ({
        ...prev,
        name: displayName,
        role: profile.role,
        userId: profile.id,
        customerId: profile.customer_id,
        driverId: profile.driver_id,
      }));
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    getToken,
    refreshUserProfile,
    isAuthenticated: !!user,
    isDriver: user?.role === "driver",
    isCustomer: user?.role === "customer",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper function to convert Firebase error codes to user-friendly messages
function getFirebaseErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password";
    case "auth/email-already-in-use":
      return "An account with this email already exists";
    case "auth/weak-password":
      return "Password should be at least 6 characters";
    case "auth/invalid-email":
      return "Invalid email address";
    case "auth/network-request-failed":
      return "Network error. Please check your connection";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later";
    default:
      return "An error occurred. Please try again";
  }
}
