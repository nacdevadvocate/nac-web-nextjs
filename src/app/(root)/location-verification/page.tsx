"use client";

import React, { useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { CREDENTIALS } from "@/data/credential";
import { useLocalStorageBase64 } from "@/hooks/useLocalStorage64";
import { Device } from "@/utils/types";
import { BiCheckCircle } from "react-icons/bi";
import { BsFillClipboard2Fill } from "react-icons/bs";

// Dynamically import the MapLocation component with SSR disabled
const MapVerification = dynamic(() => import("@/components/MapVerification"), {
  ssr: false,
});

type ApiResponse =
  | {
      lastLocationTime: string;
      area: {
        areaType: string;
        center: {
          latitude: number;
          longitude: number;
        };
        radius: number;
      };
    }
  | { error: string }
  | null;

const LocationVerification: React.FC = () => {
  const [devices] = useLocalStorageBase64<Device[]>("devices", []);
  const [selectedToken] = useLocalStorageBase64<string | null>(
    "selectedToken",
    null
  );
  const [identifierType, setIdentifierType] = useState<"phone" | "nai">(
    "phone"
  );
  const [identifier, setIdentifier] = useState("+3672123456");
  const [latitude, setLatitude] = useState<number>(47.48); // Default as a valid number
  const [longitude, setLongitude] = useState<number>(7.10066); // Default as a valid number
  const [radius, setRadius] = useState(50000);
  const [maxAge, setMaxAge] = useState(120);
  const [loading, setLoading] = useState(false);
  const [verificationResponse, setVerificationResponse] =
    useState<ApiResponse>(null);
  const [retrievedLocation, setRetrievedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredDevices = devices.filter(
    (device) => device.category === identifierType
  );

  const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Validate if the input is a valid number, allowing negative and decimal points
    if (!isNaN(Number(value)) || value === "") {
      setLatitude(value === "" ? 0 : parseFloat(value)); // Use parseFloat to allow decimals
    }
  };

  const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Same validation logic for longitude
    if (!isNaN(Number(value)) || value === "") {
      setLongitude(value === "" ? 0 : parseFloat(value)); // Use parseFloat to allow decimals
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Verify location
      const verificationRequest = {
        device:
          identifierType === "phone"
            ? { phoneNumber: identifier }
            : { networkAccessIdentifier: identifier },
        area: {
          areaType: "CIRCLE",
          center: { latitude, longitude },
          radius,
        },
        maxAge,
      };

      const verificationApiResponse = await axios.post(
        CREDENTIALS.LOCATION_VERIFICATION_URL,
        verificationRequest,
        {
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": selectedToken,
            "X-RapidAPI-Host": CREDENTIALS.LOCATION_VERIFICATION_HOST,
          },
        }
      );

      setVerificationResponse(verificationApiResponse.data);

      // Step 2: Retrieve location details
      const retrievalRequest =
        identifierType === "phone"
          ? { device: { phoneNumber: identifier }, maxAge }
          : { device: { networkAccessIdentifier: identifier }, maxAge };

      const retrievalApiResponse = await axios.post(
        "https://location-retrieval.p-eu.rapidapi.com/retrieve",
        retrievalRequest,
        {
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": selectedToken,
            "X-RapidAPI-Host": CREDENTIALS.LOCATION_RETRIEVAL_HOST,
          },
        }
      );

      if (
        retrievalApiResponse.data?.area?.center?.latitude &&
        retrievalApiResponse.data?.area?.center?.longitude
      ) {
        setRetrievedLocation({
          latitude: retrievalApiResponse.data.area?.center?.latitude,
          longitude: retrievalApiResponse.data.area?.center?.longitude,
        });
      } else {
        setRetrievedLocation(null);
      }
    } catch (error: unknown) {
      console.error("Error:", error);
      setVerificationResponse({ error: "Failed to verify location" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (verificationResponse) {
      navigator.clipboard.writeText(
        JSON.stringify(verificationResponse, null, 2)
      );
      setCopied(true); // Set copied to true
      setTimeout(() => setCopied(false), 5000); // Revert after 5 seconds
    }
  };

  const isErrorResponse = (
    response: ApiResponse
  ): response is { error: string } => {
    return (response as { error: string }).error !== undefined;
  };

  return (
    <div className="min-h-full bg-white flex flex-col items-center">
      <div className="w-full max-w-4xl p-4">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Location Verification
        </h1>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Identifier Type Selection */}
            <div>
              <label
                htmlFor="identifierType"
                className="block text-gray-600 font-medium mb-2"
              >
                Select Identifier Type
              </label>
              <select
                id="identifierType"
                value={identifierType}
                onChange={(e) => {
                  setIdentifierType(e.target.value as "phone" | "nai");
                  setIdentifier("");
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="phone">Phone Number</option>
                <option value="nai">Network Access Identifier (NAI)</option>
              </select>
            </div>

            {/* Dynamic List Based on Selected Identifier Type */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-gray-600 font-medium mb-2"
              >
                {identifierType === "phone"
                  ? "Phone Numbers"
                  : "Network Access Identifiers (NAIs)"}
              </label>
              {filteredDevices.length > 0 ? (
                <select
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>
                    Select {identifierType === "phone" ? "Phone Number" : "NAI"}
                  </option>
                  {filteredDevices.map((device, index) => (
                    <option key={index} value={device.value}>
                      {device.name} ({device.value})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-500 text-sm">
                  No {identifierType === "phone" ? "Phone Number" : "NAI"}{" "}
                  available.
                </p>
              )}
            </div>
          </div>

          {/* Latitude and Longitude */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label
                htmlFor="latitude"
                className="block text-gray-600 font-medium mb-2"
              >
                Latitude
              </label>
              <input
                type="text"
                id="latitude"
                value={latitude}
                onChange={handleLatitudeChange}
                placeholder="Enter latitude"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="longitude"
                className="block text-gray-600 font-medium mb-2"
              >
                Longitude
              </label>
              <input
                type="text"
                id="longitude"
                value={longitude}
                onChange={handleLongitudeChange}
                placeholder="Enter longitude"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Radius and Max Age */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label
                htmlFor="radius"
                className="block text-gray-600 font-medium mb-2"
              >
                Radius (meters)
              </label>
              <input
                type="number"
                id="radius"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                placeholder="Enter radius"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="maxAge"
                className="block text-gray-600 font-medium mb-2"
              >
                Max Age (seconds)
              </label>
              <input
                type="number"
                id="maxAge"
                value={maxAge}
                onChange={(e) => setMaxAge(Number(e.target.value))}
                placeholder="Enter max age"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-6 w-full bg-blue-600 text-white px-4 py-2 rounded-md flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-4 border-t-4 border-white rounded-full animate-spin"></div>
            ) : (
              "Verify Location"
            )}
          </button>
        </form>

        {/* Response Section */}
        {verificationResponse && !isErrorResponse(verificationResponse) && (
          <div className="mt-8 p-6 rounded-lg shadow-lg bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Verification Response:
              </h2>
              <button
                onClick={handleCopyToClipboard}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                {copied ? (
                  <>
                    <BiCheckCircle className="w-5 h-5 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <BsFillClipboard2Fill className="w-5 h-5 mr-1" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-100 text-gray-800 p-4 rounded-md overflow-x-auto">
              {JSON.stringify(verificationResponse, null, 2)}
            </pre>
          </div>
        )}

        {/* Map Section */}
        {verificationResponse && !isErrorResponse(verificationResponse) && (
          <MapVerification
            retrievedLocation={retrievedLocation}
            radius={radius}
            latitude={latitude}
            longitude={longitude}
          />
        )}

        {/* Error Section */}
        {verificationResponse && isErrorResponse(verificationResponse) && (
          <div className="mt-8 p-6 bg-red-100 text-red-600 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Error:</h2>
            <pre>{verificationResponse.error}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationVerification;
