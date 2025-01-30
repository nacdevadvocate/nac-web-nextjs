"use client";
import React, { useState } from "react";
import axios from "axios";
import { CREDENTIALS } from "@/data/credential";
import { useLocalStorageBase64 } from "@/hooks/useLocalStorage64";
import { DeviceEntry } from "@/utils/types";

interface RetrieveResponse {
  latestSimChange: string;
}

interface CheckResponse {
  swapped: boolean;
}

const SimSwap: React.FC = () => {
  const [selectedToken] = useLocalStorageBase64<string | null>(
    "selectedToken",
    null
  );
  const [activeTab, setActiveTab] = useState("retrieve");
  const [phoneNumber, setPhoneNumber] = useState("+3637123456");
  const [maxAge, setMaxAge] = useState(240); // Default value 240
  const [error, setError] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const [responseData, setResponseData] = useState<
    RetrieveResponse | CheckResponse | null
  >(null); // Store response data
  const [devices] = useLocalStorageBase64<DeviceEntry[]>("devices", []);

  // Filter phone numbers from the stored devices
  const phoneNumbers = devices?.filter((device) => device.category === "phone");

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setShowResponse(false); // Hide response when switching tabs
    setError(""); // Reset error
    setResponseData(null); // Reset raw response data
  };

  const handleRetrieveData = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();

    try {
      setLoading(true); // Start loading
      const response = await axios.post(
        CREDENTIALS.SIMSWAP_URL, // Replace with actual endpoint
        { phoneNumber },
        {
          headers: {
            "content-type": "application/json",
            "X-RapidAPI-Key": selectedToken,
            "X-RapidAPI-Host": CREDENTIALS.SIMSWAP_HOST,
          },
        }
      );

      setResponseData(response.data);
    } catch (error) {
      console.log(error);
      setError("Failed to retrieve data. Please try again.");
    } finally {
      setShowResponse(true); // Show response
      setLoading(false); // Stop loading
    }
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();

    try {
      setLoading(true); // Start loading
      const response = await axios.post(
        "https://sim-swap.p-eu.rapidapi.com/sim-swap/sim-swap/v0/check", // Replace with actual endpoint
        { phoneNumber, maxAge },
        {
          headers: {
            "content-type": "application/json",
            "X-RapidAPI-Key": selectedToken,
            "X-RapidAPI-Host": CREDENTIALS.SIMSWAP_HOST,
          },
        }
      );

      setResponseData(response.data);
    } catch (error) {
      console.log(error);
      setError("Failed to check status. Please try again.");
    } finally {
      setShowResponse(true); // Show response
      setLoading(false); // Stop loading
    }
  };

  const resetState = () => {
    setShowResponse(false); // Reset animation state
    setError(""); // Reset error
    setResponseData(null); // Reset raw response data
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <div className="w-full max-w-4xl p-4">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Sim Swap
        </h1>

        {/* Tabs */}
        <div className="flex justify-center border-b border-gray-300 mb-6">
          <button
            onClick={() => handleTabClick("retrieve")}
            className={`px-6 py-3 text-lg font-medium ${
              activeTab === "retrieve"
                ? "border-b-4 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            Retrieve Data
          </button>
          <button
            onClick={() => handleTabClick("check")}
            className={`px-6 py-3 text-lg font-medium ${
              activeTab === "check"
                ? "border-b-4 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            Check Status
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow-md rounded-lg p-6">
          {activeTab === "retrieve" && (
            <form onSubmit={handleRetrieveData}>
              <div className="mb-4">
                <label
                  htmlFor="phoneNumber"
                  className="block text-gray-600 font-medium mb-2"
                >
                  Phone Number
                </label>
                {phoneNumbers?.length > 0 ? (
                  <select
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="" disabled>
                      Select a phone number
                    </option>
                    {phoneNumbers.map((device, index) => (
                      <option key={index} value={device.value}>
                        {device.name} ({device.value})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No phone numbers available.
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading} // Disable button when loading
              >
                {loading ? (
                  <div className="w-5 h-5 border-4 border-t-4 border-blue-600 rounded-full animate-spin"></div>
                ) : (
                  "Retrieve"
                )}
              </button>
            </form>
          )}

          {activeTab === "check" && (
            <form onSubmit={handleCheckStatus}>
              <div className="mb-4">
                <label
                  htmlFor="phoneNumber"
                  className="block text-gray-600 font-medium mb-2"
                >
                  Phone Number
                </label>
                {phoneNumbers.length > 0 ? (
                  <select
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="" disabled>
                      Select a phone number
                    </option>
                    {phoneNumbers.map((device, index) => (
                      <option key={index} value={device.value}>
                        {device.name} ({device.value})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No phone numbers available.
                  </p>
                )}
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
                disabled={loading} // Disable button when loading
              >
                {loading ? (
                  <div className="w-5 h-5 border-4 border-t-4 border-blue-600 rounded-full animate-spin"></div>
                ) : (
                  "Check Status"
                )}
              </button>
            </form>
          )}
        </div>

        {/* Animated Response Section */}
        {showResponse && (
          <div
            className={`mt-8 p-6 rounded-lg shadow-lg transition-all duration-500 ease-in-out transform ${
              showResponse ? "opacity-100 scale-100" : "opacity-0 scale-95"
            } bg-white`}
          >
            {error ? (
              <p className="text-red-600 font-semibold text-center text-lg">
                {error}
              </p>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-gray-800 text-center mb-4">
                  Raw Response:
                </h2>
                <pre className="bg-gray-100 text-gray-800 p-4 rounded-md overflow-x-auto">
                  {JSON.stringify(responseData, null, 2)}
                </pre>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimSwap;
