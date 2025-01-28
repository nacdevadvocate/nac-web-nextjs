"use client";

import React, { useState } from "react";
import axios from "axios";
import { CREDENTIALS } from "@/data/credential";
import dynamic from "next/dynamic";

// Dynamically import the MapLocation component with SSR disabled
const MapLocation = dynamic(() => import("@/components/MapLocation"), {
  ssr: false,
});
import { useLocalStorageBase64 } from "@/hooks/useLocalStorage64";
import { Device, LocationData } from "@/utils/types";
import { BiCheckCircle } from "react-icons/bi";
import { BsFillClipboard2Fill } from "react-icons/bs";

const LocationRetrieval: React.FC = () => {
  const [identifierType, setIdentifierType] = useState("phone");
  const [identifier, setIdentifier] = useState("+3672123456");
  const [maxAge, setMaxAge] = useState(120);
  const [responseData, setResponseData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false); // State to track copy status

  const [selectedToken] = useLocalStorageBase64<string | null>(
    "selectedToken",
    null
  );

  const [devices] = useLocalStorageBase64<Device[]>("devices", []);

  const filteredDevices = devices?.filter(
    (device) => device.category === identifierType
  );

  const handleRetrieveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponseData(null);
    setError("");
    setLoading(true);

    try {
      const requestBody =
        identifierType === "phone"
          ? { device: { phoneNumber: identifier }, maxAge }
          : { device: { networkAccessIdentifier: identifier }, maxAge };

      const response = await axios.post(
        CREDENTIALS.LOCATION_RETRIEVAL_URL, // Replace with actual endpoint
        requestBody,
        {
          headers: {
            "content-type": "application/json",
            "X-RapidAPI-Key": selectedToken, // Replace with actual key
            "X-RapidAPI-Host": CREDENTIALS.LOCATION_RETRIEVAL_HOST, // Replace with actual host
          },
        }
      );

      // Update response data
      setResponseData(response.data);
    } catch (err) {
      setError("Failed to retrieve location. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (responseData) {
      navigator.clipboard.writeText(JSON.stringify(responseData, null, 2));
      setCopied(true); // Set copied to true
      setTimeout(() => setCopied(false), 5000); // Revert after 5 seconds
    }
  };

  return (
    <div className="min-h-full bg-white flex flex-col items-center font-work-sans">
      <div className="w-full max-w-4xl p-4">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Location Retrieval
        </h1>

        {/* Form */}
        <form
          onSubmit={handleRetrieveLocation}
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

          <div className="mb-4">
            <label
              htmlFor="maxAge"
              className="block text-gray-600 font-medium mb-2"
            >
              Max Age (in minutes)
            </label>
            <input
              type="number"
              id="maxAge"
              value={maxAge}
              onChange={(e) => setMaxAge(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-4 border-t-4 border-blue-600 rounded-full animate-spin mx-auto"></div>
            ) : (
              "Retrieve Location"
            )}
          </button>
        </form>

        {/* Error Section */}
        {error && (
          <div className="mt-8 p-6 bg-red-100 text-red-600 rounded-lg shadow-lg">
            {error}
          </div>
        )}
        {/* Response Section */}
        {responseData && !error && (
          <div
            className={`mt-8 p-6 rounded-lg shadow-lg transition-all duration-500 ease-in-out transform bg-white`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Response Data:
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
              {JSON.stringify(responseData, null, 2)}
            </pre>
          </div>
        )}

        {/* Map Section */}
        {responseData && !error && (
          <MapLocation
            latitude={responseData.area.center?.latitude}
            longitude={responseData.area.center?.longitude}
          />
        )}
      </div>
    </div>
  );
};

export default LocationRetrieval;
