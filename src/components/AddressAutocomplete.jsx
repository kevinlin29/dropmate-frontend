import React, { useRef, useEffect, useCallback, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const libraries = ["places"];

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Enter an address",
  disabled = false,
  required = false,
  autoFocus = false,
  className = "modal-input",
}) {
  const elementRef = useRef(null);
  const containerRef = useRef(null);
  const [localValue, setLocalValue] = useState(value || "");

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Initialize PlaceAutocompleteElement when script loads
  useEffect(() => {
    if (!isLoaded || !window.google || !containerRef.current) return;

    console.log("[AddressAutocomplete] Initializing PlaceAutocompleteElement (new API)");

    // Create the new PlaceAutocompleteElement
    const placeAutocomplete = new window.google.maps.places.PlaceAutocompleteElement({
      componentRestrictions: { country: [] }, // No restrictions, can be configured
    });

    // Store reference
    elementRef.current = placeAutocomplete;

    // Set initial value if exists
    if (value) {
      placeAutocomplete.value = value;
    }

    // Apply styling and attributes
    const inputElement = placeAutocomplete.querySelector('input');
    if (inputElement) {
      inputElement.placeholder = placeholder;
      inputElement.className = className;
      inputElement.disabled = disabled;
      inputElement.required = required;
      if (autoFocus) {
        inputElement.focus();
      }

      // Listen for manual input changes
      inputElement.addEventListener('input', (e) => {
        const newValue = e.target.value;
        console.log("[AddressAutocomplete] Manual input:", newValue);
        setLocalValue(newValue);
        // When manually typing, call onChange without place object
        onChange(newValue);
      });
    }

    // Listen for place selection from autocomplete dropdown
    const selectHandler = async (event) => {
      const placePrediction = event.placePrediction;

      if (!placePrediction) {
        console.warn("[AddressAutocomplete] No place prediction in event");
        return;
      }

      try {
        console.log("[AddressAutocomplete] Place selected from dropdown");

        // Convert prediction to Place object
        const place = placePrediction.toPlace();

        // Fetch the fields we need (formattedAddress and location)
        await place.fetchFields({
          fields: ['formattedAddress', 'location']
        });

        const formattedAddress = place.formattedAddress;
        const location = place.location;

        console.log("[AddressAutocomplete] Place details:", {
          formattedAddress,
          location: location ? { lat: location.lat(), lng: location.lng() } : null
        });

        setLocalValue(formattedAddress);

        // Call onChange with formatted address and place data in legacy format
        onChange(formattedAddress, {
          formatted_address: formattedAddress,
          geometry: location ? {
            location: {
              lat: () => location.lat(),
              lng: () => location.lng()
            }
          } : undefined
        });

      } catch (error) {
        console.error("[AddressAutocomplete] Error fetching place details:", error);
      }
    };

    placeAutocomplete.addEventListener('gmp-select', selectHandler);

    // Append to container
    containerRef.current.appendChild(placeAutocomplete);

    return () => {
      if (elementRef.current && containerRef.current) {
        placeAutocomplete.removeEventListener('gmp-select', selectHandler);
        if (containerRef.current.contains(placeAutocomplete)) {
          containerRef.current.removeChild(placeAutocomplete);
        }
      }
    };
  }, [isLoaded, placeholder, className, disabled, required, autoFocus, onChange]);

  // Sync external value changes to the element
  useEffect(() => {
    if (elementRef.current && value !== localValue) {
      console.log("[AddressAutocomplete] Syncing external value:", value);
      elementRef.current.value = value || "";
      setLocalValue(value || "");
    }
  }, [value, localValue]);

  return (
    <div
      ref={containerRef}
      className="address-autocomplete-container"
      style={{ width: '100%' }}
    >
      {!isLoaded && (
        <input
          type="text"
          placeholder="Loading Google Maps..."
          disabled
          className={className}
        />
      )}
    </div>
  );
}
